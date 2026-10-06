import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  User,
  Flame,
  Trophy,
  Dumbbell,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  Settings,
  Scale,
  Target,
  Zap,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import PRBadge from '../components/PRBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const isSelf = !id || id === currentUser?._id;
  const targetId = id || currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Workouts');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (!targetId) return;
        const res = await API.get(`/users/${targetId}`);
        if (res.data?.success) {
          setProfile(res.data.data);
          setIsFollowing(res.data.data.isFollowing);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetId]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    try {
      if (isFollowing) {
        await API.delete(`/users/${profile._id}/follow`);
        setIsFollowing(false);
        setProfile((prev) => ({ ...prev, followersCount: Math.max(0, (prev.followersCount || 1) - 1) }));
      } else {
        await API.post(`/users/${profile._id}/follow`);
        setIsFollowing(true);
        setProfile((prev) => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-white">Athlete Profile Not Found</h2>
      </div>
    );
  }

  const onboarding = profile.onboarding || {};
  const stats = profile.stats || {};
  const recentWorkouts = profile.recentWorkouts || [];
  const prs = profile.prs || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Athlete Hero Header */}
      <div className="repx-card rounded-3xl p-6 md:p-8 border border-repx-border relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-repx-volt/10 to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <img
              src={
                profile.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
              }
              alt={profile.name}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-repx-volt/40 shadow-volt-glow shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black font-display text-white">
                  {profile.name}
                </h1>
                {profile.isPro && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    REPX PRO
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 font-medium">@{profile.username}</div>

              <p className="text-xs md:text-sm text-slate-300 max-w-lg leading-relaxed pt-1">
                {profile.bio || 'Tracking telemetry, progressive overload, and relentless consistency.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSelf ? (
              <NavLink
                to="/settings"
                className="px-4 py-2.5 rounded-xl bg-repx-850 hover:bg-repx-800 text-xs font-bold text-slate-200 border border-repx-border flex items-center gap-1.5 transition-all"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </NavLink>
            ) : (
              <button
                onClick={handleToggleFollow}
                className={`px-6 py-2.5 rounded-xl text-xs font-black font-display transition-all ${
                  isFollowing
                    ? 'bg-repx-850 border border-repx-border text-slate-300 hover:text-white'
                    : 'bg-repx-volt text-black hover:bg-repx-voltHover shadow-volt-glow active:scale-95'
                }`}
              >
                {isFollowing ? 'Following' : '+ Follow Athlete'}
              </button>
            )}
          </div>
        </div>

        {/* Followers / Stats Counter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-repx-border/60">
          <div className="text-center">
            <div className="text-xl font-black font-display text-white">
              {stats.totalWorkouts || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Workouts</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-black font-display text-repx-crimson flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-repx-crimson" /> {stats.currentStreak || 0}d
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-black font-display text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> {stats.prCount || prs.length || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Records</div>
          </div>

          <div className="text-center">
            <div className="text-xl font-black font-display text-white">
              {profile.followersCount || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Followers</div>
          </div>

          <div className="text-center col-span-2 sm:col-span-1">
            <div className="text-xl font-black font-display text-white">
              {profile.followingCount || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Following</div>
          </div>
        </div>
      </div>

      {/* Biomarker Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="repx-card rounded-2xl p-3.5 border border-repx-border">
          <div className="text-[10px] font-bold uppercase text-slate-400">Goal</div>
          <div className="text-sm font-black font-display text-repx-volt mt-0.5">
            {onboarding.fitnessGoal || 'Muscle Gain'}
          </div>
        </div>

        <div className="repx-card rounded-2xl p-3.5 border border-repx-border">
          <div className="text-[10px] font-bold uppercase text-slate-400">Level</div>
          <div className="text-sm font-black font-display text-white mt-0.5">
            {onboarding.experienceLevel || 'Intermediate'}
          </div>
        </div>

        <div className="repx-card rounded-2xl p-3.5 border border-repx-border">
          <div className="text-[10px] font-bold uppercase text-slate-400">Height / Weight</div>
          <div className="text-sm font-black font-display text-white mt-0.5">
            {onboarding.height || 178}cm • {onboarding.weight || 75}kg
          </div>
        </div>

        <div className="repx-card rounded-2xl p-3.5 border border-repx-border">
          <div className="text-[10px] font-bold uppercase text-slate-400">Weekly Frequency</div>
          <div className="text-sm font-black font-display text-white mt-0.5">
            {onboarding.trainingDays || 5} Days / week
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-repx-900 rounded-2xl border border-repx-border w-fit">
        {['Workouts', 'PR Shelf'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-repx-volt text-black shadow-volt-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Workouts' && (
        <div className="space-y-3">
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-10 repx-card rounded-2xl border border-dashed border-repx-border text-xs text-slate-500">
              No completed sessions recorded yet.
            </div>
          ) : (
            recentWorkouts.map((w) => (
              <div
                key={w._id}
                className="repx-card rounded-2xl p-4 border border-repx-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-repx-850 border border-repx-border flex items-center justify-center text-repx-volt">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black font-display text-white">{w.workoutName}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {Math.round((w.durationSeconds || 0) / 60)}m
                      </span>
                      <span className="flex items-center gap-1 text-repx-volt font-bold">
                        <Layers className="w-3 h-3" /> {(w.totalVolumeKg || 0).toLocaleString()} KG
                      </span>
                      <span>{w.totalSets || 0} Sets</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  {new Date(w.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'PR Shelf' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prs.length === 0 ? (
            <div className="col-span-full text-center py-10 repx-card rounded-2xl border border-dashed border-repx-border text-xs text-slate-500">
              No PR records established yet.
            </div>
          ) : (
            prs.map((pr) => (
              <div
                key={pr._id}
                className="repx-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/[0.02] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>{pr.category}</span>
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-black font-display text-white mt-1">
                    {pr.exerciseName}
                  </h4>
                </div>
                <div className="mt-4 pt-2 border-t border-repx-border flex items-baseline justify-between">
                  <span className="text-lg font-black font-display text-amber-400">
                    {pr.maxWeightKg} KG
                  </span>
                  <span className="text-xs text-slate-400">× {pr.maxRepsAtMaxWeight} reps</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
