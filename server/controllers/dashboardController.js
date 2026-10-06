import WorkoutSession from '../models/WorkoutSession.js';
import PersonalRecord from '../models/PersonalRecord.js';
import Measurement from '../models/Measurement.js';
import Workout from '../models/Workout.js';
import Split from '../models/Split.js';
import User from '../models/User.js';

// @desc    Get aggregated dashboard stats and data for the logged-in user
// @route   GET /api/dashboard
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // 1. Current Weight: Latest measurement or user onboarding weight
    const latestMeasurement = await Measurement.findOne({ user: userId }).sort({ date: -1 });
    const currentWeight = latestMeasurement ? latestMeasurement.weightKg : user?.onboarding?.weight || 75;

    // 2. Weekly Workouts (sessions in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyWorkoutsCount = await WorkoutSession.countDocuments({
      user: userId,
      createdAt: { $gte: sevenDaysAgo },
      status: 'completed',
    });

    // 3. Workout Streak (calculate or use cached)
    const workoutStreak = user?.stats?.currentStreak || 0;

    // 4. Total Volume Lifted (lifetime or month-to-date)
    const volumeAggregate = await WorkoutSession.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $group: { _id: null, totalVol: { $sum: '$totalVolumeKg' }, totalSets: { $sum: '$totalSets' } } },
    ]);
    const totalVolumeKg = volumeAggregate.length > 0 ? volumeAggregate[0].totalVol : user?.stats?.totalVolumeKg || 0;

    // 5. Personal Records Count
    const prCount = await PersonalRecord.countDocuments({ user: userId });

    // 6. Today's Recommended Workout based on Active Split or Default Routine
    let todaysWorkout = null;
    const activeSplit = await Split.findOne({ user: userId, isActive: true }).populate('days.workout');
    
    // Day of week: 1=Mon, ..., 7=Sun
    const dayOfWeek = new Date().getDay(); // 0 is Sun, 1 is Mon
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    if (activeSplit && activeSplit.days && activeSplit.days.length > 0) {
      const splitDay = activeSplit.days.find((d) => d.dayNumber === normalizedDay) || activeSplit.days[0];
      if (splitDay && !splitDay.isRestDay) {
        todaysWorkout = {
          id: splitDay.workout?._id || null,
          name: splitDay.title || 'Push Day',
          targetMuscles: splitDay.targetMuscles?.length ? splitDay.targetMuscles : ['Chest', 'Shoulders', 'Triceps'],
          estimatedMinutes: splitDay.workout?.estimatedDurationMinutes || 55,
          isRestDay: false,
          dayName: splitDay.dayName,
        };
      } else {
        todaysWorkout = {
          id: null,
          name: 'Rest & Recovery Day',
          targetMuscles: ['Recovery', 'Mobility'],
          estimatedMinutes: 0,
          isRestDay: true,
          dayName: splitDay?.dayName || 'Today',
        };
      }
    }

    if (!todaysWorkout) {
      // Fallback to first available workout template
      const defaultWorkout = await Workout.findOne({ isTemplate: true });
      todaysWorkout = {
        id: defaultWorkout?._id || null,
        name: defaultWorkout?.name || 'PUSH DAY',
        targetMuscles: defaultWorkout?.targetMuscles || ['Chest', 'Shoulders', 'Triceps'],
        estimatedMinutes: defaultWorkout?.estimatedDurationMinutes || 60,
        isRestDay: false,
        dayName: 'Today',
      };
    }

    // 7. Recent Weight Chart Data (last 8 entries)
    const weightHistory = await Measurement.find({ user: userId })
      .sort({ date: 1 })
      .limit(10)
      .select('date weightKg');

    // 8. Weekly Training Volume History (last 6 completed sessions)
    const recentSessions = await WorkoutSession.find({ user: userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('workoutName totalVolumeKg durationSeconds createdAt personalRecordsBroken');

    const volumeChartData = [...recentSessions].reverse().map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: s.totalVolumeKg,
      name: s.workoutName,
    }));

    // 9. Recent Activity Feed
    const recentActivities = [];

    // Recent PRs
    const recentPRs = await PersonalRecord.find({ user: userId })
      .sort({ achievedAt: -1 })
      .limit(2);

    recentPRs.forEach((pr) => {
      recentActivities.push({
        id: `pr-${pr._id}`,
        type: 'pr',
        icon: '🔥',
        title: `New ${pr.exerciseName} PR`,
        detail: `${pr.maxWeightKg} KG × ${pr.maxRepsAtMaxWeight} reps (Est 1RM: ${pr.best1RM} KG)`,
        time: pr.achievedAt,
      });
    });

    // Recent Completed Sessions
    recentSessions.slice(0, 3).forEach((s) => {
      recentActivities.push({
        id: `session-${s._id}`,
        type: 'workout',
        icon: '🏋️',
        title: `Completed ${s.workoutName}`,
        detail: `${Math.round(s.durationSeconds / 60)} min • ${s.totalVolumeKg.toLocaleString()} KG Volume`,
        time: s.createdAt,
      });
    });

    // Latest Weight update
    if (latestMeasurement) {
      recentActivities.push({
        id: `weight-${latestMeasurement._id}`,
        type: 'weight',
        icon: '📈',
        title: 'Weight updated',
        detail: `${latestMeasurement.weightKg} KG recorded`,
        time: latestMeasurement.date,
      });
    }

    // Sort recent activities chronologically descending
    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          streak: workoutStreak,
        },
        stats: {
          currentWeight,
          weeklyWorkouts: weeklyWorkoutsCount,
          workoutStreak,
          totalVolumeKg,
          prCount,
        },
        todaysWorkout,
        charts: {
          weightHistory: weightHistory.map((m) => ({
            date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: m.weightKg,
          })),
          volumeHistory: volumeChartData,
        },
        recentActivities: recentActivities.slice(0, 5),
      },
    });
  } catch (err) {
    next(err);
  }
};
