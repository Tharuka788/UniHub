const express = require('express');
const router = express.Router();
const {
  getPaymentOverview,
  getPaymentOverviewPDF
} = require('../../controllers/admin/adminDashboardController');

router.get('/payment-overview', getPaymentOverview);
router.get('/payment-overview/pdf', getPaymentOverviewPDF);

module.exports = router;
