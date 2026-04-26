const express = require('express');
const { createConfirmedEnrollment } = require('../../controllers/student-management/integrationController');
const { requireIntegrationAccess } = require('../../middleware/student-management/integrationAuth');
const { validateBody } = require('../../middleware/student-management/validateRequest');
const { confirmedEnrollmentPayloadSchema } = require('../../utils/student-management/validations/enrollmentIntegrationValidation');

const router = express.Router();

router.post(
  '/enrollments/confirmed',
  requireIntegrationAccess,
  validateBody(confirmedEnrollmentPayloadSchema),
  createConfirmedEnrollment,
);

module.exports = router;
