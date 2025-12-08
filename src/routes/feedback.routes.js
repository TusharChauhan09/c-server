import express from 'express';
import { submitFeedback, getAllFeedback, updateFeedbackStatus } from '../controllers/feedback.controller.js';

const router = express.Router();

// Public route - submit feedback
router.post('/', submitFeedback);

// Admin routes (add authentication middleware as needed)
router.get('/', getAllFeedback);
router.patch('/:id/status', updateFeedbackStatus);

export default router;
