const Message = require('../models/Message');
const User = require('../models/User');

// Send message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    console.log('📤 Sending message:', { senderId, receiverId, message });

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message,
      messageType
    });

    const savedMessage = await newMessage.save();
    console.log('💾 Message saved to DB:', savedMessage._id);

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    console.log('📨 Returning populated message:', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending message',
      error: error.message 
    });
  }
};

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    console.log('📜 Fetching chat history between:', currentUserId, 'and', userId);

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar')
    .sort({ createdAt: 1 })
    .limit(100); // Limit to last 100 messages

    console.log('📨 Found', messages.length, 'messages in chat history');

    res.json({ 
      success: true, 
      messages,
      count: messages.length 
    });
  } catch (error) {
    console.error('❌ Get chat history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching chat history',
      error: error.message 
    });
  }
};

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$createdAt' },
          lastMessageSender: { $first: '$sender' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: '$_id',
          username: '$user.username',
          avatar: '$user.avatar',
          isOnline: '$user.isOnline',
          lastSeen: '$user.lastSeen',
          lastMessage: 1,
          lastMessageTime: 1,
          lastMessageSender: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.body;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error while marking messages as read' });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: currentUserId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getConversations,
  markMessagesAsRead,
  deleteMessage
};