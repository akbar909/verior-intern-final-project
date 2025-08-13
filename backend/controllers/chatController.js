const Chat = require('../models/Chat');

const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'username email avatar isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username'
      }
    })
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrGetChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, participantId] }
    }).populate('participants', 'username email avatar isOnline lastSeen');
    if (chat) {
      return res.json(chat);
    }
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      isGroupChat: false
    });
    chat = await Chat.findById(chat._id)
      .populate('participants', 'username email avatar isOnline lastSeen');
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChats, createOrGetChat };
