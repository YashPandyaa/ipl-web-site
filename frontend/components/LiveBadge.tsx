'use client';

import React from 'react';
import { LiveScorecard } from '../lib/types';

interface LiveBadgeProps {
  scorecard: LiveScorecard | null;
  isLive: boolean;
}

export default function LiveBadge({ scorecard, isLive }: LiveBadgeProps) {
  if (!isLive || !scorecard) return null;

  return (
    <div className="flex items-center space-x-2 bg-danger/10 border border-danger/25 px-2.5 py-1 rounded-sm text-xs font-mono text-danger animate-pulse shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping"></span>
      <span className="font-extrabold tracking-wider">LIVE</span>
      <span className="text-[10px] text-sage-dim">|</span>
      <span className="font-sans font-bold text-chalk text-[10px] uppercase select-none">
        {scorecard.teamA} vs {scorecard.teamB} · {scorecard.battingTeam} {scorecard.runs}/{scorecard.wickets} ({scorecard.overs} ov)
      </span>
      <span className="text-[10px] text-sage-dim">|</span>
      <span className="text-[9px] text-sage">
        {(scorecard.viewers / 1000).toFixed(0)}k watching
      </span>
    </div>
  );
}
