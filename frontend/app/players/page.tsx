'use client';

import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { getMatches } from '@/lib/api';
import { Match } from '@/lib/types';
import { useAppState } from '@/context/AppContext';
import { Sparkles, Trophy } from 'lucide-react';
import PlayerSearch from './PlayerSearch';
import LeaderboardPanel from './LeaderboardPanel';
import ProfileDrawer from './ProfileDrawer';

export default function PlayersPage() {
  const { state, dispatch } = useAppState();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Synchronize navigation activePage state to 'players' on mount
  useEffect(() => {
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'players' });
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-text-primary selection:bg-brand/35 selection:text-white font-sans transition-colors duration-300">
      {/* Navigation bar */}
      <Nav />

      {/* Core Layout Frame */}
      <main className="flex-grow max-w-[1180px] mx-auto w-full px-8 py-8 space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Superstar Player Profiles</h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 font-mono uppercase tracking-wider">
              Interactive radar skills, consistency heatmaps, and PNG exports
            </p>
          </div>
          <div>
            <PlayerSearch 
              onSelect={(player) => {
                setSelectedPlayerId(player.id);
              }} 
            />
          </div>
        </div>

        {/* Selector Banner Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-2/40 to-brand-dark/5 border border-border-light dark:border-border-dark p-6 shadow-lg mb-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -z-10"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                <span>Select a Legend to Profile</span>
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 max-w-2xl">
                Click on any player in the live leaderboards below to load their skill ratings, seasonal consistency heatmaps, streamed career bio, and exportable stat card.
              </p>
            </div>
          </div>
        </div>

        {/* Three Leaderboards Side-by-side */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Batting Leaderboard */}
          <LeaderboardPanel
            title="All-Time Batting Leaders"
            category="batting"
            metricOptions={[
              { value: 'runs', label: 'Runs' }
            ]}
            badgeColorClass="text-brand bg-brand/5 border-brand/10"
            badgeLabel="Runs"
            iconType="trophy"
            onPlayerSelect={(id) => setSelectedPlayerId(id)}
          />

          {/* All-Rounder Leaderboard */}
          <LeaderboardPanel
            title="All-Time All-Rounders"
            category="all-rounders"
            metricOptions={[
              { value: 'rating', label: 'Rating' }
            ]}
            badgeColorClass="text-emerald-500 bg-emerald-500/5 border-emerald-500/10"
            badgeLabel="Rating"
            iconType="award"
            onPlayerSelect={(id) => setSelectedPlayerId(id)}
          />

          {/* Bowling Leaderboard */}
          <LeaderboardPanel
            title="All-Time Bowling Leaders"
            category="bowling"
            metricOptions={[
              { value: 'wickets', label: 'Wickets' }
            ]}
            badgeColorClass="text-accent-purple-light bg-accent-purple-light/5 border-accent-purple-light/10"
            badgeLabel="Wickets"
            iconType="activity"
            onPlayerSelect={(id) => setSelectedPlayerId(id)}
          />

        </div>

        {/* Side Drawer Profile Detail Panel */}
        <ProfileDrawer
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />

      </main>

      {/* Footer */}
      <footer className="bg-surface-2 border-t border-border-light dark:border-border-dark py-6 px-8 text-center text-xs text-text-secondary font-medium flex flex-col md:flex-row justify-between items-center max-w-[1180px] mx-auto w-full transition-colors duration-300">
        <p>© {new Date().getFullYear()} IPL Mega-Website Stats Universe. All rights reserved.</p>
        <p className="mt-1 md:mt-0 text-[10px] text-text-muted font-mono">
          Compiled across 19 seasons of historical cricket logs (2008–2026).
        </p>
      </footer>
    </div>
  );
}
