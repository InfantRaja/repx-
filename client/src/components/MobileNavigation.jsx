import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Play, TrendingUp, Users, BookOpen } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export const MobileNavigation = () => {
  const { hasActiveWorkout, startWorkout } = useWorkout();
  const navigate = useNavigate();

  const handleCenterAction = () => {
    if (hasActiveWorkout) {
      navigate('/workout/session');
    } else {
      startWorkout();
      navigate('/workout/session');
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-repx-950/95 backdrop-blur-2xl border-t border-repx-border pb-safe">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-repx-volt' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        {/* Workouts */}
        <NavLink
          to="/workouts"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-repx-volt' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Dumbbell className="w-5 h-5" />
          <span>Routines</span>
        </NavLink>

        {/* Center Gym Quick Action */}
        <div className="-mt-6">
          <button
            onClick={handleCenterAction}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all active:scale-90 shadow-2xl border-2 ${
              hasActiveWorkout
                ? 'bg-repx-crimson text-white border-white/50 animate-pulse shadow-crimson-glow'
                : 'bg-repx-volt text-black border-black/20 shadow-volt-glow'
            }`}
            title={hasActiveWorkout ? 'Resume Workout' : 'Start Workout'}
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>
        </div>

        {/* Progress & PRs */}
        <NavLink
          to="/progress"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-repx-volt' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <TrendingUp className="w-5 h-5" />
          <span>Progress</span>
        </NavLink>

        {/* Social Feed */}
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-repx-volt' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Social</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNavigation;
