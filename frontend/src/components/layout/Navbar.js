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
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand text-primary-700 font-weight-bold">
          Coolie Booking System
        </Link>
        <button
          onClick={toggleMenu}
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated && user && (
              <li className="nav-item d-none d-lg-block">
                <span className="nav-link text-muted">
                  Welcome, {user.name} ({user.role})
                </span>
              </li>
            )}
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            {isAuthenticated ? (
              <>
                {user && user.role === 'passenger' && (
                  <>
                    <li className="nav-item">
                      <Link to="/book" className="nav-link">Book Coolie</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/bookings" className="nav-link">My Bookings</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/user-profile" className="nav-link">My Profile</Link>
                    </li>
                  </>
                )}
                {user && user.role === 'coolie' && (
                  <>
                    <li className="nav-item">
                      <Link to="/coolie-profile" className="nav-link">Profile</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/bookings" className="nav-link">My Bookings</Link>
                    </li>
                  </>
                )}
                {user && user.role === 'admin' && (
                  <>
                    <li className="nav-item">
                      <Link to="/admin" className="nav-link">Admin Panel</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/coolie-approvals" className="nav-link">Coolie Approvals</Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/admin-profile" className="nav-link">My Profile</Link>
                    </li>
                  </>
                )}
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-link nav-link text-danger">Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Register</Link>
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