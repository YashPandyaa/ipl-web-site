'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getPlayers } from '@/lib/api';
import { PlayerSummary } from '@/lib/types';
import { Search, Loader2, User } from 'lucide-react';

interface PlayerSearchProps {
  onSelect: (player: PlayerSummary) => void;
  placeholder?: string;
}

export default function PlayerSearch({ onSelect, placeholder = 'Search player name...' }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await getPlayers(query);
      if (res && res.results) {
        setResults(res.results);
        setOpen(true);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (player: PlayerSummary) => {
    onSelect(player);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
          <Search className="w-4 h-4" />
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-secondary-light dark:text-text-secondary-dark">
            <Loader2 className="w-4 h-4 animate-spin text-brand" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute mt-1.5 w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-border-light/50 dark:divide-border-dark/50">
          {results.map((player) => (
            <div
              key={player.player}
              onClick={() => handleSelect(player)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1 rounded-full bg-base-light dark:bg-slate-700/50 text-text-secondary-light dark:text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{player.player}</span>
                  <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark flex space-x-2 mt-0.5">
                    {player.batting && <span>Runs: {player.batting.runs}</span>}
                    {player.bowling && <span>Wkts: {player.bowling.wickets}</span>}
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-mono uppercase">
                {player.batting && player.bowling ? 'All-Rounder' : player.batting ? 'Batter' : 'Bowler'}
              </span>
            </div>
          ))}
        </div>
      )}

      {open && results.length === 0 && query.trim() !== '' && !loading && (
        <div className="absolute mt-1.5 w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark z-50">
          No players found matching &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
