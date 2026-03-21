const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        family: 4, // අනිවාර්යයෙන්ම මේක දාන්න (Force IPv4)
    });
    console.log("✅ Connected to MongoDB via Legacy String!");
  } catch (error) {
    console.error("❌ Still having issues:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
