const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const {
  createTicket,
  getTickets,
  getMyTickets,
  updateTicket,
  getTicketById,
  deleteTicket,
  getTicketReports,
  getTicketReportsPDF
} = require('../../controllers/support/ticketController');

router.post('/create', createTicket);
router.get('/reports', getTicketReports);
router.get('/reports/pdf', getTicketReportsPDF);
router.get('/my-tickets', protect, getMyTickets);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.put('/update/:id', updateTicket);
router.delete('/delete/:id', deleteTicket);

module.exports = router;
