import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        'glass-card rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
