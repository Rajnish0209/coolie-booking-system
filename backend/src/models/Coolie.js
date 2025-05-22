const mongoose = require('mongoose');

const coolieSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    required: [true, 'Please add your age'],
    min: [18, 'Age must be at least 18'],
    max: [65, 'Age cannot be more than 65']
  },
  gender: {
    type: String,
    required: [true, 'Please specify your gender'],
    enum: ['male', 'female', 'other']
  },
  idProofType: {
    type: String,
    required: [true, 'Please specify ID proof type'],
    enum: ['aadhar', 'pan', 'voterid']
  },
  idProofNumber: {
    type: String,
    required: [true, 'ID proof number is required'],
    unique: true
  },
  idProofUrl: {
    type: String,
    required: false
  },
  station: {
    type: String,
    required: [true, 'Please specify your preferred station'],
    trim: true
  },
  platformNumbers: [{
    type: Number,
    required: [true, 'Please specify platform numbers']
  }],
  isAvailable: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    type: String,
    default: 'Not specified'
  },
  vehicleDetails: {
    type: String,
    default: ''
  },
  languagesSpoken: [{
    type: String
  }],
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating when ratings are modified
coolieSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, item) => sum + item.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
  }
  next();
});

module.exports = mongoose.model('Coolie', coolieSchema);