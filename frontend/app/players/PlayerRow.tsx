'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Award, Trophy, Activity, Loader2 } from 'lucide-react';

interface PlayerRowProps {
  player: string;
  rank: number;
  matches: number;
  innings?: number;
  mainValue: number;
  decimals?: number;
  metricLabel: string;
  badgeLabel: string;
  badgeColorClass: string;
  avatarUrl?: string;
  team?: string;
  isLive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

// Count Up hook for smooth number animations
function useCountUp(target: number, duration: number = 350, decimals: number = 0) {
  const [count, setCount] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    let start = count;
    const end = target;
    if (start === end) return;
    
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const ease = progress * (2 - progress);
      const current = start + (end - start) * ease;
      
      setCount(parseFloat(current.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
    prevTargetRef.current = target;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, decimals, duration]);

  return count;
}

export default function PlayerRow({
  player,
  rank,
  matches,
  innings,
  mainValue,
  decimals = 0,
  metricLabel,
  badgeLabel,
  badgeColorClass,
  avatarUrl,
  team = 'IPL',
  isLive = false,
  isLoading = false,
  onClick
}: PlayerRowProps) {
  const animatedValue = useCountUp(mainValue, 400, decimals);
  const [flash, setFlash] = useState(false);
  const isFirstMount = useRef(true);

  // Flash row background when value changes (live update)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(timer);
  }, [mainValue]);

  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border-light dark:hover:border-border-dark transition-all duration-300 cursor-pointer group relative overflow-hidden select-none ${
        flash 
          ? 'bg-brand/10 shadow-[0_0_15px_rgba(232,163,61,0.15)] border-brand/20' 
          : 'hover:bg-surface-2'
      }`}
    >
      {/* Background flash animation overlay */}
      {flash && (
        <motion.div
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-brand/5 pointer-events-none"
        />
      )}

      {/* Left: Rank & Avatar & Name */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* Rank / Medal Badge */}
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0 transition-colors ${
          isGold ? 'bg-brand/20 text-brand border border-brand/30 text-sm shadow-[0_0_8px_rgba(232,163,61,0.15)]' :
          isSilver ? 'bg-slate-300/20 text-slate-700 dark:text-slate-300 border border-slate-300/30 text-sm shadow-[0_0_8px_rgba(255,255,255,0.08)]' :
          isBronze ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 text-sm shadow-[0_0_8px_rgba(168,85,247,0.15)]' :
          'bg-surface-2 text-text-secondary-light dark:text-text-secondary-dark'
        }`}>
          {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : rank}
        </div>

        {/* Avatar with Live Match Dot */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-border-light dark:border-border-dark flex items-center justify-center text-text-primary-light dark:text-text-primary-dark font-bold text-sm">
            {player.charAt(0)}
          </div>
          {isLive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-2 animate-pulse shadow-[0_0_6px_#10b981]" title="Playing Live Match" />
          )}
        </div>
        
        {/* Player Name and Metadata */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark group-hover:text-brand dark:group-hover:text-white transition-colors truncate block">
            {player}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5 font-mono">
            <span className="bg-surface-2 px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark">{matches} M</span>
            {innings !== undefined && (
              <span className="bg-surface-2 px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark">{innings} I</span>
            )}
            <span className="text-text-secondary-light dark:text-text-secondary-dark font-sans">· {team}</span>
          </div>
        </div>
      </div>

      {/* Right: Progress bar, score badge and Chevron */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Score/Runs Badge */}
        <div className="text-right min-w-[85px] flex items-center justify-end space-x-2">
          <span className={`text-xs font-extrabold font-mono px-2.5 py-1 rounded border transition-all ${badgeColorClass} ${
            flash ? 'scale-110 shadow-md' : ''
          }`}>
            {animatedValue}
          </span>
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-secondary-light dark:text-text-secondary-dark group-hover:text-text-primary-light dark:group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
