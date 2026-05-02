// Friend controller — handles friend requests and friend list management
const Friendship = require('../models/Friendship');
const User = require('../models/User');

// @route   POST /api/friends/request/:userId
// @desc    Send a friend request to another user
const sendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const requesterId = req.user._id;

    if (recipientId === requesterId.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if a friendship already exists in either direction
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    const friendship = await Friendship.create({
      requester: requesterId,
      recipient: recipientId,
    });

    res.status(201).json(friendship);
  } catch (err) {
    console.error('Send request error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PATCH /api/friends/respond/:friendshipId
// @desc    Accept or reject a friend request
const respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const friendship = await Friendship.findById(req.params.friendshipId);

    if (!friendship) return res.status(404).json({ message: 'Request not found' });

    // Only the recipient can respond
    if (friendship.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendship.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendship.save();

    res.json(friendship);
  } catch (err) {
    console.error('Respond error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/friends
// @desc    Get current user's accepted friends
const getFriends = async (req, res) => {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'accepted'
    })
      .populate('requester', 'username avatar streak')
      .populate('recipient', 'username avatar streak');

    // Return the "other" user from each friendship
    const friends = friendships.map(f => {
      const isRequester = f.requester._id.toString() === req.user._id.toString();
      return isRequester ? f.recipient : f.requester;
    });

    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/friends/pending
// @desc    Get pending friend requests (received)
const getPendingRequests = async (req, res) => {
  try {
    const requests = await Friendship.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'username avatar');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/friends/sent
// @desc    Get pending friend requests (sent by me)
const getSentRequests = async (req, res) => {
  try {
    const requests = await Friendship.find({
      requester: req.user._id,
      status: 'pending'
    }).populate('recipient', 'username avatar');

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/friends/:userId
// @desc    Remove a friend (delete friendship in either direction)
const removeFriend = async (req, res) => {
  try {
    const otherId = req.params.userId;
    await Friendship.deleteMany({
      $or: [
        { requester: req.user._id, recipient: otherId },
        { requester: otherId, recipient: req.user._id }
      ]
    });
    res.json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendRequest, respondToRequest, getFriends, getPendingRequests, getSentRequests, removeFriend };