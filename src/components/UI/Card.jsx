import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        'neu-card bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-md dark:shadow-2xl transition-all duration-300 animate-slide-up',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
