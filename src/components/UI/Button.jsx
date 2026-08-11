import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-white dark:bg-slate-900 border-1.5 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 shadow-sm',
    secondary: 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm',
    success: 'bg-white dark:bg-slate-900 border-1.5 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800 shadow-sm',
    danger: 'bg-white dark:bg-slate-900 border-1.5 border-rose-600 dark:border-rose-500 text-rose-700 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-sm',
    ghost: 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800',
    outline: 'border border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};
