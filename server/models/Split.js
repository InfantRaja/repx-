import mongoose from 'mongoose';

const SplitDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 7,
  },
  dayName: {
    type: String,
    required: true, // Monday, Tuesday, etc.
  },
  title: {
    type: String,
    required: true, // "Push Day", "Pull Day", "Rest Day"
  },
  isRestDay: {
    type: Boolean,
    default: false,
  },
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    default: null,
  },
  targetMuscles: [
    {
      type: String,
    },
  ],
  exercises: [
    {
      exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
      exerciseName: String,
      muscleGroup: String,
      defaultSetsCount: { type: Number, default: 3 },
    },
  ],
});

const SplitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a split name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    days: [SplitDaySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Split', SplitSchema);
