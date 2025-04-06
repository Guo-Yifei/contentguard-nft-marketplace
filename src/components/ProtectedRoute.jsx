import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const walletAddress = localStorage.getItem('walletAddress');
  
  if (!walletAddress) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute; 