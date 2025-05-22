import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookingHistory = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null); // For errors during actions
  const [actionSuccess, setActionSuccess] = useState(null); // For success messages during actions
  const [processingBookingId, setProcessingBookingId] = useState(null); // Tracks the booking being processed
  const [activeTab, setActiveTab] = useState('all'); // Added activeTab state
  const [searchTerm, setSearchTerm] = useState(''); // Added searchTerm state
  const [ratingModalOpen, setRatingModalOpen] = useState(false); // State for rating modal
  const [currentBookingForRating, setCurrentBookingForRating] = useState(null); // Booking to be rated
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' }); // State for rating form

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchBookings = useCallback(async () => {
    if (!token || !user) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/bookings`, { // Removed /my-history
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.bookings || response.data.data || []);
    } catch (err) {
      console.error('Fetch Bookings Error:', err.response || err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout(); 
      } else {
        setError(err.response?.data?.message || 'Failed to fetch bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, API_URL, logout]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    // Use the more generic handleBookingAction for cancellation
    await handleBookingAction(bookingId, 'cancel');
  };

  // Remove the specific handleUpdateBookingStatus as handleBookingAction covers it
  // const handleUpdateBookingStatus = async (bookingId, status) => { ... };

  const handleBookingAction = async (bookingId, action, payload = {}) => {
    setActionError('');
    setActionSuccess('');
    setLoading(true); 
    try {
      let response;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (action === 'cancel') {
        response = await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 'cancelled' }, config);
      } else if (action === 'rate') {
        response = await axios.post(`${API_URL}/bookings/${bookingId}/rate`, payload, config);
      } else if (action === 'accept' || action === 'reject') {
        const status = action === 'accept' ? 'confirmed' : 'rejected';
        response = await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status }, config);
      } else if (action === 'complete') {
        response = await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: 'completed' }, config);
      }

      if (response && response.data.success) {
        setActionSuccess(`Booking ${action}ed successfully.`);
        fetchBookings(); 
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        setActionError(response?.data?.message || `Failed to ${action} booking.`);
        setTimeout(() => setActionError(''), 5000);
      }
    } catch (err) {
      console.error(`Booking Action (${action}) Error:`, err.response || err);
      setActionError(err.response?.data?.message || `Failed to ${action} booking.`);
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setLoading(false); 
    }
  };
  
  const openRatingModal = (booking) => {
    setCurrentBookingForRating(booking);
    setRatingData({ rating: booking.rating?.rating || 5, comment: booking.rating?.comment || '' });
    setRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setRatingModalOpen(false);
    setCurrentBookingForRating(null);
    setRatingData({ rating: 5, comment: '' });
  };

  const handleRatingSubmit = async () => {
    if (!currentBookingForRating) return;
    setActionError('');
    setActionSuccess('');
    setProcessingBookingId(currentBookingForRating._id);
    try {
      const response = await axios.post(
        `${API_URL}/bookings/${currentBookingForRating._id}/rate`,
        ratingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setActionSuccess('Rating submitted successfully.');
        fetchBookings(); // Refresh bookings to show updated rating
        closeRatingModal();
      } else {
        setActionError(response.data.message || 'Failed to submit rating.');
      }
    } catch (err) {
      console.error('Rating Submission Error:', err.response || err);
      setActionError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setProcessingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = activeTab === 'all' || booking.status === activeTab;
    if (!searchTerm) return statusMatch;
    const term = searchTerm.toLowerCase();
    return statusMatch && (
      (booking.station?.toLowerCase().includes(term)) ||
      (booking.trainNumber?.toLowerCase().includes(term)) ||
      (booking.coolie?.user?.name?.toLowerCase().includes(term)) ||
      (booking.passenger?.name?.toLowerCase().includes(term)) ||
      (booking.serviceDateTime && new Date(booking.serviceDateTime).toLocaleDateString().includes(term)) ||
      (booking._id?.toLowerCase().includes(term))
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'confirmed': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  // Helper function to determine if cancel button should be disabled
  const isCancelDisabled = (status) => {
    return ['confirmed', 'completed', 'cancelled'].includes(status);
  };

  if (loading) return <div className="container mt-5"><p className="text-center">Loading bookings...</p></div>;
  if (error) return <div className="container mt-5"><p className="alert alert-danger text-center">{error}</p></div>;

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">
        {user?.role === 'admin' ? 'All Bookings Management' : 'My Booking History'}
      </h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {actionError && <div className="alert alert-danger mt-2">{actionError}</div>}
      {actionSuccess && <div className="alert alert-success mt-2">{actionSuccess}</div>}
      
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Search by ID, station, train, name, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control form-control-sm"
          />
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'].map(tabStatus => (
          <li className="nav-item" key={tabStatus}>
            <button 
              className={`nav-link ${activeTab === tabStatus ? 'active' : ''}`}
              onClick={() => setActiveTab(tabStatus)}
            >
              {tabStatus.charAt(0).toUpperCase() + tabStatus.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {loading && <div className="text-center my-3"><div className="spinner-sm"></div><p>Updating...</p></div>}

      {filteredBookings.length === 0 && !loading && (
        <div className="alert alert-info text-center">No bookings found matching your criteria.</div>
      )}

      <div className="row row-cols-1 row-cols-md-2 g-4">
        {filteredBookings.map(booking => (
          <div key={booking._id} className="col">
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-bold">Booking ID: {booking._id.slice(-8)}</span>
                <span className={`badge ${getStatusBadgeClass(booking.status)}`}>{booking.status}</span>
              </div>
              <div className="card-body">
                <p className="card-text"><strong>Date & Time:</strong> {booking.serviceDateTime ? new Date(booking.serviceDateTime).toLocaleString() : 'Not set'}</p>
                <p className="card-text"><strong>Station:</strong> {booking.station} (Platform: {booking.platformNumber})</p>
                {user?.role !== 'passenger' && <p className="card-text"><strong>Passenger:</strong> {booking.user?.name || 'N/A'} ({booking.user?.email || 'N/A'})</p>}
                {user?.role !== 'coolie' && <p className="card-text"><strong>Coolie:</strong> {booking.coolie?.user?.name || 'N/A'} (ID: {booking.coolie?.idProofNumber || 'N/A'})</p>}
                <p className="card-text"><strong>Train:</strong> {booking.trainName || booking.trainNumber || 'N/A'} ({booking.trainNumber || 'N/A'})</p>
                <p className="card-text"><strong>Luggage:</strong> {booking.luggageDetails?.count || 0} item(s)</p>
                {booking.fare !== undefined && <p className="card-text"><strong>Fare:</strong> ₹{booking.fare.toFixed(2)}</p>}
                {booking.message && <p className="card-text"><strong>Message:</strong> <span className="text-muted">{booking.message}</span></p>}
                {booking.rating && (
                  <p className="card-text">
                    <strong>Rating:</strong> 
                    <span className="text-warning"> {'★'.repeat(booking.rating.rating)}{'☆'.repeat(5 - booking.rating.rating)}</span> ({booking.rating.rating}/5)
                    {booking.rating.comment && <em className="ms-2 d-block text-muted">"{booking.rating.comment}"</em>}
                  </p>
                )}
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  {/* Consolidated Passenger Actions */}
                  {user?.role === 'passenger' && (
                    <>
                      {/* Cancel button: show if status is pending */}
                      {booking.status === 'pending' && (
                        <button 
                          className="btn btn-danger btn-sm me-2"
                          onClick={() => handleCancelBooking(booking._id)} 
                          disabled={processingBookingId === booking._id || isCancelDisabled(booking.status)}
                        >
                          {processingBookingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                      {/* Rate button: show if status is completed */}
                      {booking.status === 'completed' && (
                        <button 
                          className="btn btn-warning btn-sm ms-2"
                          onClick={() => openRatingModal(booking)}
                          disabled={processingBookingId === booking._id}
                        >
                          {booking.rating ? 'View/Edit Rating' : 'Rate Coolie'}
                        </button>
                      )}
                    </>
                  )}

                  {/* Coolie Actions */}
                  {user?.role === 'coolie' && booking.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleBookingAction(booking._id, 'accept')}
                        disabled={processingBookingId === booking._id}
                      >
                        {processingBookingId === booking._id ? 'Processing...' : 'Accept'}
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleBookingAction(booking._id, 'reject')}
                        disabled={processingBookingId === booking._id}
                      >
                        {processingBookingId === booking._id ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                  {user?.role === 'coolie' && booking.status === 'confirmed' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleBookingAction(booking._id, 'complete')}
                      disabled={processingBookingId === booking._id}
                    >
                      {processingBookingId === booking._id ? 'Processing...' : 'Mark as Completed'}
                    </button>
                  )}

                  {/* Admin Actions */}
                  {user?.role === 'admin' && (booking.status === 'pending' || booking.status === 'confirmed') && (
                     <button 
                       onClick={() => handleBookingAction(booking._id, 'cancel')} 
                       className="btn btn-outline-danger btn-sm me-2"
                       disabled={processingBookingId === booking._id}
                     >
                       {processingBookingId === booking._id ? 'Processing...' : 'Cancel (Admin)'}
                     </button>
                  )}
                   {user?.role === 'admin' && booking.status === 'confirmed' && (
                     <button 
                       onClick={() => handleBookingAction(booking._id, 'complete')} 
                       className="btn btn-outline-success btn-sm"
                       disabled={processingBookingId === booking._id}
                     >
                       {processingBookingId === booking._id ? 'Processing...' : 'Complete (Admin)'}
                     </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> {/* This closes div.row.row-cols-1.row-cols-md-2.g-4 */}

      {/* Rating Modal */}
      {ratingModalOpen && currentBookingForRating && (
        <div className="modal fade show d-block" tabIndex={-1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Rate Coolie: {currentBookingForRating.coolie?.user?.name || 'Coolie'}</h5>
                <button type="button" className="btn-close" onClick={closeRatingModal}></button>
              </div>
              <div className="modal-body">
                {actionError && <div className="alert alert-danger">{actionError}</div>}
                <div className="mb-3">
                  <label htmlFor="rating" className="form-label">Rating (1-5)</label>
                  <select 
                    className="form-select" 
                    id="rating" 
                    value={ratingData.rating} 
                    onChange={(e) => setRatingData({...ratingData, rating: parseInt(e.target.value)})}
                  >
                    {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="comment" className="form-label">Comment (Optional)</label>
                  <textarea
                    className="form-control"
                    id="comment"
                    rows="3"
                    value={ratingData.comment}
                    onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRatingModal}>Close</button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleRatingSubmit}
                  disabled={processingBookingId === currentBookingForRating._id}
                >
                  {processingBookingId === currentBookingForRating._id ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
