import express from 'express';
import { getEphemeralToken, saveConversation } from '../controllers/voiceAgent.controller.js';

const router = express.Router();

// Get ephemeral token for voice session
router.get('/ephemeral-token', getEphemeralToken);

// Save conversation history (optional)
router.post('/save-conversation', saveConversation);

export default router;
