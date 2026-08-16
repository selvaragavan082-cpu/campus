const express = require('express');
const router = express.Router();
const {
  uploadResource,
  getResources,
  getResourceById,
  deleteResource,
  trackDownload,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getResources)
  .post(protect, authorize('admin', 'staff'), upload.single('file'), uploadResource);

router.route('/:id')
  .get(protect, getResourceById)
  .delete(protect, authorize('admin', 'staff'), deleteResource);

router.post('/:id/download', protect, trackDownload);

module.exports = router;
