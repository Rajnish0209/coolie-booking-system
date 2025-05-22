import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const PrivateRoute = ({ component: Component, roles, ...rest }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  // Check if the route is loading or not authenticated
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen"> {/* Ensure full height for centering */}
        <div className="spinner-border text-primary-600" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
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