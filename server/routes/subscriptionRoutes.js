import express from 'express';
import {
  getSubscriptionStatus,
  upgradeToPro,
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getSubscriptionStatus);
router.post('/upgrade', upgradeToPro);

export default router;
