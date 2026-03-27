const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await Admin.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = new Admin({
      username: 'admin',
      email: 'admin@unihub.com',
      password: 'admin123', // Will be hashed by pre-save hook
    });

    await admin.save();
    console.log('Admin seeded successfully: admin / admin123');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
