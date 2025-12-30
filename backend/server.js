const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database: chatapp');
    console.log('🔗 Connection: ' + process.env.MONGODB_URI);
  })
  .catch(err => {
    console.log('❌ MongoDB connection failed:');
    console.log('Error:', err.message);
    console.log('💡 Server will continue running for API testing');
    console.log('💡 To fix: Add your IP to MongoDB Atlas whitelist');
  });

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
    
    // Broadcast to all users that this user is online
    socket.broadcast.emit('userOnline', { userId });
    
    // Send current online users to the joined user
    const onlineUserIds = Array.from(activeUsers.keys());
    socket.emit('onlineUsers', onlineUserIds);
  });

  // Handle sending message
  socket.on('sendMessage', (data) => {
    const { receiverId, message, senderId, senderName, senderAvatar } = data;
    
    // Find receiver's socket
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      // Send message to specific user
      io.to(receiverSocketId).emit('receiveMessage', {
        message,
        senderId,
        senderName,
        senderAvatar,
        timestamp: new Date()
      });
      console.log(`Message sent from ${senderId} to ${receiverId}: ${message}`);
    } else {
      console.log(`User ${receiverId} is not online`);
    }
    
    // Send confirmation back to sender
    socket.emit('messageConfirmed', {
      message,
      receiverId,
      timestamp: new Date(),
      delivered: !!receiverSocketId
    });
  });

  // Handle getting online users
  socket.on('getOnlineUsers', () => {
    const onlineUserIds = Array.from(activeUsers.keys());
    socket.emit('onlineUsers', onlineUserIds);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = activeUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('userTyping', {
        userId: socket.userId,
        isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      // Broadcast to all users that this user went offline
      socket.broadcast.emit('userOffline', { userId: socket.userId });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});