import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search,  MessageSquare, LogOut } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { getChats, setCurrentChat } from '../../store/slices/chatSlice';
import SearchModal from '../Modals/SearchModal';
import ChatsList from './ChatsList';

const Sidebar = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { chats } = useSelector((state) => state.chat);


  useEffect(() => {
    dispatch(getChats());
    
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(setCurrentChat(null));
  };

  return (
    <>
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{user?.username}</h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center space-x-3 p-3 bg-gray-100 hover:bg-gray-150 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">Search users...</span>
          </button>
        </div>

      
        <div className="flex border-b border-gray-200">
          <div
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center space-x-2 transition-colors 
              text-primary-600 border-b-2 border-primary-600
          `}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chats</span>
            {chats.length > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px]">
                {chats.length}
              </span>
            )}
          </div>
        
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
         <ChatsList /> 
        </div>
      </div>

      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
    </>
  );
};

export default Sidebar;