import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    station: '',
    platformNumber: '',
    trainNumber: '',
    seatNumber: '',
    arrivalTime: '',
    luggageDetails: {
      count: 1,
      weight: 10,
      description: 'General luggage'
    },
    paymentMethod: 'cash'
  });
  const [availableCoolies, setAvailableCoolies] = useState([]);
  const [selectedCoolie, setSelectedCoolie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fare, setFare] = useState(100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLuggageChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      luggageDetails: {
        ...formData.luggageDetails,
        [name]: value
      }
    });

    // Calculate fare based on weight
    if (name === 'weight') {
      const weight = parseInt(value);
      const basePrice = 100;
      
      if (weight <= 20) {
        setFare(basePrice);
      } else {
        const extraWeight = weight - 20;
        const extraCharges = Math.ceil(extraWeight / 10) * 10;
        setFare(basePrice + extraCharges);
      }
    }
  };

  const searchCoolies = async () => {
    if (!formData.station || !formData.platformNumber) {
      setError('Please select a station and platform number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/coolies/available`, {
        params: {
          station: formData.station,
          platformNumber: formData.platformNumber
        }
      });

      if (response.data.data.length === 0) {
        setError('No coolies available for this station and platform');
      } else {
        setAvailableCoolies(response.data.data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch available coolies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCoolie = (coolie) => {
    setSelectedCoolie(coolie);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCoolie) {
      setError('Please select a coolie');
      return;
    }

    // Format arrival time to ISO string
    const bookingData = {
      ...formData,
      coolie: selectedCoolie._id,
      arrivalTime: new Date(formData.arrivalTime).toISOString(),
      fare
    };

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        navigate('/bookings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book a Coolie</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Journey Details</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
              <input
                type="text"
                name="station"
                value={formData.station}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter station name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Number</label>
              <select
                name="platformNumber"
                value={formData.platformNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select Platform</option>
                <option value="1">Platform 1</option>
                <option value="2">Platform 2</option>
                <option value="3">Platform 3</option>
                <option value="4">Platform 4</option>
                <option value="5">Platform 5</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Train Number</label>
              <input
                type="text"
                name="trainNumber"
                value={formData.trainNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter train number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Number</label>
              <input
                type="text"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter seat number"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
              <input
                type="datetime-local"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Luggage Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Items</label>
              <input
                type="number"
                name="count"
                value={formData.luggageDetails.count}
                onChange={handleLuggageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.luggageDetails.weight}
                onChange={handleLuggageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.luggageDetails.description}
                onChange={handleLuggageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Description of luggage"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="cash">Cash</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Estimated Fare</h4>
              <p className="text-3xl font-bold text-primary-600">₹{fare}</p>
              <p className="text-sm text-gray-500">Base fare: ₹100 + Additional charges based on weight</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={searchCoolies}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition duration-300 mr-4"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search Available Coolies'}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm">
              {error}
            </div>
          )}

          {availableCoolies.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Coolies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCoolies.map(coolie => (
                  <div 
                    key={coolie._id} 
                    className={`border rounded-lg p-4 cursor-pointer ${selectedCoolie?._id === coolie._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                    onClick={() => selectCoolie(coolie)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{coolie.user.name}</h4>
                        <p className="text-sm text-gray-600">Rating: {coolie.averageRating.toFixed(1)}/5</p>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          checked={selectedCoolie?._id === coolie._id}
                          onChange={() => selectCoolie(coolie)}
                          className="h-4 w-4 text-primary-600" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCoolie && (
            <div className="mt-8">
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingForm; 