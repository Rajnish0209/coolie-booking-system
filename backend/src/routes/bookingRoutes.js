const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  rateBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Booking routes
router.route('/')
  .post(authorize('passenger'), createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBooking);

router.route('/:id/status')
  .put(updateBookingStatus);

router.route('/:id/rate')
  .post(authorize('passenger'), rateBooking);

module.exports = router; 