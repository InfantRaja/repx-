import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

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
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upgrade to REPX PRO (Payment-ready mock architecture)
// @route   POST /api/subscription/upgrade
export const upgradeToPro = async (req, res, next) => {
  try {
    const { paymentMethod, billingCycle } = req.body;
    const userId = req.user._id;

    // Create 30 days pro period
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await Subscription.create({
      user: userId,
      plan: 'REPX PRO',
      price: 199,
      currency: 'INR',
      billingCycle: billingCycle || 'monthly',
      status: 'active',
      startDate: new Date(),
      endDate,
      paymentMethod: paymentMethod || 'Mock Payment Gateway (UPI / Card)',
    });

    await User.findByIdAndUpdate(userId, {
      isPro: true,
      proExpiresAt: endDate,
    });

    res.status(200).json({
      success: true,
      message: 'Welcome to REPX PRO! All elite features unlocked.',
      subscription,
    });
  } catch (err) {
    next(err);
  }
};
