'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { getBattingRecords } from '@/lib/api';
import { BattingRecord } from '@/lib/types';
import { Loader2, Coins, UserCheck, ShieldAlert, RefreshCw } from 'lucide-react';

export default function AuctionSimulator() {
  const { state, dispatch } = useAppState();
  const [availablePlayers, setAvailablePlayers] = useState<BattingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<Record<string, string>>({}); // local bid inputs
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuctionPool() {
      setLoading(true);
      // Fetch top 50 batters for the auction pool
      const res = await getBattingRecords({ season: 0, order_by: '-runs', page: 1 });
      if (res && res.results) {
        setAvailablePlayers(res.results.slice(0, 30));
      }
      setLoading(false);
    }
    loadAuctionPool();
  }, []);

  const handleBidChange = (playerName: string, val: string) => {
    setBids({ ...bids, [playerName]: val });
    setErrorMsg(null);
  };

  const placeBid = (player: BattingRecord) => {
    const bidVal = parseFloat(bids[player.player] || '0');
    
    if (isNaN(bidVal) || bidVal <= 0) {
      setErrorMsg('Please enter a valid bid amount (e.g. 5.5)');
      return;
    }

    if (bidVal > state.auctionBudget) {
      setErrorMsg(`Over Budget! You only have ₹${state.auctionBudget} Cr remaining.`);
      return;
    }

    if (state.auctionSquad.includes(player.player)) {
      setErrorMsg('This player is already in your squad!');
      return;
    }

    // Success! Bid player
    dispatch({ type: 'BID_AUCTION_PLAYER', player: player.player, bidAmount: bidVal });
    
    // Clear local input
    setBids({ ...bids, [player.player]: '' });
    setErrorMsg(null);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_AUCTION' });
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary-light dark:text-text-secondary-dark">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand" />
        Preparing Auction Simulator player pool...
      </div>
    );
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-border-light dark:border-border-dark/60 pb-5">
        <div>
          <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center">
            🔨 IPL Career Auction Simulator
          </h4>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">
            Build your franchise squad under a ₹100 Crore cap. Bid on top-tier batting statistics!
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-brand/10 border border-brand/30 px-4 py-2 rounded-lg flex items-center space-x-2">
            <Coins className="w-4 h-4 text-gold" />
            <div>
              <span className="text-[9px] text-text-secondary-light dark:text-text-secondary-dark block font-bold uppercase">Budget Left</span>
              <span className="text-base font-black text-text-primary-light dark:text-text-primary-dark font-mono">₹{state.auctionBudget} Cr</span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-lg bg-base-light dark:bg-base-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary-light dark:text-text-secondary-dark transition-all border border-border-light dark:border-border-dark"
            title="Reset Auction"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-accent-red-light/10 dark:bg-accent-red-dark/10 border border-accent-red-light/30 dark:border-accent-red-dark/30 p-3 rounded-lg flex items-center space-x-2 text-xs text-accent-red-light dark:text-accent-red-dark font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Player Pool Cards */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2">
          <h5 className="text-xs font-extrabold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-2">Available Players ({availablePlayers.length})</h5>
          
          {availablePlayers.map((player) => {
            const isOwned = state.auctionSquad.includes(player.player);
            const bidInput = bids[player.player] || '';

            return (
              <div
                key={player.player}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isOwned 
                    ? 'border-accent-green-light/20 dark:border-accent-green-dark/20 bg-accent-green-light/5 dark:bg-accent-green-dark/5 opacity-60' 
                    : 'border-border-light dark:border-border-dark bg-base-light dark:bg-base-dark hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div>
                  <h6 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{player.player}</h6>
                  <div className="flex space-x-4 mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-semibold">
                    <span>Runs: {player.runs}</span>
                    <span>Avg: {player.average.toFixed(1)}</span>
                    <span>SR: {player.strike_rate.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {isOwned ? (
                    <span className="flex items-center space-x-1 text-xs text-accent-green-light dark:text-accent-green-dark bg-accent-green-light/10 dark:bg-accent-green-dark/10 px-3 py-1.5 rounded-lg font-bold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Owned</span>
                    </span>
                  ) : (
                    <>
                      <div className="relative flex-1 sm:flex-none">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100"
                          value={bidInput}
                          onChange={(e) => handleBidChange(player.player, e.target.value)}
                          placeholder="Bid in Cr (e.g. 8.5)"
                          className="w-full sm:w-36 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-1.5 text-xs text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:border-brand"
                        />
                        <span className="absolute right-3 inset-y-0 flex items-center text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-bold">Cr</span>
                      </div>
                      <button
                        onClick={() => placeBid(player)}
                        className="bg-brand hover:bg-brand-dark text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                      >
                        Bid
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Squad Panel */}
        <div className="p-5 bg-base-light dark:bg-base-dark rounded-xl border border-border-light dark:border-border-dark h-fit">
          <h5 className="text-xs font-extrabold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-4 flex items-center">
            📋 YOUR SQUAD ({state.auctionSquad.length})
          </h5>

          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {state.auctionSquad.map((p, idx) => (
              <div key={p} className="flex justify-between items-center p-2.5 bg-white dark:bg-slate-900/60 rounded border border-border-light dark:border-border-dark/50 text-xs">
                <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{p}</span>
                <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded font-mono">
                  Slot #{idx + 1}
                </span>
              </div>
            ))}

            {state.auctionSquad.length === 0 && (
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic text-center py-8">
                Your squad is currently empty. Bid on players on the left to start building your squad!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
