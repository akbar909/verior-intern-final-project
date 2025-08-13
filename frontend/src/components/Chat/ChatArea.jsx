import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../../store/slices/chatSlice';
import socketService from '../../utils/socket';
import MessageList from './MessageList';

const ChatArea = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  
  const { currentChat, messages } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const chatMessages = currentChat ? messages[currentChat._id] || [] : [];
  
  const getOtherParticipant = () => {
    if (!currentChat) return null;
    return currentChat.participants.find(p => p._id !== user._id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() || !currentChat) return;
    
    const messageData = {
      chatId: currentChat._id,
      content: message.trim()
    };
    
    dispatch(sendMessage(messageData)).then((action) => {
      if (action.type === 'chat/sendMessage/fulfilled') {
        socketService.sendMessage({
          ...action.payload,
          chatId: currentChat._id
        });
      }
    });
    
    setMessage('');
    handleStopTyping();
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(currentChat._id);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(currentChat._id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Send className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to Chat</h2>
          <p className="text-gray-500">Select a chat or start a new conversation</p>
        </div>
      </div>
    );
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
              {otherUser?.username?.charAt(0).toUpperCase()}
            </div>
            {otherUser?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{otherUser?.username}</h3>
            <p className="text-sm text-gray-500">
              {otherUser?.isOnline ? 'Online' : `Last seen ${new Date(otherUser?.lastSeen).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={chatMessages} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none"
              maxLength={1000}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;