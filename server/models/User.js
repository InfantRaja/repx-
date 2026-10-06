import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: 60,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 250,
      default: 'Chasing strength and continuous transformation with REPX.',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    onboarding: {
      age: { type: Number, default: 24 },
      height: { type: Number, default: 178 }, // in cm
      weight: { type: Number, default: 75 }, // in kg
      gender: { type: String, default: 'Prefer not to say' },
      fitnessGoal: {
        type: String,
        enum: ['Muscle Gain', 'Strength', 'Fat Loss', 'General Fitness', 'Bodybuilding'],
        default: 'Muscle Gain',
      },
      experienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate',
      },
      trainingDays: { type: Number, default: 5 },
      preferredSplit: {
        type: String,
        enum: ['Push Pull Legs', 'Upper Lower', 'Bro Split', 'Full Body', 'Custom'],
        default: 'Push Pull Legs',
      },
      availableEquipment: {
        type: String,
        default: 'Commercial Gym',
      },
    },
    preferences: {
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
      theme: {
        type: String,
        default: 'pitch-black',
      },
      restTimerSound: {
        type: Boolean,
        default: true,
      },
      defaultRestSeconds: {
        type: Number,
        default: 90,
      },
      notifications: {
        prs: { type: Boolean, default: true },
        followers: { type: Boolean, default: true },
        workoutLikes: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
      },
    },
    stats: {
      totalWorkouts: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastWorkoutDate: { type: Date },
      totalVolumeKg: { type: Number, default: 0 },
      prCount: { type: Number, default: 0 },
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    proExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
