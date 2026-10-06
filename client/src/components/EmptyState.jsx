import React from 'react';
import { Dumbbell } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Dumbbell,
  title = 'No Data Found',
  description = 'Start tracking to see your records and progression here.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="repx-card rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 border-dashed border-repx-borderLight">
      <div className="w-16 h-16 rounded-2xl bg-repx-800/80 border border-repx-border flex items-center justify-center mb-4 text-repx-volt shadow-volt-glow">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-display text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-repx-volt text-black font-bold font-display hover:bg-repx-voltHover transition-all shadow-volt-glow active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
