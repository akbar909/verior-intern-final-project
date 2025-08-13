import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';

const Register = () => {
  const { token } = useSelector((state) => state.auth);

  if (token) {
    return <Navigate to="/" />;
  }

  return <RegisterForm />;
};

export default Register;