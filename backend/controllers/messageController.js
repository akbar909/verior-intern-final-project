const Message = require('../models/Message');
const Chat = require('../models/Chat');

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });
    if (!chat) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });
    if (!chat) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      content: content.trim()
    });
    chat.lastMessage = message._id;
    await chat.updateLastActivity();
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
