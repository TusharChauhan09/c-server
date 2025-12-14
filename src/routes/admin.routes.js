import express from 'express';
import {
  getDashboardStats,
  getAllServices,
  createService,
  updateService,
  deleteService,
  getAllBookings,
  updateBooking,
  deleteBooking,
  getAllUsers,
  updateUser,
  deleteUser
} from '../controllers/admin.controller.js';

const router = express.Router();

// Dashboard
router.get('/stats', getDashboardStats);

// Services CRUD
router.get('/services/:type', getAllServices);
router.post('/services/:type', createService);
router.put('/services/:type/:id', updateService);
router.delete('/services/:type/:id', deleteService);

// Bookings
router.get('/bookings', getAllBookings);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
