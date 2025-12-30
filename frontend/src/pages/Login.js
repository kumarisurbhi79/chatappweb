import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const emailRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    // Auto-focus on email field when component mounts
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter' && nextFieldRef?.current) {
      e.preventDefault();
      nextFieldRef.current.focus();
    }
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      emailRef.current?.focus();
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      emailRef.current?.focus();
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      passwordRef.current?.focus();
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      passwordRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (!result.success) {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">💬</div>
            <h1>ChatApp</h1>
          </div>
          <h2>Welcome Back!</h2>
          <p>Sign in to continue chatting</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span className="label-text">Email Address</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, passwordRef)}
                className={`form-input ${error && error.includes('email') ? 'error' : ''}`}
                placeholder="Enter your email address"
                autoComplete="email"
                required
              />
              <span className="input-icon">📧</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-text">Password</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className={`form-input ${error && error.includes('Password') ? 'error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary auth-submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="btn-icon">🚀</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="demo-accounts">
          <p className="demo-title">Try Demo Accounts:</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => {
                setFormData({email: 'demo1@chat.com', password: '123456'});
                emailRef.current?.focus();
              }}
            >
              Demo User 1
            </button>
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => {
                setFormData({email: 'demo2@chat.com', password: '123456'});
                emailRef.current?.focus();
              }}
            >
              Demo User 2
            </button>
          </div>
        </div>

        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;