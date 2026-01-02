// Database helper functions for better performance and error handling

const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
};

/**
 * Create safe query with proper error handling
 * @param {Function} queryFunction - The async function to execute
 * @param {string} operation - Description of the operation
 * @returns {Object} - { success, data, error }
 */
const safeQuery = async (queryFunction, operation = 'database operation') => {
  try {
    const data = await queryFunction();
    return { success: true, data, error: null };
  } catch (error) {
    console.error(`❌ ${operation} failed:`, error);
    return { 
      success: false, 
      data: null, 
      error: error.message || 'Database operation failed' 
    };
  }
};

/**
 * Get pagination parameters with validation
 * @param {Object} query - Request query object
 * @returns {Object} - { page, limit, skip }
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Format message for response with proper user data
 * @param {Object} message - Message document
 * @returns {Object} - Formatted message
 */
const formatMessage = (message) => {
  const formatted = message.toObject ? message.toObject() : message;
  
  // Ensure sender and receiver have proper avatar URLs
  if (formatted.sender && formatted.sender.avatar && !formatted.sender.avatar.startsWith('http')) {
    formatted.sender.avatar = `${process.env.API_URL || 'http://localhost:5000'}${formatted.sender.avatar}`;
  }
  
  if (formatted.receiver && formatted.receiver.avatar && !formatted.receiver.avatar.startsWith('http')) {
    formatted.receiver.avatar = `${process.env.API_URL || 'http://localhost:5000'}${formatted.receiver.avatar}`;
  }
  
  return formatted;
};

/**
 * Create aggregation pipeline for chat conversations
 * @param {string} userId - Current user ID
 * @returns {Array} - Aggregation pipeline
 */
const getConversationsPipeline = (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  return [
    {
      $match: {
        $or: [
          { sender: userObjectId },
          { receiver: userObjectId }
        ],
        isDeleted: { $ne: true }
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', userObjectId] },
            '$receiver',
            '$sender'
          ]
        },
        lastMessage: { $first: '$message' },
        lastMessageTime: { $first: '$createdAt' },
        lastMessageSender: { $first: '$sender' },
        lastMessageType: { $first: '$messageType' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', userObjectId] },
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
        avatar: {
          $cond: [
            { $regexMatch: { input: '$user.avatar', regex: /^https?:\/\// } },
            '$user.avatar',
            { $concat: [process.env.API_URL || 'http://localhost:5000', '$user.avatar'] }
          ]
        },
        isOnline: '$user.isOnline',
        lastSeen: '$user.lastSeen',
        lastMessage: 1,
        lastMessageTime: 1,
        lastMessageSender: 1,
        lastMessageType: 1,
        unreadCount: 1
      }
    },
    {
      $sort: { lastMessageTime: -1 }
    }
  ];
};

/**
 * Build message query with proper filters
 * @param {string} currentUserId - Current user ID
 * @param {string} otherUserId - Other user ID
 * @param {Object} options - Query options
 * @returns {Object} - MongoDB query object
 */
const buildMessageQuery = (currentUserId, otherUserId, options = {}) => {
  const query = {
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId }
    ]
  };
  
  // Exclude deleted messages unless specifically requested
  if (!options.includeDeleted) {
    query.isDeleted = { $ne: true };
  }
  
  // Filter by message type if specified
  if (options.messageType) {
    query.messageType = options.messageType;
  }
  
  // Filter by read status if specified
  if (options.isRead !== undefined) {
    query.isRead = options.isRead;
  }
  
  return query;
};

module.exports = {
  isValidObjectId,
  safeQuery,
  getPaginationParams,
  formatMessage,
  getConversationsPipeline,
  buildMessageQuery
};