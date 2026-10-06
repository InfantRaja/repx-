import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Dumbbell,
  BookOpen,
  Calendar,
  TrendingUp,
  Ruler,
  Activity,
  Users,
  Zap,
  Settings,
  Flame,
  LogOut,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { hasActiveWorkout, startWorkout } = useWorkout();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Coach', path: '/coach', icon: Bot, isAi: true },
    { label: 'Workouts', path: '/workouts', icon: Dumbbell },
    { label: 'Exercises', path: '/exercises', icon: BookOpen },
    { label: 'Split Builder', path: '/splits', icon: Calendar },
    { label: 'Progress & PRs', path: '/progress', icon: TrendingUp },
    { label: 'Measurements', path: '/measurements', icon: Ruler },
    { label: 'Social Feed', path: '/feed', icon: Activity },
    { label: 'Athletes & Friends', path: '/friends', icon: Users },
    { label: 'REPX PRO', path: '/pro', icon: Zap, proBadge: true },
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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-repx-900 border-r border-repx-border h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-repx-border flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-repx-850 border border-repx-borderLight p-1.5 flex items-center justify-center group-hover:border-repx-volt transition-all shadow-volt-glow">
            <img src="/logo.svg" alt="REPX" className="w-full h-full" />
          </div>
          <div>
            <div className="font-display font-black text-xl tracking-tight text-white flex items-center gap-1">
              REP<span className="text-repx-volt">X</span>
            </div>
            <div className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
              TRACK • TRAIN • TRANSFORM
            </div>
          </div>
        </NavLink>
      </div>

      {/* Quick Start Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={handleQuickStart}
          className={`w-full py-3 px-4 rounded-xl font-display font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            hasActiveWorkout
              ? 'bg-repx-crimson text-white animate-pulse shadow-crimson-glow'
              : 'bg-repx-volt text-black hover:bg-repx-voltHover shadow-volt-glow'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          {hasActiveWorkout ? 'RESUME WORKOUT' : 'START WORKOUT'}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-repx-volt/15 text-repx-volt font-bold border border-repx-volt/30 shadow-volt-glow'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-repx-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.isAi && (
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-repx-volt text-black tracking-wider animate-pulse shadow-volt-glow">
                  AI
                </span>
              )}
              {item.proBadge && (
                <span
                  className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    user?.isPro
                      ? 'bg-amber-400 text-black shadow-amber-400/50 shadow-sm font-black'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {user?.isPro ? 'PRO ✓' : 'PRO'}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Athlete Profile & Streak footer */}
      <div className="p-4 border-t border-repx-border bg-repx-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
              }
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover border border-repx-borderLight"
            />
            <div className="truncate max-w-[100px]">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span className="truncate">{user?.name}</span>
                {user?.isPro && (
                  <span className="text-[8px] bg-amber-400 text-black px-1 py-0.2 rounded font-black tracking-wider shrink-0">
                    PRO
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate">@{user?.username}</div>
            </div>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-repx-crimson/15 border border-repx-crimson/30 text-repx-crimson text-xs font-extrabold font-display"
            title="Current Workout Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-repx-crimson animate-pulse" />
            <span>{user?.stats?.currentStreak ?? 0}d</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-repx-800/80 flex items-center justify-center gap-2 transition-all border border-repx-border"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
