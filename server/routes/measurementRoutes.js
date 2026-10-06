import express from 'express';
import {
  getMeasurements,
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from '../controllers/measurementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getMeasurements).post(addMeasurement);
router.route('/:id').put(updateMeasurement).delete(deleteMeasurement);

export default router;
