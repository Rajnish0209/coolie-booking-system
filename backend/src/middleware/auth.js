const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check for x-auth-token header
  if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
    // console.log('AUTH_MIDDLEWARE_DEBUG: Token found in x-auth-token header:', token);
  } 
  // 2. Else, check for Bearer token in Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    // console.log('AUTH_MIDDLEWARE_DEBUG: Token found in Authorization header:', token);
  } 
  // 3. Else, fallback to cookies
  else {
    const potentialTokens = [
      req.cookies?.token_passenger,
      req.cookies?.token_coolie,
      req.cookies?.token_admin,
      req.cookies?.token 
    ];
    token = potentialTokens.find(t => t && t !== 'none');
    // if (token) console.log('AUTH_MIDDLEWARE_DEBUG: Token found in cookies:', token);
  }

  // Make sure token exists
  if (!token) {
    // console.log('AUTH_MIDDLEWARE_DEBUG: No token found.');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (no token)'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('AUTH_MIDDLEWARE_DEBUG: Token decoded:', decoded);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      // console.log('AUTH_MIDDLEWARE_DEBUG: User not found for decoded ID.');
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }
    // console.log('AUTH_MIDDLEWARE_DEBUG: User attached to req:', req.user._id);
    next();
  } catch (err) {
    // console.error('AUTH_MIDDLEWARE_DEBUG: Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route (token invalid)'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) { // Check if req.user exists, which protect should have set
        return res.status(401).json({
            success: false,
            message: 'Not authorized, user not identified before authorization check'
        });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};