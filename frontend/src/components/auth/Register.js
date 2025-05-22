import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password2: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, user, error, clearError } = useContext(AuthContext); // Added user
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) { // Check for user object as well
      // Passenger registration defaults to dashboard
      navigate('/dashboard'); 
    }

    if (error) {
      setFormError(error);
      clearError();
      setIsLoading(false);
    }
  }, [isAuthenticated, user, error, navigate, clearError]); // Added user to dependency array

  const { name, email, phone, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');

    if (password !== password2) {
      setFormError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setFormError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name,
        email,
        phone,
        password,
        role: 'passenger' // Default role for this registration form
      });
      // If successful, the useEffect will handle redirection.
    } catch (err) {
      // Error is handled in useEffect via context
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9fafb' }}>
      <div className="card" style={{ maxWidth: '28rem', width: '100%' }}>
        <div className="card-header">
          <h2 className="text-center h3 mb-0">
            Create your account
          </h2>
          <p className="text-center mt-2" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Or{' '}
            <Link to="/login" style={{ fontWeight: '500', color: 'var(--primary-600)' }}>
              sign in to your account
            </Link>
          </p>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="form-control"
                placeholder="Full Name"
                value={name}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="sr-only">Email address</label>
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
              <label htmlFor="phone" className="sr-only">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="form-control"
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={onChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="form-control"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={onChange}
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password2" className="sr-only">Confirm Password</label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                className="form-control"
                placeholder="Confirm Password"
                value={password2}
                onChange={onChange}
                minLength="6"
              />
            </div>

            {formError && (
              <div className="alert alert-danger mt-3 py-2 px-3">
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
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;