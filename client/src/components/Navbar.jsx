import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, Flame, Play, CheckCheck, User, Zap, Menu, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import API from '../services/api';
import VoiceAssistantModal from './VoiceAssistantModal';

export const Navbar = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();
  const { activeSession, hasActiveWorkout } = useWorkout();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data.slice(0, 5));
          setUnreadCount(res.data.unreadCount);
        }
      } catch (e) {
        // Silently catch in dev
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  // Format active session elapsed time
  const formatTime = (totalSecs = 0) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-repx-950/80 backdrop-blur-xl border-b border-repx-border px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left side: Page Title / Mobile Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <NavLink to="/dashboard" className="lg:hidden flex items-center gap-2">
          <img src="/logo.svg" alt="REPX" className="w-8 h-8" />
          <span className="font-display font-black text-lg tracking-tight text-white">
            REP<span className="text-repx-volt">X</span>
          </span>
        </NavLink>

        <h1 className="hidden lg:block text-xl font-black font-display text-white tracking-tight">
          {title}
        </h1>
      </div>

      {/* Center: Live workout badge if active */}
      {hasActiveWorkout && (
        <button
          onClick={() => navigate('/workout/session')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-repx-crimson/20 border border-repx-crimson/50 text-white text-xs font-bold font-display shadow-crimson-glow animate-pulse"
        >
          <span className="w-2 h-2 rounded-full bg-repx-crimson"></span>
          <span className="truncate max-w-[130px] md:max-w-none">{activeSession?.workoutName}</span>
          <span className="text-repx-volt font-mono font-bold">
            {formatTime(activeSession?.elapsedSeconds)}
          </span>
        </button>
      )}

      {/* Right side: Voice, Streak, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Voice Command Button */}
        <button
          onClick={() => setShowVoiceModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-repx-volt/15 hover:bg-repx-volt/25 border border-repx-volt/40 text-repx-volt text-xs font-black font-display shadow-volt-glow transition-all active:scale-95"
          title="Voice Command Assistant"
        >
          <Mic className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">Voice Command</span>
        </button>

        {/* Streak Pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-repx-850 border border-repx-border text-xs font-extrabold font-display text-white"
          title="Workout Streak"
        >
          <Flame className="w-4 h-4 text-repx-crimson fill-repx-crimson animate-pulse" />
          <span>{user?.stats?.currentStreak ?? 0}</span>
          <span className="hidden sm:inline text-slate-400 font-normal">DAYS</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-repx-850 hover:bg-repx-800 border border-repx-border flex items-center justify-center text-slate-300 relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-repx-volt text-black text-[10px] font-black flex items-center justify-center shadow-volt-glow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 repx-card rounded-2xl p-4 border border-repx-border bg-repx-900/95 shadow-2xl z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-repx-border mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-repx-volt hover:underline flex items-center gap-1 font-bold"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        n.isRead
                          ? 'bg-repx-850/50 border-transparent text-slate-400'
                          : 'bg-repx-800/80 border-repx-border text-slate-200 font-medium'
                      }`}
                    >
                      <div className="font-bold text-white mb-0.5">{n.title}</div>
                      <div>{n.message}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-repx-border text-center">
                <NavLink
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-repx-volt font-bold hover:underline"
                >
                  View All Notifications
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-repx-850 transition-all border border-transparent hover:border-repx-border"
        >
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
            }
            alt={user?.name}
            className="w-8 h-8 rounded-lg object-cover border border-repx-borderLight"
          />
        </NavLink>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} />
    </header>
  );
};

export default Navbar;
