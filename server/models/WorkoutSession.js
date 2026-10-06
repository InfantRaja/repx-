import mongoose from 'mongoose';

const LoggedSetSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  weightKg: { type: Number, required: true, default: 0 },
  reps: { type: Number, required: true, default: 0 },
  isWarmup: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: true },
  isPR: { type: Boolean, default: false },
  rpe: { type: Number, min: 1, max: 10 },
  previousWeightKg: { type: Number, default: 0 },
  previousReps: { type: Number, default: 0 },
});

const LoggedExerciseSchema = new mongoose.Schema({
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
  notes: {
    type: String,
    default: '',
  },
  sets: [LoggedSetSchema],
});

const WorkoutSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      default: null,
    },
    workoutName: {
      type: String,
      required: true,
      default: 'Quick Workout',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'completed',
    },
    totalVolumeKg: {
      type: Number,
      default: 0,
    },
    totalSets: {
      type: Number,
      default: 0,
    },
    totalReps: {
      type: Number,
      default: 0,
    },
    exercises: [LoggedExerciseSchema],
    personalRecordsBroken: [
      {
        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        exerciseName: String,
        metric: String, // 'weight', 'volume', 'reps', '1rm'
        oldValue: Number,
        newValue: Number,
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('WorkoutSession', WorkoutSessionSchema);
