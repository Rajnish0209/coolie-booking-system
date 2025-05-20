import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '1.5rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div className="flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Coolie Booking System</h2>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db', marginTop: '0.25rem' }}>Making railway journeys easier</p>
          </div>
          <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/" style={{ color: '#d1d5db' }}>Home</Link>
            <Link to="/login" style={{ color: '#d1d5db' }}>Login</Link>
            <Link to="/register" style={{ color: '#d1d5db' }}>Register</Link>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #374151', paddingTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          <p>&copy; {new Date().getFullYear()} Coolie Booking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 