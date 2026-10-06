import PersonalRecord from '../models/PersonalRecord.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const detectPersonalRecords = async (userId, session) => {
  const prsBroken = [];

  if (!session || !session.exercises || !Array.isArray(session.exercises)) {
    return prsBroken;
  }

  for (const exItem of session.exercises) {
    if (!exItem.exercise || !exItem.sets || exItem.sets.length === 0) continue;

    // Find best performance in this session for this exercise
    const completedSets = exItem.sets.filter((s) => s.isCompleted && s.weightKg > 0);
    if (completedSets.length === 0) continue;

    let sessionMaxWeight = 0;
    let sessionRepsAtMaxWeight = 0;
    let sessionBest1RM = 0;
    let sessionBestVolume = 0;

    for (const set of completedSets) {
      const weight = Number(set.weightKg) || 0;
      const reps = Number(set.reps) || 0;
      const vol = weight * reps;
      const est1RM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30) * 10) / 10;

      if (weight > sessionMaxWeight) {
        sessionMaxWeight = weight;
        sessionRepsAtMaxWeight = reps;
      }
      if (est1RM > sessionBest1RM) {
        sessionBest1RM = est1RM;
      }
      if (vol > sessionBestVolume) {
        sessionBestVolume = vol;
      }
    }

    if (sessionMaxWeight === 0) continue;

    let prDoc = await PersonalRecord.findOne({
      user: userId,
      exercise: exItem.exercise,
    });

    if (!prDoc) {
      // First time recording this exercise - Establish Baseline PR!
      prDoc = await PersonalRecord.create({
        user: userId,
        exercise: exItem.exercise,
        exerciseName: exItem.exerciseName,
        category: exItem.muscleGroup || 'Full Body',
        maxWeightKg: sessionMaxWeight,
        maxRepsAtMaxWeight: sessionRepsAtMaxWeight,
        best1RM: sessionBest1RM,
        bestSetVolumeKg: sessionBestVolume,
        achievedAt: new Date(),
        history: [
          {
            weightKg: sessionMaxWeight,
            reps: sessionRepsAtMaxWeight,
            estimated1RM: sessionBest1RM,
            date: new Date(),
            session: session._id,
          },
        ],
      });

      prsBroken.push({
        exercise: exItem.exercise,
        exerciseName: exItem.exerciseName,
        metric: 'weight',
        oldValue: 0,
        newValue: sessionMaxWeight,
        reps: sessionRepsAtMaxWeight,
        best1RM: sessionBest1RM,
      });

      await Notification.create({
        recipient: userId,
        type: 'pr',
        title: '🔥 New Personal Record!',
        message: `Set initial baseline PR on ${exItem.exerciseName}: ${sessionMaxWeight} KG × ${sessionRepsAtMaxWeight} reps!`,
        entityId: session._id,
      });

      await User.findByIdAndUpdate(userId, { $inc: { 'stats.prCount': 1 } });
    } else {
      let isWeightPR = sessionMaxWeight > prDoc.maxWeightKg;
      let is1RMPR = sessionBest1RM > prDoc.best1RM;

      if (isWeightPR || is1RMPR) {
        const oldWeight = prDoc.maxWeightKg;
        const old1RM = prDoc.best1RM;

        prDoc.maxWeightKg = Math.max(prDoc.maxWeightKg, sessionMaxWeight);
        if (sessionMaxWeight >= prDoc.maxWeightKg) {
          prDoc.maxRepsAtMaxWeight = sessionRepsAtMaxWeight;
        }
        prDoc.best1RM = Math.max(prDoc.best1RM, sessionBest1RM);
        prDoc.bestSetVolumeKg = Math.max(prDoc.bestSetVolumeKg, sessionBestVolume);
        prDoc.achievedAt = new Date();

        prDoc.history.push({
          weightKg: sessionMaxWeight,
          reps: sessionRepsAtMaxWeight,
          estimated1RM: sessionBest1RM,
          date: new Date(),
          session: session._id,
        });

        await prDoc.save();

        prsBroken.push({
          exercise: exItem.exercise,
          exerciseName: exItem.exerciseName,
          metric: isWeightPR ? 'weight' : '1rm',
          oldValue: isWeightPR ? oldWeight : old1RM,
          newValue: isWeightPR ? sessionMaxWeight : sessionBest1RM,
          reps: sessionRepsAtMaxWeight,
          best1RM: sessionBest1RM,
        });

        await Notification.create({
          recipient: userId,
          type: 'pr',
          title: '🔥 Personal Record Smashed!',
          message: `You hit a new PR on ${exItem.exerciseName}: ${sessionMaxWeight} KG × ${sessionRepsAtMaxWeight} reps (Est 1RM: ${sessionBest1RM} KG)!`,
          entityId: session._id,
        });

        await User.findByIdAndUpdate(userId, { $inc: { 'stats.prCount': 1 } });
      }
    }
  }

  return prsBroken;
};
