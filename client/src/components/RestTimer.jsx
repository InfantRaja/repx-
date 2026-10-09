import React from 'react';
import { Timer, Plus, Minus, X } from 'lucide-react';
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
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Rest Interval
            </span>
          </div>
          <span className="text-2xl font-black font-display text-blue-600 tracking-tight">
            {formattedTime}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-blue-600 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, 100 - progressPct))}%` }}
          ></div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustRestTimer(-15)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 border border-slate-200"
              title="-15s"
            >
              <Minus className="w-3 h-3" /> 15s
            </button>
            <button
              onClick={() => adjustRestTimer(15)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 border border-slate-200"
              title="+15s"
            >
              <Plus className="w-3 h-3" /> 15s
            </button>
            <button
              onClick={() => startRestTimer(60)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200"
            >
              60s
            </button>
            <button
              onClick={() => startRestTimer(90)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200"
            >
              90s
            </button>
          </div>

          <button
            onClick={stopRestTimer}
            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 transition-colors"
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
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xl flex items-center gap-4 min-w-[280px]">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#E2E8F0"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#0084FF"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={125.6}
              strokeDashoffset={125.6 * (progressPct / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <Timer className="w-5 h-5 text-blue-600 absolute" />
        </div>

        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Rest Timer
          </div>
          <div className="text-2xl font-black font-display text-slate-900 tracking-tight">
            {formattedTime}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjustRestTimer(15)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200"
            title="+15 seconds"
          >
            +15
          </button>
          <button
            onClick={stopRestTimer}
            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200"
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
