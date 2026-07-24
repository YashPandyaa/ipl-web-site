'use client';

import React, { useState } from 'react';
import { useLiveLeaders } from './useLiveLeaders';
import PlayerRow from './PlayerRow';
import { Trophy, Award, Activity } from 'lucide-react';

interface MetricOption {
  value: string;
  label: string;
  decimals?: number;
}

interface LeaderboardPanelProps {
  title: string;
  category: 'batting' | 'bowling' | 'all-rounders';
  metricOptions: MetricOption[];
  badgeColorClass: string;
  badgeLabel: string;
  iconType: 'trophy' | 'award' | 'activity';
  onPlayerSelect: (playerId: string) => void;
}

export default function LeaderboardPanel({
  title,
  category,
  metricOptions,
  badgeColorClass,
  badgeLabel,
  iconType,
  onPlayerSelect
}: LeaderboardPanelProps) {
  const [metric, setMetric] = useState(metricOptions[0].value);
  const { players, isLoading, isError, refetch } = useLiveLeaders(category, metric);

  const activeMetricOption = metricOptions.find((m) => m.value === metric) || metricOptions[0];

  const renderIcon = () => {
    if (iconType === 'trophy') return <Trophy className="w-4 h-4 text-[#e8a33d]" />;
    if (iconType === 'award') return <Award className="w-4 h-4 text-emerald-400" />;
    return <Activity className="w-4 h-4 text-[#a855f7]" />;
  };

  return (
    <div className="relative overflow-hidden glass-card p-6 rounded-2xl shadow-lg transition-all duration-300 hover:border-border-light dark:hover:border-border-dark flex flex-col min-h-[480px]">
      
      {/* Title & Metric Switcher Chip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-light dark:border-border-dark pb-4 mb-4 gap-3">
        <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
          {renderIcon()}
          <span>{title}</span>
        </h3>
        
        {/* Toggle metrics chips */}
        {metricOptions.length > 1 && (
          <div className="flex bg-surface-2 p-0.5 rounded-lg border border-border-light dark:border-border-dark gap-1 flex-wrap">
            {metricOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMetric(opt.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider transition-all uppercase ${
                  metric === opt.value
                    ? 'bg-brand text-white font-semibold'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard content list */}
      {isLoading ? (
        <div className="space-y-2.5 flex-grow">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border-light dark:border-border-dark animate-pulse">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-surface-light dark:bg-white/5 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 bg-surface-light dark:bg-white/5 rounded w-1/3" />
                  <div className="h-2.5 bg-surface-light dark:bg-white/5 rounded w-1/4" />
                </div>
              </div>
              <div className="w-16 h-5 bg-surface-light dark:bg-white/5 rounded shrink-0" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Failed to load statistics.</span>
          <button 
            onClick={() => refetch()}
            className="text-[10px] bg-surface-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark px-3 py-1 rounded font-mono uppercase"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-2 flex-grow overflow-y-auto pr-0.5">
          {players.map((player, index) => {
            const displayField = metric === 'runs' ? 'runs' : (metric === 'wickets' ? 'wickets' : (metric === 'rating' ? 'score' : metric));
            
            return (
              <PlayerRow
                key={player.id || player.player}
                player={player.player}
                rank={index + 1}
                matches={player.matches}
                innings={player.innings}
                mainValue={player[displayField] ?? 0}
                decimals={activeMetricOption.decimals ?? 0}
                metricLabel={activeMetricOption.label}
                badgeLabel={badgeLabel}
                badgeColorClass={badgeColorClass}
                team={player.team}
                isLive={player.isLive}
                onClick={() => onPlayerSelect(player.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
