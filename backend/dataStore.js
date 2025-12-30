const fs = require('fs');
const path = require('path');

// File paths for data storage
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Load data from files or initialize empty arrays
let users = [];
let messages = [];
let userIdCounter = 1;
let messageIdCounter = 1;

// Load users
if (fs.existsSync(USERS_FILE)) {
  try {
    const userData = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(userData);
    userIdCounter = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Load messages
if (fs.existsSync(MESSAGES_FILE)) {
  try {
    const messageData = fs.readFileSync(MESSAGES_FILE, 'utf8');
    messages = JSON.parse(messageData);
    messageIdCounter = messages.length > 0 ? Math.max(...messages.map(m => m._id)) + 1 : 1;
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Save data functions
const saveUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

const saveMessages = () => {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

module.exports = {
  users,
  messages,
  userIdCounter,
  messageIdCounter,
  saveUsers,
  saveMessages,
  setUserIdCounter: (counter) => { userIdCounter = counter; },
  setMessageIdCounter: (counter) => { messageIdCounter = counter; }
};