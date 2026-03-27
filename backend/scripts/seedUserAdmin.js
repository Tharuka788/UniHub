require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user/User');
const connectDB = require('../config/db');

const seedUserAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@unihub.com';
    const password = 'demo123';

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      console.log('User already exists, updating to admin...');
      user.isAdmin = true;
      user.password = password; // Will be re-hashed by pre-save hook
      await user.save();
      console.log('Admin user updated successfully');
    } else {
      console.log('Creating new admin user...');
      user = await User.create({
        name: 'Admin User',
        email,
        phoneNumber: '0112345678',
        password,
        isAdmin: true
      });
      console.log('Admin user created successfully');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedUserAdmin();
