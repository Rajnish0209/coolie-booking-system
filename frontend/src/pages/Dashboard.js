import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just a placeholder for future implementation
    // You would fetch dashboard data based on user role
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'passenger':
        return (
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">Book a Coolie</h5>
                  <p className="card-text text-muted">Need help with your luggage? Book a coolie now!</p>
                  <Link to="/book" className="btn btn-primary">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">My Bookings</h5>
                  <p className="card-text text-muted">View and manage your bookings.</p>
                  <Link to="/bookings" className="btn btn-primary">
                    View Bookings
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">My Profile</h5>
                  <p className="card-text text-muted">View and update your personal information.</p>
                  <Link to="/user-profile" className="btn btn-primary">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      case 'coolie':
        return (
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">My Profile</h5>
                  <p className="card-text text-muted">Update your profile and availability status.</p>
                  <Link to="/coolie-profile" className="btn btn-primary">
                    Manage Profile
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">My Bookings</h5>
                  <p className="card-text text-muted">View and manage your assigned bookings.</p>
                  <Link to="/bookings" className="btn btn-primary">
                    View Bookings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">Admin Panel</h5>
                  <p className="card-text text-muted">Access the main admin dashboard.</p>
                  <Link to="/admin" className="btn btn-primary">
                    Go to Admin Panel
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">Coolie Management</h5>
                  <p className="card-text text-muted">Approve or reject coolie registrations.</p>
                  <Link to="/coolie-approvals" className="btn btn-primary">
                    Manage Approvals
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">My Admin Profile</h5>
                  <p className="card-text text-muted">View and update your admin information.</p>
                  <Link to="/admin-profile" className="btn btn-primary">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="alert alert-warning">Unknown user role. Please contact support.</div>;
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4 p-3 bg-light rounded shadow-sm">
        <h2 className="display-5">Welcome, {user?.name}!</h2>
        <p className="lead text-muted">
          {user?.role === 'passenger' && 'Passenger Dashboard'}
          {user?.role === 'coolie' && 'Coolie Dashboard'}
          {user?.role === 'admin' && 'Admin Dashboard'}
        </p>
      </div>

      {user ? renderDashboard() : 
        <div className="alert alert-info">Loading user data or user not found.</div>
      }
    </div>
  );
};

export default Dashboard;