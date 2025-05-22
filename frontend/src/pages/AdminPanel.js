import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AdminPanel = () => {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingCoolies, setPendingCoolies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [processingCoolieId, setProcessingCoolieId] = useState(null); // New state for loading

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  const fetchPendingCoolies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/pending-coolies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPendingCoolies(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch pending coolies');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending coolies');
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data.users || response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllBookings(response.data.bookings || response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [token, API_URL]);

  const getBookingStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'confirmed': return 'badge-info';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      setError('Access denied. You must be an admin to view this page.');
      setLoading(false);
      return;
    }
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'coolies') {
      fetchPendingCoolies();
    } else if (activeTab === 'users') {
      fetchAllUsers();
    } else if (activeTab === 'bookings') {
      fetchAllBookings();
    }
  }, [activeTab, token, user, fetchDashboardStats, fetchPendingCoolies, fetchAllUsers, fetchAllBookings]);

  const handleCoolieApproval = async (id, isApproved) => {
    setActionError('');
    setActionSuccess('');
    setProcessingCoolieId(id); // Set processing ID
    try {
      const response = await axios.put(
        `${API_URL}/coolies/${id}/approve`,
        { isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setPendingCoolies(prevCoolies => prevCoolies.filter(coolie => coolie._id !== id));
        setActionSuccess(`Coolie ${isApproved ? 'approved' : 'rejected'} successfully.`);
        if (activeTab === 'dashboard' && stats) {
          fetchDashboardStats();
        }
      } else {
        setActionError(response.data.message || 'Failed to update coolie status');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update coolie status');
    } finally {
      setProcessingCoolieId(null); // Clear processing ID
    }
  };

  if (loading && activeTab === 'dashboard' && !stats) {
    return (
        <div className="container text-center py-5">
            <div className="spinner"></div>
            <p>Loading Dashboard...</p>
        </div>
    );
  }
  if (error && !user) { // If initial auth check fails
    return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;
  }

  const renderDashboard = () => {
    if (!stats) return <p className="text-muted">No statistics available.</p>;
    return (
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Admin Dashboard</h2>
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Users</h5>
                  <p className="card-text display-4">{stats.counts.users}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Coolies</h5>
                  <p className="card-text display-4">{stats.counts.coolies}</p>
                  {stats.counts.pendingCoolies > 0 && (
                    <p className="text-warning mt-1">{stats.counts.pendingCoolies} pending</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Bookings</h5>
                  <p className="card-text display-4">{stats.counts.bookings}</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Completed Bookings</h5>
                  <p className="card-text display-4 text-success">{stats.counts.completedBookings}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4>Quick Actions</h4>
            <Link to="/coolie-approvals" className="btn btn-outline-primary me-2">View Coolie Approval History</Link>
            {/* Add more quick links as needed */}
          </div>
        </div>
      </div>
    );
  };

  const renderPendingCoolies = () => {
    if (loading && pendingCoolies.length === 0) {
      return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>;
    }
    if (!loading && pendingCoolies.length === 0) {
      return <p>No pending coolie approvals.</p>;
    }
    return (
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Pending Coolie Approvals</h2>
          {actionError && <div className="alert alert-danger">{actionError}</div>}
          {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
          <ul className="list-group">
            {pendingCoolies.map(coolie => (
              <li key={coolie._id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start flex-wrap">
                  <div className="mb-2 mb-md-0 flex-grow-1">
                    <p className="mb-0"><strong>{coolie.user?.name || 'N/A'}</strong> ({coolie.user?.email || 'N/A'})</p>
                    <p className="mb-0"><small>Station: {coolie.station || 'N/A'} | ID: {coolie.idProofType} - {coolie.idProofNumber || coolie.idProof}</small></p>
                    
                    <div className="mt-2 d-flex flex-wrap">
                      {coolie.user?.imageUrl ? (
                        <div className="me-3 mb-2">
                          <p className="mb-1"><small>Profile Picture:</small></p>
                          <img 
                            src={coolie.user.imageUrl} 
                            alt={`${coolie.user?.name || 'Coolie'}'s profile`} 
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                          />
                        </div>
                      ) : (
                        <p className="me-3 mb-2"><small>No profile picture provided.</small></p>
                      )}
                      {coolie.idProofUrl ? (
                        <div className="mb-2">
                          <p className="mb-1"><small>ID Proof:</small></p>
                          <img 
                            src={coolie.idProofUrl} 
                            alt="ID Proof" 
                            style={{ width: '150px', height: '100px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} 
                          />
                        </div>
                      ) : (
                        <p className="mb-2"><small>No ID proof image provided.</small></p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 mt-md-0 ms-md-3">
                    <button
                      onClick={() => handleCoolieApproval(coolie._id, true)}
                      className="btn btn-success btn-sm me-2 mb-1 d-block w-100"
                      disabled={processingCoolieId === coolie._id}
                    >
                      {processingCoolieId === coolie._id && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
                      Approve
                    </button>
                    <button
                      onClick={() => handleCoolieApproval(coolie._id, false)}
                      className="btn btn-danger btn-sm d-block w-100"
                      disabled={processingCoolieId === coolie._id}
                    >
                      {processingCoolieId === coolie._id && <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>}
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderAllUsers = () => {
    if (loading) return <div className="spinner"></div>;
    if (allUsers.length === 0) return <p>No users found.</p>;
    return (
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">All Users</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/users/${user._id}`} className="btn btn-primary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAllBookings = () => {
    if (loading) return <div className="spinner"></div>;
    if (allBookings.length === 0) return <p>No bookings found.</p>;
    return (
      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">All Bookings</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Coolie</th>
                  <th>Station</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td>{booking.coolie?.user?.name || 'N/A'}</td>
                    <td>{booking.station}</td>
                    <td>{new Date(booking.bookingDate).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getBookingStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/bookings/${booking._id}`} className="btn btn-primary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Admin Panel</h1>
      <div className="mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setActiveTab('dashboard')}
              type="button" // Added type="button"
            >
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'coolies' ? 'active' : ''}`} 
              onClick={() => setActiveTab('coolies')}
              type="button" // Added type="button"
            >
              Coolie Approvals
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} 
              onClick={() => setActiveTab('users')}
              type="button" // Added type="button"
            >
              Users
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} 
              onClick={() => setActiveTab('bookings')}
              type="button" // Added type="button"
            >
              Bookings
            </button>
          </li>
        </ul>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'coolies' && renderPendingCoolies()}
      {activeTab === 'users' && renderAllUsers()}
      {activeTab === 'bookings' && renderAllBookings()}
    </div>
  );
};

export default AdminPanel;