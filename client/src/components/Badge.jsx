import React from 'react';

export default function Badge({ status, label, size = 'sm' }) {
  const norm = (status || label || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['approved', 'completed', 'active', 'success', 'confirmed'].includes(norm)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['pending', 'processing', 'under review', 'pending review'].includes(norm)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['rejected', 'failed', 'suspended', 'danger', 'inactive'].includes(norm)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (['surveys'].includes(norm)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
  } else if (['apps'].includes(norm)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200/80';
  } else if (['social'].includes(norm)) {
    styles = 'bg-sky-50 text-sky-700 border-sky-200/80';
  } else if (['other'].includes(norm)) {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
  }

  const sizeStyles = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px]' 
    : size === 'md' 
    ? 'px-3 py-1 text-sm' 
    : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border capitalize tracking-wide ${styles} ${sizeStyles}`}>
      {label || status}
    </span>
  );
}
