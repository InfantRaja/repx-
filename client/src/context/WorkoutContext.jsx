import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { sound } from '../utils/sound';

const WorkoutContext = createContext();

const ACTIVE_WORKOUT_STORAGE_KEY = 'repx_active_workout_session';

export const WorkoutProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [completedSummary, setCompletedSummary] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState({
    isActive: false,
    remainingSeconds: 90,
    totalSeconds: 90,
  });

  const timerIntervalRef = useRef(null);
  const restIntervalRef = useRef(null);

  // Sync activeSession to localStorage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(activeSession));
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    }
  }, [activeSession]);

  // Elapsed workout timer tick
  useEffect(() => {
    if (activeSession && !activeSession.isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setActiveSession((prev) => {
          if (!prev || prev.isPaused) return prev;
          return {
            ...prev,
            elapsedSeconds: (prev.elapsedSeconds || 0) + 1,
          };
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [activeSession?.isPaused, !!activeSession]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer.isActive && restTimer.remainingSeconds > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(restIntervalRef.current);
            sound.playRestComplete();
            return { ...prev, isActive: false, remainingSeconds: 0 };
          }
          if (prev.remainingSeconds <= 4) {
            sound.playCountdownTick();
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }

    return () => clearInterval(restIntervalRef.current);
  }, [restTimer.isActive, restTimer.remainingSeconds]);

  // Start workout from routine template or blank
  const startWorkout = (workoutTemplate) => {
    let exercises = [];

    if (workoutTemplate && workoutTemplate.exercises && workoutTemplate.exercises.length > 0) {
      exercises = workoutTemplate.exercises.map((item) => {
        const exId = item.exercise?._id || item.exercise || 'custom';
        const exName = item.exerciseName || item.exercise?.name || 'Exercise';
        const muscleGroup = item.muscleGroup || item.exercise?.muscleGroup || 'Full Body';

        const sets = (item.defaultSets && item.defaultSets.length > 0
          ? item.defaultSets
          : [
              { targetWeight: 60, targetReps: 10 },
              { targetWeight: 60, targetReps: 10 },
              { targetWeight: 60, targetReps: 10 },
            ]
        ).map((s, idx) => ({
          setNumber: idx + 1,
          weightKg: s.targetWeight || 0,
          reps: s.targetReps || 10,
          isCompleted: false,
          isWarmup: !!s.isWarmup,
          previousWeightKg: s.targetWeight || 0,
          previousReps: s.targetReps || 10,
        }));

        return {
          exercise: exId,
          exerciseName: exName,
          muscleGroup,
          notes: item.notes || '',
          sets,
        };
      });
    } else {
      // Default initial exercise if starting blank
      exercises = [
        {
          exercise: null,
          exerciseName: 'Bench Press',
          muscleGroup: 'Chest',
          notes: '',
          sets: [
            { setNumber: 1, weightKg: 60, reps: 10, isCompleted: false, isWarmup: false },
            { setNumber: 2, weightKg: 70, reps: 8, isCompleted: false, isWarmup: false },
            { setNumber: 3, weightKg: 80, reps: 6, isCompleted: false, isWarmup: false },
          ],
        },
      ];
    }

    const newSession = {
      workoutId: workoutTemplate?._id || null,
      workoutName: workoutTemplate?.name || 'Live Gym Workout',
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
      isPaused: false,
      currentExerciseIndex: 0,
      exercises,
    };

    setActiveSession(newSession);
    return newSession;
  };

  const pauseWorkout = () => {
    setActiveSession((prev) => (prev ? { ...prev, isPaused: true } : null));
  };

  const resumeWorkout = () => {
    setActiveSession((prev) => (prev ? { ...prev, isPaused: false } : null));
  };

  const cancelWorkout = () => {
    setActiveSession(null);
    setRestTimer({ isActive: false, remainingSeconds: 0, totalSeconds: 90 });
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  };

  const startRestTimer = (seconds = 90) => {
    setRestTimer({
      isActive: true,
      remainingSeconds: seconds,
      totalSeconds: seconds,
    });
  };

  const stopRestTimer = () => {
    setRestTimer((prev) => ({ ...prev, isActive: false, remainingSeconds: 0 }));
  };

  const adjustRestTimer = (deltaSeconds) => {
    setRestTimer((prev) => {
      const nextRemaining = Math.max(0, prev.remainingSeconds + deltaSeconds);
      return {
        ...prev,
        remainingSeconds: nextRemaining,
        totalSeconds: Math.max(prev.totalSeconds, nextRemaining),
        isActive: nextRemaining > 0,
      };
    });
  };

  // Toggle set completion and trigger rest timer
  const toggleSetComplete = (exIdx, setIdx) => {
    if (!activeSession) return;

    setActiveSession((prev) => {
      const exercises = [...prev.exercises];
      const targetExercise = { ...exercises[exIdx] };
      const sets = [...targetExercise.sets];
      const targetSet = { ...sets[setIdx] };

      const willBeCompleted = !targetSet.isCompleted;
      targetSet.isCompleted = willBeCompleted;
      sets[setIdx] = targetSet;
      targetExercise.sets = sets;
      exercises[exIdx] = targetExercise;

      if (willBeCompleted) {
        sound.playSetComplete();
        // Start rest timer
        startRestTimer(90);
      }

      return { ...prev, exercises };
    });
  };

  // Add a new set to current exercise
  const addSet = (exIdx) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      const exercises = [...prev.exercises];
      const target = { ...exercises[exIdx] };
      const sets = [...target.sets];
      const lastSet = sets[sets.length - 1];

      sets.push({
        setNumber: sets.length + 1,
        weightKg: lastSet ? lastSet.weightKg : 60,
        reps: lastSet ? lastSet.reps : 10,
        isCompleted: false,
        isWarmup: false,
        previousWeightKg: lastSet ? lastSet.weightKg : 0,
        previousReps: lastSet ? lastSet.reps : 0,
      });

      target.sets = sets;
      exercises[exIdx] = target;
      return { ...prev, exercises };
    });
  };

  // Remove set
  const removeSet = (exIdx, setIdx) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      const exercises = [...prev.exercises];
      const target = { ...exercises[exIdx] };
      let sets = target.sets.filter((_, idx) => idx !== setIdx);
      sets = sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      target.sets = sets;
      exercises[exIdx] = target;
      return { ...prev, exercises };
    });
  };

  // Update set values (weight, reps, etc.)
  const updateSet = (exIdx, setIdx, field, value) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      const exercises = [...prev.exercises];
      const target = { ...exercises[exIdx] };
      const sets = [...target.sets];
      sets[setIdx] = {
        ...sets[setIdx],
        [field]: value,
      };
      target.sets = sets;
      exercises[exIdx] = target;
      return { ...prev, exercises };
    });
  };

  // Add exercise to active session
  const addExercise = (exercise) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      const exercises = [
        ...prev.exercises,
        {
          exercise: exercise._id,
          exerciseName: exercise.name,
          muscleGroup: exercise.muscleGroup,
          notes: '',
          sets: [
            { setNumber: 1, weightKg: 40, reps: 10, isCompleted: false, isWarmup: false },
            { setNumber: 2, weightKg: 50, reps: 8, isCompleted: false, isWarmup: false },
            { setNumber: 3, weightKg: 60, reps: 6, isCompleted: false, isWarmup: false },
          ],
        },
      ];
      return {
        ...prev,
        exercises,
        currentExerciseIndex: exercises.length - 1,
      };
    });
  };

  // Remove exercise from active session
  const removeExercise = (exIdx) => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      const exercises = prev.exercises.filter((_, idx) => idx !== exIdx);
      const nextIndex = Math.max(0, Math.min(prev.currentExerciseIndex, exercises.length - 1));
      return {
        ...prev,
        exercises,
        currentExerciseIndex: nextIndex,
      };
    });
  };

  // Finish Workout and send to MongoDB API
  const finishWorkout = async () => {
    if (!activeSession) return { success: false, message: 'No workout active' };

    try {
      const payload = {
        workoutId: activeSession.workoutId,
        workoutName: activeSession.workoutName,
        startTime: activeSession.startTime,
        endTime: new Date().toISOString(),
        durationSeconds: activeSession.elapsedSeconds || 1,
        exercises: activeSession.exercises,
      };

      const res = await API.post('/workout-sessions', payload);

      if (res.data?.success) {
        const { session, personalRecordsBroken, stats } = res.data.data;

        // Stop timers
        cancelWorkout();

        if (personalRecordsBroken && personalRecordsBroken.length > 0) {
          sound.playPRCelebration();
        }

        setCompletedSummary({
          session,
          personalRecordsBroken: personalRecordsBroken || [],
          stats,
        });
        setShowCompletionModal(true);

        return { success: true, data: res.data.data };
      }
    } catch (err) {
      console.error('Failed to log workout session:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to save workout session to server',
      };
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        activeSession,
        hasActiveWorkout: !!activeSession,
        startWorkout,
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
        restTimer,
        startRestTimer,
        stopRestTimer,
        adjustRestTimer,
        completedSummary,
        showCompletionModal,
        setShowCompletionModal,
        setActiveSession,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
