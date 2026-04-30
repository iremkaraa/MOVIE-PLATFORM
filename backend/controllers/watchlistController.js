// Watchlist controller — handles all watchlist operations
const WatchlistItem = require('../models/WatchlistItem');
const User = require('../models/User');

// @route   GET /api/watchlist
// @desc    Get all watchlist items for logged in user
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const items = await WatchlistItem.find({ user: req.user._id })
      .sort({ createdAt: -1 }); // Most recently added first
    res.json(items);
  } catch (error) {
    console.error('Get watchlist error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/watchlist
// @desc    Add a movie or series to watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { tmdbId, mediaType, title, posterPath, overview, releaseDate, voteAverage } = req.body;

    // Check if item already exists in user's watchlist
    const exists = await WatchlistItem.findOne({
      user: req.user._id,
      tmdbId
    });

    if (exists) {
      return res.status(400).json({ message: 'Already in your watchlist' });
    }

    // Create new watchlist item
    const item = await WatchlistItem.create({
      user: req.user._id,
      tmdbId,
      mediaType,
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Add to watchlist error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/watchlist/:tmdbId
// @desc    Remove a movie from watchlist
// @access  Private
const removeFromWatchlist = async (req, res) => {
  try {
    const item = await WatchlistItem.findOneAndDelete({
      user: req.user._id,
      tmdbId: req.params.tmdbId
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found in watchlist' });
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PATCH /api/watchlist/:tmdbId/watched
// @desc    Mark a movie as watched and update streak
// @access  Private
const markAsWatched = async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({
      user: req.user._id,
      tmdbId: req.params.tmdbId
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found in watchlist' });
    }

    // Mark item as watched
    item.watched = true;
    item.watchedAt = new Date();
    await item.save();

    // Update user streak
    const user = await User.findById(req.user._id);
    const today = new Date();
    const lastWatched = user.streak.lastWatchedDate;

    if (lastWatched) {
      const diffDays = Math.floor((today - lastWatched) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day — increment streak
        user.streak.count += 1;
      } else if (diffDays > 1) {
        // Streak broken — reset to 1
        user.streak.count = 1;
      }
      // diffDays === 0 means watched twice today — no change
    } else {
      // First time watching — start streak
      user.streak.count = 1;
    }

    user.streak.lastWatchedDate = today;

    // Check and award badges based on streak and total watched count
    const totalWatched = await WatchlistItem.countDocuments({
      user: req.user._id,
      watched: true
    });

    // Award streak badges
    if (user.streak.count >= 7 && !user.badges.includes('7-day-streak')) {
      user.badges.push('7-day-streak');
    }
    if (user.streak.count >= 30 && !user.badges.includes('30-day-streak')) {
      user.badges.push('30-day-streak');
    }

    // Award total watched badges
    if (totalWatched >= 10 && !user.badges.includes('watched-10')) {
      user.badges.push('watched-10');
    }
    if (totalWatched >= 50 && !user.badges.includes('watched-50')) {
      user.badges.push('watched-50');
    }

    await user.save();

    res.json({ item, streak: user.streak, badges: user.badges });
  } catch (error) {
    console.error('Mark as watched error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/watchlist/:tmdbId/vote
// @desc    Vote for a movie in "What should we watch tonight?" feature
// @access  Private
const voteForMovie = async (req, res) => {
  try {
    const item = await WatchlistItem.findOne({
      user: req.params.userId || req.user._id,
      tmdbId: req.params.tmdbId
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Toggle vote — if already voted remove vote, otherwise add vote
    const alreadyVoted = item.votes.includes(req.user._id);

    if (alreadyVoted) {
      item.votes = item.votes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      item.votes.push(req.user._id);
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Vote error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, markAsWatched, voteForMovie };