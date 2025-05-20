import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white py-2 px-4 shadow-md">
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '1.25rem' }}>Coolie Booking System</span>
        </Link>
        <div className="flex items-center">
          {isAuthenticated && user && (
            <span className="mr-4" style={{ display: 'none', fontSize: '0.875rem', color: '#4b5563' }}>
              Welcome, {user.name} ({user.role})
            </span>
          )}
          <button
            onClick={toggleMenu}
            type="button"
            className="py-2 px-2 rounded-md"
            style={{ color: '#6b7280', display: 'inline-flex' }}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div
          className={`${isMenuOpen ? 'block' : 'none'} flex-col`}
          style={{ width: '100%' }}
          id="mobile-menu"
        >
          <ul className="flex flex-col" style={{ marginTop: '1rem' }}>
            <li>
              <Link to="/" className="block py-2" style={{ color: '#374151' }}>Home</Link>
            </li>
            {isAuthenticated ? (
              <>
                {user && user.role === 'passenger' && (
                  <>
                    <li>
                      <Link to="/book" className="block py-2" style={{ color: '#374151' }}>Book Coolie</Link>
                    </li>
                    <li>
                      <Link to="/bookings" className="block py-2" style={{ color: '#374151' }}>My Bookings</Link>
                    </li>
                    <li>
                      <Link to="/user-profile" className="block py-2" style={{ color: '#374151' }}>My Profile</Link>
                    </li>
                  </>
                )}
                {user && user.role === 'coolie' && (
                  <>
                    <li>
                      <Link to="/coolie-profile" className="block py-2" style={{ color: '#374151' }}>Profile</Link>
                    </li>
                    <li>
                      <Link to="/bookings" className="block py-2" style={{ color: '#374151' }}>My Bookings</Link>
                    </li>
                  </>
                )}
                {user && user.role === 'admin' && (
                  <>
                    <li>
                      <Link to="/admin" className="block py-2" style={{ color: '#374151' }}>Admin Panel</Link>
                    </li>
                    <li>
                      <Link to="/admin-profile" className="block py-2" style={{ color: '#374151' }}>My Profile</Link>
                    </li>
                  </>
                )}
                <li>
                  <Link to="/dashboard" className="block py-2" style={{ color: '#374151' }}>Dashboard</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="block py-2" style={{ color: '#374151' }}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="block py-2" style={{ color: '#374151' }}>Login</Link>
                </li>
                <li>
                  <Link to="/register" className="block py-2" style={{ color: '#374151' }}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 