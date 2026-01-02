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
          _id: Date.now().toString(),
          message: data.message,
          sender: {
            _id: data.senderId,
            username: data.senderName,
            avatar: data.senderAvatar
          },
          receiver: {
            _id: user.id
          },
          createdAt: data.timestamp
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Refresh user list to update recent messages
        setTimeout(() => fetchUsers(), 100);
        
        // Show notification sound/effect
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
  }, [user, selectedUser]);

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
            setMessages(data.messages || []);
          } else {
            const errorData = await response.json();
            console.error('❌ Failed to fetch chat history:', errorData);
            setMessages([]);
          }
        } catch (error) {
          console.error('❌ Error fetching chat history:', error);
          setMessages([]);
        }
      };

      fetchChatHistory();
    } else {
      // Clear messages when no user is selected
      setMessages([]);
    }
  }, [selectedUser, getAuthHeaders]);

  const handleSendMessage = async (messageText) => {
    if (!selectedUser || !messageText.trim()) return;

    const tempMessageId = Date.now().toString();
    
    try {
      // Add message to local state immediately for instant feedback
      const newMessage = {
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

      setMessages(prev => [...prev, newMessage]);

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
        
        // Replace the temporary message with the actual saved message
        if (result.data) {
          setMessages(prev => prev.map(msg => 
            msg._id === tempMessageId ? {
              ...result.data,
              sending: false,
              sent: true
            } : msg
          ));
        } else {
          // Fallback: just mark as sent
          setMessages(prev => prev.map(msg => 
            msg._id === tempMessageId ? { ...msg, sending: false, sent: true } : msg
          ));
        }
        
        // Refresh user list to update recent messages order
        setTimeout(() => fetchUsers(), 100);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save message to database:', errorData);
        // Mark message as failed
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