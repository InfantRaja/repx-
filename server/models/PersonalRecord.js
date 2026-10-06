import mongoose from 'mongoose';

const PRHistoryEntrySchema = new mongoose.Schema({
  weightKg: { type: Number, required: true },
  reps: { type: Number, required: true },
  estimated1RM: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutSession' },
});

const PersonalRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    category: {
      type: String,
      required: true,
      enum: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio', 'Full Body'],
      index: true,
    },
    maxWeightKg: {
      type: Number,
      default: 0,
    },
    maxRepsAtMaxWeight: {
      type: Number,
      default: 0,
    },
    best1RM: {
      type: Number,
      default: 0,
    },
    bestSetVolumeKg: {
      type: Number,
      default: 0,
    },
    achievedAt: {
      type: Date,
      default: Date.now,
    },
    history: [PRHistoryEntrySchema],
  },
  {
    timestamps: true,
  }
);

PersonalRecordSchema.index({ user: 1, exercise: 1 }, { unique: true });

export default mongoose.model('PersonalRecord', PersonalRecordSchema);
