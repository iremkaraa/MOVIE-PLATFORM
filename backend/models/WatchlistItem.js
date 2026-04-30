// WatchlistItem model — stores movies/series added to a user's watchlist
const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  // Reference to the user who owns this watchlist item
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // TMDB movie/series ID — used to fetch details from TMDB API
  tmdbId: {
    type: Number,
    required: true
  },

  // Whether this is a movie or a TV series
  mediaType: {
    type: String,
    enum: ['movie', 'tv'],
    required: true
  },

  // Basic info stored locally to avoid extra TMDB API calls
  title: {
    type: String,
    required: true
  },
  posterPath: {
    type: String,
    default: ''
  },
  overview: {
    type: String,
    default: ''
  },
  releaseDate: {
    type: String,
    default: ''
  },
  voteAverage: {
    type: Number,
    default: 0
  },

  // Watch status — has the user watched this item yet
  watched: {
    type: Boolean,
    default: false
  },

  // Date when the user marked this item as watched
  watchedAt: {
    type: Date,
    default: null
  },

  // Collaborative watchlist reference — null means personal list
  collaborativeList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborativeList',
    default: null
  },

  // Votes for "What should we watch tonight?" feature
  votes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  }

}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true
});

// Prevent duplicate entries — same user cannot add same movie twice
watchlistItemSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);