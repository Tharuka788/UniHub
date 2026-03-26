const express = require('express');
const router = express.Router();
const {
  createTicket,
  getUserTickets,
  getTickets,
  updateTicketStatus,
  deleteTicket
} = require('../../controllers/support/ticketController');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public routes
router.post('/', createTicket);
router.get('/user/:email', getUserTickets);

// Protected Admin routes
router.get('/', protect, admin, getTickets);
router.put('/:id/status', protect, admin, updateTicketStatus);
router.delete('/:id', protect, admin, deleteTicket);

module.exports = router;
