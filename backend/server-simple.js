const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// In-memory storage for demo purposes
const users = [];
const messages = [];
let userIdCounter = 1;
let messageIdCounter = 1;

// Add some demo users for testing
const initializeDemoData = () => {
  const demoUsers = [
    {
      id: userIdCounter++,
      username: 'alice_demo',
      email: 'alice@demo.com',
      password: 'demo123', // Simplified for demo
      avatar: null,
      isOnline: false,
      lastSeen: new Date()
    },
    {
      id: userIdCounter++,
      username: 'bob_demo',
      email: 'bob@demo.com', 
      password: 'demo123', // Simplified for demo
      avatar: null,
      isOnline: false,
      lastSeen: new Date()
    },
    {
      id: userIdCounter++,
      username: 'carol_demo',
      email: 'carol@demo.com',
      password: 'demo123', // Simplified for demo
      avatar: null,
      isOnline: false,
      lastSeen: new Date()
    }
  ];

  users.push(...demoUsers);
  console.log('✅ Demo users initialized:', demoUsers.map(u => u.username).join(', '));
};

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper functions
const findUserByEmail = (email) => users.find(user => user.email === email);
const findUserById = (id) => users.find(user => user.id === id);
const findUserByUsername = (username) => users.find(user => user.username === username);

// Simple JWT implementation
const jwt = {
  sign: (payload, secret) => {
    const header = Buffer.from(JSON.stringify({typ: 'JWT', alg: 'HS256'})).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${payloadB64}.signature`;
  },
  verify: (token, secret) => {
    const [header, payload, signature] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  }
};

// Simple bcrypt implementation
const bcrypt = {
  hash: (password) => Promise.resolve(`hashed_${password}`),
  compare: (password, hash) => Promise.resolve(hash === `hashed_${password}`)
};

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    if (findUserByEmail(email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (findUserByUsername(username)) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password);
    const user = {
      id: userIdCounter++,
      username,
      email,
      password: hashedPassword,
      avatar: '',
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date()
    };

    users.push(user);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword._id = user.id; // Add _id for frontend compatibility
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    user.isOnline = true;
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    const { password: _, ...userWithoutPassword } = user;
    userWithoutPassword._id = user.id; // Add _id for frontend compatibility
    
    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/logout', auth, (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

app.get('/api/user/all', auth, (req, res) => {
  const otherUsers = users
    .filter(user => user.id !== req.user.id)
    .map(({ password, ...user }) => {
      // Find most recent message with this user
      const userMessages = messages.filter(message => 
        (message.sender._id === req.user.id && message.receiver._id === user.id) ||
        (message.sender._id === user.id && message.receiver._id === req.user.id)
      );
      
      const lastMessage = userMessages.length > 0 
        ? userMessages[userMessages.length - 1] 
        : null;
      
      return {
        ...user,
        _id: user.id, // Add _id field for frontend compatibility
        lastMessage: lastMessage ? {
          message: lastMessage.message,
          timestamp: lastMessage.createdAt,
          senderId: lastMessage.sender._id
        } : null,
        lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(0) // For sorting
      };
    })
    // Sort by most recent message first
    .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
  res.json({ users: otherUsers });
});

app.get('/api/user/profile', auth, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

app.put('/api/user/profile', auth, (req, res) => {
  try {
    const { username } = req.body;
    
    if (username && username !== req.user.username) {
      // Check if username is taken
      const existingUser = findUserByUsername(username);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      req.user.username = username;
    }
    
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

app.post('/api/chat/send', auth, (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const receiver = findUserById(parseInt(receiverId));
    
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const newMessage = {
      _id: messageIdCounter++,
      sender: {
        _id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar
      },
      receiver: {
        _id: receiver.id,
        username: receiver.username,
        avatar: receiver.avatar
      },
      message,
      createdAt: new Date(),
      isRead: false
    };

    messages.push(newMessage);

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

app.get('/api/chat/history/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const chatMessages = messages.filter(message => 
      (message.sender._id === req.user.id && message.receiver._id === parseInt(userId)) ||
      (message.sender._id === parseInt(userId) && message.receiver._id === req.user.id)
    );
    
    res.json({ messages: chatMessages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error while fetching chat history' });
  }
});

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    const numericUserId = parseInt(userId);
    activeUsers.set(numericUserId, socket.id);
    socket.userId = numericUserId;
    console.log(`User ${numericUserId} joined with socket ${socket.id}`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message, senderId, senderName, senderAvatar } = data;
    const receiverSocketId = activeUsers.get(parseInt(receiverId)); // Convert to number
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        message,
        senderId,
        senderName,
        senderAvatar,
        timestamp: new Date()
      });
    }
    
    socket.emit('messageConfirmed', {
      message,
      receiverId,
      timestamp: new Date()
    });
  });

  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = activeUsers.get(parseInt(receiverId)); // Convert to number
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('✅ In-memory database ready for demo');
  
  // Initialize demo data
  initializeDemoData();
});