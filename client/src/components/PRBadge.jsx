import React from 'react';
import { Flame } from 'lucide-react';

export const PRBadge = ({ text = 'PR', size = 'sm', glowing = true }) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2 font-bold',
  }[size] || 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-display font-extrabold uppercase tracking-wider rounded-md bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/50 text-amber-300 ${sizeClasses} ${
        glowing ? 'shadow-[0_0_15px_-2px_rgba(245,158,11,0.5)]' : ''
      }`}
    >
      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
      {text}
    </span>
  );
};

export default PRBadge;
