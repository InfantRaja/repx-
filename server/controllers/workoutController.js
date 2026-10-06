import Workout from '../models/Workout.js';

// @desc    Get all user workouts + system templates
// @route   GET /api/workouts
export const getWorkouts = async (req, res, next) => {
  try {
    const workouts = await Workout.find({
      $or: [{ user: req.user._id }, { isTemplate: true }],
    })
      .populate('exercises.exercise')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
export const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('exercises.exercise');

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout routine not found' });
    }

    res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new custom workout
// @route   POST /api/workouts
export const createWorkout = async (req, res, next) => {
  try {
    const { name, description, targetMuscles, difficulty, estimatedDurationMinutes, exercises } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a workout name' });
    }

    const workout = await Workout.create({
      name,
      description,
      targetMuscles: targetMuscles || [],
      difficulty: difficulty || 'Intermediate',
      estimatedDurationMinutes: estimatedDurationMinutes || 60,
      user: req.user._id,
      isTemplate: false,
      exercises: exercises || [],
    });

    res.status(201).json({
      success: true,
      data: workout,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
export const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Ensure user owns workout or is admin
    if (workout.user && workout.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this workout' });
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('exercises.exercise');

    res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
export const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    if (workout.user && workout.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this workout' });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workout routine successfully removed',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Duplicate workout routine
// @route   POST /api/workouts/:id/duplicate
export const duplicateWorkout = async (req, res, next) => {
  try {
    const original = await Workout.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Workout to duplicate not found' });
    }

    const cloned = await Workout.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      targetMuscles: original.targetMuscles,
      difficulty: original.difficulty,
      estimatedDurationMinutes: original.estimatedDurationMinutes,
      exercises: original.exercises,
      user: req.user._id,
      isTemplate: false,
    });

    res.status(201).json({
      success: true,
      message: 'Workout duplicated successfully',
      data: cloned,
    });
  } catch (err) {
    next(err);
  }
};
