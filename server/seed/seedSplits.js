import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Split from '../models/Split.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import { allSplitsData } from './splitsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repx';
const DB_NAME = process.env.MONGODB_DB || 'repx';

export const seedAllSplits = async () => {
  try {
    console.log('Connecting to MongoDB for splits seeding...');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('MongoDB: CONNECTED');

    // Find demo user if available
    const demoUser = await User.findOne({ email: 'demo@repx.com' });
    const userId = demoUser ? demoUser._id : null;

    // Fetch existing workouts to link if possible
    const pushWorkout = await Workout.findOne({ name: /push/i });
    const pullWorkout = await Workout.findOne({ name: /pull/i });
    const legsWorkout = await Workout.findOne({ name: /leg/i });
    const upperWorkout = await Workout.findOne({ name: /upper/i });
    const lowerWorkout = await Workout.findOne({ name: /lower/i });

    // Clean up old template splits to ensure fresh accurate templates
    const deleteResult = await Split.deleteMany({ isTemplate: true });
    console.log(`Cleaned up ${deleteResult.deletedCount} old template splits.`);

    let insertedCount = 0;

    for (let i = 0; i < allSplitsData.length; i++) {
      const splitInfo = allSplitsData[i];

      // Assign workouts to days if matched
      const enrichedDays = splitInfo.days.map((d) => {
        let matchedWorkout = null;
        if (!d.isRestDay) {
          const title = d.title.toLowerCase();
          if (title.includes('push') && pushWorkout) matchedWorkout = pushWorkout._id;
          else if (title.includes('pull') && pullWorkout) matchedWorkout = pullWorkout._id;
          else if (title.includes('leg') && legsWorkout) matchedWorkout = legsWorkout._id;
          else if (title.includes('upper') && upperWorkout) matchedWorkout = upperWorkout._id;
          else if (title.includes('lower') && lowerWorkout) matchedWorkout = lowerWorkout._id;
        }

        return {
          dayNumber: d.dayNumber,
          dayName: d.dayName,
          title: d.title,
          isRestDay: d.isRestDay,
          targetMuscles: d.targetMuscles,
          workout: matchedWorkout,
        };
      });

      await Split.create({
        user: userId,
        name: splitInfo.name,
        description: splitInfo.description,
        isActive: i === 0, // First split active by default
        isTemplate: true,
        days: enrichedDays,
      });

      console.log(`[${i + 1}/${allSplitsData.length}] Inserted: ${splitInfo.name} (${splitInfo.daysPerWeek} Days/Week) [${splitInfo.badge}]`);
      insertedCount++;
    }

    console.log('====================================');
    console.log(`✅ SUCCESS: Inserted all ${insertedCount} workout splits!`);
    console.log('====================================');

    return insertedCount;
  } catch (err) {
    console.error('Error seeding splits:', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedAllSplits()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
