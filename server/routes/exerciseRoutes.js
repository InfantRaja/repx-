import express from 'express';
import {
  getExercises,
  getExerciseById,
  createExercise,
} from '../controllers/exerciseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getExercises).post(protect, createExercise);
router.route('/:id').get(getExerciseById);

export default router;
