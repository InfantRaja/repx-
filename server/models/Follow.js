import mongoose from 'mongoose';

const FollowSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted',
    },
  },
  {
    timestamps: true,
  }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export default mongoose.model('Follow', FollowSchema);
