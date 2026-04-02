const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    authUser, 
    getUserProfile,
    getUsers 
} = require('../../controllers/user/authController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/', protect, admin, getUsers);
router.get('/profile', protect, getUserProfile);

module.exports = router;
