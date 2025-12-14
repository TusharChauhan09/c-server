import express from 'express';
import { 
  getServices, 
  getServiceById, 
  searchServices, 
  seedServices 
} from '../controllers/services.controller.js';

const router = express.Router();

// Get all services by type
// GET /api/services/:type (hotels, flights, trains, buses, taxis, restaurants, guides)
router.get('/:type', getServices);

// Search services
// GET /api/services/:type/search?from=Delhi&to=Mumbai
router.get('/:type/search', searchServices);

// Get single service by ID
// GET /api/services/:type/:id
router.get('/:type/:id', getServiceById);

// Seed initial data (development only)
// POST /api/services/seed
router.post('/seed', seedServices);

export default router;
