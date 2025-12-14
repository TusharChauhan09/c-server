import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // User info
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  userEmail: { type: String },
  userName: { type: String },

  // Service info
  serviceType: { 
    type: String, 
    required: true,
    enum: ['hotel', 'flight', 'train', 'bus', 'taxi', 'restaurant', 'guide']
  },
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  serviceName: { type: String, required: true },
  serviceImage: { type: String },

  // Booking details (varies by service type)
  bookingDetails: {
    // Common fields
    travelers: { type: Number, default: 1 },
    
    // Hotel specific
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    rooms: { type: Number },
    guests: { type: Number },
    
    // Transport specific (flight/train/bus)
    travelDate: { type: Date },
    from: { type: String },
    to: { type: String },
    class: { type: String },
    
    // Taxi specific
    pickupLocation: { type: String },
    dropLocation: { type: String },
    pickupDateTime: { type: Date },
    
    // Restaurant specific
    reservationDate: { type: Date },
    reservationTime: { type: String },
    partySize: { type: Number },
    
    // Guide specific
    startDate: { type: Date },
    endDate: { type: Date },
    groupSize: { type: Number },
    specialRequests: { type: String },
  },

  // Pricing
  basePrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  // Payment info
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: String },
  orderId: { type: String },
  paymentMethod: { type: String },

  // Booking status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Timestamps
  bookingDate: { type: Date, default: Date.now },
  confirmationDate: { type: Date },
  cancellationDate: { type: Date },
  cancellationReason: { type: String },

  // Additional
  notes: { type: String },
  confirmationCode: { type: String },

}, { timestamps: true });

// Generate unique confirmation code before saving
bookingSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    const prefix = this.serviceType.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.confirmationCode = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Index for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ serviceType: 1, bookingDate: -1 });
bookingSchema.index({ confirmationCode: 1 }, { unique: true });

export const Booking = mongoose.model('Booking', bookingSchema);
