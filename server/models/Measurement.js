import mongoose from 'mongoose';

const MeasurementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    weightKg: {
      type: Number,
      required: [true, 'Please provide body weight'],
    },
    chestCm: {
      type: Number,
      default: null,
    },
    armsCm: {
      type: Number,
      default: null,
    },
    waistCm: {
      type: Number,
      default: null,
    },
    thighsCm: {
      type: Number,
      default: null,
    },
    calvesCm: {
      type: Number,
      default: null,
    },
    shouldersCm: {
      type: Number,
      default: null,
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

export default mongoose.model('Measurement', MeasurementSchema);
