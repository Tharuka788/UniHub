const Ticket = require('../../models/support/Ticket');

// @desc    Create new ticket
// @route   POST /api/support/tickets
// @access  Public
const createTicket = async (req, res) => {
  const { name, email, subject, description, priority } = req.body;

  if (!name || !email || !subject || !description) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  try {
    const ticket = await Ticket.create({
      name,
      email,
      subject,
      description,
      priority: priority || 'Low',
      status: 'Open',
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating ticket' });
  }
};

// @desc    Get user tickets by email
// @route   GET /api/support/tickets/user/:email
// @access  Public (In a real app, this might be protected with user auth)
const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user tickets' });
  }
};

// @desc    Get all tickets
// @route   GET /api/support/tickets
// @access  Private/Admin
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching all tickets' });
  }
};

// @desc    Update ticket status
// @route   PUT /api/support/tickets/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Open', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    const updatedTicket = await ticket.save();

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating ticket' });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/support/tickets/:id
// @access  Private/Admin
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Ticket removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting ticket' });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTickets,
  updateTicketStatus,
  deleteTicket
};
