import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import socketService from '../utils/socket';
import Sidebar from '../components/Layout/Sidebar';
import ChatArea from '../components/Chat/ChatArea';

const Chat = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  useEffect(() => {
    if (user) {
      socketService.connect(user._id);
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="flex flex-col md:flex-row w-full">
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  );
};

export default Chat;