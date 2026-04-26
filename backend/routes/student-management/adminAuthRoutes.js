const express = require('express');
const {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} = require('../../controllers/student-management/adminAuthController');
const { validateBody } = require('../../middleware/student-management/validateRequest');
const { adminLoginSchema } = require('../../utils/student-management/validations/adminValidation');

const router = express.Router();

router.post('/login', validateBody(adminLoginSchema), loginAdmin);
router.get('/session', getAdminSession);
router.post('/logout', logoutAdmin);

module.exports = router;
