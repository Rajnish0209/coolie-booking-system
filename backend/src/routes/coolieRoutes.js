const express = require('express');
const {
  getCoolies,
  getCoolie,
  updateCoolie,
  updateAvailability,
  approveCoolie,
  getAvailableCoolies,
  getCoolieProfile
} = require('../controllers/coolieController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/available', getAvailableCoolies);

// Routes that can be accessed without auth
router.route('/')
  .get(getCoolies);

router.route('/:id')
  .get(getCoolie);

// Protected routes
router.use(protect);

// Add route for coolie to get their own profile
router.get('/profile/me', authorize('coolie'), getCoolieProfile);

// Add route for coolie to update their own profile
router.put('/profile/me', authorize('coolie'), updateCoolie);

// Add route for coolie to update their own availability
router.put('/profile/availability', authorize('coolie'), updateAvailability);

// Coolie routes (old one, can be removed or kept for admin use if needed, but /profile/availability is preferred for coolies)
router.put('/:id/availability', authorize('coolie', 'admin'), updateAvailability); // Allow admin to also use this if needed

// Admin routes
router.put('/:id/approve', authorize('admin'), approveCoolie);

// Routes that need auth but can be accessed by different roles
router.route('/:id')
  .put(updateCoolie);

module.exports = router;