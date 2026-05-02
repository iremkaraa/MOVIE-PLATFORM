// Friend routes — all require authentication
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendRequest, respondToRequest, getFriends,
  getPendingRequests, getSentRequests, removeFriend
} = require('../controllers/friendController');

router.get('/', protect, getFriends);
router.get('/pending', protect, getPendingRequests);
router.get('/sent', protect, getSentRequests);
router.post('/request/:userId', protect, sendRequest);
router.patch('/respond/:friendshipId', protect, respondToRequest);
router.delete('/:userId', protect, removeFriend);

module.exports = router;