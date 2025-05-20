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
    let coolie = await Coolie.findById(req.params.id);
    
    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    // Make sure user is coolie owner or admin
    if (coolie.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this coolie profile'
      });
    }
    
    // Don't allow approval status change unless admin
    if (req.body.isApproved !== undefined && req.user.role !== 'admin') {
      delete req.body.isApproved;
    }
    
    coolie = await Coolie.findByIdAndUpdate(req.params.id, req.body, {
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
// @route   PUT /api/coolies/:id/availability
// @access  Private/Coolie
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, currentLocation } = req.body;
    
    let coolie = await Coolie.findOne({ user: req.user.id });
    
    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie profile not found'
      });
    }
    
    // Update fields
    if (isAvailable !== undefined) {
      coolie.isAvailable = isAvailable;
    }
    
    if (currentLocation) {
      coolie.currentLocation = currentLocation;
    }
    
    await coolie.save();
    
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

// @desc    Approve or reject coolie
// @route   PUT /api/coolies/:id/approve
// @access  Private/Admin
exports.approveCoolie = async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify approval status'
      });
    }
    
    const coolie = await Coolie.findById(req.params.id);
    
    if (!coolie) {
      return res.status(404).json({
        success: false,
        message: 'Coolie not found'
      });
    }
    
    coolie.isApproved = isApproved;
    await coolie.save();
    
    // Create notification for the coolie
    await Notification.create({
      recipient: coolie.user,
      type: 'approval',
      title: isApproved ? 'Account Approved' : 'Account Rejected',
      message: isApproved 
        ? 'Your coolie account has been approved. You can now receive bookings.'
        : 'Your coolie account has been rejected. Please contact admin for more information.'
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

// @desc    Get coolies by station and platform
// @route   GET /api/coolies/available
// @access  Public
exports.getAvailableCoolies = async (req, res) => {
  try {
    const { station, platformNumber } = req.query;
    
    if (!station) {
      return res.status(400).json({
        success: false,
        message: 'Please provide station name'
      });
    }
    
    console.log(`Searching for coolies at station: ${station}, platform: ${platformNumber}`);
    
    let query = {
      station: { $regex: new RegExp('^' + station + '$', 'i') }, // Case-insensitive match
      isApproved: true,
      isAvailable: true
    };
    
    if (platformNumber) {
      // Convert platformNumber to Number to ensure proper comparison
      query.platformNumbers = parseInt(platformNumber);
    }
    
    console.log('Query:', JSON.stringify(query));
    
    const coolies = await Coolie.find(query)
      .populate({
        path: 'user',
        select: 'name phone'
      })
      .sort('-averageRating');
    
    console.log(`Found ${coolies.length} matching coolies`);
    
    // If no coolies found, log all active coolies for debugging
    if (coolies.length === 0) {
      const allActiveCoolies = await Coolie.find({
        isApproved: true,
        isAvailable: true
      }).select('station platformNumbers');
      
      console.log('All active coolies:', JSON.stringify(allActiveCoolies));
    }
    
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