// Badge routes — all routes require authentication
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyBadges } = require('../controllers/badgeController');

// Get badges and streak info for logged in user
router.get('/me', protect, getMyBadges);

module.exports = router;