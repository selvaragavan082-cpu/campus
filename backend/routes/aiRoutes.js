const express = require('express');
const router = express.Router();
const { askCampusAI } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/ask', protect, askCampusAI);

module.exports = router;
