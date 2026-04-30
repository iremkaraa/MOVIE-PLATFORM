// Review routes — GET is public, POST and DELETE require authentication
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');

// Public — anyone can read reviews
router.get('/:tmdbId', getReviews);

// Private — must be logged in to write or delete reviews
router.post('/:tmdbId', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;