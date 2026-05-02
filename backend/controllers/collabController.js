// Collaborative list controller — handles shared watchlist CRUD and voting
const CollaborativeList = require('../models/CollaborativeList');
const Friendship = require('../models/Friendship');

// @route   GET /api/collab
// @desc    Get all collaborative lists where current user is a member
const getMyLists = async (req, res) => {
  try {
    const lists = await CollaborativeList.find({ members: req.user._id })
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar')
      .sort({ updatedAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/collab/:id
// @desc    Get a specific collaborative list
const getListById = async (req, res) => {
  try {
    const list = await CollaborativeList.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar');

    if (!list) return res.status(404).json({ message: 'List not found' });

    // Only members can view
    if (!list.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member of this list' });
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/collab
// @desc    Create a new collaborative list
const createList = async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    // Verify all invited users are friends with the creator
    if (memberIds && memberIds.length > 0) {
      const friendships = await Friendship.find({
        $or: [
          { requester: req.user._id, recipient: { $in: memberIds } },
          { requester: { $in: memberIds }, recipient: req.user._id }
        ],
        status: 'accepted'
      });

      const validFriendIds = new Set();
      friendships.forEach(f => {
        validFriendIds.add(f.requester.toString());
        validFriendIds.add(f.recipient.toString());
      });

      const invalidIds = memberIds.filter(id => !validFriendIds.has(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({ message: 'Can only invite accepted friends' });
      }
    }

    const list = await CollaborativeList.create({
      name,
      owner: req.user._id,
      members: [req.user._id, ...(memberIds || [])],
      items: []
    });

    await list.populate('members', 'username avatar');
    res.status(201).json(list);
  } catch (err) {
    console.error('Create list error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/collab/:id/items
// @desc    Add a movie to the collaborative list
const addItem = async (req, res) => {
  try {
    const list = await CollaborativeList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (!list.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member' });
    }

    // Prevent duplicates
    if (list.items.some(i => i.tmdbId === req.body.tmdbId)) {
      return res.status(400).json({ message: 'Already in list' });
    }

    list.items.push({
      ...req.body,
      addedBy: req.user._id,
      votes: []
    });

    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/collab/:id/items/:tmdbId
// @desc    Remove an item from the list
const removeItem = async (req, res) => {
  try {
    const list = await CollaborativeList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (!list.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member' });
    }

    list.items = list.items.filter(i => i.tmdbId !== parseInt(req.params.tmdbId));
    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   POST /api/collab/:id/items/:tmdbId/vote
// @desc    Toggle a vote for a movie in the list
const voteForItem = async (req, res) => {
  try {
    const list = await CollaborativeList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (!list.members.some(m => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a member' });
    }

    const item = list.items.find(i => i.tmdbId === parseInt(req.params.tmdbId));
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const userId = req.user._id.toString();
    const alreadyVoted = item.votes.some(v => v.toString() === userId);

    if (alreadyVoted) {
      item.votes = item.votes.filter(v => v.toString() !== userId);
    } else {
      item.votes.push(req.user._id);
    }

    await list.save();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/collab/:id
// @desc    Delete a collaborative list (only owner)
const deleteList = async (req, res) => {
  try {
    const list = await CollaborativeList.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    if (list.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this list' });
    }

    await list.deleteOne();
    res.json({ message: 'List deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyLists, getListById, createList, addItem, removeItem, voteForItem, deleteList };