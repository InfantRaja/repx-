const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Exercise = require('./models/Exercise');
const Workout = require('./models/Workout');
const FitnessRecord = require('./models/FitnessRecord');
const ActivityLog = require('./models/ActivityLog');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repx_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Exercise.deleteMany({});
    await Workout.deleteMany({});
    await FitnessRecord.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Users (Pre-save hook will hash passwords)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@repx.com',
      password: 'Admin123!',
      role: 'admin'
    });
    await adminUser.save();

    const normalUser = new User({
      name: 'John Doe',
      email: 'user@repx.com',
      password: 'User123!',
      role: 'user'
    });
    await normalUser.save();

    const sarahUser = new User({
      name: 'Sarah Connor',
      email: 'sarah@repx.com',
      password: 'User123!',
      role: 'user'
    });
    await sarahUser.save();

    console.log('Seeded Users:');
    console.log('  Admin: admin@repx.com / Admin123!');
    console.log('  User:  user@repx.com / User123!');
    console.log('  User:  sarah@repx.com / User123!');

    // 2. Create Exercises
    const exercisesData = [
      {
        name: 'Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Compound chest exercise targeting pectoralis major, anterior deltoids, and triceps.'
      },
      {
        name: 'Barbell Squat',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'King of leg exercises targeting quadriceps, glutes, hamstrings, and core stability.'
      },
      {
        name: 'Conventional Deadlift',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        difficulty: 'Advanced',
        description: 'Heavy posterior chain compound movement strengthening back, glutes, and hamstrings.'
      },
      {
        name: 'Pull-ups',
        muscleGroup: 'Back',
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        description: 'Upper-body vertical pulling exercise building broad lats and strong biceps.'
      },
      {
        name: 'Overhead Shoulder Press',
        muscleGroup: 'Shoulders',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Standing overhead press developing deltoids, upper chest, and core stability.'
      },
      {
        name: 'Dumbbell Bicep Curls',
        muscleGroup: 'Arms',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Isolation exercise targeting bicep brachii peak, grip, and arm stamina.'
      },
      {
        name: 'Tricep Parallel Dips',
        muscleGroup: 'Arms',
        equipment: 'Bodyweight',
        difficulty: 'Intermediate',
        description: 'Compound bodyweight pushing exercise focusing on triceps and lower chest fibers.'
      },
      {
        name: 'Plank Hold',
        muscleGroup: 'Core',
        equipment: 'Bodyweight',
        difficulty: 'Beginner',
        description: 'Isometric abdominal endurance exercise engaging core muscles and posture.'
      },
      {
        name: 'Lateral Dumbbell Raises',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        difficulty: 'Beginner',
        description: 'Isolation movement focusing on lateral deltoid heads for shoulder width.'
      },
      {
        name: 'Romanian Deadlift',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        difficulty: 'Intermediate',
        description: 'Hip-hinge movement maximizing hamstring elongation and glute activation.'
      }
    ];

    const exercises = await Exercise.insertMany(exercisesData);
    console.log(`Seeded ${exercises.length} Exercises.`);

    // 3. Create Workouts
    const workoutsData = [
      {
        name: 'Push Power Workout',
        targetMuscle: 'Chest + Shoulders + Triceps',
        exercise: 'Bench Press, Overhead Press, Tricep Dips',
        sets: 4,
        reps: 10,
        duration: '45 mins',
        difficulty: 'Intermediate'
      },
      {
        name: 'Pull Hypertrophy Workout',
        targetMuscle: 'Back + Biceps',
        exercise: 'Conventional Deadlift, Pull-ups, Dumbbell Bicep Curls',
        sets: 4,
        reps: 8,
        duration: '50 mins',
        difficulty: 'Advanced'
      },
      {
        name: 'Legs & Calves Routine',
        targetMuscle: 'Quadriceps + Hamstrings + Calves',
        exercise: 'Barbell Squat, Romanian Deadlift, Calf Raises',
        sets: 5,
        reps: 12,
        duration: '55 mins',
        difficulty: 'Intermediate'
      },
      {
        name: 'Core Conditioning & Mobility',
        targetMuscle: 'Core + Abdominals',
        exercise: 'Plank Hold, Hanging Knee Raises, Russian Twists',
        sets: 3,
        reps: 15,
        duration: '25 mins',
        difficulty: 'Beginner'
      }
    ];

    const workouts = await Workout.insertMany(workoutsData);
    console.log(`Seeded ${workouts.length} Workouts.`);

    // 4. Create Fitness Records
    const recordsData = [
      {
        userId: normalUser._id,
        exercise: 'Bench Press',
        sets: 4,
        reps: 10,
        weight: 80,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        userId: normalUser._id,
        exercise: 'Barbell Squat',
        sets: 5,
        reps: 8,
        weight: 105,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: normalUser._id,
        exercise: 'Conventional Deadlift',
        sets: 3,
        reps: 5,
        weight: 140,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sarahUser._id,
        exercise: 'Pull-ups',
        sets: 4,
        reps: 12,
        weight: 0,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: sarahUser._id,
        exercise: 'Dumbbell Bicep Curls',
        sets: 3,
        reps: 15,
        weight: 12,
        date: new Date()
      }
    ];

    const records = await FitnessRecord.insertMany(recordsData);
    console.log(`Seeded ${records.length} Fitness Records.`);

    // 5. Create Activity Logs
    const activityLogs = [
      {
        action: 'System initialized',
        details: 'REPX Database seeded with default users and fitness catalog',
        performedBy: 'System',
        role: 'system'
      },
      {
        action: 'New user registered',
        details: 'John Doe (user@repx.com) registered as USER',
        performedBy: 'John Doe',
        role: 'user'
      },
      {
        action: 'Exercise added',
        details: 'Admin added exercise "Bench Press" (Chest)',
        performedBy: 'Admin User',
        role: 'admin'
      },
      {
        action: 'Workout updated',
        details: 'Admin updated workout "Push Power Workout"',
        performedBy: 'Admin User',
        role: 'admin'
      },
      {
        action: 'Fitness record added',
        details: 'John Doe logged record: Bench Press (4 sets x 10 reps, 80kg)',
        performedBy: 'John Doe',
        role: 'user'
      }
    ];

    await ActivityLog.insertMany(activityLogs);
    console.log('Seeded Activity Logs.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
