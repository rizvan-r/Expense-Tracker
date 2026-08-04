import React from 'react';

export const Badge = ({ children, variant = 'indigo', className = '' }) => {
  const variants = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 font-bold',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 font-bold',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 font-bold',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant] || variants.indigo} ${className}`}>
      {children}
    </span>
  );
};
