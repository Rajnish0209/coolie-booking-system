import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingCoolies, setPendingCoolies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'coolies') {
      fetchPendingCoolies();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCoolies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/pending-coolies', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setPendingCoolies(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch pending coolies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveCoolie = async (id, isApproved) => {
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
        setPendingCoolies(pendingCoolies.filter(coolie => coolie._id !== id));
      }
    } catch (err) {
      setError('Failed to update coolie status');
      console.error(err);
    }
  };

  const renderDashboard = () => {
    if (!stats) return null;
    
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Admin Dashboard</h3>
            <p>Welcome to the Coolie Booking System admin panel. Here you can manage users, approve coolies, and monitor bookings.</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Total Users</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--primary-600)' }}>{stats.counts.users}</p>
          </div>
          
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Total Coolies</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--primary-600)' }}>{stats.counts.coolies}</p>
            {stats.counts.pendingCoolies > 0 && (
              <p style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                {stats.counts.pendingCoolies} pending approval
              </p>
            )}
          </div>
          
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Total Bookings</h3>
            <p style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--primary-600)' }}>{stats.counts.bookings}</p>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              <span style={{ display: 'inline-block', marginRight: '0.75rem' }}>
                <span style={{ color: '#059669', fontWeight: '500' }}>{stats.counts.completedBookings}</span> completed
              </span>
              <span style={{ display: 'inline-block' }}>
                <span style={{ color: '#dc2626', fontWeight: '500' }}>{stats.counts.cancelledBookings}</span> cancelled
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Booking History</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>View all bookings in the system</p>
            <Link 
              to="/bookings" 
              style={{ 
                display: 'inline-flex', 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--primary-600)', 
                color: 'white', 
                borderRadius: '0.375rem', 
                textDecoration: 'none',
                fontSize: '0.875rem' 
              }}
            >
              View Bookings
            </Link>
          </div>
          
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4b5563' }}>Coolie Approvals</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>View and manage coolie approval history</p>
            <Link 
              to="/coolie-approvals" 
              style={{ 
                display: 'inline-flex', 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--primary-600)', 
                color: 'white', 
                borderRadius: '0.375rem', 
                textDecoration: 'none',
                fontSize: '0.875rem' 
              }}
            >
              View Approvals
            </Link>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#4b5563' }}>Pending Coolie Approvals</h3>
            {stats.pendingCoolies.length > 0 ? (
              <div>
                {stats.pendingCoolies.map(coolie => (
                  <div key={coolie._id} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontWeight: '500' }}>{coolie.user?.name || 'Unknown'}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          Station: {coolie.station}, ID: {coolie.idProofType} ({coolie.idProof})
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => approveCoolie(coolie._id, true)}
                          style={{ padding: '0.375rem 0.75rem', backgroundColor: '#059669', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => approveCoolie(coolie._id, false)}
                          style={{ padding: '0.375rem 0.75rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCoolies = () => {
    return (
      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>Pending Coolie Approvals</h3>
        
        {pendingCoolies.length === 0 ? (
          <div style={{ backgroundColor: '#f9fafb', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>No pending coolie approvals</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingCoolies.map(coolie => (
              <div key={coolie._id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{coolie.user?.name || 'Unknown'}</h4>
                    <p style={{ color: '#6b7280' }}>{coolie.user?.email || 'No email'} | {coolie.user?.phone || 'No phone'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => approveCoolie(coolie._id, true)}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => approveCoolie(coolie._id, false)}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <div style={{ width: '3rem', height: '3rem', border: '2px solid #e5e7eb', borderTop: '2px solid var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            padding: '0.75rem 1rem', 
            backgroundColor: 'transparent',
            color: activeTab === 'dashboard' ? 'var(--primary-600)' : '#6b7280',
            borderBottom: activeTab === 'dashboard' ? '2px solid var(--primary-600)' : 'none',
            fontWeight: activeTab === 'dashboard' ? '600' : '400',
            marginBottom: '-1px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('coolies')}
          style={{ 
            padding: '0.75rem 1rem', 
            backgroundColor: 'transparent',
            color: activeTab === 'coolies' ? 'var(--primary-600)' : '#6b7280',
            borderBottom: activeTab === 'coolies' ? '2px solid var(--primary-600)' : 'none',
            fontWeight: activeTab === 'coolies' ? '600' : '400',
            marginBottom: '-1px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Pending Coolies
        </button>
      </div>
      
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'coolies' && renderCoolies()}
    </div>
  );
};

export default AdminPanel; 