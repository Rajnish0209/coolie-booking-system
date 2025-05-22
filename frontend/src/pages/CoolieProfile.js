import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CoolieProfile = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    station: '',
    platformNumbers: [],
    isAvailable: false,
    currentLocation: '',
    vehicleDetails: '',
    languagesSpoken: [],
  });
  const [successMessage, setSuccessMessage] = useState('');
  // Rename pendingBookings to activeBookings and related states
  const [activeBookings, setActiveBookings] = useState([]);
  const [activeBookingsLoading, setActiveBookingsLoading] = useState(false);
  const [activeBookingsError, setActiveBookingsError] = useState('');
  const [processingBookingId, setProcessingBookingId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getBookingStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Helper function to determine if action buttons should be disabled
  const areCoolieActionsDisabled = (status) => {
    return ['confirmed', 'completed', 'cancelled'].includes(status);
  };

  const fetchProfile = useCallback(async () => {
    if (!user || !token) {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure this matches backend (x-auth-token or Bearer)
        },
      };
      const res = await axios.get(`${API_URL}/coolies/profile/me`, config);
      
      if (res.data && res.data.success && res.data.data) {
        setProfile(res.data.data);
        setFormData({
          station: res.data.data.station || '',
          platformNumbers: res.data.data.platformNumbers || [],
          isAvailable: res.data.data.isAvailable || false,
          currentLocation: res.data.data.currentLocation || '',
          vehicleDetails: res.data.data.vehicleDetails || '',
          languagesSpoken: res.data.data.languagesSpoken || [],
        });
      } else {
        setError(res.data?.message || 'Failed to parse profile data.');
        if (res.data?.message === 'User no longer exists' || res.status === 401) { // Example check
            logout(); // Logout if user is invalid
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile. Please try again.');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, API_URL, logout]);

  // Renamed from fetchPendingBookings to fetchActiveBookings
  const fetchActiveBookings = useCallback(async () => {
    if (!profile || !token) return;
    setActiveBookingsLoading(true);
    setActiveBookingsError('');
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` },
      };
      // Fetch both pending and confirmed bookings
      // ASSUMPTION: Backend handles status=pending,confirmed (e.g., by splitting and using $in)
      const res = await axios.get(`${API_URL}/bookings?status=pending,confirmed&coolieId=${profile._id}`, config); 
      
      if (res.data && res.data.success) {
        setActiveBookings(res.data.data || []); 
      } else {
        setActiveBookingsError(res.data?.message || 'Failed to parse active bookings data.');
      }
    } catch (err) {
      setActiveBookingsError(err.response?.data?.message || 'Failed to fetch active bookings.');
      if (err.response?.status === 401) {
        logout(); 
      }
    } finally {
      setActiveBookingsLoading(false);
    }
  }, [profile, token, API_URL, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?._id) {
      fetchActiveBookings(); // Call renamed function
    }
  }, [profile, fetchActiveBookings]); // Dependency on renamed function


  const handleToggleAvailability = async () => {
    if (!profile) return;
    setError('');
    setSuccessMessage('');
    try {
      const newAvailability = !profile.isAvailable;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure this matches backend
        },
      };
      // The backend route will be /api/coolies/profile/availability
      const res = await axios.put(`${API_URL}/coolies/profile/availability`, { isAvailable: newAvailability }, config);
      
      if (res.data && res.data.success && res.data.data) {
        setProfile(prev => ({ ...prev, isAvailable: res.data.data.isAvailable }));
        setFormData(prev => ({ ...prev, isAvailable: res.data.data.isAvailable }));
        setSuccessMessage(`Availability updated to: ${res.data.data.isAvailable ? 'Available' : 'Unavailable'}`);
      } else {
        setError(res.data?.message || 'Failed to update availability status.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability.');
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePlatformChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      platformNumbers: value.split(',').map(p => p.trim()).filter(p => p),
    }));
  };
  
  const handleLanguagesChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      languagesSpoken: value.split(',').map(lang => lang.trim()).filter(lang => lang),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError('');
    setSuccessMessage('');
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };
      const payload = { ...formData };
      if (typeof formData.platformNumbers === 'string') {
        payload.platformNumbers = formData.platformNumbers.split(',').map(p => p.trim()).filter(p => p);
      }
      if (typeof formData.languagesSpoken === 'string') {
        payload.languagesSpoken = formData.languagesSpoken.split(',').map(p => p.trim()).filter(p => p);
      }

      const res = await axios.put(`${API_URL}/coolies/profile/me`, payload, config);
      
      // Check if the response structure is as expected and contains the coolie data
      if (res.data && res.data.success && res.data.data) {
        setProfile(res.data.data); 
        setFormData({ 
          station: res.data.data.station || '',
          platformNumbers: res.data.data.platformNumbers || [],
          isAvailable: res.data.data.isAvailable || false,
          currentLocation: res.data.data.currentLocation || '',
          vehicleDetails: res.data.data.vehicleDetails || '',
          languagesSpoken: res.data.data.languagesSpoken || [],
        });
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
      } else {
        // If success is true but data is not in the expected format, or if success is false
        setError(res.data?.message || 'Failed to update profile: Unexpected response structure.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    setActiveBookingsError(''); // Use renamed error state
    setSuccessMessage('');
    setProcessingBookingId(bookingId);
    try {
      let status;
      if (action === 'accept') {
        status = 'confirmed';
      } else if (action === 'reject') {
        status = 'rejected';
      } else if (action === 'complete') {
        status = 'completed';
      } else {
        setActiveBookingsError('Invalid booking action.');
        setProcessingBookingId(null);
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status }, config);

      if (res.data && res.data.success) {
        setSuccessMessage(`Booking ${action}ed successfully.`); // More generic message
        fetchActiveBookings(); // Refresh the list of active bookings
      } else {
        setActiveBookingsError(res.data?.message || `Failed to ${action} booking.`);
      }
    } catch (err) {
      setActiveBookingsError(err.response?.data?.message || `Failed to ${action} booking.`);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setProcessingBookingId(null);
    }
  };

  if (loading && !profile && !isEditing) { 
    return (
      <div className="container text-center py-5">
        <div className="spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {loading && <p className="text-center">Loading profile...</p>}
      {error && <p className="alert alert-danger text-center">{error}</p>}
      {successMessage && <p className="alert alert-success text-center">{successMessage}</p>}

      {profile && (
        <>
          {/* Profile details and edit form */}
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="card-title">Welcome, {user?.name || 'Coolie'}!</h2>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Station:</strong> {profile.station || 'Not set'}</p>
              <p><strong>Platform Numbers:</strong> {profile.platformNumbers?.join(', ') || 'Not set'}</p>
              <p><strong>Current Location:</strong> {profile.currentLocation || 'Not set'}</p>
              <p><strong>Vehicle Details:</strong> {profile.vehicleDetails || 'Not set'}</p>
              <p><strong>Languages Spoken:</strong> {profile.languagesSpoken?.join(', ') || 'Not set'}</p>
              {profile.averageRating !== undefined && (
                <p>
                  <strong>Average Rating:</strong> {profile.averageRating.toFixed(1)} ({profile.totalRatings} ratings)
                </p>
              )}
              <p>
                <strong>Availability:</strong> 
                <span className={profile.isAvailable ? 'text-success' : 'text-danger'}>
                  {profile.isAvailable ? ' Available' : ' Unavailable'}
                </span>
              </p>
              <button onClick={handleToggleAvailability} className="btn btn-secondary mr-2 mb-2">
                Toggle Availability
              </button>
              <button onClick={() => setIsEditing(true)} className="btn btn-primary mb-2">
                Edit Profile
              </button>
            </div>
          </div>

          {isEditing && (
            <div className="card mb-4">
              <div className="card-body">
                <h2 className="card-title">Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="station">Station</label>
                    <input
                      type="text"
                      className="form-control"
                      id="station"
                      name="station"
                      value={formData.station}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="platformNumbers">Platform Numbers (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="platformNumbers"
                      name="platformNumbers"
                      value={Array.isArray(formData.platformNumbers) ? formData.platformNumbers.join(', ') : formData.platformNumbers}
                      onChange={handlePlatformChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="currentLocation">Current Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="currentLocation"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vehicleDetails">Vehicle Details (e.g., Handcart, Trolley)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="vehicleDetails"
                      name="vehicleDetails"
                      value={formData.vehicleDetails}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="languagesSpoken">Languages Spoken (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="languagesSpoken"
                      name="languagesSpoken"
                      value={Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken.join(', ') : formData.languagesSpoken}
                      onChange={handleLanguagesChange}
                    />
                  </div>
                  <div className="form-group form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isAvailable"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isAvailable">
                      Available for Bookings
                    </label>
                  </div>
                  <button type="submit" className="btn btn-primary mr-2" disabled={loading}>
                    {loading ? <span className="spinner-sm"></span> : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Active Bookings Section */}
          <div className="mt-5">
            <h3>Active Bookings</h3>
            {activeBookingsLoading && <p>Loading bookings...</p>}
            {activeBookingsError && <p className="alert alert-danger text-center">{activeBookingsError}</p>}
            {activeBookings.length > 0 ? (
              <ul className="list-group">
                {activeBookings.map(booking => (
                  <li key={booking._id} className="list-group-item">
                    <p><strong>Booking ID:</strong> {booking._id.slice(-6)}</p>
                    <p><strong>Passenger:</strong> {booking.user?.name || 'N/A'}</p>
                    <p><strong>Date & Time:</strong> {booking.serviceDateTime ? new Date(booking.serviceDateTime).toLocaleString() : 'Not set'}</p>
                    <p><strong>Station:</strong> {booking.station} - Platform {booking.platformNumber}</p>
                    <p><strong>Status:</strong> <span className={`badge bg-${getBookingStatusClass(booking.status)}`}>{booking.status}</span></p>
                    <div className="mt-2">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleBookingAction(booking._id, 'accept')}
                            disabled={processingBookingId === booking._id || areCoolieActionsDisabled(booking.status)}
                          >
                            {processingBookingId === booking._id ? 'Processing...' : 'Accept'}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleBookingAction(booking._id, 'reject')}
                            disabled={processingBookingId === booking._id || areCoolieActionsDisabled(booking.status)}
                          >
                            {processingBookingId === booking._id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleBookingAction(booking._id, 'complete')}
                          disabled={processingBookingId === booking._id || booking.status === 'completed' || booking.status === 'cancelled'}
                        >
                          {processingBookingId === booking._id ? 'Processing...' : 'Mark as Complete'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No active bookings (pending or confirmed) at the moment.</p>
            )}
          </div>
        </> 
      )}
    </div>
  );
};

export default CoolieProfile;