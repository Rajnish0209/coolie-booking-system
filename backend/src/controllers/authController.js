const User = require('../models/User');
const Coolie = require('../models/Coolie');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'passenger' // Default to passenger if role not specified
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Register coolie
// @route   POST /api/auth/register-coolie
// @access  Public
exports.registerCoolie = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      age, 
      gender, 
      idProofType,
      idProofNumber,
      station, 
      platformNumbers 
    } = req.body;

    let imageUrlPath;
    let idProofUrlPath;

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        imageUrlPath = `/uploads/${req.files.profileImage[0].filename}`;
      }
      if (req.files.idProofImage && req.files.idProofImage[0]) {
        idProofUrlPath = `/uploads/${req.files.idProofImage[0].filename}`;
      }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check if ID proof number already exists
    const coolieExistsByIdProof = await Coolie.findOne({ idProofNumber });
    if (coolieExistsByIdProof) {
      return res.status(400).json({
        success: false,
        message: 'ID proof number already registered'
      });
    }

    // Create user with coolie role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'coolie',
      imageUrl: imageUrlPath 
    });

    // Create coolie profile
    const coolie = await Coolie.create({
      user: user._id,
      age,
      gender,
      idProofType,
      idProofNumber, 
      idProofUrl: idProofUrlPath, 
      station,
      platformNumbers: platformNumbers ? platformNumbers.split(',').map(p => p.trim()) : [],
      isApproved: false,
      isAvailable: false
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Error in registerCoolie:', error);
    // Check for duplicate key error specifically for idProofNumber
    if (error.code === 11000 && error.keyPattern && error.keyPattern.idProofNumber) {
      return res.status(400).json({
        success: false,
        message: 'ID proof number is already registered. Please use a different ID proof.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during coolie registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // If coolie, check if approved
    if (user.role === 'coolie') {
      const coolie = await Coolie.findOne({ user: user._id });
      
      if (!coolie || !coolie.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval by admin'
        });
      }
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      console.error('getMe TRACER --- User object not found on req in getMe.');
      return res.status(404).json({
        success: false,
        message: 'User not found after authentication'
      });
    }

    // Add cache-disabling headers to ensure fresh data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    console.log('getMe TRACER --- Sending user data (as data object):', user._id, user.role);
    res.status(200).json({
      success: true,
      data: { // Reverted to use 'data' as the key for the user object
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('getMe TRACER --- Error in getMe controller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving user profile'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  const cookieNames = ['token_passenger', 'token_coolie', 'token_admin', 'token'];
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000), // Short expiry to ensure clearance
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  cookieNames.forEach(cookieName => {
    res.cookie(cookieName, 'none', cookieOptions);
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  const currentRoleCookieName = `token_${user.role}`; // e.g., token_passenger, token_coolie

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Clear other role-specific cookies and the generic 'token' cookie
  const allPossibleCookieNames = ['token_passenger', 'token_coolie', 'token_admin', 'token'];
  allPossibleCookieNames.forEach(cookieNameToClear => {
    if (cookieNameToClear !== currentRoleCookieName) {
      res.cookie(cookieNameToClear, 'none', {
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }
  });

  res.status(statusCode).cookie(currentRoleCookieName, token, options).json({
    success: true,
    token, // Keep token in response for frontend to use (e.g., store in localStorage)
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};