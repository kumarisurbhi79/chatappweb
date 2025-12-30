// Demo Data Seeder
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const createDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Check if demo users already exist
    const existingUsers = await User.find({
      email: { $in: ['demo1@chat.com', 'demo2@chat.com'] }
    });

    if (existingUsers.length > 0) {
      console.log('Demo users already exist!');
      return;
    }

    // Create demo users
    const demoUsers = [
      {
        username: 'Alice',
        email: 'demo1@chat.com',
        password: '123456'
      },
      {
        username: 'Bob', 
        email: 'demo2@chat.com',
        password: '123456'
      }
    ];

    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created demo user: ${userData.username} (${userData.email})`);
    }

    console.log('🎉 Demo users created successfully!');
    console.log('Login credentials:');
    console.log('User 1: demo1@chat.com / 123456');
    console.log('User 2: demo2@chat.com / 123456');

  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run if called directly
if (require.main === module) {
  createDemoUsers();
}

module.exports = createDemoUsers;