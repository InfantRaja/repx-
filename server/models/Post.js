import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Please add some text to your post'],
      maxlength: 1000,
    },
    workoutSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSession',
      default: null,
    },
    type: {
      type: String,
      enum: ['workout', 'pr', 'general', 'milestone'],
      default: 'general',
    },
    workoutSummary: {
      workoutName: { type: String },
      durationMinutes: { type: Number },
      totalVolumeKg: { type: Number },
      prsCount: { type: Number },
      exercisesCount: { type: Number },
      setsCount: { type: Number },
      highlights: [{ type: String }],
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', PostSchema);
