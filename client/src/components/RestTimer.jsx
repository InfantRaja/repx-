import React from 'react';
import { Timer, Plus, Minus, X, Volume2, RotateCcw } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

export const RestTimer = ({ inline = false }) => {
  const { restTimer, startRestTimer, stopRestTimer, adjustRestTimer } = useWorkout();

  if (!restTimer.isActive && !inline) return null;

  const minutes = Math.floor(restTimer.remainingSeconds / 60);
  const seconds = restTimer.remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct =
    restTimer.totalSeconds > 0
      ? ((restTimer.totalSeconds - restTimer.remainingSeconds) / restTimer.totalSeconds) * 100
      : 0;

  if (inline) {
    return (
      <div className="repx-card rounded-2xl p-4 border border-repx-volt/40 bg-repx-900/90 shadow-volt-glow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-repx-volt animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300">
              Rest Interval
            </span>
          </div>
          <span className="text-2xl font-black font-display text-repx-volt tracking-tight">
            {formattedTime}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-repx-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-repx-volt h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, 100 - progressPct))}%` }}
          ></div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustRestTimer(-15)}
              className="px-2.5 py-1 rounded-lg bg-repx-800 hover:bg-repx-700 text-xs font-bold text-slate-300 flex items-center gap-1 border border-repx-border"
              title="-15s"
            >
              <Minus className="w-3 h-3" /> 15s
            </button>
            <button
              onClick={() => adjustRestTimer(15)}
              className="px-2.5 py-1 rounded-lg bg-repx-800 hover:bg-repx-700 text-xs font-bold text-slate-300 flex items-center gap-1 border border-repx-border"
              title="+15s"
            >
              <Plus className="w-3 h-3" /> 15s
            </button>
            <button
              onClick={() => startRestTimer(60)}
              className="px-2.5 py-1 rounded-lg bg-repx-800 hover:bg-repx-700 text-xs font-bold text-slate-300 border border-repx-border"
            >
              60s
            </button>
            <button
              onClick={() => startRestTimer(90)}
              className="px-2.5 py-1 rounded-lg bg-repx-800 hover:bg-repx-700 text-xs font-bold text-slate-300 border border-repx-border"
            >
              90s
            </button>
          </div>

          <button
            onClick={stopRestTimer}
            className="px-3 py-1 rounded-lg bg-repx-crimson/20 hover:bg-repx-crimson/30 text-repx-crimson text-xs font-bold border border-repx-crimson/40"
          >
            Skip Rest
          </button>
        </div>
      </div>
    );
  }

  // Floating Gym HUD
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 animate-bounce-in">
      <div className="repx-card rounded-2xl p-4 border-2 border-repx-volt/60 bg-repx-900/95 shadow-[0_0_30px_rgba(212,255,0,0.35)] backdrop-blur-xl flex items-center gap-4 min-w-[280px]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#1B212F"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#D4FF00"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 * (progressPct / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <Timer className="w-5 h-5 text-repx-volt absolute" />
        </div>

        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
            Rest Timer
          </div>
          <div className="text-2xl font-black font-display text-white tracking-tight">
            {formattedTime}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjustRestTimer(15)}
            className="w-8 h-8 rounded-lg bg-repx-800 hover:bg-repx-700 flex items-center justify-center text-xs font-bold text-slate-200 border border-repx-border"
            title="+15 seconds"
          >
            +15
          </button>
          <button
            onClick={stopRestTimer}
            className="w-8 h-8 rounded-lg bg-repx-crimson/20 hover:bg-repx-crimson/30 flex items-center justify-center text-repx-crimson border border-repx-crimson/40"
            title="Skip Rest"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
