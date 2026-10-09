import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Timer,
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Flame,
  Award,
  AlertCircle,
  HelpCircle,
  X,
  Dumbbell,
  Mic,
} from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import RestTimer from '../components/RestTimer';
import API from '../services/api';
import { parseWorkoutLog } from '../utils/voiceParser';

export const WorkoutSessionPage = () => {
  const navigate = useNavigate();
  const {
    activeSession,
    hasActiveWorkout,
    pauseWorkout,
    resumeWorkout,
    cancelWorkout,
    finishWorkout,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    addExercise,
    removeExercise,
    startRestTimer,
    startWorkout,
  } = useWorkout();

  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showFormTips, setShowFormTips] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState('');
  const [isVoiceLogging, setIsVoiceLogging] = useState(false);
  const [voiceLogFeedback, setVoiceLogFeedback] = useState('');

  const handleVoiceLogSet = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or standard inputs.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceLogging(true);
      setVoiceLogFeedback('Listening... Speak: "4 sets 10 reps 80 kg" or "10 reps 80 kg"');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const parsed = parseWorkoutLog(text);
      if (parsed) {
        setVoiceLogFeedback(`✓ Logged by Voice: ${parsed.formattedSummary}`);
        const setsNeeded = parsed.sets || 1;
        while (currentExercise.sets.length < setsNeeded) {
          addSet(currentExIdx);
        }
        for (let i = 0; i < setsNeeded; i++) {
          if (i < currentExercise.sets.length) {
            updateSet(currentExIdx, i, 'weightKg', parsed.weightKg);
            updateSet(currentExIdx, i, 'reps', parsed.reps);
          }
        }
      } else {
        setVoiceLogFeedback(`Could not parse: "${text}". Try saying "10 reps 80 kg"`);
      }
      setTimeout(() => {
        setIsVoiceLogging(false);
      }, 3500);
    };

    recognition.onerror = (err) => {
      console.warn('Voice log error:', err);
      setIsVoiceLogging(false);
      setVoiceLogFeedback('Microphone error or could not hear audio.');
    };

    recognition.onend = () => {
      setIsVoiceLogging(false);
    };

    recognition.start();
  };

  // Load exercises for in-session addition
  useEffect(() => {
    const loadExercises = async () => {
      try {
        const res = await API.get('/exercises');
        if (res.data?.success) {
          setLibraryExercises(res.data.data);
        }
      } catch (e) {}
    };
    loadExercises();
  }, []);

  const exercises = activeSession?.exercises || [];
  const currentExercise = exercises[currentExIdx] || exercises[0];

  // Duration formatting (HH:MM:SS)
  const formatDuration = (totalSecs = 0) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    if (!window.confirm('Finish and log this workout to MongoDB?')) return;
    try {
      setIsFinishing(true);
      setFinishError('');
      const res = await finishWorkout();
      if (!res.success) {
        setFinishError(res.message || 'Failed to save session');
      }
    } catch (err) {
      setFinishError('Network error saving workout.');
    } finally {
      setIsFinishing(false);
    }
  };

  const handleConfirmDiscard = () => {
    cancelWorkout();
    setShowDiscardModal(false);
    navigate('/workouts');
  };

  const handleNextExercise = () => {
    if (currentExIdx < exercises.length - 1) {
      setCurrentExIdx(currentExIdx + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExIdx > 0) {
      setCurrentExIdx(currentExIdx - 1);
    }
  };

  const handleAddWeight = (setIdx, delta) => {
    const set = currentExercise.sets[setIdx];
    const newWeight = Math.max(0, (Number(set.weightKg) || 0) + delta);
    updateSet(currentExIdx, setIdx, 'weightKg', newWeight);
  };

  const handleAddReps = (setIdx, delta) => {
    const set = currentExercise.sets[setIdx];
    const newReps = Math.max(0, (Number(set.reps) || 0) + delta);
    updateSet(currentExIdx, setIdx, 'reps', newReps);
  };

  // Look up full exercise info from library for form tips
  const fullExerciseInfo = libraryExercises.find(
    (e) => e._id === currentExercise?.exercise || e.name === currentExercise?.exerciseName
  );

  // If there is no active workout session, display a clean start / resume prompt
  if (!hasActiveWorkout || !activeSession) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Dumbbell className="w-10 h-10 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
            No Active Workout
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            You don't currently have a workout session in progress. Pick an established routine from your library or start a quick custom session.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              startWorkout({ name: 'Quick Gym Workout', targetMuscles: ['Full Body'] });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Start Quick Session
          </button>
          <button
            onClick={() => navigate('/workouts')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 transition-all shadow-sm"
          >
            Browse Routines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 select-none pb-20 animate-fade-in">
      {/* 1. TOP GYM HUD BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Active Workout
          </span>
          <h1 className="text-lg md:text-xl font-black font-display text-slate-900 tracking-tight truncate max-w-[180px] md:max-w-xs">
            {activeSession?.workoutName || 'Live Workout'}
          </h1>
        </div>

        {/* Live Duration Timer */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <Timer className="w-4 h-4 text-blue-600" />
            <span className="font-mono text-base md:text-lg font-black text-slate-900">
              {formatDuration(activeSession?.elapsedSeconds || 0)}
            </span>
            <button
              onClick={activeSession?.isPaused ? resumeWorkout : pauseWorkout}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              title={activeSession?.isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {activeSession?.isPaused ? (
                <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
              ) : (
                <Pause className="w-3.5 h-3.5 fill-current text-amber-500" />
              )}
            </button>
          </div>

          {/* Discard Button */}
          <button
            type="button"
            onClick={() => setShowDiscardModal(true)}
            className="px-3 md:px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all active:scale-95"
            title="Discard this workout without saving"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>DISCARD</span>
          </button>

          {/* Finish Button */}
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs md:text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isFinishing ? 'Saving...' : 'FINISH'}
          </button>
        </div>
      </div>

      {finishError && (
        <div className="p-3 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{finishError}</span>
        </div>
      )}

      {/* 2. EXERCISE SELECTOR PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exercises.map((ex, i) => {
          const isCurrent = i === currentExIdx;
          const completedCount = (ex.sets || []).filter((s) => s.isCompleted).length;
          const totalCount = (ex.sets || []).length;
          const isDone = completedCount === totalCount && totalCount > 0;

          return (
            <button
              key={i}
              onClick={() => setCurrentExIdx(i)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{ex.exerciseName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {completedCount}/{totalCount}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setShowAddExModal(true)}
          className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-600 text-xs font-bold border border-slate-200 flex items-center gap-1 whitespace-nowrap shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Exercise
        </button>
      </div>

      {/* 3. CURRENT EXERCISE CARD */}
      {currentExercise && (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 space-y-5 shadow-sm">
          {/* Header info */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Exercise {currentExIdx + 1} of {exercises.length}
              </div>
              <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight mt-0.5">
                {currentExercise.exerciseName}
              </h2>
              <span className="text-xs font-bold text-blue-600 uppercase">
                {currentExercise.muscleGroup || 'Target Muscle'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Logging Button */}
              <button
                type="button"
                onClick={handleVoiceLogSet}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isVoiceLogging
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
                }`}
                title="Log sets with your voice"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isVoiceLogging ? 'Listening...' : 'Voice Log'}</span>
              </button>

              <button
                onClick={() => setShowFormTips(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5"
                title="Exercise Form Guide"
              >
                <HelpCircle className="w-4 h-4 text-blue-600" /> Form Tips
              </button>

              {exercises.length > 1 && (
                <button
                  onClick={() => removeExercise(currentExIdx)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600"
                  title="Remove Exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Voice Feedback Banner */}
          {voiceLogFeedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-bold animate-fade-in ${
              voiceLogFeedback.startsWith('✓')
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <Mic className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
              <span>{voiceLogFeedback}</span>
            </div>
          )}

          {/* 4. SET TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <th className="py-2 w-10 text-center">Set</th>
                  <th className="py-2">Previous</th>
                  <th className="py-2 text-center">Weight (KG)</th>
                  <th className="py-2 text-center">Reps</th>
                  <th className="py-2 w-16 text-center">Status</th>
                  <th className="py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(currentExercise.sets || []).map((set, sIdx) => {
                  return (
                    <tr
                      key={sIdx}
                      className={`transition-colors ${
                        set.isCompleted ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Set Number */}
                      <td className="py-3 text-center">
                        <span
                          className={`w-7 h-7 mx-auto rounded-lg text-xs font-bold flex items-center justify-center ${
                            set.isCompleted
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {set.setNumber}
                        </span>
                      </td>

                      {/* Previous Performance */}
                      <td className="py-3 text-xs text-slate-500 font-mono">
                        {set.previousWeightKg ? `${set.previousWeightKg}kg × ${set.previousReps}` : '—'}
                      </td>

                      {/* Weight Stepper */}
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddWeight(sIdx, -2.5)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            value={set.weightKg}
                            onChange={(e) =>
                              updateSet(currentExIdx, sIdx, 'weightKg', Number(e.target.value))
                            }
                            className="w-16 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg py-1 text-center font-bold text-slate-900 text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddWeight(sIdx, 2.5)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Reps Stepper */}
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddReps(sIdx, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(currentExIdx, sIdx, 'reps', Number(e.target.value))
                            }
                            className="w-14 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg py-1 text-center font-bold text-slate-900 text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddReps(sIdx, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Complete Checkbox */}
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSetComplete(currentExIdx, sIdx)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 border ${
                            set.isCompleted
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:border-slate-400'
                          }`}
                          title="Complete Set"
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>
                      </td>

                      {/* Delete Set */}
                      <td className="py-3 text-right">
                        {currentExercise.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(currentExIdx, sIdx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Set Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => addSet(currentExIdx)}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-blue-600" /> + ADD SET
            </button>
          </div>
        </div>
      )}

      {/* 5. INLINE REST TIMER */}
      <RestTimer inline={true} />

      {/* 6. BOTTOM NAVIGATION (PREV / NEXT / FINISH) */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrevExercise}
          disabled={currentExIdx === 0}
          className="py-3.5 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-2 disabled:opacity-30 transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> PREVIOUS
        </button>

        <button
          onClick={() => setShowDiscardModal(true)}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Discard Session
        </button>

        {currentExIdx < exercises.length - 1 ? (
          <button
            onClick={handleNextExercise}
            className="py-3.5 px-6 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-all active:scale-95"
          >
            NEXT EXERCISE <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="py-3.5 px-6 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
          >
            FINISH WORKOUT <Award className="w-4 h-4 fill-white" />
          </button>
        )}
      </div>

      {/* MODAL: ADD EXERCISE TO ACTIVE WORKOUT */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-2xl p-6 border border-slate-200 flex flex-col shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Movement</h3>
              <button
                onClick={() => setShowAddExModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                placeholder="Search exercise..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {libraryExercises
                .filter((e) => e.name.toLowerCase().includes(exerciseSearch.toLowerCase()))
                .map((ex) => (
                  <div
                    key={ex._id}
                    onClick={() => {
                      addExercise(ex);
                      setShowAddExModal(false);
                      setCurrentExIdx(exercises.length);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{ex.name}</div>
                      <div className="text-[10px] text-slate-500">{ex.muscleGroup}</div>
                    </div>
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXERCISE FORM GUIDE */}
      {showFormTips && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md max-h-[85vh] rounded-2xl p-6 border border-slate-200 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {currentExercise.exerciseName} - Form Guide
              </h3>
              <button
                onClick={() => setShowFormTips(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div>
                <h4 className="font-bold text-blue-600 uppercase tracking-wider mb-2">
                  Target Muscles
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(fullExerciseInfo?.targetMuscles || [currentExercise.muscleGroup]).map((m, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-blue-600 uppercase tracking-wider mb-2">
                  Execution Steps
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-slate-700 leading-relaxed">
                  {(
                    fullExerciseInfo?.instructions || [
                      'Control the eccentric phase for 2 seconds.',
                      'Maintain neutral spine and tight core brace.',
                      'Drive weight through palms or heels without jerking.',
                    ]
                  ).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-rose-600 uppercase tracking-wider mb-2">
                  Common Mistakes
                </h4>
                <ul className="space-y-1 list-disc list-inside text-slate-500">
                  {(
                    fullExerciseInfo?.commonMistakes || [
                      'Using excessive momentum',
                      'Truncating range of motion',
                    ]
                  ).map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowFormTips(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-colors"
            >
              Got It, Back to Lifting
            </button>
          </div>
        </div>
      )}

      {/* MODAL: DISCARD WORKOUT CONFIRMATION */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Discard Active Workout?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will clear all logged sets, reps, and elapsed time.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Are you sure you want to discard <strong className="text-slate-900">"{activeSession?.workoutName || 'this workout'}"</strong>? 
              This session will not be saved to your workout history or analytics.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Keep Lifting
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                Yes, Discard Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSessionPage;
