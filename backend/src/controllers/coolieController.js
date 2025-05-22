const Coolie = require('../models/Coolie');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all coolies
// @route   GET /api/coolies
// @access  Public
exports.getCoolies = async (req, res) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Coolie.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name email phone'
    });
    
    // Only show approved coolies for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      query = query.find({ isApproved: true });
    }
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-averageRating');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Coolie.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const coolies = await query;
    
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
      count: coolies.length,
      pagination,
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

// @desc    Get single coolie
// @route   GET /api/coolies/:id
// @access  Public
exports.getCoolie = async (req, res) => {
  try {
    const coolie = await Coolie.findById(req.params.id).populate({
      path: 'user',
      select: 'name email phone'
    });
    
    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    // Only show approved coolies for non-admin users
    if ((!req.user || req.user.role !== 'admin') && !coolie.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: coolie
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update coolie
// @route   PUT /api/coolies/:id
// @access  Private
exports.updateCoolie = async (req, res) => {
  try {
    let coolieId;
    // If the route is /profile/me, the coolie to update is the logged-in user.
    // Otherwise, it's specified by req.params.id (for admin or direct ID access).
    if (req.path === '/profile/me') { // Corrected path check
      if (req.user.role !== 'coolie') {
        return res.status(403).json({
          success: false,
          message: 'Only coolies can update their own profile through this route.'
        });
      }
      const coolieProfile = await Coolie.findOne({ user: req.user.id });
      if (!coolieProfile) {
        return res.status(404).json({ success: false, message: 'Coolie profile not found for this user.' });
      }
      coolieId = coolieProfile._id;
    } else if (req.params.id) {
      coolieId = req.params.id;
    } else {
      return res.status(400).json({ success: false, message: 'Coolie ID not determinable from route.'});
    }

    let coolie = await Coolie.findById(coolieId);

    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    // Make sure user is coolie owner or admin
    // For /profile/me, ownership is already established by user role and finding coolie by user ID.
    // For /:id, we need to check ownership or admin role.
    if (req.params.id && coolie.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this coolie profile'
      });
    }
    
    // Don't allow approval status change unless admin
    if (req.body.isApproved !== undefined && req.user.role !== 'admin') {
      delete req.body.isApproved;
    }

    // Prevent coolies from updating their own coolieIdNumber or averageRating/totalRatings directly
    if (req.user.role === 'coolie') {
      delete req.body.coolieIdNumber;
      delete req.body.averageRating;
      delete req.body.totalRatings;
      delete req.body.user; // Prevent changing the associated user account
    }

    coolie = await Coolie.findByIdAndUpdate(coolieId, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: coolie
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update coolie availability
// @route   PUT /api/coolies/profile/availability  (for coolie updating their own)
// @route   PUT /api/coolies/:id/availability (for admin or coolie if they have their coolie ID)
// @access  Private/Coolie or Private/Admin
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body; // Only expect isAvailable for this specific route
    let coolieToUpdate;

    // If accessing via /profile/availability, coolie is identified by req.user.id
    // If accessing via /:id/availability, coolie is identified by req.params.id
    if (req.path.includes('/profile/availability')) {
      if (req.user.role !== 'coolie') {
        return res.status(403).json({
            success: false,
            message: 'Only coolies can update their own availability through this route.'
        });
      }
      coolieToUpdate = await Coolie.findOne({ user: req.user.id });
    } else if (req.params.id) {
      coolieToUpdate = await Coolie.findById(req.params.id);
      // Optional: Add check if admin or if coolie matches req.user.id
      if (!coolieToUpdate) {
        return res.status(404).json({ success: false, message: 'Coolie not found' });
      }
      if (req.user.role !== 'admin' && coolieToUpdate.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this coolie availability'
        });
      }
    } else {
        return res.status(400).json({ success: false, message: 'Invalid request for updating availability' });
    }

    if (!coolieToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Coolie profile not found'
      });
    }

    // Update fields
    if (isAvailable !== undefined) {
      coolieToUpdate.isAvailable = isAvailable;
    }
    
    // Removed currentLocation update from here, should be part of general profile update
    // if (currentLocation) { 
    //   coolieToUpdate.currentLocation = currentLocation;
    // }
    
    await coolieToUpdate.save();
    
    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: { isAvailable: coolieToUpdate.isAvailable } // Return only the updated field
    });
  } catch (error) {
    console.error('Error in updateAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating availability'
    });
  }
};

// @desc    Get coolie profile for the logged-in coolie
// @route   GET /api/coolies/profile/me
// @access  Private (Coolie)
exports.getCoolieProfile = async (req, res) => {
  try {
    const coolie = await Coolie.findOne({ user: req.user.id }).populate({
      path: 'user',
      select: 'name email phone role'
    });

    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie profile not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: coolie
    });
  } catch (error) {
    console.error('Error in getCoolieProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching coolie profile'
    });
  }
};

// @desc    Approve or reject coolie
// @route   PUT /api/coolies/:id/approve
// @access  Private/Admin
exports.approveCoolie = async (req, res) => {
  try {
    const { isApproved, rejectionReason } = req.body; // Added rejectionReason
    
    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify approval status'
      });
    }
    
    const coolie = await Coolie.findById(req.params.id).populate('user'); // Populate user to get user details
    
    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    // Create notification for the coolie
    let notificationMessage = isApproved 
        ? 'Your coolie account has been approved. You can now receive bookings.'
        : `Your coolie account has been rejected. Reason: ${rejectionReason || 'Not specified'}. Please update your details and re-register if necessary.`;

    await Notification.create({
      recipient: coolie.user._id, // Use coolie.user._id after populating
      type: 'approval',
      title: isApproved ? 'Account Approved' : 'Account Rejected',
      message: notificationMessage
    });

    // If rejected, delete the Coolie and associated User record
    if (isApproved === false) {
      const userId = coolie.user._id; // Get the user ID
      
      // It's generally better to mark as rejected and inactive rather than full delete
      // to maintain historical data or allow for review. But if full deletion is required:
      await Coolie.findByIdAndDelete(req.params.id);
      await User.findByIdAndDelete(userId);
      // Optionally, delete associated profile images and ID proofs from storage if implemented
      // For example: if (coolie.idProofUrl) { deleteFile(coolie.idProofUrl); }
      // if (coolie.user.imageUrl) { deleteFile(coolie.user.imageUrl); }
      
      return res.status(200).json({
        success: true,
        message: `Coolie registration rejected and user account deleted. Reason: ${rejectionReason || 'Not specified'}. The user will need to register again.`,
        data: null // No coolie data to return as it's deleted
      });
    } else {
      // If approved, update the coolie's status
      coolie.isApproved = true;
      await coolie.save();
    }
    
    res.status(200).json({
      success: true,
      data: coolie
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get coolies by station and platform
// @route   GET /api/coolies/available
// @access  Public
exports.getAvailableCoolies = async (req, res) => {
  try {
    const { station, platformNumber } = req.query;
    
    console.log(`[getAvailableCoolies] Received search request - Station: "${station}", Platform: "${platformNumber}"`);

    if (!station) {
      return res.status(400).json({
        success: false,
        message: 'Please provide station name'
      });
    }
    
    // Log all potentially available coolies before specific station/platform filtering
    const allPotentiallyAvailableCoolies = await Coolie.find({ 
      isApproved: true, 
      isAvailable: true 
    }).populate('user', 'name').select('station platformNumbers isAvailable isApproved user');
    console.log('[getAvailableCoolies] All potentially available coolies (approved & available):', JSON.stringify(allPotentiallyAvailableCoolies, null, 2));

    let query = {
      station: { $regex: new RegExp('^' + station.trim() + '$', 'i') }, // Trim station input
      isApproved: true,
      isAvailable: true
    };
    
    if (platformNumber && String(platformNumber).trim() !== "") {
      const platformNum = parseInt(String(platformNumber).trim(), 10);
      if (!isNaN(platformNum)) {
        query.platformNumbers = { $in: [platformNum] }; // Use number for query
      }
    }
    
    console.log('[getAvailableCoolies] Constructed MongoDB Query:', JSON.stringify(query));
    
    const coolies = await Coolie.find(query)
      .populate({
        path: 'user',
        select: 'name phone'
      })
      .sort('-averageRating');
    
    console.log(`[getAvailableCoolies] Found ${coolies.length} matching coolies after applying filters.`);
    
    if (coolies.length === 0) {
      console.log('[getAvailableCoolies] No coolies found for the given criteria. Double check station name and platform number against the list of all potentially available coolies above.');
    }
    
    res.status(200).json({
      success: true,
      count: coolies.length,
      data: coolies
    });
  } catch (error) {
    console.error('[getAvailableCoolies] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};