const API_URL = 'http://localhost:4000/api';

async function testVoice() {
  console.log('========================================================');
  console.log('REPX - VOICE FEATURE AUTOMATED TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // Import voice parser module
  const { parseWorkoutLog, parseVoiceCommand } = await import('./client/src/utils/voiceParser.js');

  // TEST 1: Workout Voice Logging Parsing
  console.log('--- 1. Natural Language Voice Logging Parsing ---');
  
  const benchLog = parseWorkoutLog('Bench press 70 kilos 5 reps');
  assert(benchLog && benchLog.exercise === 'Bench Press' && benchLog.weight === 70 && benchLog.reps === 5,
    'Parses "Bench press 70 kilos 5 reps" -> Bench Press, 70 kg, 5 reps');

  const squatLog = parseWorkoutLog('Squat 100 kilos 5 reps');
  assert(squatLog && squatLog.exercise === 'Barbell Squat' && squatLog.weight === 100 && squatLog.reps === 5,
    'Parses "Squat 100 kilos 5 reps" -> Barbell Squat, 100 kg, 5 reps');

  const latLog = parseWorkoutLog('Lat pulldown 50 kilos 10 reps');
  assert(latLog && latLog.exercise === 'Lat Pulldown' && latLog.weight === 50 && latLog.reps === 10,
    'Parses "Lat pulldown 50 kilos 10 reps" -> Lat Pulldown, 50 kg, 10 reps');

  // TEST 2: Voice Navigation Commands
  console.log('\n--- 2. Voice Navigation Commands ---');

  const cmdWorkouts = parseVoiceCommand('Show my workouts');
  assert(cmdWorkouts && cmdWorkouts.type === 'NAVIGATE' && cmdWorkouts.path === '/user/workouts',
    'Recognizes "Show my workouts" -> /user/workouts');

  const cmdExercises = parseVoiceCommand('Show exercises');
  assert(cmdExercises && cmdExercises.type === 'NAVIGATE' && cmdExercises.path === '/user/exercises',
    'Recognizes "Show exercises" -> /user/exercises');

  const cmdPush = parseVoiceCommand('Open push workout');
  assert(cmdPush && cmdPush.type === 'NAVIGATE_WORKOUT' && cmdPush.workoutFilter === 'Push',
    'Recognizes "Open push workout" -> Push workout');

  const cmdDashboard = parseVoiceCommand('Show my dashboard');
  assert(cmdDashboard && cmdDashboard.type === 'NAVIGATE' && cmdDashboard.path === '/user/dashboard',
    'Recognizes "Show my dashboard" -> /user/dashboard');

  const cmdPassword = parseVoiceCommand('Change password');
  assert(cmdPassword && cmdPassword.type === 'NAVIGATE' && cmdPassword.path === '/change-password',
    'Recognizes "Change password" -> /change-password');

  const cmdLogout = parseVoiceCommand('Logout');
  assert(cmdLogout && cmdLogout.type === 'LOGOUT',
    'Recognizes "Logout" -> LOGOUT action');

  // TEST 3: Confirmation & Database Persistence
  console.log('\n--- 3. Confirmation Flow & MongoDB Persistence ---');

  // Login as user
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@repx.com', password: 'User123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // Simulate user speaking "Bench press 70 kilos 5 reps" and clicking [ CONFIRM ]
  const confirmedSet = {
    exercise: benchLog.exercise,
    weight: benchLog.weight,
    sets: 1,
    reps: benchLog.reps,
    date: new Date()
  };

  const saveRes = await fetch(`${API_URL}/fitness-records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(confirmedSet)
  });
  const saveData = await saveRes.json();
  assert(saveData.success && saveData.record.exercise === 'Bench Press' && saveData.record.weight === 70,
    'Confirmed voice log saved to MongoDB successfully');

  console.log('\n========================================================');
  console.log(`VOICE TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

testVoice().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
