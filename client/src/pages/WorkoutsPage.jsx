import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Plus,
  Play,
  Copy,
  Trash2,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
} from 'lucide-react';
import API from '../services/api';
import { useWorkout } from '../context/WorkoutContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

export const WorkoutsPage = () => {
  const navigate = useNavigate();
  const { startWorkout } = useWorkout();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/workouts');
      if (res.data?.success) {
        setWorkouts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleStartWorkout = (workout) => {
    startWorkout(workout);
    navigate('/workout/session');
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await API.post(`/workouts/${id}/duplicate`);
      if (res.data?.success) {
        fetchWorkouts();
      }
    } catch (err) {
      console.error('Failed to duplicate:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this workout routine?')) return;
    try {
      await API.delete(`/workouts/${id}`);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const filteredWorkouts = workouts.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.targetMuscles || []).some((m) => m.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filter === 'Custom') return !w.isTemplate;
    if (filter === 'Templates') return w.isTemplate;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
            Workout Routines
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Select an established routine or build custom high-density hypertrophy protocols.
          </p>
        </div>

        <NavLink
          to="/workouts/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-repx-volt text-black font-black font-display text-sm hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Custom Routine
        </NavLink>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-repx-900 rounded-2xl border border-repx-border">
          {['All', 'Templates', 'Custom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-repx-volt text-black shadow-volt-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routine or muscle..."
            className="w-full bg-repx-900 border border-repx-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-repx-volt"
          />
        </div>
      </div>

      {/* Workout Routines Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton type="card" count={6} />
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No Routines Found"
          description="Build your first workout routine to start crushing reps."
          actionLabel="Create Routine"
          onAction={() => navigate('/workouts/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((w) => (
            <div
              key={w._id}
              onClick={() => navigate(`/workouts/${w._id}`)}
              className="repx-card-interactive rounded-3xl p-6 border border-repx-border cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg border ${
                      w.isTemplate
                        ? 'bg-repx-cyan/15 text-repx-cyan border-repx-cyan/30'
                        : 'bg-repx-volt/15 text-repx-volt border-repx-volt/30'
                    }`}
                  >
                    {w.isTemplate ? 'Official Routine' : 'Custom Athlete Routine'}
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> ~{w.estimatedDurationMinutes || 60}m
                  </span>
                </div>

                <h3 className="text-xl font-black font-display text-white group-hover:text-repx-volt transition-colors">
                  {w.name}
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {w.description || 'Targeted hypertrophy and progressive overload workout.'}
                </p>

                {/* Target muscles tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {(w.targetMuscles || []).map((m) => (
                    <span
                      key={m}
                      className="px-2.5 py-0.5 rounded-lg bg-repx-800 text-[11px] font-medium text-slate-300 border border-repx-border"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Exercises Preview Count */}
                <div className="mt-4 pt-3 border-t border-repx-border/60 flex items-center justify-between text-xs text-slate-400">
                  <span>{w.exercises?.length || 0} Exercises programmed</span>
                  <span className="font-bold text-slate-300">{w.difficulty || 'Intermediate'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleStartWorkout(w)}
                  className="flex-1 py-3 px-4 rounded-xl bg-repx-volt text-black font-black font-display text-xs hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2 shadow-volt-glow active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> START WORKOUT
                </button>

                <button
                  onClick={(e) => handleDuplicate(w._id, e)}
                  className="p-3 rounded-xl bg-repx-800 hover:bg-repx-750 text-slate-400 hover:text-white border border-repx-border transition-all"
                  title="Duplicate Routine"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {!w.isTemplate && (
                  <button
                    onClick={(e) => handleDelete(w._id, e)}
                    className="p-3 rounded-xl bg-repx-800 hover:bg-repx-crimson/20 text-slate-400 hover:text-repx-crimson border border-repx-border transition-all"
                    title="Delete Routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;
