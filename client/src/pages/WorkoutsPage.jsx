import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Plus,
  Play,
  Copy,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  FileText,
  Calendar,
  Search,
} from 'lucide-react';
import API from '../services/api';
import { useWorkout } from '../context/WorkoutContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const WorkoutsPage = () => {
  const navigate = useNavigate();
  const { startWorkout } = useWorkout();

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

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
    } finally {
      setActiveMenuId(null);
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
    } finally {
      setActiveMenuId(null);
    }
  };

  const filteredWorkouts = workouts.filter((w) => {
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.exercises || []).some((e) => e.exerciseName?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Routines</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column: Routines List (Like Hevy Screenshot 2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Collapsible header: My Routines */}
          <div className="flex items-center justify-between text-slate-600 font-semibold text-sm select-none">
            <div className="flex items-center gap-1.5">
              <ChevronDown className="w-4 h-4 text-slate-400" />
              <span>My Routines ({filteredWorkouts.length})</span>
            </div>
            {workouts.length > 5 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter routines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none border border-transparent focus:border-blue-400"
                />
              </div>
            )}
          </div>

          {/* Routine Cards */}
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : filteredWorkouts.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No routines created yet.</p>
              <button
                onClick={() => navigate('/workouts/create')}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Create Routine
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkouts.map((workout) => {
                const exerciseNames = (workout.exercises || [])
                  .map((e) => e.exerciseName)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div
                    key={workout._id}
                    onClick={() => handleStartWorkout(workout)}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer relative shadow-sm group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 pr-6">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {workout.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {exerciseNames || workout.description || 'Custom routine'}
                        </p>
                      </div>

                      {/* Three-dots menu */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === workout._id ? null : workout._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {activeMenuId === workout._id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-fade-in text-xs font-medium">
                            <button
                              onClick={() => {
                                navigate(`/workouts/${workout._id}`);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4 text-slate-400" /> Edit Routine
                            </button>
                            <button
                              onClick={(e) => handleDuplicate(workout._id, e)}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4 text-slate-400" /> Duplicate
                            </button>
                            <button
                              onClick={(e) => handleDelete(workout._id, e)}
                              className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Actions (Exact Hevy Screenshot 2) */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
            <button
              onClick={() => navigate('/workouts/create')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-800">New Routine</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/splits')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800">Weekly Splits</span>
                  <span className="text-[10px] ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">10 SPLITS</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutsPage;
