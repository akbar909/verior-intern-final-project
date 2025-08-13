import { io } from 'socket.io-client';
import { addMessage, setTyping, setUserOffline, setUserOnline } from '../store/slices/chatSlice';
import { store } from '../store/store';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('join', userId);
    });

    this.socket.on('messageReceived', (messageData) => {
      store.dispatch(addMessage({ 
        chatId: messageData.chat, 
        message: messageData 
      }));

      store.dispatch({
        type: 'chat/updateLastMessage',
        payload: {
          chatId: messageData.chat,
          lastMessage: messageData,
        },
      });
    });

    this.socket.on('userOnline', (userId) => {
      store.dispatch(setUserOnline(userId));
    });

    this.socket.on('userOffline', (userId) => {
      store.dispatch(setUserOffline(userId));
    });

    this.socket.on('userTyping', ({ userId, isTyping }) => {
      const state = store.getState();
      if (state.chat.currentChat) {
        store.dispatch(setTyping({ 
          userId, 
          chatId: state.chat.currentChat._id, 
          isTyping 
        }));
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('joinChat', chatId);
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('newMessage', messageData);
    }
  }

  startTyping(chatId) {
    if (this.socket) {
      this.socket.emit('typing', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket) {
      this.socket.emit('stopTyping', { chatId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();