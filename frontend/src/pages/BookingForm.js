import React, { useState, useContext, useEffect, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookingForm = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    station: '',
    platformNumber: '',
    trainNumber: '',
    trainName: '',
    coachNumber: '',
    seatNumber: '',
    serviceDateTime: '', // This will be used for arrivalTime
    luggageQuantity: 1, // Corresponds to luggageDetails.count
    luggageWeight: 10, // New field for luggageDetails.weight, default 10kg
    message: '', // Corresponds to notes
  });
  const [availableCoolies, setAvailableCoolies] = useState([]);
  const [selectedCoolie, setSelectedCoolie] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [estimatedFare, setEstimatedFare] = useState(0); // New state for estimated fare

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    } else if (user.role !== 'passenger') {
      setError('Only passengers can book coolies. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 3000); 
    }
  }, [user, token, navigate]);

  // Calculate estimated fare when luggageWeight changes
  useEffect(() => {
    const weight = parseInt(formData.luggageWeight, 10);
    if (isNaN(weight) || weight <= 0) {
      setEstimatedFare(0);
      return;
    }

    const basePrice = 100;
    let calculatedFare = basePrice;

    if (weight > 20) {
      const extraWeight = weight - 20;
      const extraCharges = Math.ceil(extraWeight / 10) * 10;
      calculatedFare = basePrice + extraCharges;
    }
    setEstimatedFare(calculatedFare);
  }, [formData.luggageWeight]);

  const searchCoolies = useCallback(async (e) => {
    if (e) e.preventDefault(); 
    if (!formData.station || !formData.platformNumber) {
      setError('Please select a station and platform number.');
      return;
    }
    if (!formData.serviceDateTime) {
        setError('Please select the service date and time.');
        return;
    }

    setLoadingSearch(true);
    setError('');
    setAvailableCoolies([]);
    setSelectedCoolie(null);
    try {
      const response = await axios.get(`${API_URL}/coolies/available`, {
        params: {
          station: formData.station,
          platformNumber: formData.platformNumber,
          // dateTime: formData.serviceDateTime // Consider if backend uses this for precise availability
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check response.data.success and access coolies from response.data.data
      if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
        setAvailableCoolies(response.data.data);
      } else {
        // Use the message from backend if available, otherwise a generic one
        setError(response.data?.message || 'No coolies available for this station and platform at the selected time. Please try different criteria.');
        setAvailableCoolies([]); // Ensure coolies list is empty
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch available coolies. Please try again.');
      console.error(err);
    } finally {
      setLoadingSearch(false);
    }
  }, [formData.station, formData.platformNumber, formData.serviceDateTime, token, API_URL]);

  const selectCoolie = (coolie) => {
    setSelectedCoolie(coolie);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'passenger') {
        setError('Only passengers can create bookings. Please log in as a passenger.');
        return;
    }

    if (!selectedCoolie) {
      setError('Please search and select an available coolie first.');
      return;
    }
    if (!formData.serviceDateTime) {
        setError('Service date and time is required.');
        return;
    }
    if (!formData.trainNumber) {
        setError('Train number is required.');
        return;
    }
    if (!formData.seatNumber) {
        setError('Seat number is required.');
        return;
    }

    const bookingData = {
      station: formData.station,
      platformNumber: parseInt(formData.platformNumber, 10), // Ensure platformNumber is an integer
      trainNumber: formData.trainNumber,
      seatNumber: formData.seatNumber,
      serviceDateTime: new Date(formData.serviceDateTime).toISOString(), // Changed from arrivalTime to serviceDateTime
      luggageDetails: {
        count: parseInt(formData.luggageQuantity, 10) || 1,
        weight: parseInt(formData.luggageWeight, 10) || 10, // Use new luggageWeight field
        description: formData.message || 'General luggage' // Optional: use message for description or add a new field
      },
      coolie: selectedCoolie._id, // Changed from coolieId to coolie to match model
      user: user.id || user._id, // Changed from passengerId to user to match model
      status: 'pending',
      notes: formData.message, // Keep message as notes as well
      // trainName and coachNumber are optional or can be added if model supports them
      ...(formData.trainName && { trainName: formData.trainName }),
      ...(formData.coachNumber && { coachNumber: formData.coachNumber }),
    };

    setLoadingSubmit(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.post(`${API_URL}/bookings`, bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccessMessage('Booking request submitted successfully! You will be notified upon confirmation.');
        setFormData({
            station: '',
            platformNumber: '',
            trainNumber: '',
            trainName: '',
            coachNumber: '',
            seatNumber: '',
            serviceDateTime: '',
            luggageQuantity: 1,
            luggageWeight: 10, // Reset new field
            message: '',
        });
        setAvailableCoolies([]);
        setSelectedCoolie(null);
        setTimeout(() => {
            setSuccessMessage('');
            navigate('/bookings'); // Changed from /booking-history to /bookings
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to create booking.');
      }
    } catch (err) {
      console.error('Booking submission error:', err.response || err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'An unexpected error occurred. Failed to create booking.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };
  
  if (user && user.role !== 'passenger') {
    return (
        <div className="container py-5">
            <div className="alert alert-danger text-center">
                <p>{error || 'Access Denied: Only passengers can make bookings.'}</p>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-2">Go to Dashboard</button>
            </div>
        </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card p-3 p-md-4 shadow-sm">
        <h1 className="text-center mb-4">Book a Coolie</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <h3 className="mb-3">Service Details</h3>
          <div className="row">
            <div className="col-md-6 form-group mb-3">
              <label htmlFor="station" className="form-label">Station*</label>
              <input
                type="text"
                id="station"
                name="station"
                value={formData.station}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., New Delhi Railway Station"
                required
              />
            </div>
            <div className="col-md-6 form-group mb-3">
              <label htmlFor="platformNumber" className="form-label">Platform Number*</label>
              <input
                type="text"
                id="platformNumber"
                name="platformNumber"
                value={formData.platformNumber}
                onChange={handleChange}
                className="form-control"
                placeholder="e.g., Platform 5"
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 form-group mb-3">
              <label htmlFor="serviceDateTime" className="form-label">Service Date & Time*</label>
              <input
                type="datetime-local"
                id="serviceDateTime"
                name="serviceDateTime"
                value={formData.serviceDateTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6 form-group mb-3">
              <label htmlFor="luggageQuantity" className="form-label">Number of Bags/Luggage Items</label>
              <input
                type="number"
                id="luggageQuantity"
                name="luggageQuantity"
                value={formData.luggageQuantity}
                onChange={handleChange}
                className="form-control"
                min="1"
                required // Make it required as per model
              />
            </div>
            <div className="col-md-6 form-group mb-3">
              <label htmlFor="luggageWeight" className="form-label">Approx. Total Weight (kg)*</label>
              <input
                type="number"
                id="luggageWeight"
                name="luggageWeight"
                value={formData.luggageWeight}
                onChange={handleChange}
                className="form-control"
                min="1"
                required // Make it required as per model
              />
            </div>
          </div>
          
          <div className="form-group mb-3">
            <button 
                type="button" 
                onClick={searchCoolies} 
                className="btn btn-info mr-2" 
                disabled={loadingSearch || !formData.station || !formData.platformNumber || !formData.serviceDateTime}
            >
              {loadingSearch ? <span className="spinner-sm"></span> : 'Search Available Coolies'}
            </button>
          </div>

          {availableCoolies.length > 0 && (
            <div className="mb-3">
              <h4>Available Coolies</h4>
              <ul className="list-group">
                {availableCoolies.map(coolie => (
                  <li 
                    key={coolie._id} 
                    className={`list-group-item d-flex justify-content-between align-items-center ${selectedCoolie?._id === coolie._id ? 'active' : ''}`}
                    onClick={() => selectCoolie(coolie)}
                    style={{cursor: 'pointer'}}
                  >
                    <div>
                        {coolie.user?.name || 'Coolie'} (ID: {coolie.coolieIdNumber || coolie._id.slice(-6)})
                        <br />
                        <small>Rating: {coolie.averageRating ? `${coolie.averageRating.toFixed(1)}/5 (${coolie.totalRatings} ratings)` : 'Not rated yet'}</small>
                        <br />
                        <small>Languages: {coolie.languagesSpoken?.join(', ') || 'N/A'} | Vehicle: {coolie.vehicleDetails || 'N/A'}</small>
                    </div>
                    {selectedCoolie?._id === coolie._id && <span className="badge bg-light text-dark">Selected</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {loadingSearch && availableCoolies.length === 0 && <p>Searching for coolies...</p>}
          {!loadingSearch && availableCoolies.length === 0 && formData.station && formData.platformNumber && formData.serviceDateTime && (
            <p className="text-muted">No coolies found for the selected criteria. Try adjusting station, platform, or time.</p>
          )}

          {selectedCoolie && (
            <div className="card p-3 my-3 bg-light">
                <h4 className="mb-3">Confirm Booking for {selectedCoolie.user?.name || 'Selected Coolie'}</h4>
                
                {/* Display Estimated Fare */}
                <div className="alert alert-info">
                    <strong>Estimated Fare: ₹{estimatedFare}</strong>
                    <p className="small mb-0">Based on {formData.luggageWeight}kg of luggage. Final fare may vary.</p>
                </div>

                <h5 className="mb-3">Additional Train Details (Optional)</h5>
                <div className="row">
                    <div className="col-md-6 form-group mb-3">
                        <label htmlFor="trainNumber" className="form-label">Train Number*</label>
                        <input type="text" id="trainNumber" name="trainNumber" value={formData.trainNumber} onChange={handleChange} className="form-control" placeholder="e.g., 12345" required />
                    </div>
                    <div className="col-md-6 form-group mb-3">
                        <label htmlFor="trainName" className="form-label">Train Name</label>
                        <input type="text" id="trainName" name="trainName" value={formData.trainName} onChange={handleChange} className="form-control" placeholder="e.g., Express CityLink" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 form-group mb-3">
                        <label htmlFor="coachNumber" className="form-label">Coach Number</label>
                        <input type="text" id="coachNumber" name="coachNumber" value={formData.coachNumber} onChange={handleChange} className="form-control" placeholder="e.g., S5" />
                    </div>
                    <div className="col-md-6 form-group mb-3">
                        <label htmlFor="seatNumber" className="form-label">Seat Number*</label>
                        <input type="text" id="seatNumber" name="seatNumber" value={formData.seatNumber} onChange={handleChange} className="form-control" placeholder="e.g., 32" required />
                    </div>
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="message" className="form-label">Message to Coolie (Optional)</label>
                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} className="form-control" rows="3" placeholder="e.g., I have 2 large suitcases and will be near the main entrance of platform 5."></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loadingSubmit}>
                    {loadingSubmit ? <span className="spinner-sm"></span> : 'Confirm & Request Booking'}
                </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingForm;