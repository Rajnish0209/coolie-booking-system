import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const CoolieApprovalHistory = () => {
  const { user } = useContext(AuthContext);
  const [coolies, setCoolies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user.role !== 'admin') {
      setError('Only admins can access this page');
      setLoading(false);
      return;
    }
    fetchCoolies();
  }, [user.role]);

  const fetchCoolies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/coolies/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setCoolies(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch coolies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter coolies by status and search term
  const filteredCoolies = coolies.filter(coolie => {
    // Filter by approval status
    if (activeTab === 'approved' && !coolie.isApproved) return false;
    if (activeTab === 'pending' && coolie.isApproved) return false;
    if (activeTab === 'rejected' && coolie.isApproved !== false) return false;
    
    // Filter by search term if provided
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      coolie.user?.name?.toLowerCase().includes(searchTermLower) ||
      coolie.user?.email?.toLowerCase().includes(searchTermLower) ||
      coolie.station?.toLowerCase().includes(searchTermLower) ||
      coolie.idProofType?.toLowerCase().includes(searchTermLower) ||
      coolie.idProof?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleApprove = async (id, isApproved) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/coolies/${id}/approve`,
        { isApproved },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the local state
        setCoolies(prevCoolies =>
          prevCoolies.map(coolie =>
            coolie._id === id ? { ...coolie, isApproved } : coolie
          )
        );
      }
    } catch (err) {
      setError('Failed to update approval status');
      console.error(err);
    }
  };

  const getStatusBadgeClass = (isApproved) => {
    if (isApproved === true) return 'bg-green-100 text-green-800';
    if (isApproved === false) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isApproved) => {
    if (isApproved === true) return 'Approved';
    if (isApproved === false) return 'Rejected';
    return 'Pending';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{ width: '3rem', height: '3rem', border: '2px solid #e5e7eb', borderTop: '2px solid var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem' }}>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Coolie Approval History</h2>
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search coolies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '20rem', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', borderBottom: '1px solid #e5e7eb', overflow: 'auto' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{ 
            padding: '0.75rem 1rem', 
            fontWeight: activeTab === 'all' ? '600' : '400',
            color: activeTab === 'all' ? 'var(--primary-600)' : '#6b7280',
            borderBottom: activeTab === 'all' ? '2px solid var(--primary-600)' : 'none',
            marginBottom: '-1px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '0.75rem 1rem', 
            fontWeight: activeTab === 'pending' ? '600' : '400',
            color: activeTab === 'pending' ? 'var(--primary-600)' : '#6b7280',
            borderBottom: activeTab === 'pending' ? '2px solid var(--primary-600)' : 'none',
            marginBottom: '-1px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{ 
            padding: '0.75rem 1rem', 
            fontWeight: activeTab === 'approved' ? '600' : '400',
            color: activeTab === 'approved' ? 'var(--primary-600)' : '#6b7280',
            borderBottom: activeTab === 'approved' ? '2px solid var(--primary-600)' : 'none',
            marginBottom: '-1px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Approved
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          style={{ 
            padding: '0.75rem 1rem', 
            fontWeight: activeTab === 'rejected' ? '600' : '400',
            color: activeTab === 'rejected' ? 'var(--primary-600)' : '#6b7280',
            borderBottom: activeTab === 'rejected' ? '2px solid var(--primary-600)' : 'none',
            marginBottom: '-1px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Rejected
        </button>
      </div>

      {filteredCoolies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
          <p style={{ color: '#6b7280' }}>No coolies found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCoolies.map(coolie => (
            <div key={coolie._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{coolie.user?.name || 'Unknown'}</h3>
                  <p style={{ color: '#6b7280' }}>{coolie.user?.email || 'No email'} | {coolie.user?.phone || 'No phone'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    ...getStatusBadgeClass(coolie.isApproved) === 'bg-green-100 text-green-800' ? 
                      { backgroundColor: '#d1fae5', color: '#065f46' } :
                      getStatusBadgeClass(coolie.isApproved) === 'bg-red-100 text-red-800' ?
                      { backgroundColor: '#fee2e2', color: '#b91c1c' } :
                      { backgroundColor: '#fef3c7', color: '#92400e' }
                  }}>
                    {getStatusText(coolie.isApproved)}
                  </span>
                  
                  <p style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    {coolie.updatedAt ? `Updated: ${new Date(coolie.updatedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p><span style={{ fontWeight: '500' }}>Age:</span> {coolie.age} years</p>
                  <p><span style={{ fontWeight: '500' }}>Gender:</span> {coolie.gender}</p>
                  <p><span style={{ fontWeight: '500' }}>ID Type:</span> {coolie.idProofType}</p>
                  <p><span style={{ fontWeight: '500' }}>ID Number:</span> {coolie.idProof}</p>
                </div>
                <div>
                  <p><span style={{ fontWeight: '500' }}>Station:</span> {coolie.station}</p>
                  <p>
                    <span style={{ fontWeight: '500' }}>Platforms:</span>{' '}
                    {coolie.platformNumbers ? coolie.platformNumbers.join(', ') : 'None'}
                  </p>
                  <p>
                    <span style={{ fontWeight: '500' }}>Available:</span>{' '}
                    {coolie.isAvailable ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              
              {coolie.isApproved === null && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleApprove(coolie._id, true)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprove(coolie._id, false)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {coolie.isApproved !== null && (
                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => handleApprove(coolie._id, !coolie.isApproved)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: coolie.isApproved ? '#ef4444' : '#10b981', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                  >
                    {coolie.isApproved ? 'Change to Rejected' : 'Change to Approved'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoolieApprovalHistory; 