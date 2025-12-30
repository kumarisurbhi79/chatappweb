// Add some demo users to the simple server
const addDemoUsers = () => {
  const demoUsers = [
    {
      id: 1,
      username: 'alice_smith',
      email: 'alice@demo.com',
      password: 'hashedpassword123', // In real app, this would be hashed
      avatar: null,
      isOnline: false,
      lastSeen: new Date()
    },
    {
      id: 2,
      username: 'bob_jones',
      email: 'bob@demo.com', 
      password: 'hashedpassword123', // In real app, this would be hashed
      avatar: null,
      isOnline: false,
      lastSeen: new Date()
    },
    {
      id: 3,
      username: 'carol_wilson',
      email: 'carol@demo.com',
      password: 'hashedpassword123', // In real app, this would be hashed
      avatar: null,
      isOnline: false,
      lastSeen: new Date()
    }
  ];

  // Add demo users to the users array
  users.push(...demoUsers);
  userIdCounter = 4; // Set counter after demo users
  
  console.log('✅ Demo users added:', demoUsers.map(u => u.username).join(', '));
};

// Export function to be used in server-simple.js
module.exports = { addDemoUsers };