const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../../controllers/chat/notificationController');

// All notification routes are protected
router.get('/:userId', protect, getNotifications);
router.patch('/:id/read', protect, markAsRead);
router.patch('/user/:userId/read-all', protect, markAllAsRead);

module.exports = router;
