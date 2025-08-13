import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const shouldShowDate = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    
    return currentDate !== previousDate;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center h-screen justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Send a message to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto h-screen p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwn = message.sender._id === user._id;
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showDate = shouldShowDate(message, previousMessage);

        return (
          <div key={message._id}>
            {showDate && (
              <div className="flex justify-center mb-4">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {formatDate(message.createdAt)}
                </span>
              </div>
            )}
            
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                {!isOwn && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {message.sender.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;