import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default router;
