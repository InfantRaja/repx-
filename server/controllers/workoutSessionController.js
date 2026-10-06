import WorkoutSession from '../models/WorkoutSession.js';
import WorkoutSet from '../models/WorkoutSet.js';
import User from '../models/User.js';
import { detectPersonalRecords } from '../services/prDetector.js';

// @desc    Log & complete a workout session
// @route   POST /api/workout-sessions
export const createWorkoutSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      workoutId,
      workoutName,
      startTime,
      endTime,
      durationSeconds,
      exercises,
      rating,
      notes,
    } = req.body;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A workout session must include at least one exercise.',
      });
    }

    // Calculate aggregated metrics
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    const formattedExercises = exercises.map((exItem) => {
      const sets = (exItem.sets || []).map((s, idx) => {
        const weight = Number(s.weightKg) || 0;
        const reps = Number(s.reps) || 0;
        const isCompleted = s.isCompleted !== undefined ? s.isCompleted : true;

        if (isCompleted) {
          totalSets += 1;
          totalReps += reps;
          totalVolume += weight * reps;
        }

        return {
          setNumber: s.setNumber || idx + 1,
          weightKg: weight,
          reps: reps,
          isWarmup: !!s.isWarmup,
          isCompleted: isCompleted,
          isPR: !!s.isPR,
          rpe: s.rpe || null,
          previousWeightKg: s.previousWeightKg || 0,
          previousReps: s.previousReps || 0,
        };
      });

      return {
        exercise: exItem.exercise,
        exerciseName: exItem.exerciseName,
        muscleGroup: exItem.muscleGroup,
        notes: exItem.notes || '',
        sets,
      };
    });

    const session = new WorkoutSession({
      user: userId,
      workout: workoutId || null,
      workoutName: workoutName || 'Custom Workout',
      startTime: startTime ? new Date(startTime) : new Date(Date.now() - (durationSeconds || 3600) * 1000),
      endTime: endTime ? new Date(endTime) : new Date(),
      durationSeconds: Number(durationSeconds) || 3600,
      status: 'completed',
      totalVolumeKg: totalVolume,
      totalSets: totalSets,
      totalReps: totalReps,
      exercises: formattedExercises,
      rating: rating || 5,
      notes: notes || '',
    });

    await session.save();

    // Insert granular WorkoutSets for rapid analytics
    const setDocs = [];
    for (const ex of formattedExercises) {
      for (const s of ex.sets) {
        if (s.isCompleted && s.weightKg > 0) {
          setDocs.push({
            user: userId,
            session: session._id,
            exercise: ex.exercise,
            exerciseName: ex.exerciseName,
            muscleGroup: ex.muscleGroup,
            setNumber: s.setNumber,
            weightKg: s.weightKg,
            reps: s.reps,
            volumeKg: s.weightKg * s.reps,
            isWarmup: s.isWarmup,
            isCompleted: true,
            isPR: s.isPR,
            completedAt: session.endTime,
          });
        }
      }
    }

    if (setDocs.length > 0) {
      await WorkoutSet.insertMany(setDocs);
    }

    // Run automatic Personal Record detection
    const prsBroken = await detectPersonalRecords(userId, session);
    session.personalRecordsBroken = prsBroken;
    await session.save();

    // Update User streak & lifetime stats
    const user = await User.findById(userId);
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = user.stats.currentStreak || 0;
      if (user.stats.lastWorkoutDate) {
        const lastDate = new Date(user.stats.lastWorkoutDate);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
        // if diffDays === 0, workout on same day -> keep current streak
      } else {
        currentStreak = 1;
      }

      user.stats.totalWorkouts = (user.stats.totalWorkouts || 0) + 1;
      user.stats.totalVolumeKg = (user.stats.totalVolumeKg || 0) + totalVolume;
      user.stats.currentStreak = currentStreak;
      user.stats.longestStreak = Math.max(user.stats.longestStreak || 0, currentStreak);
      user.stats.lastWorkoutDate = new Date();

      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully!',
      data: {
        session,
        personalRecordsBroken: prsBroken,
        stats: {
          totalVolumeKg: totalVolume,
          totalSets,
          totalReps,
          durationSeconds: session.durationSeconds,
          currentStreak: user?.stats?.currentStreak || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user past workout sessions
// @route   GET /api/workout-sessions
export const getWorkoutSessions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const sessions = await WorkoutSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('workout', 'name targetMuscles');

    const total = await WorkoutSession.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single workout session
// @route   GET /api/workout-sessions/:id
export const getWorkoutSessionById = async (req, res, next) => {
  try {
    const session = await WorkoutSession.findById(req.params.id)
      .populate('exercises.exercise')
      .populate('user', 'name username avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Workout session not found' });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update workout session
// @route   PUT /api/workout-sessions/:id
export const updateWorkoutSession = async (req, res, next) => {
  try {
    let session = await WorkoutSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Workout session not found' });
    }

    if (session.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this session' });
    }

    session = await WorkoutSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};
