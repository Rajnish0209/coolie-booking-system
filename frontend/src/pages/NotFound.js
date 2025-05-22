import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center text-center min-vh-100 py-5">
      <div className="not-found-content p-4 p-md-5 bg-light shadow-sm rounded">
        <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
        <h2 className="h3 fw-bold mb-3">Oops! Page Not Found</h2>
        <p className="text-muted mb-4">
          We're sorry, but the page you are looking for cannot be found.
          It might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="btn btn-primary btn-lg px-4"
        >
          <i className="fas fa-home me-2"></i>
          Go Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;