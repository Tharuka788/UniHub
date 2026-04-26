const express = require('express');
const adminRoutes = require('./adminRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');
const { getHealth } = require('../../controllers/student-management/healthController');
const integrationRoutes = require('./integrationRoutes');
const { requireAdminAuth } = require('../../middleware/student-management/adminAuth');

const router = express.Router();

router.get('/health', getHealth);
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin', requireAdminAuth, adminRoutes);
router.use('/integrations', integrationRoutes);

module.exports = router;
