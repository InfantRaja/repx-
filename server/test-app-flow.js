// Complete End-to-End Automated Test Script for REPX
const BASE_URL = 'http://localhost:4000/api';
const CLIENT_URL = 'http://localhost:5173';

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 REPX FULL-STACK APPLICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    assert(healthRes.status === 'ok' && healthRes.database === 'connected', 'Server Health & MongoDB Connection', JSON.stringify(healthRes));

    // 2. Client Dev Server Response
    const clientRes = await fetch(CLIENT_URL);
    const clientHtml = await clientRes.text();
    assert(clientRes.status === 200 && clientHtml.includes('REPX'), 'Client Dev Server Serving index.html on port 5173');

    // 3. Demo User Login
    const demoLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@repx.com', password: 'demo123456' }),
    }).then((r) => r.json());
    assert(demoLoginRes.success && demoLoginRes.token, 'Demo User Login (demo@repx.com / demo123456)');
    const demoToken = demoLoginRes.token;
    const demoUser = demoLoginRes.user;

    // 4. Register New Athlete Flow
    const testUsername = `athlete_${Date.now()}`;
    const testEmail = `${testUsername}@test.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Stone',
        username: testUsername,
        email: testEmail,
        password: 'password123',
      }),
    }).then((r) => r.json());
    assert(regRes.success && regRes.token, 'New Athlete Registration Flow');
    const newAthleteToken = regRes.token;

    // 5. Onboarding Save Flow
    const onboardRes = await fetch(`${BASE_URL}/auth/onboarding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newAthleteToken}` },
      body: JSON.stringify({
        age: 27,
        height: 180,
        weight: 82.5,
        fitnessGoal: 'Strength',
        experienceLevel: 'Advanced',
        trainingDays: 5,
        preferredSplit: 'Push Pull Legs',
        availableEquipment: 'Commercial Gym',
      }),
    }).then((r) => r.json());
    assert(onboardRes.success && onboardRes.user.isOnboarded === true, 'Athlete Onboarding Telemetry Persisted in MongoDB');

    // 6. Dashboard Telemetry Endpoint
    const dashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(
      dashRes.success &&
        dashRes.data?.stats?.currentWeight > 0 &&
        dashRes.data?.todaysWorkout?.name &&
        Array.isArray(dashRes.data?.charts?.volumeHistory),
      'Dashboard Analytics Aggregation (GET /api/dashboard)',
      `Weight: ${dashRes.data?.stats?.currentWeight}, Today: ${dashRes.data?.todaysWorkout?.name}`
    );

    // 7. Exercise Library (30+ Exercises, Search, Category Filters)
    const exAllRes = await fetch(`${BASE_URL}/exercises`).then((r) => r.json());
    assert(exAllRes.success && exAllRes.count >= 30, `Exercise Library Contains 30+ Exercises (Found: ${exAllRes.count})`);

    const exChestRes = await fetch(`${BASE_URL}/exercises?muscle=Chest`).then((r) => r.json());
    assert(exChestRes.success && exChestRes.data.every((e) => e.muscleGroup === 'Chest'), 'Exercise Muscle Filter (Chest)');

    const benchEx = exAllRes.data.find((e) => /bench press/i.test(e.name));
    assert(benchEx && benchEx.instructions?.length > 0, 'Exercise Detail Schema with Biomechanical Instructions');

    // 8. Custom Workout Builder
    const createWorkoutRes = await fetch(`${BASE_URL}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${demoToken}` },
      body: JSON.stringify({
        name: 'Heavy Chest & Triceps Blast',
        description: 'Targeted high-intensity bench pressing',
        targetMuscles: ['Chest', 'Triceps'],
        difficulty: 'Advanced',
        estimatedDurationMinutes: 65,
        exercises: [
          {
            exercise: benchEx._id,
            exerciseName: benchEx.name,
            muscleGroup: benchEx.muscleGroup,
            order: 1,
            defaultSets: [
              { setNumber: 1, targetWeight: 80, targetReps: 8 },
              { setNumber: 2, targetWeight: 100, targetReps: 5 },
            ],
          },
        ],
      }),
    }).then((r) => r.json());
    assert(createWorkoutRes.success && createWorkoutRes.data?._id, 'Custom Workout Creation (POST /api/workouts)');
    const createdWorkoutId = createWorkoutRes.data?._id;

    // 9. Duplicate Workout
    const dupRes = await fetch(`${BASE_URL}/workouts/${createdWorkoutId}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(dupRes.success && dupRes.data.name.includes('(Copy)'), 'Duplicate Workout Routine (POST /api/workouts/:id/duplicate)');

    // 10. LIVE WORKOUT SESSION LOGGING & AUTOMATIC PR DETECTION
    const testPrWeight = Math.floor(Date.now() / 1000) % 10000 + 200;
    const sessionRes = await fetch(`${BASE_URL}/workout-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${demoToken}` },
      body: JSON.stringify({
        workoutId: createdWorkoutId,
        workoutName: 'Heavy Chest & Triceps Blast',
        durationSeconds: 4200,
        exercises: [
          {
            exercise: benchEx._id,
            exerciseName: benchEx.name,
            muscleGroup: 'Chest',
            sets: [
              { setNumber: 1, weightKg: 80, reps: 8, isCompleted: true },
              { setNumber: 2, weightKg: testPrWeight, reps: 5, isCompleted: true, isPR: true },
            ],
          },
        ],
        rating: 5,
        notes: 'Felt explosive off the chest. Crushed a new PR!',
      }),
    }).then((r) => r.json());

    assert(
      sessionRes.success &&
        sessionRes.data?.session?.totalVolumeKg === 80 * 8 + testPrWeight * 5 &&
        sessionRes.data?.personalRecordsBroken?.length > 0,
      'Live Workout Session Logged & Automatic PR Detected (POST /api/workout-sessions)',
      `PRs Broken: ${JSON.stringify(sessionRes.data?.personalRecordsBroken?.map((p) => `${p.exerciseName}: ${p.newValue}kg`))}`
    );

    // 11. Progress Analytics & Big 3 Curves
    const progRes = await fetch(`${BASE_URL}/progress?period=30d`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(
      progRes.success &&
        Array.isArray(progRes.charts?.weight) &&
        Array.isArray(progRes.charts?.volume) &&
        Array.isArray(progRes.charts?.strength),
      'Progress Analytics with Big 3 1RM curves and volume trends (GET /api/progress)'
    );

    // 12. Personal Records Trophy Cabinet
    const prsRes = await fetch(`${BASE_URL}/progress/prs`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(prsRes.success && prsRes.count > 0, `Personal Records Shelf (GET /api/progress/prs) - Found ${prsRes.count} PRs`);

    // 13. Body Measurements (Strictly NO body fat %)
    const measLogRes = await fetch(`${BASE_URL}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${demoToken}` },
      body: JSON.stringify({
        weightKg: 81.2,
        chestCm: 106.5,
        armsCm: 38.6,
        waistCm: 81.8,
        thighsCm: 62.5,
        calvesCm: 38.5,
        shouldersCm: 125.0,
        notes: 'Fasted Sunday morning weigh-in',
      }),
    }).then((r) => r.json());
    assert(
      measLogRes.success &&
        measLogRes.data.weightKg === 81.2 &&
        measLogRes.data.bodyFat === undefined &&
        measLogRes.data.bodyFatPercentage === undefined,
      'Body Measurements Logged Without Body-Fat Percentage (POST /api/measurements)'
    );

    // 14. Workout Split Builder
    const splitRes = await fetch(`${BASE_URL}/splits`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(splitRes.success && splitRes.data.length > 0, 'Workout Split Retrieval (GET /api/splits)');

    const activateSplitRes = await fetch(`${BASE_URL}/splits/${splitRes.data[0]._id}/activate`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(activateSplitRes.success && activateSplitRes.data.isActive, 'Workout Split Activation (PUT /api/splits/:id/activate)');

    // 15. Social Community Feed
    const feedRes = await fetch(`${BASE_URL}/feed`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(feedRes.success && feedRes.data.length > 0, `Social Community Feed (GET /api/feed) - Found ${feedRes.data.length} Posts`);

    const firstPost = feedRes.data[0];
    const likeRes = await fetch(`${BASE_URL}/posts/${firstPost._id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(likeRes.success && typeof likeRes.isLiked === 'boolean', 'Post Toggle Like Interaction (POST /api/posts/:id/like)');

    const commentRes = await fetch(`${BASE_URL}/posts/${firstPost._id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${demoToken}` },
      body: JSON.stringify({ text: 'Incredible lift! Keep up the momentum!' }),
    }).then((r) => r.json());
    assert(commentRes.success && commentRes.data.text.includes('Incredible lift'), 'Add Comment to Post (POST /api/posts/:id/comment)');

    // 16. Friends & Athlete Networking
    const friendsRes = await fetch(`${BASE_URL}/friends`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(
      friendsRes.success &&
        Array.isArray(friendsRes.data.following) &&
        Array.isArray(friendsRes.data.followers),
      'Friends, Following & Discover Athletes (GET /api/friends)'
    );

    // 17. User Profile
    const profileRes = await fetch(`${BASE_URL}/users/${demoUser._id}`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(
      profileRes.success &&
        profileRes.data.name &&
        profileRes.data.followersCount !== undefined &&
        Array.isArray(profileRes.data.recentWorkouts),
      'User Profile with Stats & Recent Workouts (GET /api/users/:id)'
    );

    // 18. Notifications
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(notifRes.success && Array.isArray(notifRes.data), 'Notifications System with Unread Alerts (GET /api/notifications)');

    // 19. REPX PRO Subscription Architecture
    const subRes = await fetch(`${BASE_URL}/subscription`, {
      headers: { Authorization: `Bearer ${demoToken}` },
    }).then((r) => r.json());
    assert(subRes.success && subRes.pricing?.amount === 199, 'REPX PRO Tier Architecture (₹199 / month) (GET /api/subscription)');

    const upgradeRes = await fetch(`${BASE_URL}/subscription/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newAthleteToken}` },
      body: JSON.stringify({ paymentMethod: 'UPI / Mock Gateway', billingCycle: 'monthly' }),
    }).then((r) => r.json());
    assert(upgradeRes.success && upgradeRes.subscription?.plan === 'REPX PRO', 'Upgrade to REPX PRO (POST /api/subscription/upgrade)');
  } catch (error) {
    console.error('Fatal test execution error:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('🎉 ALL INTEGRATION FLOWS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runTests();
