import React, { useState, useEffect } from 'react';
import { Bell, Flame, Heart, MessageSquare, UserPlus, CheckCheck, Clock } from 'lucide-react';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'pr':
        return <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />;
      case 'like':
        return <Heart className="w-5 h-5 text-repx-crimson fill-repx-crimson" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-repx-cyan fill-repx-cyan" />;
      case 'follower':
        return <UserPlus className="w-5 h-5 text-repx-volt" />;
      default:
        return <Bell className="w-5 h-5 text-repx-volt" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-repx-volt text-black font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time updates on PR milestones, social feedback, and athlete follows.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-repx-850 hover:bg-repx-800 text-xs font-bold text-repx-volt border border-repx-border flex items-center gap-1.5 transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton type="card" count={5} />
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 repx-card rounded-2xl border border-dashed border-repx-border">
          <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-white">No notifications yet</div>
          <div className="text-xs text-slate-400 mt-1">
            Workout activity and community interactions will appear here.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkSingleRead(n._id)}
              className={`repx-card rounded-2xl p-4 border transition-all flex items-start gap-3.5 cursor-pointer ${
                n.isRead
                  ? 'border-repx-border/50 bg-repx-900/40 text-slate-400'
                  : 'border-repx-borderLight bg-repx-900 text-slate-200 shadow-md'
              }`}
            >
              <div className="p-2 rounded-xl bg-repx-850 border border-repx-border shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs md:text-sm font-black font-display text-white">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-repx-volt shrink-0 mt-2 shadow-volt-glow" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
