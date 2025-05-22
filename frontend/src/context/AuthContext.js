import { createContext, useState, useEffect, useCallback, useReducer } from 'react';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken'; // Assuming setAuthToken is correctly imported

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'USER_LOADED':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'AUTH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token_passenger') || localStorage.getItem('token_coolie') || localStorage.getItem('token_admin'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null,
    role: null, // Add role to initial state
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Actions
  const setToken = (token) => dispatch({ type: 'SET_TOKEN', payload: token });
  const setUser = (user) => dispatch({ type: 'USER_LOADED', payload: user });
  const setIsAuthenticated = (isAuthenticated) => dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
  const setLoading = (loading) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error) => dispatch({ type: 'AUTH_ERROR', payload: error });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });


  // Load user
  const loadUser = useCallback(async (source = 'unknown') => {
    console.log(`AUTH_CONTEXT_DEBUG: loadUser called. Source: ${source}. Current token in state: ${state.token}`);
    setLoading(true);

    let tokenFromStorage = localStorage.getItem('token_passenger') ||
                             localStorage.getItem('token_coolie') ||
                             localStorage.getItem('token_admin');

    if (tokenFromStorage === "") {
      console.log('AUTH_CONTEXT_DEBUG: loadUser - Found empty string token in localStorage, treating as null.');
      tokenFromStorage = null;
    }
    
    console.log(`AUTH_CONTEXT_DEBUG: loadUser - Token from localStorage: ${tokenFromStorage}`);

    if (tokenFromStorage) {
      // The token from React state (state.token) might be stale here due to useCallback dependencies.
      // The comparison `state.token !== tokenFromStorage` uses this potentially stale state.token.
      console.log(`AUTH_CONTEXT_DEBUG: loadUser - Comparing state.token ('${state.token}') with tokenFromStorage ('${tokenFromStorage}')`);
      if (state.token !== tokenFromStorage) {
        console.log('AUTH_CONTEXT_DEBUG: loadUser - React state token differs from localStorage token. Updating React token state.');
        // This setToken might be redundant if the main effect calling loadUser already updated it,
        // or it might be necessary if loadUser is called from somewhere else (e.g. storage event).
        setToken(tokenFromStorage); // This will update state.token for subsequent renders/effects
      }
      setAuthToken(tokenFromStorage); // Configure axios
      try {
        console.log('AUTH_CONTEXT_DEBUG: loadUser - Attempting to fetch http://localhost:5000/api/auth/me'); // Corrected log
        const res = await axios.get('http://localhost:5000/api/auth/me'); // Use absolute URL
        console.log('AUTH_CONTEXT_DEBUG: loadUser - /api/auth/me SUCCESS', res.data);
        if (res.data && res.data.data) {
            setUser(res.data.data);
            setIsAuthenticated(true);
            setError(null);
        } else {
            console.error('AUTH_CONTEXT_DEBUG: loadUser - /api/auth/me response missing data.data:', res.data);
            localStorage.removeItem('token_passenger');
            localStorage.removeItem('token_coolie');
            localStorage.removeItem('token_admin');
            setAuthToken(null);
            setToken(null); // Ensure token state is cleared
            setUser(null);
            setIsAuthenticated(false);
            setError('User data not found in server response.');
        }
      } catch (err) {
        console.error("AUTH_CONTEXT_DEBUG: loadUser - Error fetching /api/auth/me:", err.response ? err.response.data : err.message, err);
        localStorage.removeItem('token_passenger');
        localStorage.removeItem('token_coolie');
        localStorage.removeItem('token_admin');
        setAuthToken(null);
        setToken(null); // Ensure token state is cleared
        setUser(null);
        setIsAuthenticated(false);
        setError(err.response?.data?.msg || 'Failed to verify user session. Please log in again.');
      }
    } else { // No token in localStorage
      console.log('AUTH_CONTEXT_DEBUG: loadUser - No token in localStorage.');
      setAuthToken(null); // Clear axios header
      // If React state thought there was a token, clear it.
      if (state.token !== null) {
        console.log('AUTH_CONTEXT_DEBUG: loadUser - React state token was not null. Clearing React token/user state.');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      // setError(null); // Decide if errors should be cleared here
    }
    setLoading(false);
    console.log(`AUTH_CONTEXT_DEBUG: loadUser finished. Current state - isAuthenticated: ${state.isAuthenticated}, user: ${JSON.stringify(state.user)}, token: ${state.token}`);
  }, [setToken, setUser, setIsAuthenticated, setLoading, setError, state.token]); // Added state.token to deps

  // Effect for initial load and token changes from login/logout actions within the same tab
  useEffect(() => {
    console.log(`AUTH_CONTEXT_DEBUG: useEffect [state.token] triggered. Current state.token: ${state.token}`);
    // This effect now runs when state.token changes.
    // loadUser will then be called with the updated state.token in its closure for comparison.
    if (state.token) { // If there's a token, try to load user
        loadUser('useEffect[state.token]');
    } else { // If token is null (e.g. after logout or initial load with no token)
        // Ensure user state is cleared if not already by loadUser
        // This part might be redundant if loadUser handles it, but ensures consistency.
        console.log('AUTH_CONTEXT_DEBUG: useEffect [state.token] - token is null. Clearing user/auth state.');
        setAuthToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false); // Ensure loading is false if no token
    }
  }, [state.token]); // Removed loadUser from here to break potential loop, now directly reacting to state.token

  // Effect for storage events (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event) => {
      console.log('AUTH_CONTEXT_DEBUG: Storage event detected - Key:', event.key);
      if (event.key === 'token_admin' || event.key === 'token_coolie' || event.key === 'token_passenger' || event.key === 'logout') {
        console.log('AUTH_CONTEXT_DEBUG: Relevant storage event. OldValue:', event.oldValue, 'NewValue:', event.newValue);
        // When a relevant storage event occurs, we need to re-evaluate the session.
        // We can directly call loadUser, or better, update our internal token state
        // to trigger the main useEffect if the localStorage token is different.
        
        let tokenFromStorageOnEvent = localStorage.getItem('token_passenger') ||
                                      localStorage.getItem('token_coolie') ||
                                      localStorage.getItem('token_admin');
        if (tokenFromStorageOnEvent === "") tokenFromStorageOnEvent = null;

        if (state.token !== tokenFromStorageOnEvent) {
            console.log('AUTH_CONTEXT_DEBUG: Storage event - token mismatch. Updating React token state to trigger main effect.');
            setToken(tokenFromStorageOnEvent); // This will trigger the useEffect dependent on state.token
        } else {
            // If tokens match, but it was a 'logout' event, still might need to refresh
            if (event.key === 'logout' && state.isAuthenticated) {
                 console.log('AUTH_CONTEXT_DEBUG: Storage event - logout key and authenticated, forcing reload via setToken');
                 setToken(null); // Force re-evaluation
            } else {
                 console.log('AUTH_CONTEXT_DEBUG: Storage event - token matches localStorage, no state change needed from event itself.');
            }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    console.log('AUTH_CONTEXT_DEBUG: Added storage event listener.');
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      console.log('AUTH_CONTEXT_DEBUG: Removed storage event listener.');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token, state.isAuthenticated]); // React to state.token to ensure comparison is fresh.

  const commonAuthSuccessHandler = async (res) => {
    console.log('commonAuthSuccessHandler TRACER --- Auth success response:', res.data);
    if (res.data.token && res.data.user) {
      const userRole = res.data.user.role;
      const roleSpecificTokenName = `token_${userRole}`;

      ['token_passenger', 'token_coolie', 'token_admin', 'token'].forEach(tName => {
        if (tName !== roleSpecificTokenName) {
          localStorage.removeItem(tName);
        }
      });

      localStorage.setItem(roleSpecificTokenName, res.data.token);
      setToken(res.data.token); 
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      console.log('commonAuthSuccessHandler TRACER --- Auth success, token and user set for role:', userRole);
      return res.data;
    } else {
      const errorMessage = res.data?.message || 'Authentication operation failed: No token or user data in response.';
      console.error('commonAuthSuccessHandler TRACER --- Error:', errorMessage);
      setError(errorMessage);
      localStorage.removeItem('token_passenger');
      localStorage.removeItem('token_coolie');
      localStorage.removeItem('token_admin');
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    }
  };

  const register = async (formData) => {
    console.log('Register TRACER --- Attempting registration.');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      return await commonAuthSuccessHandler(res);
    } catch (err) {
      console.error('Register TRACER --- Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed');
      setToken(null); setUser(null); setIsAuthenticated(false);
      throw err;
    }
  };

  const registerCoolie = async (formData) => {
    console.log('RegisterCoolie TRACER --- Attempting coolie registration.');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register-coolie', formData);
      return await commonAuthSuccessHandler(res);
    } catch (err) {
      console.error('RegisterCoolie TRACER --- Coolie registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Coolie registration failed');
      setToken(null); setUser(null); setIsAuthenticated(false);
      throw err;
    }
  };

  const loginUser = async (formData, role) => {
    console.log('Login TRACER --- Attempting login with formData:', formData);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login TRACER --- Login API call successful, response:', res);
      const result = await commonAuthSuccessHandler(res); // Process response
      setLoading(false);
      return result;
    } catch (err) {
      console.error('Login TRACER --- Login error:', err.response?.data || err.message, err);
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      // Clear any potential tokens or user data from failed login attempt
      localStorage.removeItem('token_passenger');
      localStorage.removeItem('token_coolie');
      localStorage.removeItem('token_admin');
      localStorage.removeItem('token'); // General token just in case
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      throw err; // Re-throw to be caught by the calling component if needed
    }
  };

  const logout = () => {
    console.log('AUTH_CONTEXT_DEBUG: logout action called');
    localStorage.removeItem('token_passenger');
    localStorage.removeItem('token_coolie');
    localStorage.removeItem('token_admin');
    localStorage.setItem('logout', Date.now().toString()); // Trigger storage event for other tabs

    setAuthToken(null); // Clear axios header immediately
    setToken(null); // This will trigger the useEffect which clears user state
    // setUser(null); // Handled by useEffect
    // setIsAuthenticated(false); // Handled by useEffect
    console.log('AUTH_CONTEXT_DEBUG: logout action - tokens cleared, setToken(null) called.');
  };

  return (
    <AuthContext.Provider value={{ 
      user: state.user, 
      token: state.token, 
      isAuthenticated: state.isAuthenticated, 
      loading: state.loading, 
      error: state.error, 
      register, 
      registerCoolie, 
      login: loginUser, 
      logout, 
      loadUser,
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;