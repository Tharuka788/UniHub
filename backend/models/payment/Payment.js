const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String, // Stored as a string to accommodate dynamic/dummy user IDs easily
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  paymentFor: {
    type: String,
    required: [true, 'Please specify what the payment is for']
  },
  slipImage: {
    type: String,
    required: [true, 'Payment slip image is required'] // Will store the file path
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
