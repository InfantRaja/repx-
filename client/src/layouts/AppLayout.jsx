import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MobileNavigation from '../components/MobileNavigation';
import RestTimer from '../components/RestTimer';
import WorkoutCompletionModal from '../components/WorkoutCompletionModal';
import AICoachWidget from '../components/AICoachWidget';

export const AppLayout = () => {
  const location = useLocation();

  // Page title mapping
  const getPageTitle = (pathname) => {
    if (pathname.includes('/coach')) return 'REPX AI Gym Coach';
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/workouts/create')) return 'Build Workout Routine';
    if (pathname.includes('/workouts/')) return 'Workout Routine';
    if (pathname.includes('/workouts')) return 'Workout Routines';
    if (pathname.includes('/workout/session')) return 'Active Gym Session';
    if (pathname.includes('/exercises/')) return 'Exercise Details';
    if (pathname.includes('/exercises')) return 'Exercise Library';
    if (pathname.includes('/splits/create')) return 'Create Custom Split';
    if (pathname.includes('/splits')) return 'Workout Split Builder';
    if (pathname.includes('/progress/prs')) return 'Personal Records Cabinet';
    if (pathname.includes('/progress')) return 'Strength & Progress Analytics';
    if (pathname.includes('/measurements')) return 'Body Measurements';
    if (pathname.includes('/feed')) return 'Community Fitness Feed';
    if (pathname.includes('/friends')) return 'Athletes & Networking';
    if (pathname.includes('/pro')) return 'REPX PRO Membership';
    if (pathname.includes('/profile')) return 'Athlete Profile';
    if (pathname.includes('/settings')) return 'Settings & Preferences';
    if (pathname.includes('/notifications')) return 'Notifications';
    return 'REPX';
  };

  const isWorkoutSession = location.pathname.includes('/workout/session');

  return (
    <div className="min-h-screen bg-repx-950 text-slate-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title={getPageTitle(location.pathname)} />

        <main className={`flex-1 p-4 md:p-8 ${isWorkoutSession ? 'pb-24 lg:pb-12' : 'pb-24 lg:pb-8'}`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Gym Navigation Bar */}
      <MobileNavigation />

      {/* Floating Rest Timer (hidden on dedicated session page because it has its own inline rest timer) */}
      {!isWorkoutSession && <RestTimer />}

      {/* Floating 24/7 AI Coach Widget (hidden when already on full /coach page) */}
      {location.pathname !== '/coach' && <AICoachWidget />}

      {/* Global Workout Completion Celebration Modal */}
      <WorkoutCompletionModal />
    </div>
  );
};

export default AppLayout;
