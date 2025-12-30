import { io } from 'socket.io-client';
import config from '../config/config';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect(userId) {
    if (!this.socket) {
      console.log('🔌 Connecting to:', config.SOCKET_URL);
      
      this.socket = io(config.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        forceNew: true,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to chat server');
        this.isConnected = true;
        this.socket.emit('join', userId);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message || error);
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected to server (attempt ${attemptNumber})`);
        this.isConnected = true;
        this.socket.emit('join', userId);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error.message || error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Failed to reconnect to server');
        alert('Unable to connect to chat server. Please refresh the page.');
      });
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send message
  sendMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', data);
    }
  }

  // Listen for incoming messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  // Listen for message confirmation
  onMessageConfirmed(callback) {
    if (this.socket) {
      this.socket.on('messageConfirmed', callback);
    }
  }

  // Handle typing indicator
  sendTyping(receiverId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { receiverId, isTyping });
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  // Get online users
  getOnlineUsers() {
    if (this.socket && this.isConnected) {
      this.socket.emit('getOnlineUsers');
    }
  }

  // Listen for online users
  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('onlineUsers', callback);
    }
  }

  // Listen for user coming online
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  // Listen for user going offline
  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('userOffline', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;