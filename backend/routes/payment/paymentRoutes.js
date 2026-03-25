const express = require('express');
const router = express.Router();
const upload = require('../../middleware/uploadMiddleware');
const { protect, admin } = require('../../middleware/authMiddleware');
const {
  uploadPayment,
  getUserPayments,
  getAllPayments,
  updatePaymentStatus
} = require('../../controllers/payment/paymentController');

// Multer error handling wrapper
const uploadHandler = (req, res, next) => {
  const fileUpload = upload.single('slipImage');
  fileUpload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/upload', protect, uploadHandler, uploadPayment);
router.get('/user/:userId', protect, getUserPayments);
router.get('/', protect, admin, getAllPayments);
router.put('/:id', protect, admin, updatePaymentStatus);

module.exports = router;
