const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAnnouncements)
  .post(protect, authorize('admin', 'staff'), createAnnouncement);

router.route('/:id')
  .get(protect, getAnnouncementById)
  .put(protect, authorize('admin', 'staff'), updateAnnouncement)
  .delete(protect, authorize('admin', 'staff'), deleteAnnouncement);

module.exports = router;
