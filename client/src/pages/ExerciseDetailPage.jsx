import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Dumbbell, AlertTriangle, CheckCircle, Target, Sparkles } from 'lucide-react';
import API from '../services/api';
import { useWorkout } from '../context/WorkoutContext';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const ExerciseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startWorkout } = useWorkout();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/exercises/${id}`);
        if (res.data?.success) {
          setExercise(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load exercise:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  const handleStartExercise = () => {
    if (exercise) {
      startWorkout({
        name: `${exercise.name} Focused Workout`,
        exercises: [
          {
            exercise: exercise._id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            defaultSets: [
              { targetWeight: 60, targetReps: 10 },
              { targetWeight: 70, targetReps: 8 },
              { targetWeight: 80, targetReps: 6 },
            ],
          },
        ],
      });
      navigate('/workout/session');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-white">Exercise Not Found</h2>
        <button
          onClick={() => navigate('/exercises')}
          className="mt-4 px-4 py-2 rounded-xl bg-repx-800 text-xs font-bold text-slate-300"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/exercises')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      {/* Main Exercise Card */}
      <div className="repx-card rounded-3xl p-6 md:p-8 border border-repx-border space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg bg-repx-volt/15 text-repx-volt border border-repx-volt/30">
            {exercise.muscleGroup}
          </span>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg bg-repx-850 text-slate-300 border border-repx-border">
            {exercise.equipment}
          </span>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg bg-repx-850 text-slate-300 border border-repx-border">
            {exercise.difficulty}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
          {exercise.name}
        </h1>

        <div className="pt-3">
          <button
            onClick={handleStartExercise}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-repx-volt text-black font-black font-display text-sm hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2.5 shadow-volt-glow active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" /> TRAIN THIS EXERCISE NOW
          </button>
        </div>
      </div>

      {/* Muscular Anatomy breakdown */}
      <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-4">
        <div className="flex items-center gap-2 text-white font-bold font-display text-base">
          <Target className="w-5 h-5 text-repx-volt" />
          <span>Muscular Recruitment Profile</span>
        </div>

        <div>
          <div className="text-xs uppercase font-extrabold text-slate-400 mb-2">Primary Drivers</div>
          <div className="flex flex-wrap gap-2">
            {(exercise.targetMuscles || [exercise.muscleGroup]).map((m, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-repx-volt/10 text-repx-volt border border-repx-volt/30 text-xs font-bold"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <div>
            <div className="text-xs uppercase font-extrabold text-slate-400 mb-2">
              Synergists & Stabilizers
            </div>
            <div className="flex flex-wrap gap-2">
              {exercise.secondaryMuscles.map((m, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-repx-850 text-slate-300 border border-repx-border text-xs font-medium"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Execution Instructions */}
      <div className="repx-card rounded-3xl p-6 border border-repx-border space-y-4">
        <div className="flex items-center gap-2 text-white font-bold font-display text-base">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>Step-by-Step Biomechanical Execution</span>
        </div>

        <ol className="space-y-3">
          {(exercise.instructions || []).map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-300 leading-relaxed">
              <span className="w-6 h-6 rounded-lg bg-repx-850 text-repx-volt font-black font-display flex items-center justify-center shrink-0 text-xs border border-repx-border">
                {idx + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Common Mistakes */}
      {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
        <div className="repx-card rounded-3xl p-6 border border-repx-crimson/30 bg-repx-crimson/[0.03] space-y-3">
          <div className="flex items-center gap-2 text-repx-crimson font-bold font-display text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Common Form Faults to Avoid</span>
          </div>

          <ul className="space-y-2">
            {exercise.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-repx-crimson font-bold">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetailPage;
