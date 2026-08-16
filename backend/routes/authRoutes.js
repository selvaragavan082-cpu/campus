const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUsers, updateProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
