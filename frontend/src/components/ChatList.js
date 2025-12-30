import React, { useState } from 'react';
import './ChatList.css';

const ChatList = ({ users, selectedUser, onUserSelect, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (message, maxLength = 35) => {
    if (!message) return '';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Chats</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            {searchTerm ? 'No users found' : 'No users available'}
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
              onClick={() => onUserSelect(user)}
            >
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={`http://localhost:5000${user.avatar}`} alt={user.username} />
                ) : (
                  <span>{user.username.charAt(0).toUpperCase()}</span>
                )}
                <div className={`status-indicator ${user.isOnline ? 'online' : 'offline'}`} />
              </div>
              
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-preview">
                  {user.lastMessage ? (
                    <div className="last-message">
                      <span className="message-text">
                        {user.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                        {truncateMessage(user.lastMessage.message)}
                      </span>
                      <span className="message-time">
                        {formatMessageTime(user.lastMessage.timestamp)}
                      </span>
                    </div>
                  ) : (
                    <div className="user-status">
                      {user.isOnline ? 'Online' : formatLastSeen(user.lastSeen)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;