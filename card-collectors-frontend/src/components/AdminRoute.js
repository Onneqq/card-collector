import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  // Temporary hardcoded email for testing
  const adminEmail = 'adampenno93@gmail.com';

  console.log('AdminRoute check:', {
    adminEmail,
    userEmail: user?.email,
    isMatching: user?.email === adminEmail
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user?.email || user.email !== adminEmail) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute; 