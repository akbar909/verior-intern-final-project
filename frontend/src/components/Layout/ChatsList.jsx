import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMessages, setCurrentChat, updateLastMessage } from '../../store/slices/chatSlice';
import socketService from '../../utils/socket';

const ChatsList = () => {
  const dispatch = useDispatch();
  const { chats, currentChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleNewMessage = (message) => {
      dispatch(updateLastMessage({ chatId: message.chatId, lastMessage: message }));
    };

    socketService.on('newMessage', handleNewMessage);

    return () => {
      socketService.off('newMessage', handleNewMessage);
    };
  }, [dispatch]);

  const handleChatSelect = (chat) => {
    dispatch(setCurrentChat(chat));
    dispatch(getMessages(chat._id));
    socketService.joinChat(chat._id);
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No chats yet</p>
        <p className="text-sm">Search for users to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {chats.map((chat) => {
        const otherUser = getOtherParticipant(chat);
        const isActive = currentChat?._id === chat._id;

        return (
          <div
            key={chat._id}
            onClick={() => handleChatSelect(chat)}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isActive ? 'bg-primary-50 border-r-4 border-primary-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                  {otherUser?.username?.charAt(0).toUpperCase()}
                </div>
                {otherUser?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {otherUser?.username}
                  </h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.updatedAt)}
                    </span>
                  )}
                </div>

                {chat.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage.sender === user._id ? 'You: ' : ''}
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatsList;