const Payment = require('../../models/payment/Payment');
const PDFDocument = require('pdfkit');

// @desc    Get dashboard payment overview
// @route   GET /admin-dashboard/payment-overview
// @access  Admin
const getPaymentOverview = async (req, res) => {
  try {
    const statusCounts = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] } } } }
    ]);

    let totalPayments = 0;
    let totalRevenue = 0;
    const breakdown = { pending: 0, approved: 0, rejected: 0 };

    statusCounts.forEach(item => {
      totalPayments += item.count;
      totalRevenue += item.revenue;
      breakdown[item._id] = item.count;
    });

    const recentPayments = await Payment.find({}).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      totalPayments,
      totalRevenue,
      completed: breakdown.approved,
      pending: breakdown.pending,
      failed: breakdown.rejected,
      recentPayments
    });
  } catch (error) {
    console.error('Error fetching payment overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate a PDF report of the payment data
// @route   GET /admin-dashboard/payment-overview/pdf
// @access  Admin
const getPaymentOverviewPDF = async (req, res) => {
  try {
    const statusCounts = await Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] } } } }
    ]);

    let totalPayments = 0;
    let totalRevenue = 0;
    const breakdown = { pending: 0, approved: 0, rejected: 0 };

    statusCounts.forEach(item => {
      totalPayments += item.count;
      totalRevenue += item.revenue;
      breakdown[item._id] = item.count;
    });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=payment-report.pdf');
    
    doc.pipe(res);

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('Payment System Overview', { align: 'center' });
    doc.moveDown();
    
    // Date Header
    doc.fontSize(10).font('Helvetica').text(`Generated On: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(16).font('Helvetica-Bold').text('Payment Statistics Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Total Payments: ${totalPayments}`);
    doc.text(`Total Revenue: Rs. ${totalRevenue.toFixed(2)}`);
    doc.moveDown(1);
    doc.fillColor('#155724').text(`Completed: ${breakdown.approved}`);
    doc.fillColor('#856404').text(`Pending: ${breakdown.pending}`);
    doc.fillColor('#721c24').text(`Failed: ${breakdown.rejected}`);
    doc.fillColor('black');
    doc.moveDown(2);

    const recentPayments = await Payment.find({}).sort({ createdAt: -1 }).limit(10);
    
    doc.fontSize(16).font('Helvetica-Bold').text('Recent Payments', { underline: true });
    doc.moveDown(0.5);

    if (recentPayments.length === 0) {
      doc.fontSize(12).font('Helvetica-Oblique').text('No recent payments found.');
    } else {
      recentPayments.forEach((payment, index) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. User: ${payment.userId} - Rs. ${payment.amount.toFixed(2)}`, { continued: true });
        
        if (payment.status === 'pending') doc.fillColor('#856404');
        else if (payment.status === 'approved') doc.fillColor('#155724');
        else doc.fillColor('#721c24');
        
        doc.text(` [${payment.status.toUpperCase()}]`, { continued: true });
        doc.fillColor('black').font('Helvetica').text(`  |  ${payment.paymentFor}`, { align: 'right' });
        
        doc.fontSize(10).fillColor('grey').text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
        doc.fillColor('black');
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (error) {
    console.error('Error generating payment PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF' });
    }
  }
};

module.exports = {
  getPaymentOverview,
  getPaymentOverviewPDF,
};
