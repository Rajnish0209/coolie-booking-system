const express = require('express');
const {
  getDashboardStats,
  getPendingCoolies,
  getBookingStats,
  getAllUsers,
  getAllBookings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and restrict to admin
router.use(protect, authorize('admin'));

// Admin dashboard routes
router.get('/stats', getDashboardStats);
router.get('/pending-coolies', getPendingCoolies);
router.get('/booking-stats', getBookingStats);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);

module.exports = router;