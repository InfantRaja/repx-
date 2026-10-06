import mongoose from 'mongoose';

const WorkoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  exerciseName: {
    type: String,
    required: true,
  },
  muscleGroup: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  defaultSets: [
    {
      setNumber: { type: Number, required: true },
      targetWeight: { type: Number, default: 0 },
      targetReps: { type: Number, default: 10 },
      isWarmup: { type: Boolean, default: false },
    },
  ],
});

const WorkoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide workout name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    targetMuscles: [
      {
        type: String,
      },
    ],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 60,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    exercises: [WorkoutExerciseSchema],
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Workout', WorkoutSchema);
