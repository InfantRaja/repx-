const API_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('========================================================');
  console.log('REPX - COMPREHENSIVE INTEGRATION & RBAC TEST SUITE');
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

  async function api(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      method,
      headers
    };
    if (body) config.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, config);
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    return { status: res.status, data };
  }

  try {
    // TEST 1: Health check
    const health = await api('GET', '/health');
    assert(health.status === 200 && health.data.status === 'OK', 'Backend health check responds with OK');

    // TEST 2: Demo 1 - User Registration with Validation
    console.log('\n--- DEMO 1: Registration & Validation ---');
    const weakReg = await api('POST', '/auth/register', {
      name: 'Test Guy',
      email: 'testguy@repx.com',
      password: 'weak',
      confirmPassword: 'weak',
      role: 'user'
    });
    assert(weakReg.status === 400, 'Weak password correctly rejected with 400 Bad Request');

    const mismatchReg = await api('POST', '/auth/register', {
      name: 'Test Guy',
      email: 'testguy@repx.com',
      password: 'Password123!',
      confirmPassword: 'MismatchPassword123!',
      role: 'user'
    });
    assert(mismatchReg.status === 400, 'Password mismatch correctly rejected with 400 Bad Request');

    // Register a valid user
    const uniqueEmail = `test_${Date.now()}@repx.com`;
    const regRes = await api('POST', '/auth/register', {
      name: 'Evaluation Tester',
      email: uniqueEmail,
      password: 'TesterPassword123!',
      confirmPassword: 'TesterPassword123!',
      role: 'user'
    });
    assert(regRes.status === 201 && regRes.data.token, 'Successful user registration returns JWT token');

    // TEST 3: Admin & User Login
    console.log('\n--- DEMO 2 & 3: Authentication & Admin Operations ---');
    const adminLogin = await api('POST', '/auth/login', {
      email: 'admin@repx.com',
      password: 'Admin123!'
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login successful with role: admin');
    const adminToken = adminLogin.data.token;

    const userLogin = await api('POST', '/auth/login', {
      email: 'user@repx.com',
      password: 'User123!'
    });
    assert(userLogin.status === 200 && userLogin.data.user.role === 'user', 'Normal User login successful with role: user');
    const userToken = userLogin.data.token;

    // TEST 4: Admin Dashboard Stats
    const statsRes = await api('GET', '/fitness-records/stats', null, adminToken);
    assert(statsRes.status === 200 && statsRes.data.stats.totalUsers >= 2, 'Admin receives live MongoDB statistics');

    // TEST 5: Exercise CRUD by Admin
    console.log('\n--- Exercise CRUD Operations ---');
    const newExercise = await api('POST', '/exercises', {
      name: 'Incline Dumbbell Press',
      muscleGroup: 'Chest',
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      description: 'Upper chest pressing movement'
    }, adminToken);
    assert(newExercise.status === 201 && newExercise.data.exercise.name === 'Incline Dumbbell Press', 'Admin successfully created Exercise');
    const exerciseId = newExercise.data.exercise._id;

    // Update Exercise
    const updatedEx = await api('PUT', `/exercises/${exerciseId}`, {
      name: 'Incline Dumbbell Bench Press',
      difficulty: 'Advanced'
    }, adminToken);
    assert(updatedEx.status === 200 && updatedEx.data.exercise.name === 'Incline Dumbbell Bench Press', 'Admin successfully updated Exercise');

    // Delete Exercise
    const delEx = await api('DELETE', `/exercises/${exerciseId}`, null, adminToken);
    assert(delEx.status === 200, 'Admin successfully deleted Exercise');

    // TEST 6: Workout CRUD by Admin
    console.log('\n--- Workout CRUD Operations ---');
    const newWorkout = await api('POST', '/workouts', {
      name: 'Upper Body Blast',
      targetMuscle: 'Chest + Back',
      exercise: 'Bench Press, Pull-ups',
      sets: 4,
      reps: 10,
      duration: '40 mins',
      difficulty: 'Intermediate'
    }, adminToken);
    assert(newWorkout.status === 201, 'Admin successfully created Workout');
    const workoutId = newWorkout.data.workout._id;

    const delWorkout = await api('DELETE', `/workouts/${workoutId}`, null, adminToken);
    assert(delWorkout.status === 200, 'Admin successfully deleted Workout');

    // TEST 7: User Management CRUD by Admin
    console.log('\n--- User Management CRUD Operations ---');
    const dummyUserEmail = `dummy_${Date.now()}@repx.com`;
    const createdUser = await api('POST', '/users', {
      name: 'Dummy Account',
      email: dummyUserEmail,
      password: 'DummyPassword123!',
      role: 'user'
    }, adminToken);
    assert(createdUser.status === 201, 'Admin successfully created a new user account');
    const dummyUserId = createdUser.data.user.id;

    const delUser = await api('DELETE', `/users/${dummyUserId}`, null, adminToken);
    assert(delUser.status === 200, 'Admin successfully deleted user account');

    // TEST 8: Fitness Record Operations
    console.log('\n--- Fitness Record Operations ---');
    const newRecord = await api('POST', '/fitness-records', {
      exercise: 'Barbell Squat',
      sets: 5,
      reps: 5,
      weight: 120
    }, userToken);
    assert(newRecord.status === 201, 'User successfully created personal fitness record');

    // TEST 9: Normal User Filter and Search
    console.log('\n--- DEMO 4: Normal User Search and Filter ---');
    const searchRes = await api('GET', '/exercises?search=Bench');
    assert(searchRes.status === 200 && searchRes.data.exercises.length > 0, 'Normal user can search exercises by name');

    const filterRes = await api('GET', '/exercises?muscleGroup=Legs&difficulty=Intermediate');
    assert(filterRes.status === 200 && filterRes.data.exercises.every(e => e.muscleGroup.toLowerCase() === 'legs'), 'Normal user can filter exercises by muscle group');

    // TEST 10: DEMO 5 - SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)
    console.log('\n--- DEMO 5: SECURITY & RBAC REJECTION TESTS ---');

    // 10a. Normal user attempting to access Admin Users API
    const blockedUsers = await api('GET', '/users', null, userToken);
    assert(blockedUsers.status === 403, 'Normal user rejected with 403 Forbidden on GET /api/users');

    // 10b. Normal user attempting to create exercise
    const blockedCreateEx = await api('POST', '/exercises', {
      name: 'Hacked Exercise',
      muscleGroup: 'Chest'
    }, userToken);
    assert(blockedCreateEx.status === 403, 'Normal user rejected with 403 Forbidden on POST /api/exercises');

    // 10c. Normal user attempting to delete workout
    const blockedDelWorkout = await api('DELETE', '/workouts/650000000000000000000000', null, userToken);
    assert(blockedDelWorkout.status === 403, 'Normal user rejected with 403 Forbidden on DELETE /api/workouts');

    // 10d. Normal user attempting to get admin dashboard stats
    const blockedStats = await api('GET', '/fitness-records/stats', null, userToken);
    assert(blockedStats.status === 403, 'Normal user rejected with 403 Forbidden on GET /api/fitness-records/stats');

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Unexpected test suite error:', err);
    process.exit(1);
  }
}

runTests();
