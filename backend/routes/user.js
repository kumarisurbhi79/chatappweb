const express = require('express');
const { getProfile, updateProfile, uploadAvatar, getAllUsers, searchUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// GET /api/user/profile - Get user profile
router.get('/profile', auth, getProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', auth, upload.single('avatar'), updateProfile, handleMulterError);

// POST /api/user/avatar - Upload avatar
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar, handleMulterError);

// GET /api/user/all - Get all users
router.get('/all', auth, getAllUsers);

// GET /api/user/search - Search users
router.get('/search', auth, searchUsers);

module.exports = router;