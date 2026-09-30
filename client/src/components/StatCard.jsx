import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, change, isDemo = false, trend = 'up' }) {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-border/80 shadow-soft hover:shadow-soft-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-dark">
          {value}
        </h3>
        {isDemo && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
            DEMO
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-muted">
          {subtitle}
        </p>
      )}

      {change && (
        <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600 gap-1">
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
