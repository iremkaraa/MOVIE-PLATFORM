// Review model — stores user reviews with optional spoiler sections
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tmdbId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  title: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  // Whether review contains spoilers (marked with ||spoiler text||)
  hasSpoilers: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);