const express = require('express');
const { register, login, logout, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/test - Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Backend API is working!', timestamp: new Date() });
});

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user
router.post('/logout', auth, logout);

// GET /api/auth/me - Get current user
router.get('/me', auth, getCurrentUser);

module.exports = router;