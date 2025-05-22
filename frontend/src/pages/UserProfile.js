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
      const userId = user?.id || user?._id;
      if (!userId) {
        setError(
          "User information is missing. Please try logging out and logging back in."
        );
        setLoading(false);
        return;
      }

      // Retrieve the correct token from AuthContext or localStorage as a fallback
      // AuthContext should provide the currently active user's token.
      const activeToken = token || localStorage.getItem("token");
      if (!activeToken) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          }
        );

        if (response.data.success) {
          const userData = response.data.data;
          setProfile(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
        } else {
          setError("Failed to load profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(
          `Failed to fetch profile: ${err.response?.data?.message || err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) { // Ensure user object is available before fetching
      fetchProfile();
    }
  }, [user, token]); // Ensure token is a dependency if used directly from context

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!userId) {
      setError("Cannot update profile: User ID is missing");
      return;
    }

    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
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

  // const renderDebugInfo = () => { // Commenting out debug info for production use
  //   if (process.env.NODE_ENV === 'development') {
  //     return (
  //       <div className="alert alert-secondary small">
  //         <p><strong>Debug Info:</strong></p>
  //         <p>User: {user ? JSON.stringify({id: user.id || user._id, role: user.role}) : 'Not set'}</p>
  //         <p>Token present: {token || localStorage.getItem('token') ? 'Yes' : 'No'}</p>
  //         <p>Profile loaded: {profile ? 'Yes' : 'No'}</p>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  if (loading) {
    return (
      <div className="container py-5">
        <h2 className="mb-4">My Profile</h2>
        {/* renderDebugInfo() */}
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">My Profile</h2>
      
      {/* renderDebugInfo() */}
      
      {error && (
        <div className="alert alert-danger">
          {error}
          {!user?.id && !user?._id && <p className="mt-2"><strong>User ID is missing.</strong> Please refresh the page or try logging in again.</p>}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {!profile && !loading && !error && (
        <div className="alert alert-warning">
          No profile data found. Please try refreshing the page or contact support.
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-sm btn-warning mt-3"
          >
            Refresh Page
          </button>
        </div>
      )}

      {profile && (
        <div className="card shadow-sm">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Personal Information</h5>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-outline-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="card-body">
              <div className="mb-3">
                <strong className="text-muted">Name:</strong>
                <p className="mb-0">{profile.name}</p>
              </div>
              <div className="mb-3">
                <strong className="text-muted">Email:</strong>
                <p className="mb-0">{profile.email}</p>
              </div>
              <div className="mb-3">
                <strong className="text-muted">Phone:</strong>
                <p className="mb-0">{profile.phone || 'Not provided'}</p>
              </div>
              <div className="mt-3 p-2 bg-light rounded">
                <p className="small mb-0">
                  <strong>Role:</strong> <span className="text-primary fw-bold">{profile.role && profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                  <label htmlFor="name">Full Name</label>
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
                  <label htmlFor="email">Email address</label>
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
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data to profile data if user cancels
                      setFormData({
                        name: profile.name || '',
                        email: profile.email || '',
                        phone: profile.phone || ''
                      });
                      setError(''); // Clear any previous errors
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
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