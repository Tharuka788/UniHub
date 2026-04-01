const Ticket = require('../../models/support/Ticket');
const PDFDocument = require('pdfkit');

// @desc    Create a new support ticket
// @route   POST /admin-support/create
// @access  Public
const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, subject, message' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const ticket = new Ticket({
      name,
      email,
      subject,
      message,
    });

    await ticket.save();

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error while creating ticket' });
  }
};

// @desc    Get tickets by email (or all with pagination)
// @route   GET /admin-support/tickets
// @access  Public / Admin
const getTickets = async (req, res) => {
  try {
    const { email, page = 1, limit = 10 } = req.query;

    const query = {};
    if (email) {
      query.email = email;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 }) // Sort latest first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      tickets,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server error while fetching tickets' });
  }
};

// @desc    Update ticket status and response
// @route   PUT /admin-support/update/:id
// @access  Admin
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (response) ticket.response = response;

    const updatedTicket = await ticket.save();

    res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(500).json({ message: 'Server error while updating ticket' });
  }
};

// @desc    Get single ticket
// @route   GET /admin-support/tickets/:id
// @access  Admin
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(500).json({ message: 'Server error while fetching ticket' });
  }
};

// @desc    Delete ticket
// @route   DELETE /admin-support/delete/:id
// @access  Admin
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await ticket.deleteOne();
    res.status(200).json({ message: 'Ticket removed' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(500).json({ message: 'Server error while deleting ticket' });
  }
};

// @desc    Get ticket reports & statistics
// @route   GET /admin-support/reports
// @access  Admin
const getTicketReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter if provided
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    // 1. Total counts & status breakdown
    const statusCounts = await Ticket.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let totalTickets = 0;
    const breakdown = {
      Pending: 0,
      'In Progress': 0,
      Resolved: 0
    };

    statusCounts.forEach(item => {
      totalTickets += item.count;
      breakdown[item._id] = item.count;
    });

    // 2. Tickets grouped by date (daily)
    const dailyTickets = await Ticket.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalTickets,
      breakdown,
      dailyTickets
    });
  } catch (error) {
    console.error('Error fetching ticket reports:', error);
    res.status(500).json({ message: 'Server error while generating reports' });
  }
};

// @desc    Download ticket reports as PDF
// @route   GET /admin-support/reports/pdf
// @access  Admin
const getTicketReportsPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const statusCounts = await Ticket.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    let totalTickets = 0;
    const breakdown = { Pending: 0, 'In Progress': 0, Resolved: 0 };

    statusCounts.forEach(item => {
      totalTickets += item.count;
      breakdown[item._id] = item.count;
    });

    const recentTickets = await Ticket.find(matchStage).sort({ createdAt: -1 }).limit(20);

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('Support Ticket Report', { align: 'center' });
    doc.moveDown();
    
    // Date Header
    doc.fontSize(10).font('Helvetica').text(`Generated On: ${new Date().toLocaleDateString()}`, { align: 'right' });
    if (startDate || endDate) {
      doc.text(`Date Range: ${startDate || 'Beginning'} to ${endDate || 'Current'}`, { align: 'right' });
    }
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(16).font('Helvetica-Bold').text('Ticket Status Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Total Tickets: ${totalTickets}`);
    doc.fillColor('#856404').text(`Pending: ${breakdown.Pending}`);
    doc.fillColor('#0c5460').text(`In Progress: ${breakdown['In Progress']}`);
    doc.fillColor('#155724').text(`Resolved: ${breakdown.Resolved}`);
    doc.fillColor('black');
    doc.moveDown(2);

    // Recent Tickets Table (List view)
    doc.fontSize(16).font('Helvetica-Bold').text('Recent Tickets Overview', { underline: true });
    doc.moveDown(0.5);

    if (recentTickets.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').text('No tickets found for this period.');
    } else {
      recentTickets.forEach((ticket, index) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${ticket.subject} `, { continued: true });
        
        // Status formatting
        if (ticket.status === 'Pending') doc.fillColor('#856404');
        else if (ticket.status === 'In Progress') doc.fillColor('#0c5460');
        else doc.fillColor('#155724');
        
        doc.text(`[${ticket.status}]`, { continued: true });
        doc.fillColor('black').font('Helvetica').text(`  |  ${ticket.email}`, { align: 'right' });
        
        doc.fontSize(10).fillColor('grey').text(`Submitted: ${new Date(ticket.createdAt).toLocaleDateString()}`);
        doc.fillColor('black');
        doc.moveDown(0.5);
      });
    }

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF' });
    }
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
  getTicketById,
  deleteTicket,
  getTicketReports,
  getTicketReportsPDF,
};
