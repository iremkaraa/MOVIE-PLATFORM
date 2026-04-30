// Auth routes — registration, login, user management, compatibility
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const WatchlistItem = require('../models/WatchlistItem');
const Review = require('../models/Review');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// @route   GET /api/auth/users
// @desc    Get all users (for admin or compatibility browsing)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/compatibility/:userId
// @desc    Calculate film compatibility score with another user
router.get('/compatibility/:userId', protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const myUserId = req.user._id;

    // Fetch both users' watched items and reviews in parallel
    const [myItems, theirItems, myReviews, theirReviews, theirUser] = await Promise.all([
      WatchlistItem.find({ user: myUserId, watched: true }),
      WatchlistItem.find({ user: otherUserId, watched: true }),
      Review.find({ user: myUserId }),
      Review.find({ user: otherUserId }),
      User.findById(otherUserId).select('username avatar'),
    ]);

    if (!theirUser) return res.status(404).json({ message: 'User not found' });

    // Find movies both users watched
    const myWatchedIds = new Set(myItems.map(i => i.tmdbId));
    const theirWatchedIds = new Set(theirItems.map(i => i.tmdbId));
    const commonIds = [...myWatchedIds].filter(id => theirWatchedIds.has(id));

    // Build rating map for each user (from reviews)
    const myRatings = {};
    myReviews.forEach(r => { myRatings[r.tmdbId] = r.rating; });
    const theirRatings = {};
    theirReviews.forEach(r => { theirRatings[r.tmdbId] = r.rating; });

    // Find movies both users rated
    const commonRated = commonIds.filter(id => myRatings[id] && theirRatings[id]);

    // Compute taste similarity score
    let score = 0;
    let breakdown = { commonWatched: commonIds.length, commonRated: commonRated.length };

    if (commonIds.length === 0) {
      // No common movies — score is 0
      score = 0;
    } else {
      // Base score from overlap (max 50 points)
      // Larger overlap = higher score, capped at 20 movies for full points
      const overlapScore = Math.min(commonIds.length / 20, 1) * 50;

      // Rating similarity (max 50 points)
      let ratingScore = 50; // Start at 50 if no rated overlap
      if (commonRated.length > 0) {
        let totalDiff = 0;
        commonRated.forEach(id => {
          totalDiff += Math.abs(myRatings[id] - theirRatings[id]);
        });
        const avgDiff = totalDiff / commonRated.length; // 0 to 4
        ratingScore = Math.max(0, 50 - (avgDiff * 12.5)); // 0 diff = 50, 4 diff = 0
      }

      score = Math.round(overlapScore + ratingScore);
    }

    // Get titles of common watched items for display
    const commonItems = myItems
      .filter(i => theirWatchedIds.has(i.tmdbId))
      .slice(0, 6)
      .map(i => ({
        tmdbId: i.tmdbId,
        title: i.title,
        posterPath: i.posterPath,
        mediaType: i.mediaType,
      }));

    res.json({
      score,
      otherUser: theirUser,
      breakdown,
      commonItems,
    });

  } catch (err) {
    console.error('Compatibility error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;