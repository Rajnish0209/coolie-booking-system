import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user, error, clearError } = useContext(AuthContext); // Added user
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) { // Check for user object as well
      // Redirect based on role after login
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'coolie') {
        navigate('/coolie-profile');
      } else { // passenger or other default roles
        navigate('/dashboard');
      }
    }

    if (error) {
      setFormError(error);
      clearError(); // Make sure to clear the error from context after displaying
      setIsLoading(false);
    }
  }, [isAuthenticated, user, error, navigate, clearError]); // Added user to dependency array

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(''); // Clear form error on change
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(''); // Clear previous errors
    
    if (!email || !password) {
      setFormError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      await login({ email, password }); // Changed to pass an object
      // If successful, the useEffect will handle redirection.
      // setIsLoading(false) will be handled by error effect or successful navigation
    } catch (err) {
      // Error is handled in useEffect via context, or if login itself throws and sets context error.
      // If login does not set context error on its own for some reason, set it here.
      // However, the current AuthContext seems to set error, so this might be redundant.
      // setFormError(err.message || 'Login failed'); 
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9fafb' }}>
      <div className="card" style={{ maxWidth: '28rem', width: '100%' }}>
        <div className="card-header">
          <h2 className="text-center h3 mb-0">
            Sign in to your account
          </h2>
          <p className="text-center mt-2" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Or{' '}
            <Link to="/register" style={{ fontWeight: '500', color: 'var(--primary-600)' }}>
              create a new account
            </Link>
          </p>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
            </div>

            {formError && (
              <div className="alert alert-danger mt-3 py-2 px-3"> {/* Adjusted padding for alert */}\
                {formError}
              </div>
            )}

            <div className="mt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-block"
                style={{ 
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  position: 'relative' // For spinner
                }}
              >
                {isLoading && (
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                    {/* Using the spinner keyframes from index.css via className */}
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;