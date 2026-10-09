import express from 'express';
import {
  getSplits,
  getSplitById,
  createSplit,
  updateSplit,
  deleteSplit,
  activateSplit,
  seedTemplates,
} from '../controllers/splitController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/seed-templates', seedTemplates);
router.route('/').get(getSplits).post(createSplit);
router.route('/:id').get(getSplitById).put(updateSplit).delete(deleteSplit);
router.put('/:id/activate', activateSplit);

export default router;
