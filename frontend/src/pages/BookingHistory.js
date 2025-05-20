import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookingHistory = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/bookings';
      
      // For admins, fetch all bookings
      if (user.role === 'admin') {
        url = 'http://localhost:5000/api/bookings/all';
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === bookingId ? { ...booking, status } : booking
          )
        );
      }
    } catch (err) {
      setError('Failed to update booking status');
      console.error(err);
    }
  };

  const rateBooking = async (bookingId, rating, comment) => {
    try {
      await axios.post(
        `http://localhost:5000/api/bookings/${bookingId}/rate`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refresh bookings after rating
      fetchBookings();
    } catch (err) {
      setError('Failed to submit rating');
      console.error(err);
    }
  };

  // Filter bookings by status and search term
  const filteredBookings = bookings.filter(booking => {
    // Filter by tab
    const statusMatch = activeTab === 'all' || booking.status === activeTab;
    
    // Filter by search term if provided
    if (!searchTerm) return statusMatch;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Search in different fields based on user role
    if (user.role === 'admin') {
      // Admin can search by passenger name, coolie name, station, train number
      return statusMatch && (
        (booking.passenger?.name?.toLowerCase().includes(searchTermLower)) ||
        (booking.coolie?.user?.name?.toLowerCase().includes(searchTermLower)) ||
        booking.station.toLowerCase().includes(searchTermLower) ||
        booking.trainNumber.toLowerCase().includes(searchTermLower)
      );
    } else if (user.role === 'passenger') {
      // Passengers can search by station, coolie name or train number
      return statusMatch && (
        (booking.coolie?.user?.name?.toLowerCase().includes(searchTermLower)) ||
        booking.station.toLowerCase().includes(searchTermLower) ||
        booking.trainNumber.toLowerCase().includes(searchTermLower)
      );
    } else {
      // Coolies can search by passenger name, station or train number
      return statusMatch && (
        (booking.passenger?.name?.toLowerCase().includes(searchTermLower)) ||
        booking.station.toLowerCase().includes(searchTermLower) ||
        booking.trainNumber.toLowerCase().includes(searchTermLower)
      );
    }
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {user.role === 'admin' ? 'All Bookings' : 'My Bookings'}
      </h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="mb-6">
        <div className="flex overflow-x-auto border-b">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'pending'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'confirmed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'completed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'cancelled'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between flex-wrap">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {booking.station} - Platform {booking.platformNumber}
                  </h3>
                  <p className="text-gray-600">
                    Train: {booking.trainNumber} | Seat: {booking.seatNumber}
                  </p>
                  
                  {/* Show passenger info for coolies and admins */}
                  {(user.role === 'coolie' || user.role === 'admin') && booking.passenger && (
                    <p className="text-gray-600 mt-1">
                      <span className="font-semibold">Passenger:</span>{' '}
                      {booking.passenger.name} | {booking.passenger.phone || 'No phone'}
                    </p>
                  )}
                  
                  {/* For admins, show booking ID for reference */}
                  {user.role === 'admin' && (
                    <p className="text-gray-500 text-xs mt-1">
                      ID: {booking._id}
                    </p>
                  )}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                      booking.status
                    )}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  
                  {/* Show booking date */}
                  <p className="text-gray-500 text-xs mt-2">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap justify-between">
                  <div className="mb-2 md:mb-0">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Arrival:</span>{' '}
                      {new Date(booking.arrivalTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Luggage:</span>{' '}
                      {booking.luggageDetails.count} items, {booking.luggageDetails.weight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Coolie:</span>{' '}
                      {booking.coolie?.user?.name || 'Not assigned'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Fare:</span> ₹{booking.fare}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {/* For passengers */}
                {user.role === 'passenger' && booking.status === 'pending' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition duration-300"
                  >
                    Cancel Booking
                  </button>
                )}

                {/* For coolies */}
                {user.role === 'coolie' && booking.status === 'pending' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition duration-300"
                  >
                    Accept Booking
                  </button>
                )}

                {user.role === 'coolie' && booking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                  >
                    Mark as Completed
                  </button>
                )}

                {/* For admins */}
                {user.role === 'admin' && booking.status === 'pending' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition duration-300"
                  >
                    Cancel Booking
                  </button>
                )}

                {/* Rating option for completed bookings (passengers only) */}
                {user.role === 'passenger' && booking.status === 'completed' && !booking.rating && (
                  <div className="w-full mt-2">
                    <h4 className="font-medium text-sm mb-1">Rate your experience:</h4>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => rateBooking(booking._id, star, '')}
                          className="text-yellow-400 text-xl mr-1 focus:outline-none"
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show rating if already rated */}
                {booking.rating && (
                  <div className="w-full mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Rating:</span>{' '}
                      {'★'.repeat(booking.rating)}
                      {'☆'.repeat(5 - booking.rating)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;