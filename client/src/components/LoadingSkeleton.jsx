import React from 'react';

export default function LoadingSkeleton({ type = 'cards', count = 3 }) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 border border-border/60 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-24 bg-slate-200 rounded-lg"></div>
              <div className="h-8 w-16 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-5 w-4/5 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-3/5 bg-slate-100 rounded mb-6"></div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="h-4 w-20 bg-slate-100 rounded"></div>
              <div className="h-8 w-24 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-surface rounded-2xl border border-border/80 shadow-soft p-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      <div className="h-32 bg-slate-100 rounded-2xl"></div>
    </div>
  );
}
