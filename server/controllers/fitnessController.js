const FitnessRecord = require('../models/FitnessRecord');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const Workout = require('../models/Workout');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all fitness records
// @route   GET /api/fitness-records
// @access  Authenticated (Admin sees all, User sees their own records)
const getFitnessRecords = async (req, res) => {
  try {
    let query = {};
    // If not admin, restrict to user's own records
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const records = await FitnessRecord.find(query)
      .populate('userId', 'name email role')
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch fitness records',
      error: error.message
    });
  }
};

// @desc    Get single fitness record
// @route   GET /api/fitness-records/:id
// @access  Authenticated
const getFitnessRecordById = async (req, res) => {
  try {
    const record = await FitnessRecord.findById(req.params.id).populate('userId', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      });
    }

    if (req.user.role !== 'admin' && record.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this record'
      });
    }

    return res.status(200).json({
      success: true,
      record
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch record',
      error: error.message
    });
  }
};

// @desc    Create fitness record (Admin or Authenticated User)
// @route   POST /api/fitness-records
// @access  Private
const createFitnessRecord = async (req, res) => {
  try {
    const { exercise, sets, reps, weight, date, userId } = req.body;

    if (!exercise || sets === undefined || reps === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name, sets, and reps are required'
      });
    }

    // Admin can specify userId, otherwise it defaults to current logged in user
    let assignedUserId = req.user._id;
    if (req.user.role === 'admin' && userId) {
      assignedUserId = userId;
    }

    const record = new FitnessRecord({
      userId: assignedUserId,
      exercise: exercise.trim(),
      sets: Number(sets),
      reps: Number(reps),
      weight: weight !== undefined ? Number(weight) : 0,
      date: date ? new Date(date) : new Date()
    });

    await record.save();

    const populatedRecord = await FitnessRecord.findById(record._id).populate('userId', 'name email');

    await ActivityLog.create({
      action: 'Fitness record added',
      details: `${req.user.name} logged record: ${record.exercise} (${record.sets} sets x ${record.reps} reps, ${record.weight}kg)`,
      performedBy: req.user.name,
      role: req.user.role
    });

    return res.status(201).json({
      success: true,
      message: 'Fitness record created successfully',
      record: populatedRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create fitness record',
      error: error.message
    });
  }
};

// @desc    Update fitness record (Admin only)
// @route   PUT /api/fitness-records/:id
// @access  Private/Admin
const updateFitnessRecord = async (req, res) => {
  try {
    const { exercise, sets, reps, weight, date, userId } = req.body;
    const record = await FitnessRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      });
    }

    if (exercise) record.exercise = exercise.trim();
    if (sets !== undefined) record.sets = Number(sets);
    if (reps !== undefined) record.reps = Number(reps);
    if (weight !== undefined) record.weight = Number(weight);
    if (date) record.date = new Date(date);
    if (userId) record.userId = userId;

    await record.save();

    const updatedRecord = await FitnessRecord.findById(record._id).populate('userId', 'name email');

    await ActivityLog.create({
      action: 'Fitness record updated',
      details: `Admin ${req.user.name} updated record #${record._id} for ${record.exercise}`,
      performedBy: req.user.name,
      role: req.user.role
    });

    return res.status(200).json({
      success: true,
      message: 'Fitness record updated successfully',
      record: updatedRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update fitness record',
      error: error.message
    });
  }
};

// @desc    Delete fitness record (Admin only)
// @route   DELETE /api/fitness-records/:id
// @access  Private/Admin
const deleteFitnessRecord = async (req, res) => {
  try {
    const record = await FitnessRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Fitness record not found'
      });
    }

    await FitnessRecord.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      action: 'Fitness record deleted',
      details: `Admin ${req.user.name} deleted record for ${record.exercise}`,
      performedBy: req.user.name,
      role: req.user.role
    });

    return res.status(200).json({
      success: true,
      message: 'Fitness record deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete fitness record',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics & recent activities (Admin)
// @route   GET /api/fitness-records/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalExercises, totalWorkouts, totalRecords, recentActivities] = await Promise.all([
      User.countDocuments(),
      Exercise.countDocuments(),
      Workout.countDocuments(),
      FitnessRecord.countDocuments(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10)
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExercises,
        totalWorkouts,
        totalRecords
      },
      recentActivities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

module.exports = {
  getFitnessRecords,
  getFitnessRecordById,
  createFitnessRecord,
  updateFitnessRecord,
  deleteFitnessRecord,
  getAdminStats
};
