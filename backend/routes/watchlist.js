// Watchlist routes — all routes require authentication
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  markAsWatched,
  voteForMovie
} = require('../controllers/watchlistController');

// All watchlist routes are protected — user must be logged in
router.get('/', protect, getWatchlist);
router.post('/', protect, addToWatchlist);
router.delete('/:tmdbId', protect, removeFromWatchlist);
router.patch('/:tmdbId/watched', protect, markAsWatched);
router.post('/:tmdbId/vote', protect, voteForMovie);

module.exports = router;