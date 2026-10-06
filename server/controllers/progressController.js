import Measurement from '../models/Measurement.js';
import WorkoutSession from '../models/WorkoutSession.js';
import WorkoutSet from '../models/WorkoutSet.js';
import PersonalRecord from '../models/PersonalRecord.js';
import Exercise from '../models/Exercise.js';

// Helper to filter dates
const getStartDateFromPeriod = (period) => {
  const now = new Date();
  switch (period) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '90d':
      return new Date(now.setDate(now.getDate() - 90));
    case '6m':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
};

// @desc    Get progress overview with charts for Body weight, Bench, Squat, Deadlift, Volume, and Frequency
// @route   GET /api/progress
export const getProgressData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const period = req.query.period || '30d';
    const startDate = getStartDateFromPeriod(period);

    // 1. Body Weight progression
    const weightMeasurements = await Measurement.find({
      user: userId,
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .select('date weightKg');

    const weightChartData = weightMeasurements.map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weightKg,
    }));

    // 2. Training Volume progression (per workout session)
    const sessions = await WorkoutSession.find({
      user: userId,
      status: 'completed',
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: 1 })
      .select('createdAt totalVolumeKg workoutName totalSets');

    const volumeChartData = sessions.map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: s.totalVolumeKg,
      name: s.workoutName,
      sets: s.totalSets,
    }));

    // 3. Big 3 Strength Progression (Bench Press, Squat, Deadlift)
    // Find exercise IDs for Bench Press, Squat, and Deadlift
    const big3Exercises = await Exercise.find({
      name: { $in: [/^Bench Press$/i, /^Squat$/i, /^Deadlift$/i] },
    });

    const benchEx = big3Exercises.find((e) => /bench/i.test(e.name));
    const squatEx = big3Exercises.find((e) => /squat/i.test(e.name));
    const deadliftEx = big3Exercises.find((e) => /deadlift/i.test(e.name));

    // Query WorkoutSets in this date range
    const big3Sets = await WorkoutSet.find({
      user: userId,
      completedAt: { $gte: startDate },
      exercise: { $in: big3Exercises.map((e) => e._id) },
    }).sort({ completedAt: 1 });

    // Aggregate by date
    const strengthDataMap = {};

    big3Sets.forEach((set) => {
      const dateKey = new Date(set.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!strengthDataMap[dateKey]) {
        strengthDataMap[dateKey] = { date: dateKey, bench: 0, squat: 0, deadlift: 0 };
      }

      const e1RM = set.estimated1RM || set.weightKg;

      if (benchEx && set.exercise.toString() === benchEx._id.toString()) {
        strengthDataMap[dateKey].bench = Math.max(strengthDataMap[dateKey].bench, e1RM);
      } else if (squatEx && set.exercise.toString() === squatEx._id.toString()) {
        strengthDataMap[dateKey].squat = Math.max(strengthDataMap[dateKey].squat, e1RM);
      } else if (deadliftEx && set.exercise.toString() === deadliftEx._id.toString()) {
        strengthDataMap[dateKey].deadlift = Math.max(strengthDataMap[dateKey].deadlift, e1RM);
      }
    });

    const strengthChartData = Object.values(strengthDataMap);

    // 4. Workout frequency / week distribution
    const frequencyByWeek = {};
    sessions.forEach((s) => {
      const d = new Date(s.createdAt);
      const weekLabel = `Wk ${Math.ceil(d.getDate() / 7)} (${d.toLocaleDateString('en-US', { month: 'short' })})`;
      frequencyByWeek[weekLabel] = (frequencyByWeek[weekLabel] || 0) + 1;
    });

    const frequencyChartData = Object.keys(frequencyByWeek).map((key) => ({
      week: key,
      workouts: frequencyByWeek[key],
    }));

    res.status(200).json({
      success: true,
      period,
      charts: {
        weight: weightChartData,
        volume: volumeChartData,
        strength: strengthChartData,
        frequency: frequencyChartData,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user Personal Records grouped by muscle category
// @route   GET /api/progress/prs
export const getPersonalRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category } = req.query;

    let query = { user: userId };
    if (category && category !== 'All') {
      query.category = category;
    }

    const prs = await PersonalRecord.find(query)
      .populate('exercise')
      .sort({ category: 1, maxWeightKg: -1 });

    // Group by category
    const grouped = {};
    prs.forEach((pr) => {
      const cat = pr.category || 'Other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(pr);
    });

    res.status(200).json({
      success: true,
      count: prs.length,
      grouped,
      data: prs,
    });
  } catch (err) {
    next(err);
  }
};
