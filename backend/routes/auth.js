// Auth routes — registration, login, user management, compatibility, admin moderation
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const WatchlistItem = require('../models/WatchlistItem');
const Review = require('../models/Review');

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// @route   GET /api/auth/users
// @desc    Get all users (excluding self) — for compatibility browsing
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

    const [myItems, theirItems, myReviews, theirReviews, theirUser] = await Promise.all([
      WatchlistItem.find({ user: myUserId, watched: true }),
      WatchlistItem.find({ user: otherUserId, watched: true }),
      Review.find({ user: myUserId }),
      Review.find({ user: otherUserId }),
      User.findById(otherUserId).select('username avatar'),
    ]);

    if (!theirUser) return res.status(404).json({ message: 'User not found' });

    const myWatchedIds = new Set(myItems.map(i => i.tmdbId));
    const theirWatchedIds = new Set(theirItems.map(i => i.tmdbId));
    const commonIds = [...myWatchedIds].filter(id => theirWatchedIds.has(id));

    const myRatings = {};
    myReviews.forEach(r => { myRatings[r.tmdbId] = r.rating; });
    const theirRatings = {};
    theirReviews.forEach(r => { theirRatings[r.tmdbId] = r.rating; });

    const commonRated = commonIds.filter(id => myRatings[id] && theirRatings[id]);

    let score = 0;
    let breakdown = { commonWatched: commonIds.length, commonRated: commonRated.length };

    if (commonIds.length > 0) {
      const overlapScore = Math.min(commonIds.length / 20, 1) * 50;
      let ratingScore = 50;
      if (commonRated.length > 0) {
        let totalDiff = 0;
        commonRated.forEach(id => {
          totalDiff += Math.abs(myRatings[id] - theirRatings[id]);
        });
        const avgDiff = totalDiff / commonRated.length;
        ratingScore = Math.max(0, 50 - (avgDiff * 12.5));
      }
      score = Math.round(overlapScore + ratingScore);
    }

    const commonItems = myItems
      .filter(i => theirWatchedIds.has(i.tmdbId))
      .slice(0, 6)
      .map(i => ({
        tmdbId: i.tmdbId,
        title: i.title,
        posterPath: i.posterPath,
        mediaType: i.mediaType,
      }));

    res.json({ score, otherUser: theirUser, breakdown, commonItems });

  } catch (err) {
    console.error('Compatibility error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====================================================================
// ADMIN ROUTES — all protected by admin middleware
// ====================================================================

// @route   GET /api/auth/admin/users
// @desc    Get all users including self (admin view)
router.get('/admin/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/admin/reviews
// @desc    Get all reviews across the platform
router.get('/admin/reviews', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/admin/stats
// @desc    Platform-wide statistics
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const [totalUsers, totalAdmins, totalWatchlistItems, totalReviews, totalWatched] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      WatchlistItem.countDocuments({}),
      Review.countDocuments({}),
      WatchlistItem.countDocuments({ watched: true }),
    ]);

    res.json({ totalUsers, totalAdmins, totalWatchlistItems, totalReviews, totalWatched });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/auth/admin/users/:id/role
// @desc    Promote or demote user role (user ↔ admin)
router.patch('/admin/users/:id/role', protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/auth/admin/users/:id
// @desc    Delete a user account (and all their content)
router.delete('/admin/users/:id', protect, admin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Cascade delete — remove user's watchlist items and reviews
    await Promise.all([
      WatchlistItem.deleteMany({ user: user._id }),
      Review.deleteMany({ user: user._id }),
      user.deleteOne(),
    ]);

    res.json({ message: 'User and all related content deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/auth/admin/reviews/:id
// @desc    Delete any review (admin moderation)
router.delete('/admin/reviews/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await review.deleteOne();
    res.json({ message: 'Review deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;