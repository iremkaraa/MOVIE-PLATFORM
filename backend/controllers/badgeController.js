// Badge controller — handles fetching user badges and streak info
const User = require('../models/User');
const WatchlistItem = require('../models/WatchlistItem');

// @route   GET /api/badges/me
// @desc    Get badges and streak info for logged in user
// @access  Private
const getMyBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('badges streak username avatar');

    // Get total number of watched movies
    const totalWatched = await WatchlistItem.countDocuments({
      user: req.user._id,
      watched: true
    });

    res.json({
      badges: user.badges,
      streak: user.streak,
      totalWatched,
      username: user.username,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Get badges error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyBadges };