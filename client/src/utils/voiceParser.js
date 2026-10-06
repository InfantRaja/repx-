/**
 * Voice Command and Fitness Logging Parser for REPX
 * Converts natural speech into either navigation actions or workout set logs.
 */

// Known standard exercises for fuzzy matching and normalization
export const KNOWN_EXERCISES = [
  { match: ['bench press', 'bench', 'flat bench'], canonical: 'Bench Press' },
  { match: ['incline bench press', 'incline bench', 'incline press'], canonical: 'Incline Bench Press' },
  { match: ['dumbbell press', 'flat dumbbell press'], canonical: 'Dumbbell Press' },
  { match: ['incline dumbbell press', 'incline dumbbell'], canonical: 'Incline Dumbbell Press' },
  { match: ['barbell squat', 'squat', 'squats', 'back squat'], canonical: 'Barbell Squat' },
  { match: ['front squat'], canonical: 'Front Squat' },
  { match: ['deadlift', 'deadlifts', 'conventional deadlift'], canonical: 'Deadlift' },
  { match: ['romanian deadlift', 'rdl'], canonical: 'Romanian Deadlift' },
  { match: ['lat pulldown', 'lat pull down', 'lat pull'], canonical: 'Lat Pulldown' },
  { match: ['pull up', 'pullups', 'pull ups', 'pull-up', 'pull-ups'], canonical: 'Pull-up' },
  { match: ['barbell row', 'bent over row', 'bent-over row'], canonical: 'Barbell Row' },
  { match: ['cable row', 'seated cable row', 'seated row'], canonical: 'Cable Row' },
  { match: ['overhead press', 'shoulder press', 'military press', 'ohp'], canonical: 'Overhead Press' },
  { match: ['dumbbell shoulder press', 'seated dumbbell press'], canonical: 'Dumbbell Shoulder Press' },
  { match: ['lateral raise', 'lateral raises', 'side lateral raise'], canonical: 'Lateral Raise' },
  { match: ['bicep curl', 'bicep curls', 'barbell curl', 'barbell curls'], canonical: 'Barbell Bicep Curl' },
  { match: ['dumbbell curl', 'dumbbell curls', 'bicep dumbbell curl'], canonical: 'Dumbbell Curl' },
  { match: ['hammer curl', 'hammer curls'], canonical: 'Hammer Curl' },
  { match: ['tricep pushdown', 'cable pushdown', 'tricep extension'], canonical: 'Tricep Pushdown' },
  { match: ['skull crusher', 'skull crushers', 'lying tricep extension'], canonical: 'Skull Crusher' },
  { match: ['dips', 'tricep dips', 'parallel dips'], canonical: 'Dips' },
  { match: ['leg press', 'leg presses'], canonical: 'Leg Press' },
  { match: ['leg extension', 'leg extensions', 'quad extension'], canonical: 'Leg Extension' },
  { match: ['leg curl', 'lying leg curl', 'hamstring curl'], canonical: 'Leg Curl' },
  { match: ['calf raise', 'standing calf raise', 'calf raises'], canonical: 'Calf Raise' },
  { match: ['plank', 'plank hold'], canonical: 'Plank' },
  { match: ['hanging leg raise', 'leg raises'], canonical: 'Hanging Leg Raise' }
];

/**
 * Extracts exercise name from spoken text
 */
export function extractExercise(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  for (const item of KNOWN_EXERCISES) {
    for (const phrase of item.match) {
      if (lower.includes(phrase)) {
        return {
          name: item.canonical,
          matchedPhrase: phrase
        };
      }
    }
  }

  // Fallback: extract text before "sets" or "kg" or "reps"
  const prefixMatch = lower.match(/^(.*?)(?:\s+\d+\s*(?:sets?|reps?|kg|kilos?|pounds?|lbs?))/i);
  if (prefixMatch && prefixMatch[1].trim()) {
    const raw = prefixMatch[1].trim().replace(/^(open|show|start|log|record|do|add)\s+/i, '');
    if (raw.length > 2) {
      const capitalized = raw
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return { name: capitalized, matchedPhrase: raw };
    }
  }

  return null;
}

/**
 * Parses spoken text to determine if it is a Workout Logging Command
 * e.g., "4 sets 10 reps 80 kg"
 *       "3 sets 12 reps 20 kg bicep curls"
 *       "Bench press 4 sets 10 reps 80 kg"
 *       "100 kg 5 reps"
 *       "Squat 120 kg 5 reps"
 */
export function parseWorkoutLog(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  // Extract Sets (e.g. "4 sets", "3 set", "set 4")
  let sets = 1;
  const setsRegex = /(\d+)\s*(?:sets?)/i;
  const setsMatch = lower.match(setsRegex);
  if (setsMatch) {
    sets = parseInt(setsMatch[1], 10);
  }

  // Extract Reps (e.g. "10 reps", "12 rep", "10 repetitions", "10 times")
  let reps = null;
  const repsRegex = /(\d+)\s*(?:reps?|repetitions?|times?)/i;
  const repsMatch = lower.match(repsRegex);
  if (repsMatch) {
    reps = parseInt(repsMatch[1], 10);
  }

  // Extract Weight (e.g. "80 kg", "80 kgs", "80 kilos", "80 kilograms", "80 pounds", "80 lbs")
  let weight = null;
  const weightRegex = /(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilos?|kilograms?|pounds?|lbs?)/i;
  const weightMatch = lower.match(weightRegex);
  if (weightMatch) {
    weight = parseFloat(weightMatch[1]);
  }

  // Fallback patterns: e.g. "80 for 10" or "80 by 10" (weight by reps)
  if (weight === null && reps === null) {
    const byMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:by|x|\*)\s*(\d+)/i);
    if (byMatch) {
      weight = parseFloat(byMatch[1]);
      reps = parseInt(byMatch[2], 10);
    }
  }

  // Trailing numbers fallback: "Bench press 80 10"
  if (weight === null && reps === null) {
    const trailingTwoNumbers = lower.match(/(\d+(?:\.\d+)?)\s+(\d+)\s*$/);
    if (trailingTwoNumbers) {
      weight = parseFloat(trailingTwoNumbers[1]);
      reps = parseInt(trailingTwoNumbers[2], 10);
    }
  }

  // Exercise extraction
  const exerciseInfo = extractExercise(lower);

  // If we parsed at least sets and reps, or weight and reps, or exercise and (weight or reps)
  if ((reps !== null && weight !== null) || (exerciseInfo && (reps !== null || weight !== null)) || (sets > 1 && reps !== null)) {
    return {
      type: 'WORKOUT_LOG',
      exercise: exerciseInfo ? exerciseInfo.name : null,
      sets: sets || 1,
      reps: reps || 10,
      weightKg: weight !== null ? weight : 0,
      rawText: cleaned,
      formattedSummary: `${exerciseInfo ? exerciseInfo.name + ' — ' : ''}${sets} ${sets === 1 ? 'set' : 'sets'} × ${reps || 10} reps @ ${weight !== null ? weight : 0} kg`
    };
  }

  return null;
}

/**
 * Parses spoken text for Navigation & Control commands
 */
export function parseVoiceCommand(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase().trim();

  // 1. Check if it is a Workout Logging Command first
  const logMatch = parseWorkoutLog(text);
  if (logMatch) {
    return logMatch;
  }

  // 2. Navigation Commands

  // AI Coach & Doubt Assistant
  if (
    lower.includes('ai coach') ||
    lower.includes('open coach') ||
    lower.includes('ask coach') ||
    lower.includes('open ai') ||
    lower.includes('ai assistant') ||
    lower.includes('chat box') ||
    lower.includes('ask doubt') ||
    lower.includes('doubts') ||
    lower === 'coach'
  ) {
    return { type: 'NAVIGATE', path: '/coach', description: 'Opening REPX AI Coach & Doubt Assistant' };
  }

  // Workouts Navigation
  if (
    lower.includes('show my workouts') ||
    lower.includes('show workouts') ||
    lower.includes('open workouts') ||
    lower.includes('my workouts') ||
    lower === 'workouts'
  ) {
    return { type: 'NAVIGATE', path: '/workouts', description: 'Opening Workout Routines' };
  }

  // Specific Workouts
  if (lower.includes('push workout') || lower.includes('push day') || lower.includes('open push')) {
    return { type: 'NAVIGATE_WORKOUT', workoutFilter: 'Push', path: '/workouts', description: 'Opening Push Workout' };
  }

  if (lower.includes('pull workout') || lower.includes('pull day') || lower.includes('open pull')) {
    return { type: 'NAVIGATE_WORKOUT', workoutFilter: 'Pull', path: '/workouts', description: 'Opening Pull Workout' };
  }

  if (lower.includes('leg workout') || lower.includes('leg day') || lower.includes('legs workout') || lower.includes('open leg')) {
    return { type: 'NAVIGATE_WORKOUT', workoutFilter: 'Legs', path: '/workouts', description: 'Opening Leg Workout' };
  }

  // Start workout session
  if (
    lower.includes('start workout') ||
    lower.includes('start push day') ||
    lower.includes('begin workout') ||
    lower.includes('active workout') ||
    lower.includes('resume workout') ||
    lower.includes('workout session')
  ) {
    return { type: 'START_WORKOUT', path: '/workout/session', description: 'Starting Gym Workout Session' };
  }

  // Exercises
  if (
    lower.includes('show exercises') ||
    lower.includes('open exercises') ||
    lower.includes('exercise library') ||
    lower.includes('browse exercises') ||
    lower === 'exercises'
  ) {
    return { type: 'NAVIGATE', path: '/exercises', description: 'Opening Exercise Encyclopedia' };
  }

  // Split Builder
  if (lower.includes('split') || lower.includes('splits') || lower.includes('split builder') || lower.includes('custom split')) {
    return { type: 'NAVIGATE', path: '/splits', description: 'Opening Workout Split Builder' };
  }

  // Dashboard
  if (
    lower.includes('show my dashboard') ||
    lower.includes('show dashboard') ||
    lower.includes('open dashboard') ||
    lower.includes('my dashboard') ||
    lower === 'dashboard' ||
    lower === 'home'
  ) {
    return { type: 'NAVIGATE', path: '/dashboard', description: 'Opening Dashboard' };
  }

  // Profile
  if (lower.includes('show my profile') || lower.includes('open profile') || lower.includes('my profile') || lower === 'profile') {
    return { type: 'NAVIGATE', path: '/profile', description: 'Opening Athlete Profile' };
  }

  // Progress / Analytics / PRs
  if (lower.includes('personal records') || lower.includes('prs') || lower.includes('records')) {
    return { type: 'NAVIGATE', path: '/progress/prs', description: 'Opening Personal Records' };
  }
  if (lower.includes('progress') || lower.includes('analytics') || lower.includes('charts')) {
    return { type: 'NAVIGATE', path: '/progress', description: 'Opening Strength Analytics' };
  }

  // Measurements
  if (lower.includes('measurements') || lower.includes('body weight') || lower.includes('body measurements')) {
    return { type: 'NAVIGATE', path: '/measurements', description: 'Opening Body Measurements' };
  }

  // Social Feed & Friends
  if (lower.includes('social feed') || lower.includes('feed') || lower.includes('community')) {
    return { type: 'NAVIGATE', path: '/feed', description: 'Opening Social Feed' };
  }
  if (lower.includes('friends') || lower.includes('athletes')) {
    return { type: 'NAVIGATE', path: '/friends', description: 'Opening Athletes & Friends' };
  }

  // Change Password & Settings
  if (
    lower.includes('change password') ||
    lower.includes('update password') ||
    lower.includes('reset password') ||
    lower.includes('settings')
  ) {
    return { type: 'NAVIGATE', path: '/settings', description: 'Opening Settings & Password Management' };
  }

  // Logout
  if (lower.includes('logout') || lower.includes('log out') || lower.includes('sign out')) {
    return { type: 'LOGOUT', description: 'Logging out of REPX...' };
  }

  return null;
}
