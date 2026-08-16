const express = require('express');
const router = express.Router();
const {
  getTimetable,
  createOrUpdateTimetable,
  getFacultySchedule,
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getTimetable)
  .post(protect, authorize('admin', 'staff'), createOrUpdateTimetable);

router.get('/faculty/my-schedule', protect, authorize('staff'), getFacultySchedule);

module.exports = router;
