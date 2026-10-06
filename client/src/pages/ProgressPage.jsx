import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  TrendingUp,
  Trophy,
  Scale,
  Dumbbell,
  Layers,
  Activity,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import API from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const ProgressPage = () => {
  const [period, setPeriod] = useState('30d');
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  const periods = [
    { label: '7 DAYS', value: '7d' },
    { label: '30 DAYS', value: '30d' },
    { label: '90 DAYS', value: '90d' },
    { label: '6 MONTHS', value: '6m' },
    { label: '1 YEAR', value: '1y' },
  ];

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/progress?period=${period}`);
        if (res.data?.success) {
          setProgressData(res.data.charts);
        }
      } catch (err) {
        console.error('Failed to load progress telemetry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [period]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & PRs Cabinet Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
            Progress & Strength Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Real MongoDB telemetry tracking Big 3 progression, weight fluctuations, and volume density.
          </p>
        </div>

        <NavLink
          to="/progress/prs"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-extrabold font-display text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <Trophy className="w-4 h-4 fill-amber-400" /> View PR Trophy Cabinet
        </NavLink>
      </div>

      {/* Time Filter Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-repx-900 rounded-2xl border border-repx-border w-fit overflow-x-auto">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              period === p.value
                ? 'bg-repx-volt text-black shadow-volt-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. BIG 3 STRENGTH PROGRESSION (BENCH, SQUAT, DEADLIFT 1RM) */}
          <div className="repx-card rounded-3xl p-6 md:p-8 border border-repx-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-repx-volt">
                  Estimated 1RM Telemetry (Epley Formula)
                </div>
                <h3 className="text-xl font-black font-display text-white">
                  The Big 3 Strength Curves (KG)
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-repx-volt">
                  <span className="w-2.5 h-2.5 rounded-full bg-repx-volt"></span> Bench Press
                </span>
                <span className="flex items-center gap-1.5 text-repx-cyan">
                  <span className="w-2.5 h-2.5 rounded-full bg-repx-cyan"></span> Squat
                </span>
                <span className="flex items-center gap-1.5 text-repx-crimson">
                  <span className="w-2.5 h-2.5 rounded-full bg-repx-crimson"></span> Deadlift
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              {progressData?.strength && progressData.strength.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData.strength}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="kg" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E1117',
                        borderColor: '#232938',
                        borderRadius: '12px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                      formatter={(val, name) => [`${val} KG`, name]}
                    />
                    <Line
                      type="monotone"
                      dataKey="bench"
                      name="Bench Press"
                      stroke="#D4FF00"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#D4FF00' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="squat"
                      name="Squat"
                      stroke="#00F0FF"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#00F0FF' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="deadlift"
                      name="Deadlift"
                      stroke="#FF2E5B"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#FF2E5B' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  Log Bench, Squat, or Deadlift sets to establish Big 3 strength curves.
                </div>
              )}
            </div>
          </div>

          {/* 2-COL GRID: BODY WEIGHT & TRAINING VOLUME */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Body Weight Progression */}
            <div className="repx-card rounded-3xl p-6 border border-repx-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black font-display text-white">Body Weight History</h3>
                  <p className="text-xs text-slate-400">Scale weight trend across {period}</p>
                </div>
                <Scale className="w-5 h-5 text-repx-cyan" />
              </div>

              <div className="h-60 w-full">
                {progressData?.weight && progressData.weight.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData.weight}>
                      <defs>
                        <linearGradient id="weightGradProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis
                        domain={['dataMin - 2', 'dataMax + 2']}
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        unit="kg"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0E1117',
                          borderColor: '#232938',
                          borderRadius: '12px',
                          color: '#FFF',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [`${val} KG`, 'Body Weight']}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#00F0FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#weightGradProgress)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No weigh-in records in this time period.
                  </div>
                )}
              </div>
            </div>

            {/* Training Volume Progression */}
            <div className="repx-card rounded-3xl p-6 border border-repx-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black font-display text-white">Cumulative Session Volume</h3>
                  <p className="text-xs text-slate-400">Total weight displaced per workout</p>
                </div>
                <Layers className="w-5 h-5 text-repx-volt" />
              </div>

              <div className="h-60 w-full">
                {progressData?.volume && progressData.volume.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData.volume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v) => `${v / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0E1117',
                          borderColor: '#232938',
                          borderRadius: '12px',
                          color: '#FFF',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [`${val.toLocaleString()} KG`, 'Volume']}
                      />
                      <Bar dataKey="volume" fill="#D4FF00" radius={[6, 6, 0, 0]} maxBarSize={38} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No completed workouts in this time range.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. WORKOUT FREQUENCY & CONSISTENCY */}
          {progressData?.frequency && progressData.frequency.length > 0 && (
            <div className="repx-card rounded-3xl p-6 border border-repx-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black font-display text-white">Workout Frequency Cadence</h3>
                  <p className="text-xs text-slate-400">Number of gym sessions completed per week</p>
                </div>
                <Flame className="w-5 h-5 text-repx-crimson" />
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData.frequency}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1B212F" vertical={false} />
                    <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0E1117',
                        borderColor: '#232938',
                        borderRadius: '12px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`${val} sessions`, 'Workouts']}
                    />
                    <Bar dataKey="workouts" fill="#FF2E5B" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
