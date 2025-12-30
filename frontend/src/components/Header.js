import React from 'react';
import config from '../config/config';
import './Header.css';

const Header = ({ user, onLogout, onProfile }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Chat App</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={`${config.API_URL}${user.avatar}`} alt="Profile" />
              ) : (
                <span>{user?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="username">{user?.username}</span>
          </div>
          
          <div className="header-actions">
            <button onClick={onProfile} className="btn btn-secondary">
              Profile
            </button>
            <button onClick={onLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;