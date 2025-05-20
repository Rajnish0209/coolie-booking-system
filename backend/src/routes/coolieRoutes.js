const express = require('express');
const {
  getCoolies,
  getCoolie,
  updateCoolie,
  updateAvailability,
  approveCoolie,
  getAvailableCoolies
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

// Coolie routes
router.put('/:id/availability', authorize('coolie'), updateAvailability);

// Admin routes
router.put('/:id/approve', authorize('admin'), approveCoolie);

// Routes that need auth but can be accessed by different roles
router.route('/:id')
  .put(updateCoolie);

module.exports = router; 