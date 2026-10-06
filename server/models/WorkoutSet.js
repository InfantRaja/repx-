import mongoose from 'mongoose';

const WorkoutSetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSession',
      required: true,
      index: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
      index: true,
    },
    exerciseName: {
      type: String,
      required: true,
    },
    muscleGroup: {
      type: String,
    },
    setNumber: {
      type: Number,
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
      default: 0,
    },
    reps: {
      type: Number,
      required: true,
      default: 0,
    },
    volumeKg: {
      type: Number,
      default: 0,
    },
    estimated1RM: {
      type: Number,
      default: 0,
    },
    isWarmup: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: true,
    },
    isPR: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation for volume and Epley estimated 1RM
WorkoutSetSchema.pre('save', function (next) {
  this.volumeKg = (this.weightKg || 0) * (this.reps || 0);
  if (this.reps === 1) {
    this.estimated1RM = this.weightKg;
  } else if (this.reps > 1) {
    // Epley Formula: 1RM = Weight * (1 + Reps / 30)
    this.estimated1RM = Math.round(this.weightKg * (1 + this.reps / 30) * 10) / 10;
  } else {
    this.estimated1RM = 0;
  }
  next();
});

export default mongoose.model('WorkoutSet', WorkoutSetSchema);
