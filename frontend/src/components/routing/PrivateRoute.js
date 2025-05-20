import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const PrivateRoute = ({ component: Component, roles, ...rest }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Check if the route is loading or not authenticated
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute; 