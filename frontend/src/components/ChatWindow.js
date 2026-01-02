import React, { useEffect, useRef } from 'react';
import config from '../config/config';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ 
  selectedUser, 
  messages, 
  currentUser, 
  onSendMessage, 
  onTyping, 
  isTyping 
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const filteredMessages = messages.filter(message => {
    if (!selectedUser || !currentUser) return false;
    
    return (
      (message.sender._id === currentUser.id && message.receiver._id === selectedUser._id) ||
      (message.sender._id === selectedUser._id && message.receiver._id === currentUser.id)
    );
  });

  // Debug logging
  console.log('🔍 ChatWindow Debug:', {
    totalMessages: messages.length,
    filteredMessages: filteredMessages.length,
    selectedUser: selectedUser?.username,
    currentUser: currentUser?.username || currentUser?.id
  });

  if (!selectedUser) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <div className="welcome-message">
            <h2>Welcome to Chat App!</h2>
            <p>Select a user from the left to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="chat-user-avatar">
            {selectedUser.avatar ? (
              <img src={`http://localhost:5000${selectedUser.avatar}`} alt={selectedUser.username} />
            ) : (
              <span>{selectedUser.username.charAt(0).toUpperCase()}</span>
            )}
            <div className={`status-indicator ${selectedUser.isOnline ? 'online' : 'offline'}`} />
          </div>
          <div className="chat-user-details">
            <h3>{selectedUser.username}</h3>
            <span className="status-text">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {filteredMessages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isOwnMessage = message.sender._id === currentUser.id;
            const showAvatar = !isOwnMessage && (
              index === 0 || 
              filteredMessages[index - 1].sender._id !== message.sender._id
            );

            return (
              <div
                key={message._id || index}
                className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
              >
                {showAvatar && (
                  <div className="message-avatar">
                    {message.sender.avatar ? (
                      <img src={`${config.API_URL}${message.sender.avatar}`} alt={message.sender.username} />
                    ) : (
                      <span>{message.sender.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}
                
                <div className="message-content">
                  {!isOwnMessage && showAvatar && (
                    <div className="message-sender">{message.sender.username}</div>
                  )}
                  <div className="message-bubble">
                    <p>{message.message}</p>
                  </div>
                  <div className="message-time">
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-avatar">
              {selectedUser.avatar ? (
                <img src={`${config.API_URL}${selectedUser.avatar}`} alt={selectedUser.username} />
              ) : (
                <span>{selectedUser.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="typing-content">
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
};

export default ChatWindow;