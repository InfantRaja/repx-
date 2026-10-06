import express from 'express';
import { chatWithCoach } from '../controllers/aiController.js';

const router = express.Router();

// Public / Authenticated route to chat with AI coach
router.post('/coach', chatWithCoach);

export default router;
