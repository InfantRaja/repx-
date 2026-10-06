import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      default: 'REPX PRO',
    },
    price: {
      type: Number,
      default: 199,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      default: 'Google Pay UPI',
    },
    utrNumber: {
      type: String,
      default: '',
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Subscription', SubscriptionSchema);
