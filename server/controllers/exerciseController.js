import Exercise from '../models/Exercise.js';

// @desc    Get all exercises with search and filters
// @route   GET /api/exercises
export const getExercises = async (req, res, next) => {
  try {
    const { search, muscle, equipment, difficulty } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { targetMuscles: { $regex: search, $options: 'i' } },
      ];
    }

    if (muscle && muscle !== 'All') {
      query.muscleGroup = muscle;
    }

    if (equipment && equipment !== 'All') {
      query.equipment = equipment;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    const exercises = await Exercise.find(query).sort({ muscleGroup: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single exercise by ID or slug
// @route   GET /api/exercises/:id
export const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create custom exercise
// @route   POST /api/exercises
export const createExercise = async (req, res, next) => {
  try {
    const { name, muscleGroup, equipment, difficulty, instructions, targetMuscles, commonMistakes } = req.body;

    if (!name || !muscleGroup || !equipment) {
      return res.status(400).json({
        success: false,
        message: 'Name, muscle group, and equipment are required',
      });
    }

    const exercise = await Exercise.create({
      name,
      muscleGroup,
      equipment,
      difficulty: difficulty || 'Intermediate',
      instructions: instructions || ['Perform with strict form and control.'],
      targetMuscles: targetMuscles || [muscleGroup],
      commonMistakes: commonMistakes || ['Loss of controlled eccentric motion.'],
      isCustom: true,
      createdBy: req.user?._id || null,
    });

    res.status(201).json({
      success: true,
      data: exercise,
    });
  } catch (err) {
    next(err);
  }
};
