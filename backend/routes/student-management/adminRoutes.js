const express = require('express');
const {
  getAdminDashboardSummary,
  getAdminEnrollmentList,
  sendClassLinks,
} = require('../../controllers/student-management/adminController');
const { validateBody, validateQuery } = require('../../middleware/student-management/validateRequest');
const { adminEnrollmentQuerySchema } = require('../../utils/student-management/validations/adminValidation');
const { sendClassLinkSchema } = require('../../utils/student-management/validations/classLinkValidation');
const adminClassOfferingsRoutes = require('./adminClassOfferingsRoutes');
const adminReportsRoutes = require('./adminReportsRoutes');
const adminStudentsRoutes = require('./adminStudentsRoutes');

const router = express.Router();

router.get('/dashboard/summary', getAdminDashboardSummary);
router.get('/enrollments', validateQuery(adminEnrollmentQuerySchema), getAdminEnrollmentList);
router.use('/students', adminStudentsRoutes);
router.use('/class-offerings', adminClassOfferingsRoutes);
router.use('/reports', adminReportsRoutes);
router.post('/class-links/send', validateBody(sendClassLinkSchema), sendClassLinks);

module.exports = router;
