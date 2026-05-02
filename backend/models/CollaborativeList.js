// Collaborative watchlist — shared list among multiple friends
const mongoose = require('mongoose');

const collaborativeListSchema = new mongoose.Schema({
  // Display name of the list
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  // User who created the list
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // All users who can view and edit the list (includes owner)
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Movies in the list
  items: [{
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    overview: { type: String, default: '' },
    voteAverage: { type: Number, default: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('CollaborativeList', collaborativeListSchema);