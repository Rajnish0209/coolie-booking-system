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

  const { register, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // If there's an error, set it to formError
    if (error) {
      setFormError(error);
      clearError();
      setIsLoading(false);
    }
  }, [isAuthenticated, error, navigate, clearError]);

  const { name, email, phone, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

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

    try {
      await register({
        name,
        email,
        phone,
        password,
        role: 'passenger'
      });
      // If successful, the useEffect will handle redirection
    } catch (err) {
      setIsLoading(false);
      // Error is handled in useEffect via context
    }
  };

  return (
    <div className="min-h-screen flex" style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%' }}>
        <div>
          <h2 style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '1.875rem', fontWeight: '800', color: '#1f2937' }}>
            Create your account
          </h2>
          <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
            Or{' '}
            <Link to="/login" style={{ fontWeight: '500', color: 'var(--primary-600)' }}>
              sign in to your account
            </Link>
          </p>
        </div>
        <form style={{ marginTop: '2rem' }} onSubmit={onSubmit}>
          <div style={{ borderRadius: '0.375rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #d1d5db', 
                  borderTopLeftRadius: '0.375rem', 
                  borderTopRightRadius: '0.375rem',
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}
                placeholder="Full Name"
                value={name}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #d1d5db', 
                  borderTop: 'none',
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}
                placeholder="Email address"
                value={email}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #d1d5db', 
                  borderTop: 'none',
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}
                placeholder="Phone Number (10 digits)"
                value={phone}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #d1d5db', 
                  borderTop: 'none',
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}
                placeholder="Password"
                value={password}
                onChange={onChange}
                minLength="6"
              />
            </div>
            <div>
              <label htmlFor="password2" className="sr-only">
                Confirm Password
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #d1d5db', 
                  borderTop: 'none',
                  borderBottomLeftRadius: '0.375rem', 
                  borderBottomRightRadius: '0.375rem',
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}
                placeholder="Confirm Password"
                value={password2}
                onChange={onChange}
                minLength="6"
              />
            </div>
          </div>

          {formError && (
            <div style={{ color: '#dc2626', fontSize: '0.875rem', textAlign: 'center', marginTop: '0.75rem' }}>
              {formError}
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                position: 'relative',
                opacity: isLoading ? '0.7' : '1',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <span style={{ position: 'absolute', left: '0', top: '0', bottom: '0', display: 'flex', alignItems: 'center', paddingLeft: '0.75rem' }}>
                  <svg style={{ height: '1.25rem', width: '1.25rem', color: 'white', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span style={{ position: 'absolute', left: '0', top: '0', bottom: '0', display: 'flex', alignItems: 'center', paddingLeft: '0.75rem' }}>
                  <svg style={{ height: '1.25rem', width: '1.25rem', color: '#A7F3D0' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Want to register as a coolie?{' '}
              <Link to="/register-coolie" style={{ fontWeight: '500', color: 'var(--primary-600)' }}>
                Click here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 