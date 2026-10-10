import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Dumbbell, User, Plus, Calendar } from 'lucide-react';
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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-sm">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {/* Feed */}
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Feed</span>
        </NavLink>

        {/* Routines */}
        <NavLink
          to="/workouts"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <ClipboardList className="w-5 h-5" />
          <span>Routines</span>
        </NavLink>

        {/* Splits */}
        <NavLink
          to="/splits"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Calendar className="w-5 h-5" />
          <span>Splits</span>
        </NavLink>

        {/* Center Workout Action (Hevy Blue Button) */}
        <div className="-mt-5">
          <button
            onClick={handleCenterAction}
            className={`w-13 h-13 p-3.5 rounded-2xl flex items-center justify-center font-black transition-all active:scale-90 shadow-md ${
              hasActiveWorkout
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={hasActiveWorkout ? 'Resume Workout' : 'Start Workout'}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Exercises */}
        <NavLink
          to="/exercises"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Dumbbell className="w-5 h-5" />
          <span>Exercises</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileNavigation;
