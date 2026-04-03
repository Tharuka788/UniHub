const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  requestHandshake,
  acceptHandshake
} = require('../../controllers/lost-and-found/connectionController');

// All connection routes are protected
router.post('/:id/request-handshake', protect, requestHandshake);
router.post('/:id/accept-handshake/:requesterId', protect, acceptHandshake);

module.exports = router;
