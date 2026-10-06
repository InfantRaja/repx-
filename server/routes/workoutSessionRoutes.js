import express from 'express';
import {
  createWorkoutSession,
  getWorkoutSessions,
  getWorkoutSessionById,
  updateWorkoutSession,
} from '../controllers/workoutSessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createWorkoutSession).get(getWorkoutSessions);
router.route('/:id').get(getWorkoutSessionById).put(updateWorkoutSession);

export default router;
