const mongoose = require('mongoose');

const fitnessRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    exercise: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true
    },
    sets: {
      type: Number,
      required: [true, 'Sets count is required'],
      min: [1, 'Sets must be at least 1']
    },
    reps: {
      type: Number,
      required: [true, 'Reps count is required'],
      min: [1, 'Reps must be at least 1']
    },
    weight: {
      type: Number,
      default: 0,
      min: [0, 'Weight cannot be negative']
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('FitnessRecord', fitnessRecordSchema);
