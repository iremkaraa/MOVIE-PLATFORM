// Main server file — initializes and runs the Express application
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware — parse incoming JSON requests
app.use(express.json());

// Allow all origins in development
app.use(cors());

// Routes — separate route file for each feature
app.use('/api/auth', require('./routes/auth'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/collab', require('./routes/collab'));

// Base route — used to verify the server is running
app.get('/', (req, res) => {
  res.json({ message: '🎬 Movie Platform API is running!' });
});

// Connect to MongoDB then start the server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});