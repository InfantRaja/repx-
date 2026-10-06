import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get social feed
// @route   GET /api/feed
export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username avatar isPro')
      .populate('workoutSession');

    // Get list of users the current user follows
    const followingDocs = await Follow.find({
      follower: req.user._id,
      status: 'accepted',
    }).select('following');

    const followingIds = new Set(followingDocs.map((f) => f.following.toString()));

    const formattedPosts = posts.map((post) => {
      const p = post.toObject();
      p.isLiked = (p.likes || []).some((l) => l.toString() === req.user._id.toString());
      p.likesCount = (p.likes || []).length;
      p.isFollowingAuthor = post.user ? followingIds.has(post.user._id.toString()) : false;
      return p;
    });

    res.status(200).json({
      success: true,
      count: formattedPosts.length,
      data: formattedPosts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
export const createPost = async (req, res, next) => {
  try {
    const { content, workoutSessionId, type, workoutSummary } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      workoutSession: workoutSessionId || null,
      type: type || 'general',
      workoutSummary: workoutSummary || null,
    });

    const populated = await Post.findById(post._id).populate('user', 'name username avatar isPro');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle like on post
// @route   POST /api/posts/:id/like
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const alreadyLikedIndex = post.likes.findIndex((id) => id.toString() === userIdStr);

    let isLiked = false;
    if (alreadyLikedIndex !== -1) {
      post.likes.splice(alreadyLikedIndex, 1);
      isLiked = false;
    } else {
      post.likes.push(req.user._id);
      isLiked = true;

      // Notify post author if not self
      if (post.user.toString() !== userIdStr) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          title: '❤️ Workout Liked',
          message: `${req.user.name} liked your activity update.`,
          entityId: post._id,
        });
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be blank' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text: text.trim(),
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    const populated = await Comment.findById(comment._id).populate('user', 'name username avatar');

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        title: '💬 New Comment',
        message: `${req.user.name} commented: "${text.substring(0, 50)}..."`,
        entityId: post._id,
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('user', 'name username avatar');

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
export const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const existing = await Follow.findOne({
      follower: req.user._id,
      following: targetUserId,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already following this athlete' });
    }

    const follow = await Follow.create({
      follower: req.user._id,
      following: targetUserId,
      status: 'accepted',
    });

    await Notification.create({
      recipient: targetUserId,
      sender: req.user._id,
      type: 'follower',
      title: '👥 New Follower',
      message: `${req.user.name} started following your training journey!`,
      entityId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Athlete followed successfully',
      data: follow,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unfollow user
// @route   DELETE /api/users/:id/follow
export const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    await Follow.findOneAndDelete({
      follower: req.user._id,
      following: targetUserId,
    });

    res.status(200).json({
      success: true,
      message: 'Unfollowed athlete successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get friends, following, followers, and requests
// @route   GET /api/friends
export const getFriendsData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Following: users I follow
    const followingDocs = await Follow.find({ follower: userId, status: 'accepted' }).populate(
      'following',
      'name username avatar bio stats isPro'
    );
    const following = followingDocs.map((f) => f.following).filter(Boolean);

    // Followers: users following me
    const followerDocs = await Follow.find({ following: userId, status: 'accepted' }).populate(
      'follower',
      'name username avatar bio stats isPro'
    );
    const followers = followerDocs.map((f) => f.follower).filter(Boolean);

    // Mutual friends (both follow each other)
    const followingIds = new Set(following.map((u) => u._id.toString()));
    const friends = followers.filter((u) => followingIds.has(u._id.toString()));

    // Recommended athletes to follow
    const allUsers = await User.find({ _id: { $ne: userId } })
      .select('name username avatar bio stats isPro')
      .limit(10);

    const suggestions = allUsers.filter((u) => !followingIds.has(u._id.toString()));

    res.status(200).json({
      success: true,
      data: {
        friends,
        following,
        followers,
        requests: [],
        suggestions,
      },
    });
  } catch (err) {
    next(err);
  }
};
