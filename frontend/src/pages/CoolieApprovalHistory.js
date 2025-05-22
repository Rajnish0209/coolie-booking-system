import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CoolieApprovalHistory = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [coolies, setCoolies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const baseUploadUrl = API_URL.replace('/api', '') + '/uploads/';

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl; // Already a full URL
    }
    if (imageUrl.startsWith('uploads/')) {
      return `${API_URL.replace('/api', '')}/${imageUrl}`; // Starts with uploads/, just prepend base server URL
    }
    return `${baseUploadUrl}${imageUrl}`; // Likely just a filename
  };

  const fetchCoolies = useCallback(async () => {
    if (user?.role !== 'admin') {
      setError('Only admins can access this page.');
      setLoading(false);
      return;
    }
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      if (logout) logout(); // Logout if no token
      return;
    }

    setLoading(true);
    setError('');
    setActionError('');
    setActionSuccess('');

    try {
      // Corrected API endpoint to fetch all coolies
      const response = await axios.get(`${API_URL}/coolies/`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setCoolies(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch coolies.');
      }
    } catch (err) {
      console.error('Fetch Coolies Error:', err.response || err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        if (logout) logout();
      } else {
        setError(err.response?.data?.message || 'An error occurred while fetching coolies.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role, token, API_URL, logout]);

  useEffect(() => {
    fetchCoolies();
  }, [fetchCoolies]);

  const handleApprovalAction = async (coolieId, newApprovalStatus) => {
    setActionError('');
    setActionSuccess('');
    setLoading(true); // Indicate loading for the action

    try {
      const response = await axios.put(
        `${API_URL}/coolies/${coolieId}/approve`,
        { isApproved: newApprovalStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setActionSuccess(`Coolie status updated successfully to ${getStatusText(newApprovalStatus)}.`);
        // Refresh the specific coolie or the whole list
        setCoolies(prevCoolies =>
          prevCoolies.map(c =>
            c._id === coolieId ? { ...c, isApproved: newApprovalStatus, updatedAt: new Date().toISOString() } : c
          )
        );
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        setActionError(response.data.message || 'Failed to update approval status.');
        setTimeout(() => setActionError(''), 5000);
      }
    } catch (err) {
      console.error('Approval Action Error:', err.response || err);
      setActionError(err.response?.data?.message || 'An error occurred while updating approval status.');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setLoading(false); // Clear loading for the action
    }
  };

  const filteredCoolies = coolies.filter(coolie => {
    if (activeTab !== 'all') {
      if (activeTab === 'approved' && coolie.isApproved !== true) return false;
      if (activeTab === 'pending' && coolie.isApproved !== null) return false;
      if (activeTab === 'rejected' && coolie.isApproved !== false) return false;
    }
    
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      coolie.user?.name?.toLowerCase().includes(term) ||
      coolie.user?.email?.toLowerCase().includes(term) ||
      coolie.station?.toLowerCase().includes(term) ||
      coolie.coolieIdNumber?.toLowerCase().includes(term) || // Search by Coolie ID
      coolie.idProof?.toLowerCase().includes(term)
    );
  });

  const getStatusBadgeClass = (isApproved) => {
    if (isApproved === true) return 'badge bg-success';
    if (isApproved === false) return 'badge bg-danger';
    return 'badge bg-warning text-dark'; // For pending (isApproved === null)
  };

  const getStatusText = (isApproved) => {
    if (isApproved === true) return 'Approved';
    if (isApproved === false) return 'Rejected';
    return 'Pending Approval';
  };

  if (loading && coolies.length === 0) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading Coolie Applications...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="container py-4">
        <div className="alert alert-danger text-center">
          <p className="mb-0">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Coolie Application Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {actionError && <div className="alert alert-danger mt-2">{actionError}</div>}
      {actionSuccess && <div className="alert alert-success mt-2">{actionSuccess}</div>}
      
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Search by name, email, station, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control form-control-sm"
          />
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {['all', 'pending', 'approved', 'rejected'].map(tabStatus => (
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

      {filteredCoolies.length === 0 && !loading ? (
        <div className="alert alert-info text-center">No coolie applications found matching your criteria.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {filteredCoolies.map(coolie => (
            <div key={coolie._id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{coolie.user?.name || 'N/A'} <small className="text-muted">({coolie.coolieIdNumber || 'No ID'})</small></h5>
                  <span className={`badge ${getStatusBadgeClass(coolie.isApproved)} p-2`}>
                    {getStatusText(coolie.isApproved)}
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-text mb-1"><strong>Email:</strong> {coolie.user?.email || 'N/A'}</p>
                  <p className="card-text mb-1"><strong>Phone:</strong> {coolie.user?.phone || 'N/A'}</p>
                  <p className="card-text mb-1"><strong>Station:</strong> {coolie.station || 'N/A'}</p>
                  <p className="card-text mb-1"><strong>Age:</strong> {coolie.age || 'N/A'} | <strong>Gender:</strong> {coolie.gender || 'N/A'}</p>
                  <p className="card-text mb-1"><strong>ID Proof:</strong> {coolie.idProofType || 'N/A'} - {coolie.idProof || 'N/A'}</p>
                  <p className="card-text mb-1"><strong>Platforms:</strong> {coolie.platformNumbers?.join(', ') || 'N/A'}</p>
                  <p className="card-text mb-1"><strong>Available:</strong> {typeof coolie.isAvailable === 'boolean' ? (coolie.isAvailable ? 'Yes' : 'No') : 'N/A'}</p>
                  <p className="card-text small text-muted mt-2">Last Updated: {new Date(coolie.updatedAt || coolie.createdAt).toLocaleDateString()}</p>
                  <div className="mt-2 d-flex flex-wrap align-items-start">
                    {coolie.user?.imageUrl && (
                      <div className="me-3 mb-2 text-center">
                        <p className="mb-1"><small>Profile Picture:</small></p>
                        <img 
                          src={getFullImageUrl(coolie.user.imageUrl)} 
                          alt={`${coolie.user?.name || 'Coolie'}'s profile`} 
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                          onError={(e) => { e.target.style.display='none'; /* Hide if broken */ const p = document.createElement('p'); p.textContent='[Image not found]'; e.target.parentElement.appendChild(p); }}
                        />
                      </div>
                    )}
                    {coolie.idProofUrl && (
                      <div className="mb-2 text-center">
                        <p className="mb-1"><small>ID Proof:</small></p>
                        <img 
                          src={getFullImageUrl(coolie.idProofUrl)} 
                          alt="ID Proof" 
                          style={{ width: '150px', height: '100px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }} 
                          onError={(e) => { e.target.style.display='none'; /* Hide if broken */ const p = document.createElement('p'); p.textContent='[Image not found]'; e.target.parentElement.appendChild(p); }}
                        />
                      </div>
                    )}
                  </div>
                  {(!coolie.user?.imageUrl && !coolie.idProofUrl) && (
                     <p className="text-muted small mt-2">No images provided.</p>
                  )}
                </div>
                
                <div className="card-footer bg-light">
                  <div className="d-flex flex-wrap gap-2 justify-content-end">
                    {coolie.isApproved === null && ( // Pending approval
                      <>
                        <button
                          onClick={() => handleApprovalAction(coolie._id, true)}
                          className="btn btn-success btn-sm"
                          disabled={loading} // Disable button when an action is in progress
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(coolie._id, false)}
                          className="btn btn-danger btn-sm"
                          disabled={loading}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {coolie.isApproved === true && ( // Currently Approved
                      <button
                        onClick={() => handleApprovalAction(coolie._id, false)}
                        className="btn btn-warning btn-sm"
                        disabled={loading}
                      >
                        Revoke Approval (Reject)
                      </button>
                    )}
                    {coolie.isApproved === false && ( // Currently Rejected
                       <button
                        onClick={() => handleApprovalAction(coolie._id, true)}
                        className="btn btn-info btn-sm"
                        disabled={loading}
                      >
                        Re-approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoolieApprovalHistory;