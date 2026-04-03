const express = require('express');
const {
  downloadAdminReportPdf,
  getAdminReportSummary,
} = require('../../controllers/student-management/adminReportsController');
const { validateQuery } = require('../../middleware/student-management/validateRequest');
const {
  reportPdfQuerySchema,
  reportSummaryQuerySchema,
} = require('../../utils/student-management/validations/reportSchemas');

const router = express.Router();

router.get('/summary', validateQuery(reportSummaryQuerySchema), getAdminReportSummary);
router.get('/pdf', validateQuery(reportPdfQuerySchema), downloadAdminReportPdf);

module.exports = router;
