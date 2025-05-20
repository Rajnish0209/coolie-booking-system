import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token set in axios headers');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Token removed from axios headers');
    }
  }, [token]);

  // Load user
  const loadUser = async () => {
    try {
      if (!token) {
        console.log('No token found, user not authenticated');
        setLoading(false);
        return;
      }

      console.log('Loading user data with token');
      const res = await axios.get('http://localhost:5000/api/auth/me');
      
      if (res.data.success) {
        console.log('User data loaded successfully:', res.data.data);
        // Normalize the MongoDB _id to id for frontend components
        const userData = res.data.data;
        if (userData && userData._id) {
          userData.id = userData._id;
          console.log('Normalized user data with id:', userData);
        } else {
          console.warn('User data missing _id field:', userData);
        }
        setUser(userData);
        setIsAuthenticated(true);
        
        // Ensure the token is fresh in localStorage
        localStorage.setItem('token', token);
      } else {
        console.error('API returned success:false when loading user');
        logout();
      }
    } catch (err) {
      console.error('Error loading user:', err.response?.data || err.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setError(err.response?.data?.message || 'Authentication error');
    }
    setLoading(false);
  };

  // Register user
  const register = async (formData) => {
    try {
      console.log('Registering new user');
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      if (res.data.token) {
        console.log('Registration successful, setting token');
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        await loadUser();
        return res.data;
      } else {
        throw new Error('No token received from registration');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Register coolie
  const registerCoolie = async (formData) => {
    try {
      console.log('Registering new coolie');
      const res = await axios.post('http://localhost:5000/api/auth/register-coolie', formData);
      
      if (res.data.token) {
        console.log('Coolie registration successful, setting token');
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        await loadUser();
        return res.data;
      } else {
        throw new Error('No token received from registration');
      }
    } catch (err) {
      console.error('Coolie registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Coolie registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (res.data.token) {
        console.log('Login successful, setting token');
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        await loadUser();
        return res.data;
      } else {
        throw new Error('No token received from login');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      console.log('Logging out user');
      await axios.get('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
      console.log('Logout complete, user state cleared');
    }
  };

  // Clear errors
  const clearError = () => {
    console.log('Clearing error state');
    setError(null);
  };

  // Check for token on mount and re-authenticate
  useEffect(() => {
    console.log('AuthContext mounted, checking for token');
    if (token) {
      console.log('Token found in localStorage, loading user');
      loadUser();
    } else {
      console.log('No token found in localStorage');
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  // Re-authenticate when token changes
  useEffect(() => {
    if (token) {
      loadUser();
    }
    // eslint-disable-next-line
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        registerCoolie,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 