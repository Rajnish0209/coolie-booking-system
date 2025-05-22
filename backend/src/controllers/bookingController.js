const Booking = require('../models/Booking');
const Coolie = require('../models/Coolie');
const Notification = require('../models/Notification');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/Passenger
exports.createBooking = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check if user is passenger
    if (req.user.role !== 'passenger') {
      return res.status(403).json({
        success: false,
        message: 'Only passengers can create bookings'
      });
    }
    
    const { station, platformNumber, coolie } = req.body;
    
    // If coolie is not specified, find an available coolie
    if (!coolie) {
      const availableCoolie = await Coolie.findOne({
        station,
        platformNumbers: platformNumber,
        isApproved: true,
        isAvailable: true
      }).sort('-averageRating');
      
      if (!availableCoolie) {
        return res.status(404).json({
          success: false,
          message: 'No available coolies found for this station and platform'
        });
      }
      
      req.body.coolie = availableCoolie._id;
    } else {
      // If coolie is specified, check if available
      const coolieExists = await Coolie.findById(coolie);
      
      if (!coolieExists || !coolieExists.isApproved || !coolieExists.isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Selected coolie is not available'
        });
      }
      
      // Check if coolie works at the specified station and platform
      if (coolieExists.station !== station || !coolieExists.platformNumbers.includes(parseInt(platformNumber))) {
        return res.status(400).json({
          success: false,
          message: 'Selected coolie does not work at this station/platform'
        });
      }
    }
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    // Update coolie availability
    await Coolie.findByIdAndUpdate(booking.coolie, { isAvailable: false });
    
    // Create notification for coolie
    const coolieUser = await Coolie.findById(booking.coolie).select('user');
    
    await Notification.create({
      recipient: coolieUser.user,
      sender: req.user.id,
      type: 'booking',
      title: 'New Booking',
      message: `You have a new booking at ${station}, Platform ${platformNumber}`,
      relatedBooking: booking._id
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query;
    const { status, coolieId } = req.query; // Destructure coolieId from query

    // If user is admin, get all bookings
    if (req.user.role === 'admin') {
      query = Booking.find();
    } 
    // If user is coolie, get their bookings
    else if (req.user.role === 'coolie') {
      const coolieProfile = await Coolie.findOne({ user: req.user.id }); // Renamed to coolieProfile for clarity
      
      if (!coolieProfile) {
        return res.status(404).json({
          success: false,
          message: 'No coolie profile found'
        });
      }
      
      // If coolieId is provided in query (e.g., for CoolieProfile page), use it, otherwise use logged-in coolie's ID
      const targetCoolieId = coolieId || coolieProfile._id;
      query = Booking.find({ coolie: targetCoolieId });
    } 
    // If user is passenger, get their bookings
    else {
      query = Booking.find({ user: req.user.id });
    }
    
    // Add status filtering if provided
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      if (statusArray.length > 0) {
        query = query.where('status').in(statusArray);
      }
    }

    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Booking.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    // Populate with user and coolie details
    query = query.populate([
      {
        path: 'user',
        select: 'name email phone'
      },
      {
        path: 'coolie',
        select: 'user station platformNumbers',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      }
    ]);
    
    // Sort by creation date (newest first)
    query = query.sort('-createdAt');
    
    // Execute query
    const bookings = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate([
      {
        path: 'user',
        select: 'name email phone'
      },
      {
        path: 'coolie',
        select: 'user station platformNumbers',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      }
    ]);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner, coolie assigned to booking, or admin
    if (
      booking.user._id.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      !(req.user.role === 'coolie' && booking.coolie.user._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, cancelledBy } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check permission based on status change
    if (status === 'cancelled') {
      // Only booking owner or admin can cancel
      if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }
      
      // Can't cancel if already completed
      if (booking.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed booking'
        });
      }
    } else if (status === 'completed') {
      // Only coolie assigned to booking or admin can mark as completed
      const coolie = await Coolie.findById(booking.coolie);
      
      if (
        coolie.user.toString() !== req.user.id && 
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to complete this booking'
        });
      }
      
      // Can't complete if cancelled
      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete a cancelled booking'
        });
      }
    }
    
    // Update booking status
    // Ensure required fields are not lost during update
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.serviceDateTime = existingBooking.serviceDateTime; // Preserve existing serviceDateTime
    // Preserve other required fields if necessary, e.g.:
    // booking.user = existingBooking.user;
    // booking.coolie = existingBooking.coolie;
    // booking.station = existingBooking.station;
    // booking.platformNumber = existingBooking.platformNumber;
    // booking.trainNumber = existingBooking.trainNumber;
    // booking.seatNumber = existingBooking.seatNumber;
    // booking.luggageDetails = existingBooking.luggageDetails;

    booking.status = status;
    await booking.save({ validateModifiedOnly: true }); // Add validateModifiedOnly to skip validation on unchanged paths

    // If booking is completed or cancelled, make coolie available again
    if (status === 'completed' || status === 'cancelled') {
      await Coolie.findByIdAndUpdate(booking.coolie, { isAvailable: true });
    }
    
    // Create notification for the other party
    let recipient;
    let message;
    
    if (status === 'cancelled') {
      // Notify coolie that booking was cancelled
      const coolie = await Coolie.findById(booking.coolie);
      recipient = coolie.user;
      message = `Booking #${booking._id} has been cancelled`;
    } else if (status === 'completed') {
      // Notify passenger that booking was completed
      recipient = booking.user;
      message = `Your booking #${booking._id} has been marked as completed`;
    }
    
    if (recipient) {
      await Notification.create({
        recipient,
        sender: req.user.id,
        type: status === 'cancelled' ? 'cancellation' : 'booking',
        title: status === 'cancelled' ? 'Booking Cancelled' : 'Booking Completed',
        message,
        relatedBooking: booking._id
      });
    }
    
    // Logic for coolie completing a booking
    if (status === 'completed' && req.user.role === 'coolie') {
      // Ensure the coolie updating is the one assigned to the booking
      const coolieProfile = await Coolie.findOne({ user: req.user.id });
      if (!coolieProfile || booking.coolie.toString() !== coolieProfile._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to complete this booking'
        });
      }
      booking.status = 'completed';
      booking.completedAt = Date.now();
      // Make coolie available again
      await Coolie.findByIdAndUpdate(booking.coolie, { isAvailable: true });

      // Create notification for passenger
      await Notification.create({
        recipient: booking.user,
        sender: req.user.id, // Coolie's user ID
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your booking with Coolie ${coolieProfile.coolieIdNumber || coolieProfile._id.toString().slice(-6)} has been marked as completed.`,
        relatedBooking: booking._id
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Rate a completed booking
// @route   POST /api/bookings/:id/rate
// @access  Private/Passenger
exports.rateBooking = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is the booking owner
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking'
      });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }
    
    // Add rating to coolie
    const coolie = await Coolie.findById(booking.coolie);
    
    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    // Check if already rated
    const alreadyRated = coolie.ratings.find(
      item => item.user.toString() === req.user.id
    );
    
    if (alreadyRated) {
      // Update existing rating
      alreadyRated.rating = rating;
      alreadyRated.comment = comment || alreadyRated.comment;
    } else {
      // Add new rating
      coolie.ratings.push({ user: req.user.id, rating, comment });
    }
    
    // Recalculate average rating (the pre-save hook will do this)
    await coolie.save(); // This was missing
    
    // Update the booking document with the rating details (optional, but good for display)
    booking.rating = {
      rating: rating,
      comment: comment,
      user: req.user.id // Store which user gave this specific rating on the booking
    };
    await booking.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: 'Rating added successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = exports;