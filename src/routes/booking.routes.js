import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookingByCode,
  updateBookingStatus,
  updatePaymentStatus,
  cancelBooking,
  getBookingStats
} from '../controllers/booking.controller.js';

const router = express.Router();

// Create a new booking
// POST /api/bookings
router.post('/', createBooking);

// Get user's bookings
// GET /api/bookings/user/:userId
router.get('/user/:userId', getUserBookings);

// Get booking by confirmation code
// GET /api/bookings/code/:code
router.get('/code/:code', getBookingByCode);

// Get booking statistics (admin)
// GET /api/bookings/stats
router.get('/stats', getBookingStats);

// Get booking by ID
// GET /api/bookings/:bookingId
router.get('/:bookingId', getBookingById);

// Update booking status
// PATCH /api/bookings/:bookingId/status
router.patch('/:bookingId/status', updateBookingStatus);

// Update payment status
// PATCH /api/bookings/:bookingId/payment
router.patch('/:bookingId/payment', updatePaymentStatus);

// Cancel booking
// POST /api/bookings/:bookingId/cancel
router.post('/:bookingId/cancel', cancelBooking);

export default router;
