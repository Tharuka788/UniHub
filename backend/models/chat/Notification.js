const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String, // String to match current User ID pattern (mock/dummy)
      required: true
    },
    senderId: {
      type: String,
      required: true
    },
    messagePreview: {
      type: String,
      required: true
    },
    itemId: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['message', 'handshake'],
      default: 'message'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
