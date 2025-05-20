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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'passenger':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Book a Coolie</h3>
              <p className="text-gray-600 mb-4">Need help with your luggage? Book a coolie now!</p>
              <Link
                to="/book"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                Book Now
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Bookings</h3>
              <p className="text-gray-600 mb-4">View and manage your bookings</p>
              <Link
                to="/bookings"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                View Bookings
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h3>
              <p className="text-gray-600 mb-4">View and update your personal information</p>
              <Link
                to="/user-profile"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                View Profile
              </Link>
            </div>
          </div>
        );

      case 'coolie':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h3>
              <p className="text-gray-600 mb-4">Update your profile and availability status</p>
              <Link
                to="/coolie-profile"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                Manage Profile
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Bookings</h3>
              <p className="text-gray-600 mb-4">View and manage your assigned bookings</p>
              <Link
                to="/bookings"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                View Bookings
              </Link>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Admin Panel</h3>
              <p className="text-gray-600 mb-4">Access the admin dashboard</p>
              <Link
                to="/admin"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                Go to Admin Panel
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">User Management</h3>
              <p className="text-gray-600 mb-4">Manage users, coolies and approvals</p>
              <Link
                to="/admin"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                Manage Users
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Admin Profile</h3>
              <p className="text-gray-600 mb-4">View and update your admin information</p>
              <Link
                to="/admin-profile"
                className="px-4 py-2 bg-primary-600 text-white rounded-md inline-block hover:bg-primary-700"
              >
                View Profile
              </Link>
            </div>
          </div>
        );

      default:
        return <div>Unknown user role</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h2>
        <p className="text-gray-600">
          {user?.role === 'passenger' && 'Passenger Dashboard'}
          {user?.role === 'coolie' && 'Coolie Dashboard'}
          {user?.role === 'admin' && 'Admin Dashboard'}
        </p>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default Dashboard; 