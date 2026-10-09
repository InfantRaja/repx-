import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Exercise from '../models/Exercise.js';
import Workout from '../models/Workout.js';
import WorkoutSession from '../models/WorkoutSession.js';
import WorkoutSet from '../models/WorkoutSet.js';
import Split from '../models/Split.js';
import { allSplitsData } from './splitsData.js';
import Measurement from '../models/Measurement.js';
import PersonalRecord from '../models/PersonalRecord.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repx';
const DB_NAME = process.env.MONGODB_DB || 'repx';

const exercisesData = [
  // CHEST
  {
    name: 'Bench Press',
    muscleGroup: 'Chest',
    targetMuscles: ['Pectoralis Major (Mid/Lower)', 'Anterior Deltoid', 'Triceps Brachii'],
    secondaryMuscles: ['Serratus Anterior', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Lie flat on bench with eyes directly under the bar.',
      'Grip the bar slightly wider than shoulder width with feet planted firmly.',
      'Unrack, retract scapula, and lower bar smoothly to mid-chest.',
      'Press upward explosively while keeping wrists neutral and butt on the bench.',
    ],
    commonMistakes: ['Flaring elbows at 90 degrees', 'Bouncing bar off chest', 'Lifting hips off the bench'],
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  {
    name: 'Incline Bench Press',
    muscleGroup: 'Chest',
    targetMuscles: ['Clavicular Head (Upper Chest)', 'Anterior Deltoid', 'Triceps'],
    secondaryMuscles: ['Upper Traps'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Set incline bench between 30 and 45 degrees.',
      'Grip bar slightly wider than shoulder width.',
      'Lower bar with control to upper sternum just below clavicles.',
      'Drive weight up through heels and palms without over-arching lower back.',
    ],
    commonMistakes: ['Incline angle too steep (>45 deg shifts to shoulders)', 'Elbows overly flared'],
    videoUrl: '',
  },
  {
    name: 'Dumbbell Press',
    muscleGroup: 'Chest',
    targetMuscles: ['Pectoralis Major', 'Anterior Deltoid', 'Triceps'],
    secondaryMuscles: ['Stabilizer muscles of rotator cuff'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    instructions: [
      'Sit on flat bench with dumbbells resting on thighs.',
      'Kick dumbbells up as you lie back into position.',
      'Lower weights at roughly 45-degree angle to torso until comfortable chest stretch.',
      'Press up and inward without clanking dumbbells together.',
    ],
    commonMistakes: ['Banging weights at the top', 'Dropping dumbbells straight down without thigh assist'],
    videoUrl: '',
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    targetMuscles: ['Upper Pectoralis', 'Anterior Deltoids', 'Triceps'],
    secondaryMuscles: ['Serratus Anterior'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    instructions: [
      'Adjust bench to 30-degree incline.',
      'Press dumbbells upward with palms facing forward.',
      'Lower under control to ear/chest level feeling deep upper pec stretch.',
      'Contract chest to drive weights back to start position.',
    ],
    commonMistakes: ['Too heavy causing elbow hyperextension', 'Overarching lumbar spine'],
    videoUrl: '',
  },
  {
    name: 'Cable Fly',
    muscleGroup: 'Chest',
    targetMuscles: ['Sternal Head Pectoralis', 'Pectoralis Minor'],
    secondaryMuscles: ['Biceps short head (isometrically)'],
    equipment: 'Cable',
    difficulty: 'Intermediate',
    instructions: [
      'Set pulleys at shoulder or high height.',
      'Take a step forward into a staggered stance with slight forward lean.',
      'Maintain slight elbow bend and bring hands together in wide hugging arc.',
      'Squeeze chest at peak contraction for 1 second, then control eccentric phase.',
    ],
    commonMistakes: ['Straightening arms completely', 'Using momentum and swinging hips'],
    videoUrl: '',
  },
  {
    name: 'Pec Deck',
    muscleGroup: 'Chest',
    targetMuscles: ['Pectoralis Major (Inner/Mid)'],
    secondaryMuscles: ['Anterior Deltoid'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: [
      'Adjust seat height so handles align with mid-chest.',
      'Keep back flat against the pad and elbows slightly bent.',
      'Push pads or handles together focusing on squeezing pecs together.',
      'Slowly resist back until chest is fully stretched.',
    ],
    commonMistakes: ['Letting weight stack slam down', 'Shoulders rolling forward out of socket'],
    videoUrl: '',
  },
  {
    name: 'Dips',
    muscleGroup: 'Chest',
    targetMuscles: ['Lower Pectoralis Major', 'Triceps Brachii', 'Front Delts'],
    secondaryMuscles: ['Latissimus Dorsi', 'Rhomboids'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: [
      'Mount dip bars with arms locked and lean torso forward 30 degrees for chest focus.',
      'Lower body by bending elbows until upper arms are parallel to floor.',
      'Push through palms back up to full extension while maintaining the forward lean.',
    ],
    commonMistakes: ['Staying completely upright (shifts to triceps)', 'Going too deep causing shoulder impingement'],
    videoUrl: '',
  },

  // BACK
  {
    name: 'Pull Ups',
    muscleGroup: 'Back',
    targetMuscles: ['Latissimus Dorsi', 'Teres Major', 'Biceps Brachii'],
    secondaryMuscles: ['Brachialis', 'Rhomboids', 'Lower Traps'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: [
      'Grasp overhead bar with overhand grip wider than shoulder width.',
      'Engage core and pull shoulder blades down and back.',
      'Drive elbows down towards hips until chin clearly clears the bar.',
      'Lower with strict 2-second negative to dead hang.',
    ],
    commonMistakes: ['Kipping or swinging legs', 'Partial reps without clearing chin'],
    videoUrl: '',
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    targetMuscles: ['Latissimus Dorsi', 'Middle Trapezius', 'Biceps'],
    secondaryMuscles: ['Rear Deltoids', 'Brachioradialis'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    instructions: [
      'Secure thigh pads comfortably tight over quads.',
      'Grip wide bar with overhand grip and lean back slightly (10-15 degrees).',
      'Pull bar down to upper chest leading with your elbows.',
      'Slowly allow bar to return overhead with full lat stretch.',
    ],
    commonMistakes: ['Pulling bar behind neck (hazardous to cervical spine)', 'Excessive backward rocking'],
    videoUrl: '',
  },
  {
    name: 'Barbell Row',
    muscleGroup: 'Back',
    targetMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle Traps', 'Erector Spinae'],
    secondaryMuscles: ['Posterior Deltoids', 'Biceps'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Hinge at hips with torso around 45 degrees to floor and knees slightly bent.',
      'Grip bar shoulder width with overhand grip.',
      'Pull barbell to lower ribcage/navel, tucking elbows close.',
      'Squeeze shoulder blades together, then lower bar under control.',
    ],
    commonMistakes: ['Rounding lower spine', 'Using jerky leg drive'],
    videoUrl: '',
  },
  {
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    targetMuscles: ['Rhomboids', 'Middle/Lower Traps', 'Lats'],
    secondaryMuscles: ['Erector Spinae', 'Biceps'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    instructions: [
      'Sit with feet on footplates, knees slightly bent.',
      'Reach forward to grip V-bar handle with neutral spine.',
      'Pull handle toward abdomen while pulling shoulders back and puffing chest.',
      'Slowly release forward allowing upper back to stretch.',
    ],
    commonMistakes: ['Hyperextending lower back at end of pull', 'Shrugging shoulders upward'],
    videoUrl: '',
  },
  {
    name: 'T-Bar Row',
    muscleGroup: 'Back',
    targetMuscles: ['Middle Traps', 'Lats', 'Rhomboids', 'Rear Delts'],
    secondaryMuscles: ['Spinal Erectors', 'Hamstrings'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Straddle bar with neutral grip handles attached.',
      'Hinge deeply at hips with flat back.',
      'Pull weight plates towards chest squeezing mid-back.',
      'Control descent without letting weights touch ground between reps.',
    ],
    commonMistakes: ['Standing too upright turning exercise into a shrug', 'Rounding back'],
    videoUrl: '',
  },
  {
    name: 'Deadlift',
    muscleGroup: 'Back',
    targetMuscles: ['Erector Spinae', 'Gluteus Maximus', 'Hamstrings', 'Latissimus Dorsi'],
    secondaryMuscles: ['Trapezius', 'Forearms', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot.',
      'Hinge and grip bar just outside legs.',
      'Pull slack out of bar, depress lats, and wedge hips.',
      'Drive floor away through heels until standing tall at lockout.',
    ],
    commonMistakes: ['Bar drifting away from shins', 'Lower back rounding on initiation', 'Hyperextending spine at lockout'],
    videoUrl: '',
  },

  // SHOULDERS
  {
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    targetMuscles: ['Anterior Deltoid', 'Lateral Deltoid', 'Triceps Brachii'],
    secondaryMuscles: ['Upper Traps', 'Core (Abs/Glutes)'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Clean or unrack bar onto front deltoids with hands just outside shoulders.',
      'Squeeze glutes and brace core.',
      'Press bar straight overhead, tucking chin back slightly until bar clears face.',
      'Lock out bar directly over mid-foot with head pushed forward to neutral.',
    ],
    commonMistakes: ['Leaning back excessively into pseudo-incline bench', 'Loose core causing lower back strain'],
    videoUrl: '',
  },
  {
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    targetMuscles: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps'],
    secondaryMuscles: ['Rotator Cuff', 'Upper Traps'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    instructions: [
      'Sit on upright bench with dumbbells at shoulder height, palms forward.',
      'Press weights up overhead in smooth converging arc.',
      'Avoid banging dumbbells at the peak.',
      'Lower with control back to ear level.',
    ],
    commonMistakes: ['Flaring elbows 180 degrees wide', 'Partial range of motion'],
    videoUrl: '',
  },
  {
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    targetMuscles: ['Lateral Deltoid (Side Delt)'],
    secondaryMuscles: ['Supraspinatus', 'Trapezius'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbells by your sides with slight forward lean (10 degrees).',
      'Raise arms laterally leading with elbows until parallel to floor.',
      'Pour imaginary water pitcher at the top for maximum lateral head activation.',
      'Lower smoothly over 2 seconds.',
    ],
    commonMistakes: ['Using momentum/swinging hips', 'Lifting hands higher than elbows (shifts to traps)'],
    videoUrl: '',
  },
  {
    name: 'Rear Delt Fly',
    muscleGroup: 'Shoulders',
    targetMuscles: ['Posterior Deltoid (Rear Delt)'],
    secondaryMuscles: ['Rhomboids', 'Infraspinatus'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    instructions: [
      'Hinge forward at waist until torso is nearly parallel to floor.',
      'Maintain slight bend in elbows with palms facing each other.',
      'Raise dumbbells out to sides squeezing back of shoulders.',
      'Lower slowly without swinging.',
    ],
    commonMistakes: ['Using heavy weights and turning it into a row', 'Standing up between reps'],
    videoUrl: '',
  },
  {
    name: 'Face Pull',
    muscleGroup: 'Shoulders',
    targetMuscles: ['Posterior Deltoids', 'External Rotators', 'Upper Back'],
    secondaryMuscles: ['Trapezius', 'Rhomboids'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    instructions: [
      'Attach rope to cable at eye height.',
      'Grip ends with thumbs facing backwards.',
      'Step back, pull rope directly towards bridge of nose while externally rotating hands back.',
      'Pause for 1 second squeezing shoulder blades together.',
    ],
    commonMistakes: ['Pulling downwards to chest', 'Using too much weight causing body lean'],
    videoUrl: '',
  },

  // BICEPS
  {
    name: 'Barbell Curl',
    muscleGroup: 'Biceps',
    targetMuscles: ['Biceps Brachii (Short & Long Heads)'],
    secondaryMuscles: ['Brachialis', 'Forearm Flexors'],
    equipment: 'Barbell',
    difficulty: 'Beginner',
    instructions: [
      'Stand tall holding barbell with underhand shoulder-width grip.',
      'Pin elbows to sides of ribcage.',
      'Curl bar up toward chest contracting biceps forcefully.',
      'Lower under strict control without swinging back.',
    ],
    commonMistakes: ['Swinging torso back and forth', 'Elbows drifting forward during lift'],
    videoUrl: '',
  },
  {
    name: 'Dumbbell Curl',
    muscleGroup: 'Biceps',
    targetMuscles: ['Biceps Brachii'],
    secondaryMuscles: ['Brachialis', 'Brachioradialis'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbells at sides with neutral grip.',
      'As you curl up, supinate wrists (turn palms up) toward top of movement.',
      'Squeeze peak bicep contraction, then lower slowly.',
    ],
    commonMistakes: ['Rushing the negative phase', 'Failing to fully supinate at top'],
    videoUrl: '',
  },
  {
    name: 'Hammer Curl',
    muscleGroup: 'Biceps',
    targetMuscles: ['Brachialis', 'Brachioradialis (Forearm)', 'Biceps Long Head'],
    secondaryMuscles: ['Wrist flexors'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    instructions: [
      'Hold dumbbells with neutral grip (palms facing each other).',
      'Keep upper arms stationary and curl weights up to shoulder height.',
      'Lower under control to full elbow extension.',
    ],
    commonMistakes: ['Swinging shoulders', 'Allowing wrists to bend backwards'],
    videoUrl: '',
  },
  {
    name: 'Preacher Curl',
    muscleGroup: 'Biceps',
    targetMuscles: ['Biceps Brachii (Isolated Short Head)'],
    secondaryMuscles: ['Brachialis'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Rest upper arms flat against preacher bench pad with armpits wedged at top.',
      'Grip EZ-curl bar and curl weight upward toward chin.',
      'Lower bar slowly until arms are almost fully extended, stopping just shy of hyperextension.',
    ],
    commonMistakes: ['Hyperextending elbows at the bottom under heavy load', 'Lifting hips off the seat'],
    videoUrl: '',
  },

  // TRICEPS
  {
    name: 'Triceps Pushdown',
    muscleGroup: 'Triceps',
    targetMuscles: ['Triceps Brachii (Lateral & Medial Heads)'],
    secondaryMuscles: ['Anconeus'],
    equipment: 'Cable',
    difficulty: 'Beginner',
    instructions: [
      'Attach straight bar or rope to high cable pulley.',
      'Tuck elbows into flanks and lean forward slightly.',
      'Push attachment down until arms are fully locked out straight.',
      'Allow attachment to rise back to 90 degrees elbow bend with strict control.',
    ],
    commonMistakes: ['Elbows flaring away from body', 'Using body weight to press down'],
    videoUrl: '',
  },
  {
    name: 'Skull Crushers',
    muscleGroup: 'Triceps',
    targetMuscles: ['Triceps Brachii (Long & Medial Heads)'],
    secondaryMuscles: ['Anconeus'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Lie on flat bench holding EZ-curl bar with narrow overhand grip overhead.',
      'Angle upper arms slightly back past vertical toward head.',
      'Bend elbows to lower bar toward forehead or slightly beyond crown of head.',
      'Extend elbows back to starting position without letting upper arms sway.',
    ],
    commonMistakes: ['Dropping bar directly onto face', 'Flaring elbows outward'],
    videoUrl: '',
  },
  {
    name: 'Overhead Triceps Extension',
    muscleGroup: 'Triceps',
    targetMuscles: ['Triceps Brachii (Long Head Deep Stretch)'],
    secondaryMuscles: ['Core stabilizers'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    instructions: [
      'Hold single heavy dumbbell with both hands cupping upper plate overhead.',
      'Lower dumbbell behind neck by bending at elbows.',
      'Feel deep stretch in triceps long head at bottom.',
      'Extend elbows smoothly to return to top lockout.',
    ],
    commonMistakes: ['Flaring elbows excessively wide', 'Arched lower back'],
    videoUrl: '',
  },

  // LEGS
  {
    name: 'Squat',
    muscleGroup: 'Legs',
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Adductor Magnus'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Spinal Erectors', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    instructions: [
      'Set bar on upper traps (high bar) or across rear delts (low bar).',
      'Unrack, take 2 steps back, feet shoulder width with toes angled slightly outward.',
      'Inhale, brace abdominal wall 360 degrees.',
      'Sit hips back and down between knees until hip crease is below top of knee.',
      'Drive upward through midfoot, knees tracking over toes, to standing lockout.',
    ],
    commonMistakes: ['Knees caving inward (valgus collapse)', 'Rising onto toes', 'Rounding back at bottom'],
    videoUrl: '',
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    targetMuscles: ['Quadriceps', 'Glutes', 'Adductors'],
    secondaryMuscles: ['Hamstrings'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: [
      'Sit in 45-degree leg press sled with back flat against pad.',
      'Place feet shoulder width in middle of sled platform.',
      'Release safety handles and lower carriage until knees bend to 90 degrees.',
      'Press through full foot back up without snapping knees into hyperextension.',
    ],
    commonMistakes: ['Locking knees hard at top', 'Lower back rounding off bottom of seat pad'],
    videoUrl: '',
  },
  {
    name: 'Romanian Deadlift',
    muscleGroup: 'Legs',
    targetMuscles: ['Hamstrings', 'Gluteus Maximus', 'Erector Spinae'],
    secondaryMuscles: ['Upper Back', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: [
      'Stand holding bar with overhand grip at hip level, knees softly unlocked (15 deg bend).',
      'Push hips straight backward toward wall behind you with flat spine.',
      'Lower bar along thighs until you feel intense stretch in hamstrings (around mid-shin).',
      'Drive hips forward to return to standing position squeezing glutes at top.',
    ],
    commonMistakes: ['Bending knees like a squat', 'Rounding spine to reach further down'],
    videoUrl: '',
  },
  {
    name: 'Leg Extension',
    muscleGroup: 'Legs',
    targetMuscles: ['Quadriceps (Rectus Femoris, Vastus Lateralis/Medialis)'],
    secondaryMuscles: ['None (isolated)'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: [
      'Adjust back pad so knees line up with machine pivot point.',
      'Place pad snug against lower shins just above ankles.',
      'Extend legs upward until legs are straight, squeezing quads for 1 second.',
      'Lower smoothly with controlled resistance.',
    ],
    commonMistakes: ['Kicking weight up using momentum', 'Seat positioned with knee off pivot point'],
    videoUrl: '',
  },
  {
    name: 'Leg Curl',
    muscleGroup: 'Legs',
    targetMuscles: ['Hamstrings (Biceps Femoris, Semitendinosus)'],
    secondaryMuscles: ['Gastrocnemius'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: [
      'Lie face down on lying leg curl bench with roller pad positioned just below calves.',
      'Hold side handles and pull heels toward glutes.',
      'Hold contraction for a beat, then slowly return to full extension.',
    ],
    commonMistakes: ['Lifting hips off bench during curl', 'Rushing the eccentric release'],
    videoUrl: '',
  },
  {
    name: 'Calf Raise',
    muscleGroup: 'Legs',
    targetMuscles: ['Gastrocnemius', 'Soleus'],
    secondaryMuscles: ['Tibialis Posterior'],
    equipment: 'Machine',
    difficulty: 'Beginner',
    instructions: [
      'Place balls of feet on edge of step with heels hanging off.',
      'Lower heels as deep as comfortably possible feeling calf stretch for 1 second.',
      'Explode upward onto tiptoes squeezing calves at peak height.',
      'Lower under 3-second control.',
    ],
    commonMistakes: ['Bouncing fast without pause at bottom', 'Short partial range of motion'],
    videoUrl: '',
  },
];

const demoUsers = [
  {
    name: 'Alex Turner (Demo)',
    username: 'demo_athlete',
    email: 'demo@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'Dedicated natural lifter. PPL 6 days/week. Tracking every rep to hit 140kg bench by winter.',
    isOnboarded: true,
    onboarding: {
      age: 26,
      height: 182,
      weight: 81.5,
      gender: 'Male',
      fitnessGoal: 'Muscle Gain',
      experienceLevel: 'Advanced',
      trainingDays: 6,
      preferredSplit: 'Push Pull Legs',
      availableEquipment: 'Commercial Gym',
    },
    stats: {
      totalWorkouts: 42,
      currentStreak: 12,
      longestStreak: 18,
      totalVolumeKg: 184500,
      prCount: 8,
    },
    isPro: true,
  },
  {
    name: 'Marcus Vance',
    username: 'marcus_vance',
    email: 'marcus.vance@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Competitive Powerlifter. S: 260kg | B: 180kg | D: 310kg. Consistency over hype.',
    isOnboarded: true,
    stats: { totalWorkouts: 84, currentStreak: 7, longestStreak: 21, totalVolumeKg: 420000, prCount: 15 },
    isPro: true,
  },
  {
    name: 'Sarah Chen',
    username: 'sarah_chen',
    email: 'sarah.chen@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    bio: 'Hybrid Athlete. Strength training + marathon prep. Reps don’t lie.',
    isOnboarded: true,
    stats: { totalWorkouts: 58, currentStreak: 14, longestStreak: 14, totalVolumeKg: 210000, prCount: 9 },
  },
  {
    name: 'David Miller',
    username: 'david_miller',
    email: 'david.miller@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Hypertrophy enthusiast & physique coach. High intensity, strict form.',
    isOnboarded: true,
    stats: { totalWorkouts: 65, currentStreak: 5, longestStreak: 19, totalVolumeKg: 310000, prCount: 11 },
  },
  {
    name: 'Elena Rostova',
    username: 'elena_lifts',
    email: 'elena.rostova@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Olympic weightlifter & squat enthusiast. Chasing that 150kg clean & jerk.',
    isOnboarded: true,
    stats: { totalWorkouts: 39, currentStreak: 4, longestStreak: 12, totalVolumeKg: 145000, prCount: 7 },
  },
  {
    name: 'Tyrone Brooks',
    username: 'tyrone_brooks',
    email: 'tyrone.brooks@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    bio: 'Heavy weighted calisthenics + barbell basics. Discipline is freedom.',
    isOnboarded: true,
    stats: { totalWorkouts: 50, currentStreak: 9, longestStreak: 15, totalVolumeKg: 198000, prCount: 6 },
  },
  {
    name: 'Chloe Bennett',
    username: 'chloe_fit',
    email: 'chloe.bennett@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Pushing past limits every single morning at 6 AM. Glutes & Back focus.',
    isOnboarded: true,
    stats: { totalWorkouts: 33, currentStreak: 3, longestStreak: 10, totalVolumeKg: 95000, prCount: 4 },
  },
  {
    name: 'Vikram Malhotra',
    username: 'vikram_m',
    email: 'vikram.malhotra@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    bio: 'Bodybuilding prep. 100% focused on mind-muscle connection and progressive overload.',
    isOnboarded: true,
    stats: { totalWorkouts: 72, currentStreak: 11, longestStreak: 25, totalVolumeKg: 340000, prCount: 14 },
    isPro: true,
  },
  {
    name: 'Maya Patel',
    username: 'maya_strength',
    email: 'maya.patel@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    bio: 'Strength coach & movement specialist. Lift heavy, recover smart.',
    isOnboarded: true,
    stats: { totalWorkouts: 45, currentStreak: 6, longestStreak: 16, totalVolumeKg: 165000, prCount: 8 },
  },
  {
    name: 'Jordan Reed',
    username: 'jordan_reed',
    email: 'jordan.reed@repx.com',
    password: 'demo123456',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
    bio: 'Powerbuilding athlete. Big 3 numbers + aesthetics. REPX community member.',
    isOnboarded: true,
    stats: { totalWorkouts: 28, currentStreak: 2, longestStreak: 8, totalVolumeKg: 110000, prCount: 5 },
  },
];

export const seedDatabase = async () => {
  try {
    console.log('--- REPX DATABASE SEED INITIALIZING ---');
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log('Connected to MongoDB for seeding.');

    // Clear existing collections
    await User.deleteMany({});
    await Exercise.deleteMany({});
    await Workout.deleteMany({});
    await WorkoutSession.deleteMany({});
    await WorkoutSet.deleteMany({});
    await Split.deleteMany({});
    await Measurement.deleteMany({});
    await PersonalRecord.deleteMany({});
    await Follow.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Subscription.deleteMany({});

    console.log('Previous database collections cleared.');

    // 1. Insert Exercises
    const insertedExercises = await Exercise.insertMany(exercisesData);
    console.log(`Inserted ${insertedExercises.length} standard exercises.`);

    // Map exercises by name for easy reference
    const exMap = {};
    insertedExercises.forEach((e) => {
      exMap[e.name] = e;
    });

    // 2. Insert Users
    const insertedUsers = [];
    for (const u of demoUsers) {
      const userDoc = new User(u);
      await userDoc.save(); // triggers bcrypt hash
      insertedUsers.push(userDoc);
    }
    console.log(`Inserted ${insertedUsers.length} athletes. Demo user: demo@repx.com / demo123456`);

    const demoUser = insertedUsers[0];

    // 3. Create Pro Subscription for Demo User
    await Subscription.create({
      user: demoUser._id,
      plan: 'REPX PRO',
      price: 199,
      currency: 'INR',
      billingCycle: 'monthly',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentMethod: 'UPI (demo@repx)',
    });

    // 4. Create Standard Workout Routines
    const pushWorkout = await Workout.create({
      name: 'PUSH DAY (Chest • Shoulders • Triceps)',
      description: 'Heavy compound pressing followed by isolated lateral and tricep hypertrophy.',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      difficulty: 'Intermediate',
      estimatedDurationMinutes: 65,
      isTemplate: true,
      user: demoUser._id,
      exercises: [
        {
          exercise: exMap['Bench Press']._id,
          exerciseName: 'Bench Press',
          muscleGroup: 'Chest',
          order: 1,
          defaultSets: [
            { setNumber: 1, targetWeight: 60, targetReps: 10, isWarmup: true },
            { setNumber: 2, targetWeight: 80, targetReps: 8 },
            { setNumber: 3, targetWeight: 90, targetReps: 6 },
            { setNumber: 4, targetWeight: 100, targetReps: 5 },
          ],
        },
        {
          exercise: exMap['Incline Dumbbell Press']._id,
          exerciseName: 'Incline Dumbbell Press',
          muscleGroup: 'Chest',
          order: 2,
          defaultSets: [
            { setNumber: 1, targetWeight: 32, targetReps: 10 },
            { setNumber: 2, targetWeight: 36, targetReps: 8 },
            { setNumber: 3, targetWeight: 36, targetReps: 8 },
          ],
        },
        {
          exercise: exMap['Dips']._id,
          exerciseName: 'Dips',
          muscleGroup: 'Chest',
          order: 3,
          defaultSets: [
            { setNumber: 1, targetWeight: 20, targetReps: 10 },
            { setNumber: 2, targetWeight: 25, targetReps: 8 },
            { setNumber: 3, targetWeight: 25, targetReps: 8 },
          ],
        },
        {
          exercise: exMap['Cable Fly']._id,
          exerciseName: 'Cable Fly',
          muscleGroup: 'Chest',
          order: 4,
          defaultSets: [
            { setNumber: 1, targetWeight: 15, targetReps: 12 },
            { setNumber: 2, targetWeight: 17.5, targetReps: 12 },
            { setNumber: 3, targetWeight: 17.5, targetReps: 10 },
          ],
        },
        {
          exercise: exMap['Lateral Raise']._id,
          exerciseName: 'Lateral Raise',
          muscleGroup: 'Shoulders',
          order: 5,
          defaultSets: [
            { setNumber: 1, targetWeight: 12, targetReps: 15 },
            { setNumber: 2, targetWeight: 14, targetReps: 12 },
            { setNumber: 3, targetWeight: 14, targetReps: 12 },
          ],
        },
        {
          exercise: exMap['Triceps Pushdown']._id,
          exerciseName: 'Triceps Pushdown',
          muscleGroup: 'Triceps',
          order: 6,
          defaultSets: [
            { setNumber: 1, targetWeight: 35, targetReps: 12 },
            { setNumber: 2, targetWeight: 40, targetReps: 10 },
            { setNumber: 3, targetWeight: 40, targetReps: 10 },
          ],
        },
      ],
    });

    const pullWorkout = await Workout.create({
      name: 'PULL DAY (Back • Biceps • Rear Delts)',
      description: 'Vertical and horizontal pulling with heavy rows, deadlifts, and arm work.',
      targetMuscles: ['Back', 'Biceps', 'Shoulders'],
      difficulty: 'Intermediate',
      estimatedDurationMinutes: 60,
      isTemplate: true,
      user: demoUser._id,
      exercises: [
        {
          exercise: exMap['Deadlift']._id,
          exerciseName: 'Deadlift',
          muscleGroup: 'Back',
          order: 1,
          defaultSets: [
            { setNumber: 1, targetWeight: 100, targetReps: 8, isWarmup: true },
            { setNumber: 2, targetWeight: 140, targetReps: 5 },
            { setNumber: 3, targetWeight: 160, targetReps: 5 },
            { setNumber: 4, targetWeight: 180, targetReps: 3 },
          ],
        },
        {
          exercise: exMap['Pull Ups']._id,
          exerciseName: 'Pull Ups',
          muscleGroup: 'Back',
          order: 2,
          defaultSets: [
            { setNumber: 1, targetWeight: 0, targetReps: 12 },
            { setNumber: 2, targetWeight: 10, targetReps: 8 },
            { setNumber: 3, targetWeight: 10, targetReps: 8 },
          ],
        },
        {
          exercise: exMap['Barbell Row']._id,
          exerciseName: 'Barbell Row',
          muscleGroup: 'Back',
          order: 3,
          defaultSets: [
            { setNumber: 1, targetWeight: 70, targetReps: 10 },
            { setNumber: 2, targetWeight: 80, targetReps: 8 },
            { setNumber: 3, targetWeight: 90, targetReps: 6 },
          ],
        },
        {
          exercise: exMap['Face Pull']._id,
          exerciseName: 'Face Pull',
          muscleGroup: 'Shoulders',
          order: 4,
          defaultSets: [
            { setNumber: 1, targetWeight: 25, targetReps: 15 },
            { setNumber: 2, targetWeight: 30, targetReps: 15 },
          ],
        },
        {
          exercise: exMap['Barbell Curl']._id,
          exerciseName: 'Barbell Curl',
          muscleGroup: 'Biceps',
          order: 5,
          defaultSets: [
            { setNumber: 1, targetWeight: 35, targetReps: 10 },
            { setNumber: 2, targetWeight: 40, targetReps: 8 },
            { setNumber: 3, targetWeight: 45, targetReps: 6 },
          ],
        },
      ],
    });

    const legsWorkout = await Workout.create({
      name: 'LEG DAY (Quads • Hamstrings • Calves)',
      description: 'Heavy squats, Romanian deadlifts, and high-volume quad and calf isolation.',
      targetMuscles: ['Legs'],
      difficulty: 'Advanced',
      estimatedDurationMinutes: 70,
      isTemplate: true,
      user: demoUser._id,
      exercises: [
        {
          exercise: exMap['Squat']._id,
          exerciseName: 'Squat',
          muscleGroup: 'Legs',
          order: 1,
          defaultSets: [
            { setNumber: 1, targetWeight: 80, targetReps: 8, isWarmup: true },
            { setNumber: 2, targetWeight: 110, targetReps: 6 },
            { setNumber: 3, targetWeight: 130, targetReps: 5 },
            { setNumber: 4, targetWeight: 140, targetReps: 4 },
          ],
        },
        {
          exercise: exMap['Romanian Deadlift']._id,
          exerciseName: 'Romanian Deadlift',
          muscleGroup: 'Legs',
          order: 2,
          defaultSets: [
            { setNumber: 1, targetWeight: 90, targetReps: 10 },
            { setNumber: 2, targetWeight: 110, targetReps: 8 },
            { setNumber: 3, targetWeight: 110, targetReps: 8 },
          ],
        },
        {
          exercise: exMap['Leg Press']._id,
          exerciseName: 'Leg Press',
          muscleGroup: 'Legs',
          order: 3,
          defaultSets: [
            { setNumber: 1, targetWeight: 200, targetReps: 12 },
            { setNumber: 2, targetWeight: 240, targetReps: 10 },
            { setNumber: 3, targetWeight: 260, targetReps: 10 },
          ],
        },
        {
          exercise: exMap['Calf Raise']._id,
          exerciseName: 'Calf Raise',
          muscleGroup: 'Legs',
          order: 4,
          defaultSets: [
            { setNumber: 1, targetWeight: 70, targetReps: 15 },
            { setNumber: 2, targetWeight: 80, targetReps: 12 },
            { setNumber: 3, targetWeight: 80, targetReps: 12 },
          ],
        },
      ],
    });

    console.log('Inserted workout templates: Push, Pull, Legs.');

    // 5. Create All 10 Workout Splits
    for (let i = 0; i < allSplitsData.length; i++) {
      const splitInfo = allSplitsData[i];
      const enrichedDays = splitInfo.days.map((d) => {
        let matchedWorkout = null;
        if (!d.isRestDay) {
          const title = d.title.toLowerCase();
          if (title.includes('push') && pushWorkout) matchedWorkout = pushWorkout._id;
          else if (title.includes('pull') && pullWorkout) matchedWorkout = pullWorkout._id;
          else if (title.includes('leg') && legsWorkout) matchedWorkout = legsWorkout._id;
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
        user: demoUser._id,
        name: splitInfo.name,
        description: splitInfo.description,
        isActive: i === 0,
        isTemplate: true,
        days: enrichedDays,
      });
    }
    console.log(`Inserted all ${allSplitsData.length} workout split templates.`);

    // 6. Seed Past Workout Sessions for Demo User (over past 30 days)
    const sessionHistoryConfigs = [
      { daysAgo: 26, name: 'Leg Day', workout: legsWorkout, vol: 8100, dur: 3800 },
      { daysAgo: 24, name: 'Push Day', workout: pushWorkout, vol: 7200, dur: 3600 },
      { daysAgo: 22, name: 'Pull Day', workout: pullWorkout, vol: 8400, dur: 3500 },
      { daysAgo: 19, name: 'Push Day', workout: pushWorkout, vol: 7600, dur: 3700 },
      { daysAgo: 17, name: 'Leg Day', workout: legsWorkout, vol: 8800, dur: 3900 },
      { daysAgo: 15, name: 'Pull Day', workout: pullWorkout, vol: 8900, dur: 3650 },
      { daysAgo: 12, name: 'Push Day', workout: pushWorkout, vol: 8100, dur: 3750 },
      { daysAgo: 9, name: 'Leg Day', workout: legsWorkout, vol: 9200, dur: 4000 },
      { daysAgo: 7, name: 'Pull Day', workout: pullWorkout, vol: 9400, dur: 3800 },
      { daysAgo: 5, name: 'Push Day', workout: pushWorkout, vol: 8700, dur: 3900 },
      { daysAgo: 3, name: 'Leg Day', workout: legsWorkout, vol: 9600, dur: 4100 },
      { daysAgo: 1, name: 'Push Day Hypertrophy', workout: pushWorkout, vol: 9150, dur: 4200 },
    ];

    let lastSession = null;
    for (const cfg of sessionHistoryConfigs) {
      const sessDate = new Date();
      sessDate.setDate(sessDate.getDate() - cfg.daysAgo);

      const sess = await WorkoutSession.create({
        user: demoUser._id,
        workout: cfg.workout._id,
        workoutName: cfg.name,
        startTime: new Date(sessDate.getTime() - cfg.dur * 1000),
        endTime: sessDate,
        durationSeconds: cfg.dur,
        status: 'completed',
        totalVolumeKg: cfg.vol,
        totalSets: 18,
        totalReps: 160,
        exercises: [
          {
            exercise: exMap['Bench Press']._id,
            exerciseName: 'Bench Press',
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, weightKg: 70, reps: 10, isCompleted: true },
              { setNumber: 2, weightKg: 85, reps: 8, isCompleted: true },
              { setNumber: 3, weightKg: 95, reps: 6, isCompleted: true },
              { setNumber: 4, weightKg: 100, reps: 5, isCompleted: true, isPR: true },
            ],
          },
          {
            exercise: exMap['Incline Dumbbell Press']._id,
            exerciseName: 'Incline Dumbbell Press',
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, weightKg: 32, reps: 10, isCompleted: true },
              { setNumber: 2, weightKg: 36, reps: 8, isCompleted: true },
              { setNumber: 3, weightKg: 36, reps: 8, isCompleted: true },
            ],
          },
        ],
        rating: 5,
        notes: 'Incredible mind-muscle connection. Hit 100kg bench cleanly for 5 reps!',
        createdAt: sessDate,
        updatedAt: sessDate,
      });

      lastSession = sess;

      // Seed WorkoutSets for Big 3 analytics
      await WorkoutSet.create({
        user: demoUser._id,
        session: sess._id,
        exercise: exMap['Bench Press']._id,
        exerciseName: 'Bench Press',
        muscleGroup: 'Chest',
        setNumber: 4,
        weightKg: Math.round(85 + (30 - cfg.daysAgo) * 0.5),
        reps: 5,
        volumeKg: Math.round(85 + (30 - cfg.daysAgo) * 0.5) * 5,
        estimated1RM: Math.round((85 + (30 - cfg.daysAgo) * 0.5) * (1 + 5 / 30)),
        isCompleted: true,
        completedAt: sessDate,
      });

      await WorkoutSet.create({
        user: demoUser._id,
        session: sess._id,
        exercise: exMap['Squat']._id,
        exerciseName: 'Squat',
        muscleGroup: 'Legs',
        setNumber: 3,
        weightKg: Math.round(120 + (30 - cfg.daysAgo) * 0.7),
        reps: 5,
        volumeKg: Math.round(120 + (30 - cfg.daysAgo) * 0.7) * 5,
        estimated1RM: Math.round((120 + (30 - cfg.daysAgo) * 0.7) * (1 + 5 / 30)),
        isCompleted: true,
        completedAt: sessDate,
      });

      await WorkoutSet.create({
        user: demoUser._id,
        session: sess._id,
        exercise: exMap['Deadlift']._id,
        exerciseName: 'Deadlift',
        muscleGroup: 'Back',
        setNumber: 4,
        weightKg: Math.round(155 + (30 - cfg.daysAgo) * 0.9),
        reps: 3,
        volumeKg: Math.round(155 + (30 - cfg.daysAgo) * 0.9) * 3,
        estimated1RM: Math.round((155 + (30 - cfg.daysAgo) * 0.9) * (1 + 3 / 30)),
        isCompleted: true,
        completedAt: sessDate,
      });
    }

    console.log(`Inserted ${sessionHistoryConfigs.length} workout sessions with time-series sets.`);

    // 7. Seed Personal Records for demoUser
    const prSeeds = [
      { ex: 'Bench Press', cat: 'Chest', weight: 100, reps: 5, est1RM: 116.7, vol: 500 },
      { ex: 'Squat', cat: 'Legs', weight: 140, reps: 4, est1RM: 158.7, vol: 560 },
      { ex: 'Deadlift', cat: 'Back', weight: 180, reps: 3, est1RM: 198.0, vol: 540 },
      { ex: 'Overhead Press', cat: 'Shoulders', weight: 65, reps: 5, est1RM: 75.8, vol: 325 },
      { ex: 'Barbell Row', cat: 'Back', weight: 90, reps: 6, est1RM: 108.0, vol: 540 },
      { ex: 'Barbell Curl', cat: 'Biceps', weight: 45, reps: 6, est1RM: 54.0, vol: 270 },
      { ex: 'Triceps Pushdown', cat: 'Triceps', weight: 42.5, reps: 10, est1RM: 56.6, vol: 425 },
      { ex: 'Incline Dumbbell Press', cat: 'Chest', weight: 36, reps: 8, est1RM: 45.6, vol: 288 },
    ];

    for (const pr of prSeeds) {
      if (exMap[pr.ex]) {
        await PersonalRecord.create({
          user: demoUser._id,
          exercise: exMap[pr.ex]._id,
          exerciseName: pr.ex,
          category: pr.cat,
          maxWeightKg: pr.weight,
          maxRepsAtMaxWeight: pr.reps,
          best1RM: pr.est1RM,
          bestSetVolumeKg: pr.vol,
          achievedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 86400000),
          history: [
            {
              weightKg: pr.weight,
              reps: pr.reps,
              estimated1RM: pr.est1RM,
              date: new Date(),
              session: lastSession?._id,
            },
          ],
        });
      }
    }
    console.log(`Inserted ${prSeeds.length} Personal Records.`);

    // 8. Seed Body Measurements for demoUser (Weekly tracking - Strictly NO body fat %)
    const measurementWeeks = [
      { daysAgo: 60, weight: 84.2, chest: 104, arms: 37.0, waist: 86.5, thighs: 61.0, calves: 38.0, shoulders: 122 },
      { daysAgo: 45, weight: 83.5, chest: 104.5, arms: 37.2, waist: 85.0, thighs: 61.2, calves: 38.0, shoulders: 122.5 },
      { daysAgo: 30, weight: 82.8, chest: 105.0, arms: 37.6, waist: 84.0, thighs: 61.5, calves: 38.2, shoulders: 123 },
      { daysAgo: 15, weight: 82.1, chest: 105.8, arms: 38.0, waist: 83.2, thighs: 62.0, calves: 38.5, shoulders: 124 },
      { daysAgo: 1, weight: 81.5, chest: 106.2, arms: 38.5, waist: 82.0, thighs: 62.5, calves: 38.5, shoulders: 125 },
    ];

    for (const m of measurementWeeks) {
      const d = new Date();
      d.setDate(d.getDate() - m.daysAgo);
      await Measurement.create({
        user: demoUser._id,
        date: d,
        weightKg: m.weight,
        chestCm: m.chest,
        armsCm: m.arms,
        waistCm: m.waist,
        thighsCm: m.thighs,
        calvesCm: m.calves,
        shouldersCm: m.shoulders,
        notes: `Weekly check-in. Waist dropped while chest and arms grew!`,
      });
    }
    console.log(`Inserted ${measurementWeeks.length} body measurement records.`);

    // 9. Follow relationships
    // Make demoUser follow Marcus, Sarah, Vikram
    await Follow.create({ follower: demoUser._id, following: insertedUsers[1]._id });
    await Follow.create({ follower: demoUser._id, following: insertedUsers[2]._id });
    await Follow.create({ follower: demoUser._id, following: insertedUsers[7]._id });

    // Make others follow demoUser
    await Follow.create({ follower: insertedUsers[1]._id, following: demoUser._id });
    await Follow.create({ follower: insertedUsers[2]._id, following: demoUser._id });
    await Follow.create({ follower: insertedUsers[3]._id, following: demoUser._id });
    await Follow.create({ follower: insertedUsers[4]._id, following: demoUser._id });
    await Follow.create({ follower: insertedUsers[5]._id, following: demoUser._id });

    // 10. Social Posts & Community Feed
    const post1 = await Post.create({
      user: demoUser._id,
      content: '🔥 Hit a milestone today! 100 KG on Bench Press for 5 clean reps with a 1-second chest pause. Hard work is paying off with REPX.',
      type: 'pr',
      workoutSession: lastSession?._id,
      workoutSummary: {
        workoutName: 'Push Day Hypertrophy',
        durationMinutes: 70,
        totalVolumeKg: 9150,
        prsCount: 1,
        exercisesCount: 6,
        setsCount: 18,
        highlights: ['Bench Press: 100 KG × 5 reps (NEW PR)', 'Incline DB: 36 KG × 8 reps'],
      },
      likes: [insertedUsers[1]._id, insertedUsers[2]._id, insertedUsers[7]._id],
      commentsCount: 2,
    });

    const post2 = await Post.create({
      user: insertedUsers[1]._id, // Marcus Vance
      content: 'Heavy deadlift session. Worked up to 300 KG for a smooth single, followed by 5x3 at 260 KG. Grip felt like steel today. Next stop: 320 KG at nationals.',
      type: 'workout',
      workoutSummary: {
        workoutName: 'Heavy Deadlift & Pull',
        durationMinutes: 85,
        totalVolumeKg: 14200,
        prsCount: 0,
        exercisesCount: 5,
        setsCount: 16,
        highlights: ['Deadlift: 300 KG × 1 rep', 'Barbell Row: 140 KG × 6 reps'],
      },
      likes: [demoUser._id, insertedUsers[3]._id, insertedUsers[4]._id],
      commentsCount: 1,
    });

    const post3 = await Post.create({
      user: insertedUsers[2]._id, // Sarah Chen
      content: 'Completed Leg Day at 6:30 AM before my 10km run. Consistency over perfection. Remember to stay hydrated and protect your rest days! ⚡',
      type: 'general',
      likes: [demoUser._id, insertedUsers[1]._id],
      commentsCount: 1,
    });

    // Seed comments
    await Comment.create({
      post: post1._id,
      user: insertedUsers[1]._id,
      text: 'Huge milestone Alex! The form looked locked in. 120kg is right around the corner.',
    });

    await Comment.create({
      post: post1._id,
      user: insertedUsers[2]._id,
      text: 'Insane power! Great chest arch and leg drive.',
    });

    await Comment.create({
      post: post2._id,
      user: demoUser._id,
      text: '300kg looked like a warmup Marcus! Monster strength.',
    });

    await Comment.create({
      post: post3._id,
      user: demoUser._id,
      text: 'Legs and a 10km run is serious discipline Sarah!',
    });

    // 11. Seed Notifications for Demo User
    await Notification.create({
      recipient: demoUser._id,
      sender: insertedUsers[1]._id,
      type: 'pr',
      title: '🔥 New Personal Record Smashed!',
      message: 'You hit a new PR on Bench Press: 100 KG × 5 reps (Est 1RM: 116.7 KG)!',
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: insertedUsers[1]._id,
      type: 'like',
      title: '❤️ Workout Liked',
      message: 'Marcus Vance liked your Push Day Hypertrophy workout update.',
      entityId: post1._id,
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: insertedUsers[1]._id,
      type: 'comment',
      title: '💬 New Comment',
      message: 'Marcus Vance commented on your post: "Huge milestone Alex! The form looked locked in."',
      entityId: post1._id,
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: insertedUsers[3]._id,
      type: 'follower',
      title: '👥 New Follower',
      message: 'David Miller started following your training journey on REPX!',
      entityId: insertedUsers[3]._id,
    });

    await Notification.create({
      recipient: demoUser._id,
      type: 'reminder',
      title: '🏋️ Time to Train!',
      message: "Ready for today's session? PUSH DAY is lined up on your schedule.",
    });

    console.log('Inserted social feed, comments, and notifications.');
    console.log('====================================');
    console.log('✅ REPX DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Login: demo@repx.com / demo123456');
    console.log('====================================');

    process.exit(0);
  } catch (err) {
    console.error('Error during database seed:', err);
    process.exit(1);
  }
};

seedDatabase();
