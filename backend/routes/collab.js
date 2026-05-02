// Collaborative routes — all routes require authentication
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyLists,
  getListById,
  createList,
  addItem,
  removeItem,
  voteForItem,
  deleteList
} = require('../controllers/collabController');

router.get('/', protect, getMyLists);
router.get('/:id', protect, getListById);
router.post('/', protect, createList);
router.post('/:id/items', protect, addItem);
router.delete('/:id/items/:tmdbId', protect, removeItem);
router.post('/:id/items/:tmdbId/vote', protect, voteForItem);
router.delete('/:id', protect, deleteList);

module.exports = router;
