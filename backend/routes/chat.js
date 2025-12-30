const express = require('express');
const { sendMessage, getChatHistory, getConversations, markMessagesAsRead, deleteMessage } = require('../controllers/chatController');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/chat/send - Send message
router.post('/send', auth, sendMessage);

// GET /api/chat/history/:userId - Get chat history with specific user
router.get('/history/:userId', auth, getChatHistory);

// GET /api/chat/conversations - Get all conversations
router.get('/conversations', auth, getConversations);

// PUT /api/chat/read - Mark messages as read
router.put('/read', auth, markMessagesAsRead);

// DELETE /api/chat/message/:messageId - Delete message
router.delete('/message/:messageId', auth, deleteMessage);

module.exports = router;