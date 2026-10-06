import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Dumbbell,
  Trophy,
  Scale,
  Calendar,
  Layers,
  Play,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  Bot,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useWorkout } from '../context/WorkoutContext';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { startWorkout } = useWorkout();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await API.get('/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleStartTodayWorkout = async () => {
    if (data?.todaysWorkout?.id) {
      try {
        const res = await API.get(`/workouts/${data.todaysWorkout.id}`);
        if (res.data?.success) {
          startWorkout(res.data.data);
          navigate('/workout/session');
          return;
        }
      } catch (e) {}
    }

    // Default template start
    startWorkout({
      name: data?.todaysWorkout?.name || 'Push Day Hypertrophy',
      targetMuscles: data?.todaysWorkout?.targetMuscles || ['Chest', 'Shoulders', 'Triceps'],
    });
    navigate('/workout/session');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-repx-900 rounded-xl w-64 animate-pulse" />
        <LoadingSkeleton type="stat" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="chart" />
          </div>
          <div>
            <LoadingSkeleton type="card" count={4} />
          </div>
        </div>
      </div>
    );
  }

  const { stats = {}, todaysWorkout = {}, charts = {}, recentActivities = [] } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-repx-volt/10 border border-repx-volt/30 text-repx-volt text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> REPX Telemetry Active
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || user?.username}!
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Ready to train? Let's turn consistency into irreversible progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-repx-900 border border-repx-border flex items-center gap-2">
            <Flame className="w-5 h-5 text-repx-crimson fill-repx-crimson animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Streak</div>
              <div className="text-base font-black font-display text-white">
                {stats.workoutStreak || user?.stats?.currentStreak || 0} Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY'S WORKOUT HERO CARD */}
      <div className="repx-card rounded-3xl p-6 md:p-8 border-2 border-repx-volt/30 bg-gradient-to-r from-repx-900 via-repx-850 to-repx-900 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-repx-volt/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <Calendar className="w-4 h-4 text-repx-volt" />
              <span>Today's Program: {todaysWorkout.dayName || 'Scheduled Session'}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
              {todaysWorkout.name || 'PUSH DAY'}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {(todaysWorkout.targetMuscles || ['Chest', 'Shoulders', 'Triceps']).map((m) => (
                <span
                  key={m}
                  className="px-3 py-1 rounded-xl bg-repx-800 border border-repx-border text-xs font-bold text-slate-300"
                >
                  {m}
                </span>
              ))}
              {todaysWorkout.estimatedMinutes > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium ml-2">
                  <Clock className="w-3.5 h-3.5" /> ~{todaysWorkout.estimatedMinutes} mins
                </span>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={handleStartTodayWorkout}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-repx-volt text-black font-black font-display text-base hover:bg-repx-voltHover transition-all flex items-center justify-center gap-3 shadow-volt-glow active:scale-95 group"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              START WORKOUT
            </button>
          </div>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Current Weight */}
        <div className="repx-card-interactive rounded-2xl p-4 md:p-5 border border-repx-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
            <Scale className="w-4 h-4 text-repx-cyan" />
          </div>
          <div className="text-xl md:text-2xl font-black font-display text-white">
            {stats.currentWeight || 75}{' '}
            <span className="text-xs font-medium text-slate-400">KG</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">Latest Entry</span>
          </div>
        </div>

        {/* Weekly Workouts */}
        <div className="repx-card-interactive rounded-2xl p-4 md:p-5 border border-repx-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Weekly Workouts</span>
            <Calendar className="w-4 h-4 text-repx-volt" />
          </div>
          <div className="text-xl md:text-2xl font-black font-display text-white">
            {stats.weeklyWorkouts || 0}{' '}
            <span className="text-xs font-medium text-slate-400">sessions</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Last 7 calendar days</div>
        </div>

        {/* Workout Streak */}
        <div className="repx-card-interactive rounded-2xl p-4 md:p-5 border border-repx-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-repx-crimson" />
          </div>
          <div className="text-xl md:text-2xl font-black font-display text-repx-crimson">
            {stats.workoutStreak || 0}{' '}
            <span className="text-xs font-medium text-slate-400">DAYS</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Continuous momentum</div>
        </div>

        {/* Total Volume */}
        <div className="repx-card-interactive rounded-2xl p-4 md:p-5 border border-repx-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
            <Layers className="w-4 h-4 text-repx-volt" />
          </div>
          <div className="text-xl md:text-2xl font-black font-display text-repx-volt truncate">
            {(stats.totalVolumeKg || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">KG moved in gym</div>
        </div>

        {/* Personal Records */}
        <div className="repx-card-interactive rounded-2xl p-4 md:p-5 border border-repx-border col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Personal Records</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black font-display text-amber-400">
            {stats.prCount || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Trophies locked in</div>
        </div>
      </div>

      {/* REPX AI COACH DOUBT ASSISTANT BANNER */}
      <div className="repx-card rounded-3xl p-5 md:p-6 border border-repx-volt/40 bg-gradient-to-r from-repx-900 via-repx-850 to-repx-900 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-repx-volt/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-repx-volt/20 border border-repx-volt/70 flex items-center justify-center text-repx-volt shadow-volt-glow shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black font-display text-white tracking-tight">
                  REPX AI COACH & GYM DOUBT ASSISTANT
                </h3>
                <span className="text-[10px] bg-repx-volt text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-volt-glow">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Have a doubt about exercise biomechanics, bench press bar path, meal timing, or progressive overload? Ask your coach anytime.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/coach')}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-repx-volt text-black font-extrabold text-xs hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2 shadow-volt-glow active:scale-95 shrink-0"
          >
            <span>ASK AI COACH</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CHARTS & RECENT ACTIVITY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Training Volume History Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="repx-card rounded-3xl p-6 border border-repx-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black font-display text-white">Training Volume Progression</h3>
                <p className="text-xs text-slate-400">Total KG lifted per completed session</p>
              </div>
              <button
                onClick={() => navigate('/progress')}
                className="text-xs font-bold text-repx-volt hover:underline flex items-center gap-1"
              >
                Deep Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-64 w-full">
              {charts.volumeHistory && charts.volumeHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.volumeHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#232938' }}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E1117',
                        borderColor: '#232938',
                        borderRadius: '12px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value.toLocaleString()} KG`, 'Volume']}
                    />
                    <Bar dataKey="volume" fill="#D4FF00" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Complete your first workout to generate volume telemetry.
                </div>
              )}
            </div>
          </div>

          {/* Body Weight Progression Preview */}
          <div className="repx-card rounded-3xl p-6 border border-repx-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black font-display text-white">Body Weight Trend</h3>
                <p className="text-xs text-slate-400">Measured weigh-ins over time (KG)</p>
              </div>
              <button
                onClick={() => navigate('/measurements')}
                className="text-xs font-bold text-repx-cyan hover:underline flex items-center gap-1"
              >
                Log Weigh-in <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-48 w-full">
              {charts.weightHistory && charts.weightHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.weightHistory}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#232938' }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E1117',
                        borderColor: '#232938',
                        borderRadius: '12px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`${val} KG`, 'Weight']}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#00F0FF"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#weightGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No weigh-ins logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Feed */}
        <div className="space-y-4">
          <div className="repx-card rounded-3xl p-6 border border-repx-border h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black font-display text-white">Recent Activity</h3>
              <Activity className="w-4 h-4 text-repx-volt" />
            </div>

            <div className="flex-1 space-y-3">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-repx-850/80 border border-repx-border flex items-start gap-3 hover:border-slate-700 transition-all"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{act.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{act.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{act.detail}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(act.time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  No activity recorded yet.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-repx-border">
              <button
                onClick={() => navigate('/feed')}
                className="w-full py-2.5 rounded-xl bg-repx-800 hover:bg-repx-750 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                Open Social Feed <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
