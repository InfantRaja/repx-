import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Dumbbell,
  Calendar,
  Sparkles,
  User,
  Settings,
  Search,
  LogOut,
  Play,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { hasActiveWorkout, startWorkout } = useWorkout();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Feed', path: '/feed', icon: Home },
    { label: 'Routines', path: '/workouts', icon: ClipboardList },
    { label: 'Exercises', path: '/exercises', icon: Dumbbell },
    { label: 'Splits', path: '/splits', icon: Calendar },
    { label: 'Trainer', path: '/coach', icon: Sparkles },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleQuickStart = () => {
    if (hasActiveWorkout) {
      navigate('/workout/session');
    } else {
      startWorkout();
      navigate('/workout/session');
    }
  };

  const displayName = user?.name || 'INFANT RAJA';
  const initial = displayName.charAt(0).toUpperCase() || 'I';

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header: REPX Brand */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <NavLink to="/feed" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black">
            <span className="text-sm font-black tracking-tighter">RX</span>
          </div>
          <span className="font-sans font-black text-2xl tracking-tight text-slate-900">
            REPX
          </span>
        </NavLink>
      </div>

      {/* Search Bar (Like Hevy screenshot) */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 bg-slate-100/80 rounded-xl px-3 py-2 text-xs text-slate-400 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search users"
            className="bg-transparent border-none outline-none text-xs text-slate-700 w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Navigation Links (Hevy style active blue pill) */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Start Action Button */}
      <div className="px-4 py-2">
        <button
          onClick={handleQuickStart}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
            hasActiveWorkout
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {hasActiveWorkout ? 'Resume Workout' : 'Start Workout'}
        </button>
      </div>

      {/* REPX PRO Banner */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs text-slate-900">REPX</span>
            <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <button
            onClick={() => navigate('/pro')}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all"
          >
            Unlock
          </button>
        </div>
      </div>

      {/* User Profile Footer (From Screenshot) */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <NavLink
            to="/profile"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity truncate flex-1 mr-2"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {initial}
              </div>
            )}
            <span className="text-xs font-black uppercase text-slate-800 tracking-tight truncate">
              {displayName}
            </span>
          </NavLink>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
