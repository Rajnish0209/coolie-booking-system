import React from 'react';
import { Link } from 'react-router-dom';
// import './Home.css'; // Assuming you might create a Home.css for specific styles if needed

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section text-center bg-light py-5">
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">Welcome to the Coolie Booking System</h1>
          <p className="lead text-muted mb-4">
            Your one-stop solution for booking reliable coolie services at Indian railway stations. 
            Travel smarter, not harder.
          </p>
          <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
            <Link 
              to="/register" 
              className="btn btn-primary btn-lg px-4 shadow-sm"
            >
              Get Started - Register
            </Link>
            <Link 
              to="/login" 
              className="btn btn-outline-secondary btn-lg px-4"
            >
              Login to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Why Choose Us?</h2>
          <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-lg-3">
            
            <div className="col">
              <div className="card h-100 shadow-sm text-center p-4">
                <div className="feature-icon-container mb-3 mx-auto">
                   {/* Placeholder for a real icon, e.g., from FontAwesome or an SVG */}
                  <span className="feature-icon">📅</span> 
                </div>
                <h3 className="fs-4 fw-semibold mb-2">Easy & Quick Booking</h3>
                <p className="text-muted">
                  Book a coolie in minutes. Specify your train, luggage, and platform details effortlessly.
                </p>
              </div>
            </div>

            <div className="col">
              <div className="card h-100 shadow-sm text-center p-4">
                <div className="feature-icon-container mb-3 mx-auto">
                  <span className="feature-icon">✅</span>
                </div>
                <h3 className="fs-4 fw-semibold mb-2">Verified Coolies</h3>
                <p className="text-muted">
                  All coolies on our platform are verified, ensuring safety and reliability for your luggage.
                </p>
              </div>
            </div>

            <div className="col">
              <div className="card h-100 shadow-sm text-center p-4">
                <div className="feature-icon-container mb-3 mx-auto">
                  <span className="feature-icon">📱</span>
                </div>
                <h3 className="fs-4 fw-semibold mb-2">Real-time Updates</h3>
                <p className="text-muted">
                  Track your booking status and receive notifications about your assigned coolie.
                </p>
              </div>
            </div>

            <div className="col">
              <div className="card h-100 shadow-sm text-center p-4">
                <div className="feature-icon-container mb-3 mx-auto">
                  <span className="feature-icon">⭐</span>
                </div>
                <h3 className="fs-4 fw-semibold mb-2">Rate & Review</h3>
                <p className="text-muted">
                  Provide feedback on your experience to help us maintain high service standards.
                </p>
              </div>
            </div>
            
            <div className="col">
              <div className="card h-100 shadow-sm text-center p-4">
                <div className="feature-icon-container mb-3 mx-auto">
                  <span className="feature-icon">🛡️</span>
                </div>
                <h3 className="fs-4 fw-semibold mb-2">Secure Payments</h3>
                <p className="text-muted">
                  Transparent pricing and secure online payment options for a hassle-free transaction.
                </p>
              </div>
            </div>

            <div className="col">
              <div className="card h-100 shadow-sm text-center p-4">
                <div className="feature-icon-container mb-3 mx-auto">
                  <span className="feature-icon">🤝</span>
                </div>
                <h3 className="fs-4 fw-semibold mb-2">Coolie Empowerment</h3>
                <p className="text-muted">
                  Join us in supporting the coolie community by providing them with a modern platform for work.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section text-center bg-primary text-white py-5">
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to Simplify Your Journey?</h2>
          <p className="lead mb-4">Register as a passenger or a coolie today and experience the difference.</p>
          <Link 
            to="/register-coolie" 
            className="btn btn-light btn-lg px-4 me-sm-3 mb-3 mb-sm-0 shadow-sm"
          >
            Become a Coolie
          </Link>
          <Link 
            to="/register" 
            className="btn btn-outline-light btn-lg px-4 shadow-sm"
          >
            Register as Passenger
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;