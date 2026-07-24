'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-brand',
  trend,
  trendDirection
}: StatCardProps) {
  return (
    <div className="glass-card hover-scale rounded-xl p-5 shadow-lg select-none relative overflow-hidden transition-all duration-300 border border-border-light dark:border-border-dark">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-semibold tracking-wider uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-text-primary-light dark:text-text-primary-dark mb-2">{value}</h3>
          {description && <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-medium leading-relaxed">{description}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-base-light/60 dark:bg-base-dark/60 border border-border-light/40 dark:border-border-dark/40 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center space-x-1.5">
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            trendDirection === 'up' 
              ? 'bg-accent-green-light/10 text-accent-green-light dark:bg-accent-green-dark/10 dark:text-accent-green-dark' 
              : 'bg-accent-red-light/10 text-accent-red-light dark:bg-accent-red-dark/10 dark:text-accent-red-dark'
          }`}>
            {trend}
          </span>
          <span className="text-[10px] text-text-secondary-light/70 dark:text-text-secondary-dark/70 font-medium">vs last season</span>
        </div>
      )}

      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none rounded-bl-full" />
    </div>
  );
}
