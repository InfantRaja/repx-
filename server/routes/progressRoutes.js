import express from 'express';
import { getProgressData, getPersonalRecords } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getProgressData);
router.get('/prs', getPersonalRecords);

export default router;
