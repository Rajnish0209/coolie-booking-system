import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CoolieProfile = () => {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    station: '',
    platformNumbers: [],
    isAvailable: false,
    currentLocation: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    // Get userId using either id or _id field
    const userId = user?.id || user?._id;
    
    if (!userId) {
      console.error('No user ID available for profile fetch', user);
      setError('User information is missing. Please try logging out and logging back in.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(''); // Clear previous errors

      console.log("Fetching coolies with user ID:", userId);
      // First get the coolie profile ID
      const cooliesResponse = await axios.get('http://localhost:5000/api/coolies', {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`
        }
      });

      if (cooliesResponse.data.success) {
        console.log("Got coolies response:", cooliesResponse.data);
        
        const myCoolie = cooliesResponse.data.data.find(
          coolie => coolie.user && (coolie.user._id === userId || coolie.user.id === userId)
        );

        console.log("Found my coolie:", myCoolie);

        if (myCoolie) {
          // Get detailed profile
          console.log("Fetching detailed profile for coolie ID:", myCoolie._id);
          const profileResponse = await axios.get(`http://localhost:5000/api/coolies/${myCoolie._id}`, {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem('token')}`
            }
          });

          if (profileResponse.data.success) {
            console.log("Got profile response:", profileResponse.data);
            const coolieData = profileResponse.data.data;
            setProfile(coolieData);
            setFormData({
              station: coolieData.station || '',
              platformNumbers: coolieData.platformNumbers || [],
              isAvailable: coolieData.isAvailable || false,
              currentLocation: coolieData.currentLocation || ''
            });
          } else {
            setError('Failed to fetch detailed profile information');
          }
        } else {
          setError('Could not find your coolie profile. Please contact support.');
        }
      } else {
        setError('Failed to fetch profile data from server');
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setError('Failed to fetch profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const fetchPendingBookings = useCallback(async () => {
    if (!profile) return;
    
    try {
      setBookingsLoading(true);
      
      console.log("Fetching pending bookings for coolie:", profile._id);
      const response = await axios.get('http://localhost:5000/api/bookings', {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`
        },
        params: {
          status: 'pending'
        }
      });
      
      if (response.data.success) {
        console.log("Pending bookings response:", response.data);
        setPendingBookings(response.data.data || []);
      } else {
        console.error("Failed to fetch pending bookings:", response.data);
      }
    } catch (err) {
      console.error('Failed to fetch pending bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [profile, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  useEffect(() => {
    if (profile) {
      fetchPendingBookings();
    }
  }, [profile, fetchPendingBookings]);

  const handleToggleAvailability = async () => {
    try {
      console.log(`Updating availability status from ${profile.isAvailable} to ${!profile.isAvailable}`);
      console.log(`Current coolie data:`, profile);
      
      const response = await axios.put(
        `http://localhost:5000/api/coolies/${profile._id}/availability`,
        {
          isAvailable: !profile.isAvailable,
          currentLocation: profile.currentLocation
        },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        const newStatus = !profile.isAvailable;
        console.log(`Availability updated successfully to: ${newStatus}`);
        
        setProfile({ ...profile, isAvailable: newStatus });
        setFormData({ ...formData, isAvailable: newStatus });
        setSuccessMessage(`You are now ${newStatus ? 'available' : 'unavailable'} for bookings. ${
          newStatus 
            ? `Passengers can now book you for ${profile.station} station, Platform ${profile.platformNumbers.join(', ')}.` 
            : 'You will not receive any new booking requests.'
        }`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePlatformChange = (e) => {
    const platformNumber = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setFormData({
        ...formData,
        platformNumbers: [...formData.platformNumbers, platformNumber].sort((a, b) => a - b)
      });
    } else {
      setFormData({
        ...formData,
        platformNumbers: formData.platformNumbers.filter(platform => platform !== platformNumber)
      });
    }
  };

  const handleBookingStatusUpdate = async (bookingId, status) => {
    try {
      console.log(`Updating booking ${bookingId} status to ${status}`);
      
      const response = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        console.log(`Successfully updated booking status:`, response.data);
        
        // Remove this booking from pending list
        setPendingBookings(pendingBookings.filter(booking => booking._id !== bookingId));
        setSuccessMessage(`Booking ${status === 'confirmed' ? 'accepted' : 'rejected'} successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // If booking is cancelled (rejected), make sure our local state is updated
        if (status === 'cancelled') {
          setProfile({ ...profile, isAvailable: true });
          setFormData({ ...formData, isAvailable: true });
        }
      }
    } catch (err) {
      console.error(`Failed to update booking status:`, err);
      setError(`Failed to ${status === 'confirmed' ? 'accept' : 'reject'} booking: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating profile with data:", formData);
      
      const response = await axios.put(
        `http://localhost:5000/api/coolies/${profile._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        console.log("Profile update successful:", response.data);
        setProfile({ ...profile, ...formData });
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  // Display debug info in development mode
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
          <p><strong>Debug Info:</strong></p>
          <p>User: {user ? JSON.stringify({id: user.id || user._id, role: user.role}) : 'Not set'}</p>
          <p>Token present: {token || localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          <p>Profile loaded: {profile ? 'Yes' : 'No'}</p>
          {profile && <p>Profile ID: {profile._id}</p>}
          {profile && <p>Availability: {profile.isAvailable ? 'Available' : 'Not Available'}</p>}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Coolie Profile</h2>
        {renderDebugInfo()}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <div style={{ width: '3rem', height: '3rem', border: '2px solid #e5e7eb', borderTop: '2px solid var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </div>
    );
  }

  // No profile data after loading
  if (!loading && !profile && !error) {
    return (
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Coolie Profile</h2>
        {renderDebugInfo()}
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          No profile data found. Please make sure you're logged in as a coolie and have been approved.
        </div>
        <button 
          onClick={fetchProfile}
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary-600)',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Retry Loading Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Coolie Profile</h2>
      
      {renderDebugInfo()}
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
          {!user?.id && !user?._id && <p style={{ marginTop: '0.5rem' }}><strong>User ID is missing.</strong> Please refresh the page or try logging in again.</p>}
        </div>
      )}
      
      {successMessage && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {successMessage}
        </div>
      )}

      {/* Debug information - only visible during development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: '0.75rem', backgroundColor: '#e5e7eb', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
          <p><strong>Debug Info:</strong></p>
          <p>user.id: {user?.id || 'not set'}</p>
          <p>profile: {profile ? 'loaded' : 'not loaded'}</p>
          <p>profile._id: {profile?._id || 'not set'}</p>
        </div>
      )}

      {profile && (
        <>
          {/* Availability Status Banner */}
          <div 
            style={{ 
              backgroundColor: profile.isAvailable ? '#d1fae5' : '#fee2e2',
              color: profile.isAvailable ? '#065f46' : '#b91c1c',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                Status: {profile.isAvailable ? 'Available for Work' : 'Currently Unavailable'}
              </h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <strong>Station:</strong> {profile.station || 'Not assigned'}
                {profile.platformNumbers && profile.platformNumbers.length > 0 && 
                  <span> | <strong>Platforms:</strong> {profile.platformNumbers.join(', ')}</span>
                }
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                {profile.isAvailable 
                  ? `You are visible to passengers at ${profile.station} station and can receive booking requests.` 
                  : 'You are not visible to passengers and cannot receive new booking requests.'}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: profile?.isAvailable ? '#ef4444' : '#10b981',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {profile?.isAvailable ? 'Set as Unavailable' : 'Set as Available'}
            </button>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Coolie Information</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage your profile details and availability</p>
              </div>
              <div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-600)', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Name</h4>
                  <p>{profile.user?.name || 'Not available'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Email</h4>
                  <p>{profile.user?.email || 'Not available'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Age</h4>
                  <p>{profile.age} years</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Gender</h4>
                  <p>{profile.gender}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>ID Type</h4>
                  <p>{profile.idProofType}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>ID Number</h4>
                  <p>{profile.idProof}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Station</h4>
                  <p>{profile.station}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Platform Numbers</h4>
                  <p>{profile.platformNumbers?.join(', ') || 'None'}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Current Location</h4>
                  <p>{profile.currentLocation || 'Not specified'}</p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Station
                    </label>
                    <input
                      type="text"
                      name="station"
                      value={formData.station}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Current Location
                    </label>
                    <input
                      type="text"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                      placeholder="Where are you currently?"
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Platform Numbers
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                      {[1, 2, 3, 4, 5].map(platform => (
                        <div key={platform} style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            id={`platform-${platform}`}
                            value={platform}
                            checked={formData.platformNumbers.includes(platform)}
                            onChange={handlePlatformChange}
                            style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}
                          />
                          <label htmlFor={`platform-${platform}`} style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            {platform}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="submit"
                      style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-600)', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          station: profile.station,
                          platformNumbers: profile.platformNumbers || [],
                          isAvailable: profile.isAvailable,
                          currentLocation: profile.currentLocation || ''
                        });
                      }}
                      style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#6b7280', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Pending Bookings Section */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Pending Booking Requests
            </h3>
            
            {bookingsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '2rem', height: '2rem', border: '2px solid #e5e7eb', borderTop: '2px solid var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : pendingBookings.length > 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
                {pendingBookings.map((booking) => (
                  <div key={booking._id} style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                          Booking #{booking._id.substring(booking._id.length - 6)}
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          Passenger: {booking.user?.name || 'Unknown'}
                        </p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>Train:</span> {booking.trainNumber} | <span style={{ fontWeight: '500' }}>Seat:</span> {booking.seatNumber}
                        </p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>Station:</span> {booking.station} | <span style={{ fontWeight: '500' }}>Platform:</span> {booking.platformNumber}
                        </p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>Arrival:</span> {new Date(booking.arrivalTime).toLocaleString()}
                        </p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>Luggage:</span> {booking.luggageDetails.count} item(s), {booking.luggageDetails.weight}kg - {booking.luggageDetails.description}
                        </p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          Fare: ₹{booking.fare}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'confirmed')}
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleBookingStatusUpdate(booking._id, 'cancelled')}
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    {booking.notes && (
                      <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.375rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Notes:</p>
                        <p style={{ fontSize: '0.875rem' }}>{booking.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>No pending booking requests</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CoolieProfile; 