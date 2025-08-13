const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChats, createOrGetChat } = require('../controllers/chatController');

router.get('/', protect, getChats);
router.post('/', protect, createOrGetChat);

module.exports = router;