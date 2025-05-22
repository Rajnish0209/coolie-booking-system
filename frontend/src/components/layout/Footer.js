import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center mb-3 mb-md-0">
            <h5 className="text-uppercase mb-3">Coolie Booking System</h5>
            <p className="text-muted">Making railway journeys easier, one booking at a time.</p>
          </div>
          <div className="col-md-3 text-center text-md-start">
            <h5 className="text-uppercase mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/login" className="footer-link">Login</Link></li>
              <li><Link to="/register" className="footer-link">Register</Link></li>
              {/* Add more links as needed */}
            </ul>
          </div>
        </div>
        <div className="text-center pt-3 mt-3 border-top border-secondary">
          <p className="text-muted">&copy; {new Date().getFullYear()} Coolie Booking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;