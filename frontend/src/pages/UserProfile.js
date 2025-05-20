import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserProfile = () => {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      // Get userId using either id or _id field
      const userId = user?.id || user?._id;
      
      if (!userId) {
        console.error('No user ID available', user);
        setError('User information is missing. Please try logging out and logging back in.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching user profile with ID:', userId);
        
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`
          }
        });

        console.log('User profile response:', response.data);

        if (response.data.success) {
          const userData = response.data.data;
          setProfile(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
          });
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(`Failed to fetch profile: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    
    if (!userId) {
      setError('Cannot update profile: User ID is missing');
      return;
    }
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setProfile({ ...profile, ...formData });
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(`Failed to update profile: ${err.response?.data?.message || err.message}`);
      console.error('Error updating profile:', err);
    }
  };

  // Display debug info in development mode
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      // return (
      //   <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.75rem' }}>
      //     <p><strong>Debug Info:</strong></p>
      //     <p>User: {user ? JSON.stringify({id: user.id || user._id, role: user.role}) : 'Not set'}</p>
      //     <p>Token present: {token || localStorage.getItem('token') ? 'Yes' : 'No'}</p>
      //     <p>Profile loaded: {profile ? 'Yes' : 'No'}</p>
      //   </div>
      // );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>My Profile</h2>
        {renderDebugInfo()}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
          <div style={{ width: '3rem', height: '3rem', border: '2px solid #e5e7eb', borderTop: '2px solid var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>My Profile</h2>
      
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

      {!profile && !loading && !error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          No profile data found. Please try refreshing the page or contact support.
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              display: 'block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#b91c1c',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )}

      {profile && (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Personal Information</h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Update your personal details</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-600)', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
              >
                Edit
              </button>
            )}
          </div>

          {!isEditing ? (
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Name</h4>
                <p>{profile.name}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Email</h4>
                <p>{profile.email}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>Phone</h4>
                <p>{profile.phone || 'Not provided'}</p>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: '500' }}>
                  Role: <span style={{ color: 'var(--primary-600)', fontWeight: '600' }}>{profile.role && profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  />
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
                        name: profile.name,
                        email: profile.email,
                        phone: profile.phone || ''
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
      )}
    </div>
  );
};

export default UserProfile; 