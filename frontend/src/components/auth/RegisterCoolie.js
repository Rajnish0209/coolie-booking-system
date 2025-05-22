import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const RegisterCoolie = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    age: '',
    gender: '',
    idProofNumber: '', // Renamed from idProof to idProofNumber
    idProofType: 'aadhar',
    station: '',
    platformNumbers: []
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [idProofImageFile, setIdProofImageFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platformCheckboxes, setPlatformCheckboxes] = useState([
    { id: 1, checked: false },
    { id: 2, checked: false },
    { id: 3, checked: false },
    { id: 4, checked: false },
    { id: 5, checked: false }
  ]);

  const { registerCoolie, isAuthenticated, error, clearError } = useContext(AuthContext);
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

  const { 
    name, 
    email, 
    phone, 
    password, 
    password2, 
    age, 
    gender, 
    idProofNumber, // Renamed
    idProofType, 
    station 
  } = formData;

  const onChange = e => {
    if (e.target.type === 'file') {
      if (e.target.name === 'profileImage') { // Changed name to match FormData key
        setProfileImageFile(e.target.files[0]);
      } else if (e.target.name === 'idProofImage') { // Changed name to match FormData key
        setIdProofImageFile(e.target.files[0]);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    setFormError('');
  };

  const handlePlatformChange = (id) => {
    const updatedPlatforms = platformCheckboxes.map(platform => 
      platform.id === id ? { ...platform, checked: !platform.checked } : platform
    );
    
    setPlatformCheckboxes(updatedPlatforms);
    
    const selectedPlatforms = updatedPlatforms
      .filter(platform => platform.checked)
      .map(platform => platform.id);
    
    setFormData({ ...formData, platformNumbers: selectedPlatforms });
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

    if (parseInt(age) < 18 || parseInt(age) > 65) {
      setFormError('Age must be between 18 and 65');
      setIsLoading(false);
      return;
    }

    if (formData.platformNumbers.length === 0) {
      setFormError('Please select at least one platform');
      setIsLoading(false);
      return;
    }

    if (!profileImageFile) {
      setFormError('Please upload a profile picture.');
      setIsLoading(false);
      return;
    }

    if (!idProofImageFile) {
      setFormError('Please upload an ID proof image.');
      setIsLoading(false);
      return;
    }

    const dataToSubmit = new FormData();
    dataToSubmit.append('name', name);
    dataToSubmit.append('email', email);
    dataToSubmit.append('phone', phone);
    dataToSubmit.append('password', password);
    dataToSubmit.append('age', parseInt(age));
    dataToSubmit.append('gender', gender);
    dataToSubmit.append('idProofNumber', idProofNumber);
    dataToSubmit.append('idProofType', idProofType);
    dataToSubmit.append('station', station);
    dataToSubmit.append('platformNumbers', formData.platformNumbers.join(','));
    dataToSubmit.append('profileImage', profileImageFile); // Key matches backend multer field
    dataToSubmit.append('idProofImage', idProofImageFile); // Key matches backend multer field

    try {
      await registerCoolie(dataToSubmit); 
    } catch (err) {
      // Error is handled in useEffect via context
      setIsLoading(false); 
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h2 className="card-title text-center mb-4">
                Register as a Coolie
              </h2>
              <p className="text-center text-muted mb-4">
                Or{' '}
                <Link to="/register" className="text-primary">
                  register as a passenger
                </Link>
              </p>
              {/* Added encType to form */}
              <form onSubmit={onSubmit} encType="multipart/form-data">
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}

                <div className="form-group mb-3">
                  <label htmlFor="name">Full Name</label>
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
                
                <div className="form-group mb-3">
                  <label htmlFor="email">Email address</label>
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
                
                <div className="form-group mb-3">
                  <label htmlFor="phone">Phone Number</label>
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
                
                <div className="form-group mb-3">
                  <label htmlFor="password">Password</label>
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
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="password2">Confirm Password</label>
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
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="age">Age</label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        required
                        className="form-control"
                        placeholder="Age (18-65)"
                        value={age}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        className="form-control"
                        value={gender}
                        onChange={onChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="idProofNumber">ID Proof Number</label>
                  <input
                    id="idProofNumber"
                    name="idProofNumber" // Ensure this matches state and FormData key
                    type="text"
                    required
                    className="form-control"
                    placeholder="Enter ID Proof Number (e.g., Aadhar, PAN)"
                    value={idProofNumber}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="idProofType">ID Proof Type</label>
                  <select
                    id="idProofType"
                    name="idProofType"
                    required
                    className="form-control form-select"
                    value={idProofType}
                    onChange={onChange}
                  >
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="voterid">Voter ID</option>
                  </select>
                </div>

                {/* Profile Image Upload */}
                <div className="form-group mb-3">
                  <label htmlFor="profileImage">Profile Picture</label>
                  <input
                    id="profileImage"
                    name="profileImage" // Name matches the key for FormData
                    type="file"
                    required
                    className="form-control"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={onChange}
                  />
                  {profileImageFile && <p className="mt-1"><small>Selected: {profileImageFile.name}</small></p>}
                </div>

                {/* ID Proof Image Upload */}
                <div className="form-group mb-3">
                  <label htmlFor="idProofImage">ID Proof Image</label>
                  <input
                    id="idProofImage"
                    name="idProofImage" // Name matches the key for FormData
                    type="file"
                    required
                    className="form-control"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={onChange}
                  />
                  {idProofImageFile && <p className="mt-1"><small>Selected: {idProofImageFile.name}</small></p>}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="station">Station</label>
                  <input
                    id="station"
                    name="station"
                    type="text"
                    required
                    className="form-control"
                    placeholder="Assigned Station"
                    value={station}
                    onChange={onChange}
                  />
                </div>

                <div className="form-group mb-3">
                  <label>Available Platforms (select at least one)</label>
                  <div className="mt-2">
                    {platformCheckboxes.map(platform => (
                      <div key={platform.id} className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`platform-${platform.id}`}
                          checked={platform.checked}
                          onChange={() => handlePlatformChange(platform.id)}
                        />
                        <label className="form-check-label" htmlFor={`platform-${platform.id}`}>
                          {platform.id}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path d="M12 2 L12 6 M12 18 L12 22 M4.93 4.93 L7.76 7.76 M16.24 16.24 L19.07 19.07 M2 12 L6 12 M18 12 L22 12 M4.93 19.07 L7.76 16.24 M16.24 7.76 L19.07 4.93" strokeDasharray="157" strokeDashoffset="0" />
                      </svg>
                    ) : (
                      'Register'
                    )}
                  </button>
                </div>
              </form>
              <p className="mt-4 text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCoolie;