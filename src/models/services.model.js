import mongoose from 'mongoose';

// Hotel Schema
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  price: { type: String, required: true },
  priceValue: { type: Number, required: true }, // Numeric price for calculations
  amenities: [{ type: String }],
  greenScore: { type: String },
  description: { type: String },
  featured: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
}, { timestamps: true });

// Flight Schema
const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  priceValue: { type: Number, required: true },
  class: { type: String, enum: ['Economy', 'Business', 'First'], default: 'Economy' },
  stops: { type: String, default: 'Non-stop' },
  image: { type: String },
  available: { type: Boolean, default: true },
}, { timestamps: true });

// Train Schema
const trainSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trainNo: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  priceValue: { type: Number, required: true },
  class: { type: String, default: '3A' },
  availability: { type: String, enum: ['Available', 'RAC', 'Waitlist'], default: 'Available' },
  image: { type: String },
}, { timestamps: true });

// Bus Schema
const busSchema = new mongoose.Schema({
  operator: { type: String, required: true },
  type: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  priceValue: { type: Number, required: true },
  seats: { type: Number, default: 40 },
  rating: { type: Number, default: 0 },
  image: { type: String },
}, { timestamps: true });

// Taxi Schema
const taxiSchema = new mongoose.Schema({
  type: { type: String, required: true },
  model: { type: String, required: true },
  capacity: { type: String, required: true },
  pricePerKm: { type: String, required: true },
  basePrice: { type: String, required: true },
  basePriceValue: { type: Number, required: true },
  image: { type: String },
  features: [{ type: String }],
  rating: { type: Number, default: 0 },
  eco: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
}, { timestamps: true });

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  cuisine: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  priceRange: { type: String, required: true },
  specialty: { type: String },
  description: { type: String },
  openHours: { type: String },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

// Travel Guide Schema
const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tours: { type: Number, default: 0 },
  specialty: { type: String },
  languages: [{ type: String }],
  price: { type: String, required: true },
  priceValue: { type: Number, required: true },
  priceUnit: { type: String, default: '/day' },
  description: { type: String },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export const Hotel = mongoose.model('Hotel', hotelSchema);
export const Flight = mongoose.model('Flight', flightSchema);
export const Train = mongoose.model('Train', trainSchema);
export const Bus = mongoose.model('Bus', busSchema);
export const Taxi = mongoose.model('Taxi', taxiSchema);
export const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export const Guide = mongoose.model('Guide', guideSchema);
