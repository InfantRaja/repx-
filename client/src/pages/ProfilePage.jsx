import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Trophy,
  ThumbsUp,
  MessageCircle,
  Share2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statTab, setStatTab] = useState('Duration'); // 'Duration' | 'Reps'

  const displayName = user?.name || 'INFANT RAJA';
  const displayUsername = user?.username || 'infantraja25';
  const initial = displayName.charAt(0).toUpperCase() || 'I';

  // Sample weekly statistics data matching Hevy screenshot 4
  const weeklyStatsData = [
    { week: 'Jul 26', duration: 1.8, reps: 220 },
    { week: 'Aug 2', duration: 4.2, reps: 480 },
    { week: 'Aug 9', duration: 4.0, reps: 460 },
    { week: 'Aug 16', duration: 3.5, reps: 410 },
    { week: 'Aug 23', duration: 2.2, reps: 280 },
    { week: 'Aug 30', duration: 4.1, reps: 490 },
    { week: 'Sep 6', duration: 4.8, reps: 540 },
    { week: 'Sep 13', duration: 3.9, reps: 430 },
    { week: 'Sep 20', duration: 3.6, reps: 410 },
    { week: 'Sep 27', duration: 1.2, reps: 150 },
    { week: 'Oct 4', duration: 1.6, reps: 210 },
    { week: 'This week', duration: 2.65, reps: 320 },
  ];

  // Calendar dates for October 2026 (matching Hevy screenshot 4)
  // Workout active dates: 5, 6, 7
  const workoutDaysInMonth = [5, 6, 7];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get('/users/me');
        if (res.data?.success) {
          setProfileData(res.data.data);
        }
      } catch (e) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header Card (Exact Hevy Screenshot 4) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center space-y-4">
        {/* Blue Circle Avatar */}
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-black text-3xl flex items-center justify-center shadow-sm">
          {initial}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">{displayUsername}</h2>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            {displayName}
          </div>
        </div>

        <div>
          <NavLink
            to="/settings"
            className="inline-block px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-800 transition-all"
          >
            Edit Profile
          </NavLink>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-12 pt-3 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-400 font-medium">Workouts</div>
            <div className="text-base font-bold text-slate-900">46</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Followers</div>
            <div className="text-base font-bold text-slate-900">5</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Following</div>
            <div className="text-base font-bold text-slate-900">6</div>
          </div>
        </div>
      </div>

      {/* 2. Middle Grid: Statistics & Calendar (Screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Statistics Card (8 Cols on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="text-base font-bold text-slate-900">Statistics</div>

          {/* Duration / Reps Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-4 text-xs font-bold">
              <button
                onClick={() => setStatTab('Duration')}
                className={`pb-2 relative transition-all ${
                  statTab === 'Duration'
                    ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Duration
              </button>
              <button
                onClick={() => setStatTab('Reps')}
                className={`pb-2 relative transition-all ${
                  statTab === 'Reps'
                    ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Reps
              </button>
            </div>

            <select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 outline-none">
              <option>Last 12 weeks</option>
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>

          <div>
            <span className="text-2xl font-black text-slate-900">
              {statTab === 'Duration' ? '2h 39m' : '320 reps'}
            </span>
            <span className="text-xs text-slate-400 ml-2 font-medium">This week</span>
          </div>

          {/* Bar Chart (Hevy Electric Blue) */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStatsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  tickFormatter={(val) => (statTab === 'Duration' ? `${val} hr` : val)}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                  formatter={(val) => [
                    statTab === 'Duration' ? `${val} hrs` : `${val} reps`,
                    statTab,
                  ]}
                />
                <Bar
                  dataKey={statTab === 'Duration' ? 'duration' : 'reps'}
                  fill="#0084FF"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar Card (4 Cols on desktop, Exact Hevy Screenshot 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">Calendar</span>
          </div>

          {/* Month Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1">
            <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>October 2026</span>
            <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-medium">
            {/* Previous month padding (Sep 27-30) */}
            <span className="text-slate-300 py-1">27</span>
            <span className="text-slate-300 py-1">28</span>
            <span className="text-slate-300 py-1">29</span>
            <span className="text-slate-300 py-1">30</span>

            {/* Days 1 to 31 */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const hasWorkout = workoutDaysInMonth.includes(day);

              return (
                <div key={day} className="flex items-center justify-center py-0.5">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      hasWorkout
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Recent Workouts Feed (Screenshot 4 bottom) */}
      <div className="space-y-4">
        <div className="text-sm font-bold text-slate-900">Recent Workouts</div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              {initial}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{displayUsername}</div>
              <div className="text-xs text-slate-400">Yesterday at 5:31 PM</div>
            </div>
          </div>

          <h3 className="text-base font-black text-slate-900">Afternoon workout 💪</h3>

          {/* Stats */}
          <div className="flex items-center gap-6 text-xs text-slate-600 pb-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
              <span className="font-bold text-slate-800">32m</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Volume</span>
              <span className="font-bold text-slate-800">4,100 kg</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Records</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">🏆 1</span>
            </div>
          </div>

          {/* Exercise list */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                🦵
              </div>
              <span className="font-medium text-slate-800">2 sets Single Leg Extensions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                🏋️
              </div>
              <span className="font-medium text-slate-800">3 sets Barbell Squats</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5 pt-3 border-t border-slate-100 text-slate-500 text-xs font-semibold">
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <ThumbsUp className="w-4 h-4" /> <span>0</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4" /> <span>0</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
