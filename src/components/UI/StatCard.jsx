import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendText,
  color = 'emerald'
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'shadow-sm'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      glow: 'shadow-sm'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      glow: 'shadow-sm'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      glow: 'shadow-sm'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      glow: 'shadow-sm'
    }
  };

  const style = colorStyles[color] || colorStyles.emerald;

  return (
    <Card className={`relative overflow-hidden group hover:scale-[1.01] transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${style.bg} dark:bg-slate-800 ${style.text} dark:text-slate-200 border ${style.border} dark:border-slate-700 ${style.glow} dark:shadow-none group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trendText && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold">
          {trend === 'up' ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          ) : null}
          <span className={trend === 'up' ? 'text-emerald-700 dark:text-emerald-400' : trend === 'down' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}>
            {trendText}
          </span>
        </div>
      )}
    </Card>
  );
};
