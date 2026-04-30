// Review controller — handles review CRUD with spoiler detection
const Review = require('../models/Review');

// Detect if comment contains spoiler markers ||...||
const detectSpoilers = (comment) => /\|\|.+?\|\|/s.test(comment);

// @route   GET /api/reviews/:tmdbId
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tmdbId: req.params.tmdbId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/reviews/:tmdbId
const createReview = async (req, res) => {
  try {
    const { rating, comment, mediaType, title } = req.body;

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      tmdbId: req.params.tmdbId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this title' });
    }

    const review = await Review.create({
      user: req.user._id,
      tmdbId: req.params.tmdbId,
      mediaType,
      title,
      rating,
      comment,
      hasSpoilers: detectSpoilers(comment),
    });

    await review.populate('user', 'username avatar');
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getReviews, createReview, deleteReview };