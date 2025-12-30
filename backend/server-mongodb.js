const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import models
const User = require('./models/User');
const Message = require('./models/Message');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// MongoDB connection with fallback
let mongoConnected = false;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    mongoConnected = true;
  })
  .catch(err => {
    console.log('⚠️ MongoDB connection failed, using in-memory storage for demo');
    console.log('Error:', err.message);
    
    // Fallback to in-memory storage
    setupInMemoryStorage();
  });

// In-memory storage fallback
const inMemoryUsers = [];
const inMemoryMessages = [];
let userIdCounter = 1;
let messageIdCounter = 1;

function setupInMemoryStorage() {
  console.log('🔄 Setting up in-memory storage...');
  
  // Override mongoose models with in-memory versions
  global.User = {
    find: (query) => Promise.resolve(inMemoryUsers.filter(user => {
      if (!query) return true;
      return Object.keys(query).every(key => {
        if (key === '_id' && query[key].$ne) {
          return user._id !== query[key].$ne;
        }
        return user[key] === query[key];
      });
    })),
    
    findOne: (query) => Promise.resolve(inMemoryUsers.find(user => {
      return Object.keys(query).some(key => {
        if (key === '$or') {
          return query[key].some(condition => 
            Object.keys(condition).every(k => user[k] === condition[k])
          );
        }
        return user[key] === query[key];
      });
    })),
    
    findById: (id) => Promise.resolve(inMemoryUsers.find(user => user._id == id)),
    
    findByIdAndUpdate: (id, update, options) => {
      const user = inMemoryUsers.find(user => user._id == id);
      if (user) {
        Object.assign(user, update);
        if (options?.new) return Promise.resolve(user);
      }
      return Promise.resolve(user);
    },
    
    create: (userData) => {
      const user = {
        _id: userIdCounter++,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryUsers.push(user);
      return Promise.resolve(user);
    }
  };
  
  global.Message = {
    find: (query) => {
      let filteredMessages = [...inMemoryMessages];
      if (query.$or) {
        filteredMessages = inMemoryMessages.filter(msg => 
          query.$or.some(condition => 
            Object.keys(condition).every(key => msg[key] == condition[key])
          )
        );
      }
      return {
        populate: () => ({
          populate: () => ({
            sort: () => ({
              limit: () => Promise.resolve(filteredMessages)
            })
          })
        })
      };
    },
    
    create: (messageData) => {
      const message = {
        _id: messageIdCounter++,
        ...messageData,
        createdAt: new Date()
      };
      inMemoryMessages.push(message);
      return Promise.resolve(message);
    },
    
    findById: (id) => ({
      populate: () => ({
        populate: () => Promise.resolve(inMemoryMessages.find(msg => msg._id == id))
      })
    })
  };
}

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers.set(parseInt(userId), socket.id);
    socket.userId = parseInt(userId);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, message, senderId, senderName, senderAvatar } = data;
    const receiverSocketId = activeUsers.get(parseInt(receiverId));
    
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
    const receiverSocketId = activeUsers.get(parseInt(receiverId));
    
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
  console.log(`🚀 Server running on port ${PORT}`);
  if (!mongoConnected) {
    console.log('📝 Using in-memory storage for demo');
    console.log('💡 To use MongoDB: Install MongoDB locally or use MongoDB Atlas');
  }
});