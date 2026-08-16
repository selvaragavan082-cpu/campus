const express = require('express');
const router = express.Router();
const { getAdminStats, getStaffStats, getStudentStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/staff', protect, authorize('staff'), getStaffStats);
router.get('/student', protect, authorize('student'), getStudentStats);

module.exports = router;
