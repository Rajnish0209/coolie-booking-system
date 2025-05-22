import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminProfile = () => {
  const { user, token, logout } = useContext(AuthContext);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchProfile = useCallback(async () => {
    const userId = user?.id || user?._id;
    
    if (!token || !userId || user?.role !== 'admin') {
      setError('Access Denied. You must be an authenticated admin to view this page.');
      setLoading(false);
      if (!token || !user) logout();
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userData = response.data.data;
        if (userData.role !== 'admin') {
          setError('You do not have admin privileges to access this page.');
          setProfile(null);
        } else {
          setProfile(userData);
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || ''
          });
        }
      } else {
        setError(response.data.message || 'Failed to load profile data.');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or unauthorized. Please log in again.');
        logout();
      } else {
        setError(`Failed to fetch profile: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, API_URL, logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    
    if (!userId) {
      setError('Cannot update profile: User ID is missing. Please refresh.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProfile(prevProfile => ({ ...prevProfile, ...response.data.data }));
        setFormData(prevData => ({...prevData, ...response.data.data}));
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(`Failed to update profile: ${err.response?.data?.message || err.message}`);
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner"></div>
        <p className="mt-2">Loading admin profile...</p>
      </div>
    );
  }

  if (error && (!profile || error.includes('Access Denied') || error.includes('Session expired'))) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <p>{error}</p>
          <Link to="/login" className="btn btn-primary mt-2">Login</Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning text-center">
          Admin profile data could not be loaded. Please try again or contact support.
          <button onClick={fetchProfile} className="btn btn-primary mt-2 ml-2">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Admin Profile</h1>
      
      {error && !isEditing && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Admin Information</h4>
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setError(''); 
                setSuccessMessage('');
                setFormData({
                  name: profile.name || '',
                  email: profile.email || '',
                  phone: profile.phone || ''
                });
              }}
              className="btn btn-primary btn-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="card-body">
          {!isEditing ? (
            <div>
              <div className="mb-3">
                <strong>Name:</strong>
                <p>{profile.name}</p>
              </div>
              <div className="mb-3">
                <strong>Email:</strong>
                <p>{profile.email}</p>
              </div>
              <div className="mb-3">
                <strong>Phone:</strong>
                <p>{profile.phone || 'Not provided'}</p>
              </div>
              <div className="mt-3 p-2 bg-light rounded">
                <p className="mb-0"><strong>Role:</strong> <span className="badge bg-primary">Administrator</span></p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary mr-2" disabled={isSubmitting}>
                {isSubmitting ? <span className="spinner-sm"></span> : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setError(''); 
                  setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || ''
                  });
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="text-center mt-4">
        <Link to="/admin" className="btn btn-outline-secondary">Back to Admin Panel</Link>
      </div>
    </div>
  );
};

export default AdminProfile;