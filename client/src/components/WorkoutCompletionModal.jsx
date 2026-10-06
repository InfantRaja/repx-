import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Flame, Trophy, Clock, Dumbbell, Layers, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import API from '../services/api';

export const WorkoutCompletionModal = () => {
  const navigate = useNavigate();
  const { completedSummary, showCompletionModal, setShowCompletionModal } = useWorkout();
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (showCompletionModal) {
      // Trigger dual side confetti cannons
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4FF00', '#00F0FF', '#FF3366', '#FFFFFF'],
        });
      } catch (e) {
        // Fallback if canvas blocked
      }
    }
  }, [showCompletionModal]);

  if (!showCompletionModal || !completedSummary) return null;

  const { session, personalRecordsBroken = [], stats = {} } = completedSummary;

  const durationMinutes = Math.round((session?.durationSeconds || 0) / 60);
  const hours = Math.floor(durationMinutes / 60);
  const remainingMins = durationMinutes % 60;
  const formattedDuration = hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;

  const totalExercises = session?.exercises?.length || 0;
  const totalSets = session?.totalSets || stats.totalSets || 0;
  const totalVolume = (session?.totalVolumeKg || stats.totalVolumeKg || 0).toLocaleString();
  const prsCount = personalRecordsBroken.length;
  const streak = stats.currentStreak || 1;

  const handleShareWorkout = async () => {
    if (shared || sharing) return;
    try {
      setSharing(true);
      await API.post('/posts', {
        workoutSessionId: session?._id,
        type: prsCount > 0 ? 'pr' : 'workout',
        content: `Completed ${session?.workoutName}! Total volume: ${totalVolume} KG across ${totalSets} sets in ${formattedDuration}. ${
          prsCount > 0 ? `Smashed ${prsCount} Personal Record(s)! 🔥` : 'Consistent grind. #REPX'
        }`,
        workoutSummary: {
          workoutName: session?.workoutName,
          durationMinutes,
          totalVolumeKg: session?.totalVolumeKg,
          prsCount,
          exercisesCount: totalExercises,
          setsCount: totalSets,
          highlights: personalRecordsBroken.map(
            (pr) => `${pr.exerciseName}: ${pr.newValue} KG (NEW PR)`
          ),
        },
      });
      setShared(true);
    } catch (err) {
      console.error('Failed to share to feed:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setShowCompletionModal(false);
    navigate('/dashboard');
  };

  const handleViewProgress = () => {
    setShowCompletionModal(false);
    navigate('/progress');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="repx-card w-full max-w-lg rounded-3xl p-6 md:p-8 border-2 border-repx-volt/40 bg-repx-900/95 shadow-[0_0_50px_rgba(212,255,0,0.25)] relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-repx-volt/15 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="text-center relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-repx-volt/10 border border-repx-volt/40 text-repx-volt font-bold text-xs uppercase tracking-widest mb-3">
            <Flame className="w-4 h-4 fill-repx-volt" /> Workout Finished
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
            WORKOUT COMPLETE
          </h2>
          <p className="text-lg font-bold text-repx-volt mt-1">{session?.workoutName}</p>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 relative z-10">
          <div className="repx-card rounded-2xl p-3.5 text-center border border-repx-border">
            <Clock className="w-4 h-4 mx-auto text-slate-400 mb-1" />
            <div className="text-xs text-slate-400 font-medium">Duration</div>
            <div className="text-lg font-black font-display text-white">{formattedDuration}</div>
          </div>

          <div className="repx-card rounded-2xl p-3.5 text-center border border-repx-border">
            <Dumbbell className="w-4 h-4 mx-auto text-slate-400 mb-1" />
            <div className="text-xs text-slate-400 font-medium">Exercises</div>
            <div className="text-lg font-black font-display text-white">{totalExercises}</div>
          </div>

          <div className="repx-card rounded-2xl p-3.5 text-center border border-repx-border">
            <Layers className="w-4 h-4 mx-auto text-slate-400 mb-1" />
            <div className="text-xs text-slate-400 font-medium">Sets</div>
            <div className="text-lg font-black font-display text-white">{totalSets}</div>
          </div>

          <div className="repx-card rounded-2xl p-3.5 text-center border border-repx-border col-span-2 md:col-span-1">
            <div className="text-xs text-slate-400 font-medium">Total Volume</div>
            <div className="text-lg font-black font-display text-repx-volt">{totalVolume} KG</div>
          </div>

          <div className="repx-card rounded-2xl p-3.5 text-center border border-repx-border">
            <Trophy className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <div className="text-xs text-slate-400 font-medium">PRs Broken</div>
            <div className="text-lg font-black font-display text-amber-400">{prsCount}</div>
          </div>

          <div className="repx-card rounded-2xl p-3.5 text-center border border-repx-border">
            <Flame className="w-4 h-4 mx-auto text-repx-crimson mb-1" />
            <div className="text-xs text-slate-400 font-medium">Current Streak</div>
            <div className="text-lg font-black font-display text-repx-crimson">{streak} DAYS</div>
          </div>
        </div>

        {/* PR Highlights */}
        {prsCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4" /> Personal Records Broken:
            </div>
            <div className="space-y-1.5">
              {personalRecordsBroken.map((pr, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-200 font-medium">{pr.exerciseName}</span>
                  <span className="font-extrabold text-amber-300 font-display">
                    {pr.newValue} KG {pr.reps ? `× ${pr.reps}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 relative z-10">
          <button
            onClick={handleShareWorkout}
            disabled={sharing || shared}
            className={`w-full py-3.5 rounded-xl font-display font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              shared
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-repx-volt text-black hover:bg-repx-voltHover shadow-volt-glow'
            }`}
          >
            {shared ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Shared to Social Feed
              </>
            ) : sharing ? (
              'Posting to Feed...'
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Share Workout to Community
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleViewProgress}
              className="py-3 rounded-xl bg-repx-800 hover:bg-repx-750 text-slate-200 text-xs font-bold font-display border border-repx-border flex items-center justify-center gap-1.5 transition-all"
            >
              View Progress <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClose}
              className="py-3 rounded-xl bg-repx-800 hover:bg-repx-750 text-slate-200 text-xs font-bold font-display border border-repx-border flex items-center justify-center transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCompletionModal;
