import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import CreateWorkoutPage from './pages/CreateWorkoutPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import WorkoutSessionPage from './pages/WorkoutSessionPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import SplitBuilderPage from './pages/SplitBuilderPage';
import ProgressPage from './pages/ProgressPage';
import PersonalRecordsPage from './pages/PersonalRecordsPage';
import MeasurementsPage from './pages/MeasurementsPage';
import SocialFeedPage from './pages/SocialFeedPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import ProPage from './pages/ProPage';
import AICoachPage from './pages/AICoachPage';

export function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Onboarding Wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Main Protected Application */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/coach" element={<AICoachPage />} />
            <Route path="/workouts" element={<WorkoutsPage />} />
            <Route path="/workouts/create" element={<CreateWorkoutPage />} />
            <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
            <Route path="/workout/session" element={<WorkoutSessionPage />} />
            <Route path="/exercises" element={<ExerciseLibraryPage />} />
            <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
            <Route path="/splits" element={<SplitBuilderPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/progress/prs" element={<PersonalRecordsPage />} />
            <Route path="/measurements" element={<MeasurementsPage />} />
            <Route path="/feed" element={<SocialFeedPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users/:id" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/pro" element={<ProPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;
