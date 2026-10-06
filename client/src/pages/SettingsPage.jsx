import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Bell,
  Eye,
  Shield,
  Zap,
  Trash2,
  Check,
  LogOut,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('Account');

  // Account form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Preferences
  const [unit, setUnit] = useState(user?.preferences?.unit || 'kg');
  const [restTimerSound, setRestTimerSound] = useState(
    user?.preferences?.restTimerSound !== undefined ? user.preferences.restTimerSound : true
  );

  // Notifications
  const [notifPrs, setNotifPrs] = useState(true);
  const [notifFollowers, setNotifFollowers] = useState(true);
  const [notifLikes, setNotifLikes] = useState(true);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');
      const res = await updateProfile({
        name,
        bio,
        avatar,
        preferences: {
          unit,
          restTimerSound,
          notifications: {
            prs: notifPrs,
            followers: notifFollowers,
            workoutLikes: notifLikes,
          },
        },
      });

      if (res?.success) {
        setSuccessMsg('Settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(res?.message || 'Failed to update settings');
      }
    } catch (e) {
      setErrorMsg('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete your REPX account? All workouts and PRs will be destroyed.')) {
      return;
    }
    try {
      await API.delete(`/users/${user._id}`);
      logout();
      navigate('/login');
    } catch (e) {
      alert('Failed to delete account');
    }
  };

  const sections = [
    { label: 'Account', icon: User },
    { label: 'Preferences', icon: Moon },
    { label: 'Notifications', icon: Bell },
    { label: 'Security', icon: Shield },
    { label: 'Subscription', icon: Zap },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-0.5">
          Configure telemetry, biometric units, privacy, and account security.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeSection === sec.label;
            return (
              <button
                key={sec.label}
                onClick={() => setActiveSection(sec.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? 'bg-repx-volt text-black shadow-volt-glow'
                    : 'bg-repx-900/60 text-slate-400 hover:text-white border border-repx-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-repx-border/60">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-repx-crimson hover:bg-repx-crimson/10 transition-all border border-repx-border"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3">
          {/* ACCOUNT */}
          {activeSection === 'Account' && (
            <form onSubmit={handleSaveProfile} className="repx-card rounded-3xl p-6 border border-repx-border space-y-4">
              <h3 className="text-base font-black font-display text-white pb-3 border-b border-repx-border">
                Public Athlete Information
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Bio / Philosophy
                </label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover transition-all shadow-volt-glow disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* PREFERENCES */}
          {activeSection === 'Preferences' && (
            <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-5">
              <h3 className="text-base font-black font-display text-white pb-3 border-b border-repx-border">
                App & Gym Preferences
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Weight Measurement Unit
                </label>
                <div className="flex gap-2">
                  {['kg', 'lbs'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold uppercase border transition-all ${
                        unit === u
                          ? 'bg-repx-volt text-black border-repx-volt shadow-volt-glow'
                          : 'bg-repx-900 text-slate-400 border-repx-border hover:text-white'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-repx-border/60">
                <div>
                  <div className="text-xs font-bold text-white">Rest Timer Synthesizer Audio</div>
                  <div className="text-[11px] text-slate-400">
                    Play audio beeps during countdown and completion.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={restTimerSound}
                  onChange={(e) => setRestTimerSound(e.target.checked)}
                  className="accent-repx-volt w-4 h-4 rounded cursor-pointer"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover shadow-volt-glow"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === 'Notifications' && (
            <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-4">
              <h3 className="text-base font-black font-display text-white pb-3 border-b border-repx-border">
                Push & In-App Alerts
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-repx-border/50">
                  <div>
                    <div className="text-xs font-bold text-white">Personal Record Alerts</div>
                    <div className="text-[11px] text-slate-400">
                      Notify when a new all-time gym PR is detected.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPrs}
                    onChange={(e) => setNotifPrs(e.target.checked)}
                    className="accent-repx-volt w-4 h-4 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-repx-border/50">
                  <div>
                    <div className="text-xs font-bold text-white">New Athlete Followers</div>
                    <div className="text-[11px] text-slate-400">
                      Alerts when another lifter follows your journey.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifFollowers}
                    onChange={(e) => setNotifFollowers(e.target.checked)}
                    className="accent-repx-volt w-4 h-4 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-repx-border/50">
                  <div>
                    <div className="text-xs font-bold text-white">Post Interactions & Likes</div>
                    <div className="text-[11px] text-slate-400">
                      Alerts when athletes like your workouts or comment.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifLikes}
                    onChange={(e) => setNotifLikes(e.target.checked)}
                    className="accent-repx-volt w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-repx-volt text-black font-extrabold font-display text-xs hover:bg-repx-voltHover shadow-volt-glow"
                >
                  Save Notification Rules
                </button>
              </div>
            </div>
          )}

          {/* SECURITY & DELETE */}
          {activeSection === 'Security' && (
            <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-6">
              <h3 className="text-base font-black font-display text-white pb-3 border-b border-repx-border">
                Account Security
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-repx-900 border border-repx-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-repx-volt"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => alert('Password update simulation successful!')}
                  className="px-5 py-2.5 rounded-xl bg-repx-800 hover:bg-repx-750 text-xs font-bold text-white border border-repx-border"
                >
                  Update Password
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-repx-crimson/30 space-y-3">
                <div className="text-sm font-bold text-repx-crimson flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" /> Danger Zone
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permanently delete your user account, workout history, custom splits, and Personal
                  Record archives from MongoDB.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 rounded-xl bg-repx-crimson/20 hover:bg-repx-crimson/30 border border-repx-crimson/50 text-repx-crimson text-xs font-bold"
                >
                  Delete Account Permanently
                </button>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION */}
          {activeSection === 'Subscription' && (
            <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-repx-border">
                <h3 className="text-base font-black font-display text-white">Membership Status</h3>
                <span
                  className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${
                    user?.isPro
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-repx-800 text-slate-400 border-repx-border'
                  }`}
                >
                  {user?.isPro ? 'REPX PRO ATHLETE' : 'FREE TIER'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {user?.isPro
                  ? 'Your REPX PRO subscription is active with unlimited workouts and advanced analytics.'
                  : 'Upgrade to REPX PRO (₹199 / month) to unlock advanced PR telemetry and custom split periodization.'}
              </p>

              <div>
                <NavLink
                  to="/pro"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-repx-volt text-black font-black font-display text-xs hover:bg-repx-voltHover shadow-volt-glow"
                >
                  <Sparkles className="w-4 h-4" />{' '}
                  {user?.isPro ? 'Manage PRO Membership' : 'Upgrade to PRO (₹199/mo)'}
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
