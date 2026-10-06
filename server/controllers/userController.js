import User from '../models/User.js';
import WorkoutSession from '../models/WorkoutSession.js';
import PersonalRecord from '../models/PersonalRecord.js';
import Follow from '../models/Follow.js';

// @desc    Get all users or search
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').limit(30);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile with stats and recent workouts
// @route   GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const followersCount = await Follow.countDocuments({ following: user._id, status: 'accepted' });
    const followingCount = await Follow.countDocuments({ follower: user._id, status: 'accepted' });

    let isFollowing = false;
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      const followCheck = await Follow.findOne({
        follower: req.user._id,
        following: user._id,
        status: 'accepted',
      });
      isFollowing = !!followCheck;
    }

    // Recent workouts
    const recentWorkouts = await WorkoutSession.find({ user: user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('workoutName durationSeconds totalVolumeKg totalSets createdAt');

    // PRs
    const prs = await PersonalRecord.find({ user: user._id })
      .sort({ maxWeightKg: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        followersCount,
        followingCount,
        isFollowing,
        recentWorkouts,
        prs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    // Only self or admin can update
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const allowedFields = [
      'name',
      'avatar',
      'bio',
      'onboarding',
      'preferences',
    ];

    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Account successfully removed',
    });
  } catch (err) {
    next(err);
  }
};
