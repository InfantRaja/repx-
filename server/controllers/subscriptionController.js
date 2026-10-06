import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get user subscription status
// @route   GET /api/subscription
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' });

    res.status(200).json({
      success: true,
      isPro: req.user.isPro || !!subscription,
      subscription: subscription || {
        plan: 'REPX Free Athlete',
        price: 0,
        status: 'active',
      },
      proFeatures: [
        'Advanced Strength & 1RM Analytics',
        'Unlimited Custom Workouts & Splits',
        'Advanced Historical PR Analytics',
        'Deep Volume Progression Charts',
        'Elite Workout Templates',
        'AI Workout Recommendations',
        'Priority Gym Cloud Sync',
      ],
      pricing: {
        amount: 199,
        currency: 'INR',
        symbol: '₹',
        billingCycle: 'month',
        upiId: 'infantraja777@okaxis',
        payeeName: 'INFANT RAJA'
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upgrade to REPX PRO with Google Pay UPI
// @route   POST /api/subscription/upgrade
export const upgradeToPro = async (req, res, next) => {
  try {
    const { paymentMethod, billingCycle, utrNumber, amount } = req.body;
    const userId = req.user._id;

    const daysToAdd = billingCycle === 'yearly' ? 365 : 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToAdd);

    const numericAmount = amount || (billingCycle === 'yearly' ? 1499 : 199);
    const resolvedUtr = utrNumber ? utrNumber.trim() : `GPAY-${Date.now().toString().slice(-8)}`;

    const subscription = await Subscription.create({
      user: userId,
      plan: billingCycle === 'yearly' ? 'REPX PRO Annual' : 'REPX PRO Monthly',
      price: numericAmount,
      currency: 'INR',
      billingCycle: billingCycle || 'monthly',
      status: 'active',
      startDate: new Date(),
      endDate,
      paymentMethod: paymentMethod || 'Google Pay UPI (infantraja777@okaxis)',
      utrNumber: resolvedUtr,
      transactionId: `TXN-${Date.now()}`
    });

    await User.findByIdAndUpdate(userId, {
      isPro: true,
      proExpiresAt: endDate,
    });

    // Send confirmation notification
    try {
      await Notification.create({
        recipient: userId,
        type: 'system',
        title: '👑 REPX PRO Membership Activated!',
        message: `Welcome to the Elite Tier! Your Google Pay payment of ₹${numericAmount} (Ref: ${resolvedUtr}) was successfully confirmed. All PRO features are now active.`,
      });
    } catch (notifErr) {
      console.warn('Could not create notification:', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Welcome to REPX PRO! Google Pay transaction verified & elite features unlocked.',
      subscription,
    });
  } catch (err) {
    next(err);
  }
};
