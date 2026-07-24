'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLiveUpdates } from '../hooks/useLiveUpdates';
import { LiveScorecard, OrangeCapStat, PurpleCapStat, StadiumStat } from '../lib/types';

interface LiveUpdatesContextType {
  connectionStatus: 'connected' | 'polling' | 'disconnected';
  matchScorecard: LiveScorecard | null;
  liveOrangeCap: OrangeCapStat | null;
  livePurpleCap: PurpleCapStat | null;
  stadiumUpdates: Record<string, Partial<StadiumStat>>;
  lastUpdated: Date;
  isLive: boolean;
}

const LiveUpdatesContext = createContext<LiveUpdatesContextType | undefined>(undefined);

export function LiveUpdatesProvider({ children }: { children: ReactNode }) {
  const value = useLiveUpdates();

  return (
    <LiveUpdatesContext.Provider value={value}>
      {children}
    </LiveUpdatesContext.Provider>
  );
}

export function useLiveContext() {
  const context = useContext(LiveUpdatesContext);
  if (context === undefined) {
    throw new Error('useLiveContext must be used within a LiveUpdatesProvider');
  }
  return context;
}
