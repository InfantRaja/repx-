import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="repx-card rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-700 rounded w-16 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="repx-card rounded-2xl p-6 animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-48 mb-6"></div>
        <div className="h-64 bg-slate-850/80 rounded-xl flex items-end gap-3 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/80 rounded-t w-full"
              style={{ height: `${20 + Math.random() * 70}%` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="repx-card rounded-xl p-5 animate-pulse flex items-center justify-between">
          <div className="space-y-2.5 flex-1">
            <div className="h-5 bg-slate-800 rounded w-1/3"></div>
            <div className="h-3 bg-slate-850 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-20 bg-slate-800 rounded-lg"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
