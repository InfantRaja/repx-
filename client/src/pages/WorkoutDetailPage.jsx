import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Copy, Trash2, Clock, Dumbbell, Layers, Trophy } from 'lucide-react';
import API from '../services/api';
import { useWorkout } from '../context/WorkoutContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const WorkoutDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startWorkout } = useWorkout();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/workouts/${id}`);
        if (res.data?.success) {
          setWorkout(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load workout:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [id]);

  const handleStart = () => {
    if (workout) {
      startWorkout(workout);
      navigate('/workout/session');
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await API.post(`/workouts/${id}/duplicate`);
      if (res.data?.success) {
        navigate('/workouts');
      }
    } catch (e) {}
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this workout routine?')) return;
    try {
      await API.delete(`/workouts/${id}`);
      navigate('/workouts');
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-white">Workout Not Found</h2>
        <button
          onClick={() => navigate('/workouts')}
          className="mt-4 px-4 py-2 rounded-xl bg-repx-800 text-xs font-bold text-slate-300"
        >
          Back to Routines
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/workouts')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Routines
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="p-2 rounded-xl bg-repx-850 hover:bg-repx-800 text-slate-300 border border-repx-border text-xs font-bold flex items-center gap-1.5"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          {!workout.isTemplate && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl bg-repx-850 hover:bg-repx-crimson/20 text-repx-crimson border border-repx-border text-xs font-bold"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Routine Banner */}
      <div className="repx-card rounded-3xl p-6 md:p-8 border border-repx-border space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg bg-repx-volt/15 text-repx-volt border border-repx-volt/30">
            {workout.difficulty || 'Intermediate'}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> ~{workout.estimatedDurationMinutes || 60}m
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
          {workout.name}
        </h1>

        <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl">
          {workout.description || 'Targeted strength protocol with structured progressive overload.'}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {(workout.targetMuscles || []).map((m) => (
            <span
              key={m}
              className="px-3 py-1 rounded-xl bg-repx-800 text-xs font-bold text-slate-300 border border-repx-border"
            >
              {m}
            </span>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-repx-volt text-black font-black font-display text-sm hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2.5 shadow-volt-glow active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" /> START THIS WORKOUT
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black font-display text-white">
          Programmed Movements ({workout.exercises?.length || 0})
        </h3>

        <div className="space-y-3">
          {(workout.exercises || []).map((item, idx) => (
            <div
              key={idx}
              className="repx-card rounded-2xl p-5 border border-repx-border flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-xl bg-repx-800 text-repx-volt font-black font-display flex items-center justify-center text-sm border border-repx-border">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-sm md:text-base font-bold text-white">
                    {item.exerciseName || item.exercise?.name}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.muscleGroup || item.exercise?.muscleGroup} • {item.defaultSets?.length || 3} Target Sets
                  </div>
                </div>
              </div>

              {/* Sets summary & Animation Video button */}
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {(item.defaultSets || []).map((s, sIdx) => (
                    <div
                      key={sIdx}
                      className="px-3 py-1.5 rounded-xl bg-repx-850 border border-repx-border text-xs text-center"
                    >
                      <div className="text-[10px] text-slate-400 font-bold">Set {s.setNumber}</div>
                      <div className="font-extrabold text-white">
                        {s.targetWeight}kg × {s.targetReps}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailPage;
