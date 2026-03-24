const Payment = require('../../models/payment/Payment');

// @desc    Upload payment slip and save payment details
// @route   POST /api/payments/upload
// @access  Private
const uploadPayment = async (req, res) => {
  try {
    const { userId, amount, paymentFor } = req.body;

    // File uploaded by Multer is in req.file
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file (jpg, jpeg, png) under 2MB' });
    }

    const slipImage = `uploads/${req.file.filename}`;

    const payment = await Payment.create({
      userId,
      amount,
      paymentFor,
      slipImage
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error uploading payment:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get user payments
// @route   GET /api/payments/user/:userId
// @access  Private
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    // Pagination (optional)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const count = await Payment.countDocuments({});

    res.json({
      payments,
      page,
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (status) payment.status = status;
    if (remarks !== undefined) payment.remarks = remarks;

    const updatedPayment = await payment.save();
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  uploadPayment,
  getUserPayments,
  getAllPayments,
  updatePaymentStatus
};
