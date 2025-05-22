const express = require('express');
const { 
  register, 
  registerCoolie, 
  login, 
  getMe, 
  logout 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadCoolieFiles } = require('../middleware/uploadMiddleware'); // Added

const router = express.Router();

// Register routes
router.post('/register', register);
// Updated registerCoolie route to include file upload middleware
router.post('/register-coolie', uploadCoolieFiles, registerCoolie);

// Login route
router.post('/login', login);

// Get current user
router.get('/me', protect, getMe);

// Logout route
router.get('/logout', protect, logout);

module.exports = router;