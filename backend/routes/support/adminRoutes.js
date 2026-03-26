const express = require('express');
const router = express.Router();
const { authAdmin, registerAdmin } = require('../../controllers/support/adminController');

router.post('/login', authAdmin);
// Initial setup route (consider removing/restricting in real prod app)
router.post('/register', registerAdmin);

module.exports = router;
