import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import config from '../config/config';
import socketService from '../utils/socketService';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import Header from '../components/Header';
import './Chat.css';

const Chat = () => {
  const { user, getAuthHeaders, logout } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const navigate = useNavigate();

  // Function to fetch users with recent messages
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/user/all`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [getAuthHeaders]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      console.log('🚀 Connecting user:', user.username);
      socketService.connect(user.id);

      // Listen for incoming messages
      socketService.onReceiveMessage((data) => {
        console.log('📨 Message received:', data);
        
        const newMessage = {
          _id: `received-${Date.now()}`,
          message: data.message,
          sender: {
            _id: data.senderId,
            username: data.senderName,
            avatar: data.senderAvatar
          },
          receiver: {
            _id: user.id
          },
          createdAt: data.timestamp || new Date()
        };
        
        // Always add the message - filtering happens in ChatWindow
        setMessages(prev => [...prev, newMessage]);
        
        // Refresh user list for unread count updates
        setTimeout(() => fetchUsers(), 100);
        
        console.log('🔔 New message from:', data.senderName);
      });

      // Listen for message confirmation
      socketService.onMessageConfirmed((data) => {
        console.log('✅ Message confirmed:', data.delivered ? 'Delivered' : 'User offline');
      });

      // Listen for online users
      socketService.onOnlineUsers((userIds) => {
        setOnlineUsers(new Set(userIds));
        console.log('👥 Online users:', userIds);
      });

      // Listen for user coming online
      socketService.onUserOnline((data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
        console.log('🟢 User came online:', data.userId);
      });

      // Listen for user going offline
      socketService.onUserOffline((data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        console.log('🔴 User went offline:', data.userId);
      });

      // Listen for typing indicators (disabled for now)
      // socketService.onUserTyping((data) => {
      //   console.log('User typing:', data);
      // });

      // Get initial online users
      setTimeout(() => {
        socketService.getOnlineUsers();
      }, 1000);
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [user]); // Only depend on user, not selectedUser

  // Fetch all users with recent messages
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch chat history when user is selected
  useEffect(() => {
    if (selectedUser) {
      const fetchChatHistory = async () => {
        try {
          console.log('📜 Fetching chat history with:', selectedUser.username);
          const response = await fetch(`${config.API_URL}/api/chat/history/${selectedUser._id}`, {
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('📨 Loaded', data.messages?.length || 0, 'messages from history');
            
            // Merge with existing messages, avoiding duplicates
            const historyMessages = data.messages || [];
            setMessages(prev => {
              // Create a map of existing messages
              const existingMap = new Map();
              prev.forEach(msg => {
                const key = `${msg.sender._id}-${msg.receiver._id}-${msg.message}-${new Date(msg.createdAt).getTime()}`;
                existingMap.set(key, msg);
              });
              
              // Add history messages that don't exist
              const newMessages = [...prev];
              historyMessages.forEach(historyMsg => {
                const key = `${historyMsg.sender._id}-${historyMsg.receiver._id}-${historyMsg.message}-${new Date(historyMsg.createdAt).getTime()}`;
                if (!existingMap.has(key)) {
                  // Check if it's a close duplicate (within 10 seconds)
                  const isDuplicate = prev.some(existing => 
                    existing.message === historyMsg.message &&
                    existing.sender._id === historyMsg.sender._id &&
                    Math.abs(new Date(existing.createdAt) - new Date(historyMsg.createdAt)) < 10000
                  );
                  
                  if (!isDuplicate) {
                    newMessages.push(historyMsg);
                  }
                }
              });
              
              // Sort by creation time
              return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            });
          } else {
            const errorData = await response.json();
            console.error('❌ Failed to fetch chat history:', errorData);
          }
        } catch (error) {
          console.error('❌ Error fetching chat history:', error);
        }
      };

      fetchChatHistory();
    }
    // Don't clear messages when no user is selected to preserve real-time messages
  }, [selectedUser, getAuthHeaders]);

  const handleSendMessage = async (messageText) => {
    if (!selectedUser || !messageText.trim()) return;

    const tempMessageId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempMessageId,
      message: messageText,
      sender: {
        _id: user.id,
        username: user.username,
        avatar: user.avatar
      },
      receiver: {
        _id: selectedUser._id
      },
      createdAt: new Date(),
      sending: true
    };
    
    try {
      // Add message to local state immediately
      setMessages(prev => [...prev, tempMessage]);

      // Send via socket for real-time delivery
      socketService.sendMessage({
        receiverId: selectedUser._id,
        message: messageText,
        senderId: user.id,
        senderName: user.username,
        senderAvatar: user.avatar
      });

      // Save to database
      const response = await fetch(`${config.API_URL}/api/chat/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiverId: selectedUser._id,
          message: messageText
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('💾 Message saved to database:', result);
        
        // Update message status to sent
        setMessages(prev => prev.map(msg => {
          if (msg._id === tempMessageId) {
            return {
              ...result.data,
              sending: false,
              sent: true
            };
          }
          return msg;
        }));
        
        // Refresh user list
        setTimeout(() => fetchUsers(), 100);
      } else {
        console.error('❌ Failed to save message to database');
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessageId ? { ...msg, sending: false, failed: true } : msg
        ));
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessageId ? { ...msg, sending: false, failed: true } : msg
      ));
    }
  };

  const handleTyping = (isTyping) => {
    if (selectedUser) {
      socketService.sendTyping(selectedUser._id, isTyping);
    }
  };

  const handleLogout = async () => {
    socketService.disconnect();
    await logout();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="chat-container">
      <Header 
        user={user} 
        onLogout={handleLogout}
        onProfile={goToProfile}
      />
      
      <div className="chat-content">
        <ChatList
          users={users.map(u => ({
            ...u,
            isOnline: onlineUsers.has(u._id)
          }))}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          currentUser={user}
          onlineUsers={onlineUsers}
        />
        
        <ChatWindow
          selectedUser={selectedUser}
          messages={messages}
          currentUser={user}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};

export default Chat;