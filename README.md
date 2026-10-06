# REPX — TRACK. TRAIN. TRANSFORM.

> **Production-Quality Commercial Full-Stack Fitness & Gym Tracking Application**

REPX is an elite, high-performance fitness platform designed for serious athletes, powerlifters, and lifters. Built with a bespoke dark gym aesthetic, electric volt accents, real-time gym telemetry, automated Personal Record (PR) detection, and a reactive workout logging interface.

---

## 📸 Core Highlights & Experience

- **⚡ Dedicated Gym Workout Interface**: Tap-friendly weight & reps steppers, live duration clock, interactive set table with checkmarks, inline + floating rest timer with Web Audio API synthesizer chimes.
- **🔥 Automated Personal Record (PR) Engine**: Automatic detection of max weight, max reps, best set volume, and estimated 1RM using the Epley formula (`Weight × (1 + Reps / 30)`).
- **📊 Real MongoDB Analytics & Recharts**: The Big 3 (Bench, Squat, Deadlift) 1RM progression curves, body weight progression, weekly volume bars, and consistency heatmaps.
- **📚 Biomechanical Exercise Encyclopedia**: 30+ comprehensive movements across Chest, Back, Shoulders, Biceps, Triceps, and Legs with detailed target muscle recruitment, step-by-step queues, and form faults.
- **🗓️ Workout Split Builder**: Full 7-day program planning (Monday–Sunday) with active recovery switches and one-click active split deployment.
- **📏 Strict Body Measurements**: Track Weight, Chest, Arms, Waist, Thighs, Calves, and Shoulders over time (strictly omitting uncalibrated body-fat percentage as specified).
- **🌐 Athlete Social Feed & Networking**: Share workouts directly from the celebration modal, like with live counters, comment, and follow fellow athletes.
- **👑 REPX PRO (₹199 / month)**: Tier architecture with payment simulation ready for UPI and Card gateways.

---

## 🧱 Application Architecture

```
REPX/
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, Recharts)
│   ├── public/
│   │   └── logo.svg            # Custom REPX brand monogram
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Top gym header with live workout ticker & alerts
│   │   │   ├── Sidebar.jsx     # Desktop athlete sidebar with streak & quick actions
│   │   │   ├── MobileNavigation.jsx # Gym bottom bar with center action button
│   │   │   ├── RestTimer.jsx   # Inline & floating HUD rest countdown with audio
│   │   │   ├── WorkoutCompletionModal.jsx # Confetti celebration & PR summary
│   │   │   ├── PRBadge.jsx     # Glowing athletic PR badges
│   │   │   ├── LoadingSkeleton.jsx # Smooth skeleton loaders
│   │   │   └── EmptyState.jsx  # Dark gym empty states
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # JWT persistence, login, register, onboarding
│   │   │   └── WorkoutContext.jsx # Live gym tracking state, timer, sets
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx   # Main shell with sidebar, top nav, mobile nav
│   │   │   └── AuthLayout.jsx  # Dark ambient gym authentication shell
│   │   ├── pages/              # Full page implementations
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── WorkoutsPage.jsx
│   │   │   ├── CreateWorkoutPage.jsx
│   │   │   ├── WorkoutDetailPage.jsx
│   │   │   ├── WorkoutSessionPage.jsx
│   │   │   ├── ExerciseLibraryPage.jsx
│   │   │   ├── ExerciseDetailPage.jsx
│   │   │   ├── SplitBuilderPage.jsx
│   │   │   ├── ProgressPage.jsx
│   │   │   ├── PersonalRecordsPage.jsx
│   │   │   ├── MeasurementsPage.jsx
│   │   │   ├── SocialFeedPage.jsx
│   │   │   ├── FriendsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── ProPage.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios client with interceptors
│   │   ├── utils/
│   │   │   └── sound.js        # Web Audio API synthesizer for timer chimes
│   │   ├── App.jsx             # Route definitions & guards
│   │   ├── index.css           # Custom dark gym aesthetic & scrollbars
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend (Node.js, Express, MongoDB, Mongoose)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── exerciseController.js
│   │   ├── measurementController.js
│   │   ├── notificationController.js
│   │   ├── progressController.js
│   │   ├── socialController.js
│   │   ├── splitController.js
│   │   ├── subscriptionController.js
│   │   ├── userController.js
│   │   ├── workoutController.js
│   │   └── workoutSessionController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT bearer verification & role authorization
│   │   └── error.js            # User-friendly error shielding
│   ├── models/                 # 12 Mongoose Models
│   │   ├── User.js
│   │   ├── Exercise.js
│   │   ├── Workout.js
│   │   ├── WorkoutSession.js
│   │   ├── WorkoutSet.js
│   │   ├── PersonalRecord.js
│   │   ├── Split.js
│   │   ├── Measurement.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   ├── Follow.js
│   │   ├── Notification.js
│   │   └── Subscription.js
│   ├── routes/                 # REST endpoints
│   ├── services/
│   │   └── prDetector.js       # Automatic PR engine & notification dispatch
│   ├── seed/
│   │   └── seed.js             # Comprehensive database seed script
│   ├── utils/
│   │   └── token.js            # JWT responder
│   ├── server.js               # Express application entry point
│   ├── test-app-flow.js        # 25-step automated test suite
│   └── package.json
│
├── .env                        # Active environment variables
├── .env.example                # Template configuration
├── package.json                # Root orchestrator script
└── README.md
```

---

## 🛠️ Technologies Used

### Frontend
- **React 18** — High-performance declarative component architecture
- **Vite** — Sub-millisecond HMR & optimized production bundler
- **Tailwind CSS** — Bespoke dark gym design tokens & responsive utilities
- **React Router v6** — Protected route guards and nested app shells
- **Recharts** — SVG-based reactive charts for 1RM, volume, and weigh-in telemetry
- **Lucide React** — Minimal athletic iconography
- **Canvas-Confetti** — Celebration physics for new PRs and completed workouts
- **Web Audio API** — Synthetic audio frequency generators for rest timer countdowns (zero external audio files needed)

### Backend
- **Node.js (v24)** & **Express.js (ES Modules)**
- **MongoDB & Mongoose (v8)** — Schema validation, compound indexing, and time-series aggregation
- **JSON Web Tokens (JWT)** & **Bcrypt.js** — Secure password encryption and authorization
- **Helmet, CORS, Cookie-Parser, Morgan** — Production API security and logging

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on default port `27017` or a MongoDB Atlas URI.

### 2. Environment Variables
Verify `.env` at root:
```ini
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/repx
MONGODB_DB=repx
SESSION_SECRET=repx_super_secure_jwt_session_secret_2026_fitness_app
JWT_SECRET=repx_super_secure_jwt_session_secret_2026_fitness_app
JWT_EXPIRES_IN=30d
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
From the repository root:
```bash
npm run install:all
```
*(or run `npm install`, `npm install --prefix server`, and `npm install --prefix client`)*

### 4. Seed the Database
Populate 10 demo athletes, 31 standard exercises, workout templates, past sessions, PR records, and social posts:
```bash
npm run seed
```

### 5. Run the Application
Start both the Express backend (`http://localhost:4000`) and the Vite frontend (`http://localhost:5173`):
```bash
npm run dev
```

---

## 🔑 Demo Account Credentials

| Attribute | Details |
|---|---|
| **Email** | `demo@repx.com` |
| **Password** | `demo123456` |
| **Role** | Verified Athlete (REPX PRO Tier) |
| **Features** | Pre-populated with 12 completed sessions, 8 Personal Records, and measurement history |

*(You can also click the **"Fill Demo Account Credentials"** button directly on the `/login` page for instant one-click login, or register a new user to test the 3-step Onboarding wizard!)*

---

## 📡 REST API Endpoints

### Authentication & User
- `POST /api/auth/register` — Register new athlete
- `POST /api/auth/login` — Sign in with email & password
- `POST /api/auth/logout` — Invalidate session
- `GET /api/auth/me` — Current athlete profile
- `PUT /api/auth/onboarding` — Save biometric goals and split
- `POST /api/auth/forgot-password` — Password recovery simulation
- `GET /api/auth/google` — Google OAuth architecture & dev flow

### Dashboard
- `GET /api/dashboard` — Live aggregated metrics, streak, today's workout, and charts

### Workout Routines & Templates
- `GET /api/workouts` — Get custom routines + system templates
- `POST /api/workouts` — Create new custom workout routine
- `GET /api/workouts/:id` — Get single routine with exercises
- `PUT /api/workouts/:id` — Update routine
- `DELETE /api/workouts/:id` — Delete routine
- `POST /api/workouts/:id/duplicate` — Duplicate routine

### Live Workout Sessions & Sets
- `POST /api/workout-sessions` — Log & complete workout, triggers automated PR engine
- `GET /api/workout-sessions` — Past sessions history with pagination
- `GET /api/workout-sessions/:id` — Detailed session report with sets and broken PRs
- `PUT /api/workout-sessions/:id` — Update session notes/ratings

### Biomechanical Exercise Library
- `GET /api/exercises` — Search, muscle filter, equipment filter, difficulty filter
- `GET /api/exercises/:id` — Exercise anatomy, instructions, common mistakes
- `POST /api/exercises` — Add custom exercise

### Split Builder
- `GET /api/splits` — List active and saved 7-day splits
- `POST /api/splits` — Build new custom split
- `PUT /api/splits/:id` — Edit split schedule
- `PUT /api/splits/:id/activate` — Deploy as primary weekly split
- `DELETE /api/splits/:id` — Remove split

### Progress & Personal Records
- `GET /api/progress?period=30d` — Big 3 (Bench, Squat, Deadlift) curves, volume, weight, frequency
- `GET /api/progress/prs` — Personal Records grouped by muscle group

### Body Measurements (No Body-Fat %)
- `GET /api/measurements` — List measurement entries and chart data
- `POST /api/measurements` — Log weigh-in and circumferences (chest, arms, waist, thighs, calves, shoulders)
- `DELETE /api/measurements/:id` — Delete measurement log

### Social Fitness Feed & Friends
- `GET /api/feed` — Community workout stream
- `POST /api/posts` — Share workout or status
- `POST /api/posts/:id/like` — Toggle like with live count
- `POST /api/posts/:id/comment` — Add comment
- `GET /api/posts/:id/comments` — View comments
- `POST /api/users/:id/follow` — Follow athlete
- `DELETE /api/users/:id/follow` — Unfollow athlete
- `GET /api/friends` — Mutual friends, following, followers, discover suggestions

### Notifications & REPX PRO
- `GET /api/notifications` — Notification alerts with unread counter
- `PUT /api/notifications/read-all` — Mark all as read
- `GET /api/subscription` — Check PRO status and tier features
- `POST /api/subscription/upgrade` — Upgrade to REPX PRO (₹199 / month)

---

## 🧪 Automated Test Verification

Run the built-in 25-step end-to-end integration test suite:
```bash
node server/test-app-flow.js
```

All 25 core test cases (auth, onboarding, telemetry, custom routines, session logging, automated PR detection, Big 3 curves, measurements, social feed, comments, split deployment, and pro upgrade) pass with 100% success.
