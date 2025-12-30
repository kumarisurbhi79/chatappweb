import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter' && nextFieldRef?.current) {
      e.preventDefault();
      nextFieldRef.current.focus();
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      usernameRef.current?.focus();
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      usernameRef.current?.focus();
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      usernameRef.current?.focus();
      return false;
    }
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
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      confirmPasswordRef.current?.focus();
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      confirmPasswordRef.current?.focus();
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
      const result = await register(formData.username.trim(), formData.email.trim(), formData.password);

      if (!result.success) {
        setError(result.message || 'Registration failed. Please try again.');
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
          <h2>Create Account</h2>
          <p>Join and start chatting with friends</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              <span className="label-text">Username</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                ref={usernameRef}
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, emailRef)}
                className={`form-input ${error && error.includes('Username') ? 'error' : ''}`}
                placeholder="Choose a username"
                autoComplete="username"
                required
              />
              <span className="input-icon">👤</span>
            </div>
          </div>

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
                onKeyDown={(e) => handleKeyDown(e, confirmPasswordRef)}
                className={`form-input ${error && error.includes('Password') ? 'error' : ''}`}
                placeholder="Create a password"
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <span className="label-text">Confirm Password</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                ref={confirmPasswordRef}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className={`form-input ${error && error.includes('match') ? 'error' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
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
                Creating Account...
              </>
            ) : (
              <>
                <span>Create Account</span>
                <span className="btn-icon">🎉</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;