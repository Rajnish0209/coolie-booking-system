const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coolie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coolie',
    required: true
  },
  station: {
    type: String,
    required: [true, 'Please specify the station'],
    trim: true
  },
  platformNumber: {
    type: Number,
    required: [true, 'Please specify the platform number']
  },
  trainNumber: {
    type: String,
    required: [true, 'Please specify the train number'],
    trim: true
  },
  seatNumber: {
    type: String,
    required: [true, 'Please specify your seat number'],
    trim: true
  },
  serviceDateTime: { // Changed from arrivalTime
    type: Date,
    required: [true, 'Please specify the service date and time'] // Updated message
  },
  luggageDetails: {
    count: {
      type: Number,
      required: [true, 'Please specify the number of luggage items'],
      default: 1
    },
    weight: {
      type: Number,
      required: [true, 'Please specify the approximate weight in kg'],
      default: 10
    },
    description: {
      type: String,
      default: 'General luggage'
    }
  },
  fare: {
    type: Number
  },
  status: {
    type: String,
    enum: [
      'pending', // Passenger has booked, awaiting coolie confirmation
      'confirmed', // Coolie has accepted the booking
      'rejected', // Coolie has rejected the booking
      'cancelled', // Passenger or Admin has cancelled the booking
      'completed' // Coolie has marked the booking as completed
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    default: 'cash'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate fare based on luggage weight
bookingSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('luggageDetails.weight')) {
    const basePrice = 100;
    const weight = this.luggageDetails.weight;
    
    if (weight <= 20) {
      this.fare = basePrice;
    } else {
      const extraWeight = weight - 20;
      const extraCharges = Math.ceil(extraWeight / 10) * 10;
      this.fare = basePrice + extraCharges;
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);