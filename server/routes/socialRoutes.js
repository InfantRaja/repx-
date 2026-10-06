import express from 'express';
import {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  getComments,
  followUser,
  unfollowUser,
  getFriendsData,
} from '../controllers/socialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect only social routes, do not block other /api paths
router.use(['/feed', '/posts', '/friends', '/users'], protect);

router.get('/feed', getFeed);
router.post('/posts', createPost);
router.post('/posts/:id/like', toggleLike);
router.post('/posts/:id/comment', addComment);
router.get('/posts/:id/comments', getComments);
router.post('/users/:id/follow', followUser);
router.delete('/users/:id/follow', unfollowUser);
router.get('/friends', getFriendsData);

export default router;
