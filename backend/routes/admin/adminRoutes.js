const express = require('express');
const router = express.Router();
const { authAdmin } = require('../../controllers/admin/adminController');

router.post('/login', authAdmin);

module.exports = router;
