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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Left side: Page Title / Mobile Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo: REPX Brand */}
        <NavLink to="/feed" className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black">
            <span className="text-xs font-black tracking-tighter">RX</span>
          </div>
          <span className="font-sans font-black text-lg tracking-tight text-slate-900">
            REPX
          </span>
        </NavLink>

        <h1 className="hidden lg:block text-2xl font-black font-sans text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Center: Live workout badge if active */}
      {hasActiveWorkout && (
        <button
          onClick={() => navigate('/workout/session')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="truncate max-w-[130px] md:max-w-none">{activeSession?.workoutName || 'Active Workout'}</span>
          <span className="font-mono font-bold">
            {formatTime(activeSession?.elapsedSeconds)}
          </span>
        </button>
      )}

      {/* Right side: Voice, Streak, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Streak Pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
          title="Workout Streak"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{user?.stats?.currentStreak ?? 0}</span>
          <span className="hidden sm:inline text-slate-400 font-normal">DAYS</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 flex items-center justify-center text-slate-600 relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl p-4 border border-slate-200 shadow-xl z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
                          ? 'bg-slate-50 border-transparent text-slate-500'
                          : 'bg-blue-50/60 border-blue-100 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="font-bold text-slate-900 mb-0.5">{n.title}</div>
                      <div>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 p-0.5 rounded-full hover:opacity-80 transition-opacity"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {(user?.name || 'I').charAt(0).toUpperCase()}
            </div>
          )}
        </NavLink>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} />
    </header>
  );
};

export default Navbar;
