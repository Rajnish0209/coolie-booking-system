const User = require('../models/User');
const Coolie = require('../models/Coolie');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments({ role: 'passenger' });
    const coolieCount = await Coolie.countDocuments();
    const pendingCoolieCount = await Coolie.countDocuments({ isApproved: false });
    const bookingCount = await Booking.countDocuments();
    const completedBookingCount = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookingCount = await Booking.countDocuments({ status: 'cancelled' });
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort('-createdAt')
      .limit(5)
      .populate([
        {
          path: 'user',
          select: 'name'
        },
        {
          path: 'coolie',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name'
          }
        }
      ]);
    
    // Get pending coolie approvals
    const pendingCoolies = await Coolie.find({ isApproved: false })
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email phone');
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userCount,
          coolies: coolieCount,
          pendingCoolies: pendingCoolieCount,
          bookings: bookingCount,
          completedBookings: completedBookingCount,
          cancelledBookings: cancelledBookingCount
        },
        recentBookings,
        pendingCoolies
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending coolie approvals
// @route   GET /api/admin/pending-coolies
// @access  Private/Admin
exports.getPendingCoolies = async (req, res) => {
  try {
    const coolies = await Coolie.find({ isApproved: false })
      .sort('-createdAt')
      .populate('user', 'name email phone imageUrl') // Added imageUrl to populate
      .select('+idProofUrl'); // Ensure idProofUrl is selected if it's not by default or explicitly excluded
    
    res.status(200).json({
      success: true,
      count: coolies.length,
      data: coolies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/admin/booking-stats
// @access  Private/Admin
exports.getBookingStats = async (req, res) => {
  try {
    // Get bookings by status
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    // Get bookings over time (e.g., last 7 days)
    const bookingsOverTime = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        bookingsOverTime
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking stats'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Removed .populate('coolieProfile')
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate({
        path: 'coolie',
        select: 'user station coolieIdNumber',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
    });
  }
};

module.exports = exports;