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
  color = 'indigo'
}) => {
  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
      glow: 'hover:shadow-indigo-500/10'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'hover:shadow-emerald-500/10'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'hover:shadow-amber-500/10'
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      glow: 'hover:shadow-rose-500/10'
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'hover:shadow-purple-500/10'
    }
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <Card className={`relative overflow-hidden group hover:border-slate-700/80 transition-all ${style.glow}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white font-heading tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${style.bg} ${style.text} border ${style.border} group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trendText && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs">
          {trend === 'up' ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          ) : null}
          <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}>
            {trendText}
          </span>
        </div>
      )}
    </Card>
  );
};
