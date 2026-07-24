'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { getPlayers } from '@/lib/api';
import { PlayerSummary } from '@/lib/types';
import { radarScore } from '@/lib/metrics';
import { Shield, Sparkles, UserPlus, Trash2 } from 'lucide-react';

const SLOTS = [
  { id: 'opener1', label: 'Opener 1', role: 'batter' },
  { id: 'opener2', label: 'Opener 2', role: 'batter' },
  { id: 'middle1', label: 'Middle Order 1', role: 'batter' },
  { id: 'middle2', label: 'Middle Order 2', role: 'batter' },
  { id: 'middle3', label: 'Middle Order 3', role: 'batter' },
  { id: 'allrounder1', label: 'All-Rounder 1', role: 'allrounder' },
  { id: 'allrounder2', label: 'All-Rounder 2', role: 'allrounder' },
  { id: 'bowler1', label: 'Bowler 1', role: 'bowler' },
  { id: 'bowler2', label: 'Bowler 2', role: 'bowler' },
  { id: 'bowler3', label: 'Bowler 3', role: 'bowler' },
  { id: 'wk', label: 'Wicket Keeper', role: 'batter' },
];

export default function DreamXIBuilder() {
  const { state, dispatch } = useAppState();
  const [playersList, setPlayersList] = useState<PlayerSummary[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopPlayers() {
      // Fetch top 100 players from backend
      const res = await getPlayers('', 1);
      if (res && res.results) {
        setPlayersList(res.results);
      }
    }
    loadTopPlayers();
  }, []);

  const selectPlayer = (slotId: string, playerName: string) => {
    dispatch({ type: 'SET_DREAM_XI', slot: slotId, player: playerName });
    setActiveSlot(null);
  };

  const clearSlot = (slotId: string) => {
    dispatch({ type: 'SET_DREAM_XI', slot: slotId, player: '' });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_DREAM_XI' });
  };

  // Find player details from the loaded list
  const getPlayerDetails = (name: string): PlayerSummary | undefined => {
    return playersList.find(p => p.player === name);
  };

  // Calculations
  let totalRunsPotential = 0;
  let totalWicketsPotential = 0;
  let econSum = 0;
  let econCount = 0;
  let totalRadarScore = 0;
  let selectedCount = 0;

  SLOTS.forEach(slot => {
    const name = state.dreamXI[slot.id];
    if (name) {
      const details = getPlayerDetails(name);
      if (details) {
        selectedCount += 1;
        const scores = radarScore(details.batting, details.bowling);
        
        // Sum values based on role weighting
        if (slot.role === 'batter') {
          totalRunsPotential += details.batting?.runs ?? 0;
          totalRadarScore += (scores.runs + scores.strikeRate + scores.average) / 3;
        } else if (slot.role === 'bowler') {
          totalWicketsPotential += details.bowling?.wickets ?? 0;
          if (details.bowling) {
            econSum += details.bowling.economy;
            econCount += 1;
          }
          totalRadarScore += (scores.wickets + scores.economy) / 2;
        } else {
          // All Rounder
          totalRunsPotential += details.batting?.runs ?? 0;
          totalWicketsPotential += details.bowling?.wickets ?? 0;
          if (details.bowling) {
            econSum += details.bowling.economy;
            econCount += 1;
          }
          totalRadarScore += (scores.runs + scores.strikeRate + scores.wickets + scores.economy) / 4;
        }
      }
    }
  });

  const teamBalanceScore = selectedCount > 0 ? Math.round(totalRadarScore / selectedCount) : 0;
  const avgEcon = econCount > 0 ? (econSum / econCount).toFixed(2) : 'N/A';

  const filteredPlayers = playersList.filter(p => {
    if (searchFilter && !p.player.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    // Don't show already selected players in the selection list
    return !Object.values(state.dreamXI).includes(p.player);
  });

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center">
            🏏 All-Time IPL Dream XI Builder
          </h4>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">Select and slot players to build a balanced squad. Compare aggregate statistics.</p>
        </div>
        <button
          onClick={clearAll}
          className="text-xs border border-brand/30 text-brand hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-all"
        >
          Reset Team
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Slot Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SLOTS.map((slot) => {
            const selectedName = state.dreamXI[slot.id];
            const isEditing = activeSlot === slot.id;
            
            return (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isEditing 
                    ? 'border-brand bg-brand/5'
                    : selectedName 
                    ? 'border-border-light dark:border-border-dark bg-base-light dark:bg-base-dark' 
                    : 'border-dashed border-border-light dark:border-border-dark bg-transparent hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">{slot.label}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      slot.role === 'batter' ? 'bg-gold/10 text-gold' :
                      slot.role === 'bowler' ? 'bg-accent-purple-light/10 text-accent-purple-light dark:bg-accent-purple-dark/10 dark:text-accent-purple-dark' :
                      'bg-accent-green-light/10 text-accent-green-light dark:bg-accent-green-dark/10 dark:text-accent-green-dark'
                    }`}>{slot.role}</span>
                  </div>

                  {selectedName ? (
                    <div className="mt-1">
                      <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{selectedName}</p>
                      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                        {getPlayerDetails(selectedName)?.batting?.runs ? `Runs: ${getPlayerDetails(selectedName)?.batting?.runs}` : ''}
                        {getPlayerDetails(selectedName)?.bowling?.wickets ? ` | Wickets: ${getPlayerDetails(selectedName)?.bowling?.wickets}` : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 italic">Empty Slot</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {selectedName ? (
                    <button
                      onClick={() => clearSlot(slot.id)}
                      className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-red-light dark:hover:text-accent-red-dark p-1.5 rounded bg-base-light dark:bg-base-dark border border-border-light dark:border-border-dark hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Clear slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveSlot(slot.id);
                        setSearchFilter('');
                      }}
                      className="flex items-center space-x-1 text-xs text-brand bg-brand/10 hover:bg-brand/20 px-2.5 py-1.5 rounded-lg font-bold"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Select</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Team Performance Dashboard & Selection list */}
        <div className="space-y-6">
          {/* Active Selection Drawer */}
          {activeSlot && (
            <div className="p-4 bg-base-light dark:bg-base-dark rounded-xl border border-border-light dark:border-border-dark">
              <h5 className="text-xs font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider mb-2">
                Select player for {SLOTS.find(s => s.id === activeSlot)?.label}
              </h5>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white dark:bg-slate-955 border border-border-light dark:border-border-dark rounded-lg px-3 py-1.5 text-xs text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none mb-3"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredPlayers.map(p => (
                  <div
                    key={p.player}
                    onClick={() => selectPlayer(activeSlot, p.player)}
                    className="flex justify-between items-center p-2 hover:bg-brand/20 rounded cursor-pointer transition-colors text-xs text-text-primary-light dark:text-text-primary-dark"
                  >
                    <span className="font-semibold">{p.player}</span>
                    <span className="text-[9px] text-text-secondary-light dark:text-text-secondary-dark">
                      {p.batting ? `Runs: ${p.batting.runs}` : `Wkts: ${p.bowling?.wickets}`}
                    </span>
                  </div>
                ))}
                {filteredPlayers.length === 0 && (
                  <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark italic text-center py-2">No options found</p>
                )}
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="mt-3 w-full text-center text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light hover:dark:text-text-primary-dark py-1 bg-base-light dark:bg-base-dark rounded border border-border-light dark:border-border-dark"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Performance Dashboard */}
          <div className="p-5 bg-base-light dark:bg-base-dark rounded-xl border border-border-light dark:border-border-dark">
            <h5 className="text-xs font-extrabold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-1.5 text-gold" />
              SQUAD METRICS
            </h5>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase">Team Balance Rating</span>
                <div className="flex items-center space-x-3 mt-1">
                  <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                    <div
                      style={{ width: `${teamBalanceScore}%` }}
                      className="h-full bg-gradient-to-r from-brand to-gold rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="text-lg font-black text-text-primary-light dark:text-text-primary-dark font-mono">{teamBalanceScore}/100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border-light dark:border-slate-700/50 pt-4">
                <div>
                  <span className="text-[10px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">Runs Potential</span>
                  <p className="text-lg font-black text-text-primary-light dark:text-text-primary-dark mt-0.5">{totalRunsPotential.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">Wickets Potential</span>
                  <p className="text-lg font-black text-text-primary-light dark:text-text-primary-dark mt-0.5">{totalWicketsPotential.toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-border-light dark:border-slate-700/50 pt-4">
                <span className="text-[10px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase">Avg Attack Economy</span>
                <p className="text-lg font-black text-text-primary-light dark:text-text-primary-dark mt-0.5">{avgEcon}</p>
              </div>

              <div className="bg-brand/5 border border-brand/20 p-3 rounded-lg flex items-start space-x-2 mt-2">
                <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {selectedCount < 11 
                    ? `Add ${11 - selectedCount} more players to calculate squad balance score.` 
                    : `Your Dream XI is locked and loaded! Team rating stands at ${teamBalanceScore}/100.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
