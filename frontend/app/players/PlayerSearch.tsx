'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  team?: string;
}

interface PlayerSearchProps {
  onSelect: (player: Player) => void;
  placeholder?: string;
}

export default function PlayerSearch({ onSelect, placeholder = 'Search player name...' }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search effect (250ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(true);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error('[Search Error]', err);
      } finally {
        setLoading(false);
      }
    }, 250);

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

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSelect = (player: Player) => {
    onSelect(player);
    setQuery('');
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onKeyDown={handleKeyDown}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-2/90 backdrop-blur-md border border-border-light dark:border-border-dark rounded-lg pl-10 pr-10 py-2.5 text-sm text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-md"
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
        <div className="absolute mt-1.5 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-lg border border-border-light dark:border-border-dark rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-border-light dark:divide-border-dark">
          {results.map((player, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={player.id}
                onClick={() => handleSelect(player)}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                  isActive ? 'bg-brand/20 text-text-primary-light dark:text-white font-semibold' : 'hover:bg-surface-2 text-text-secondary-light dark:text-text-secondary-dark'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1 rounded-full bg-surface-2 text-text-primary-light dark:text-text-primary-dark">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{player.name}</span>
                    <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark block mt-0.5">{player.team || 'IPL'}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-surface-2 text-brand px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {player.team || 'IPL'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {open && results.length === 0 && query.trim() !== '' && !loading && (
        <div className="absolute mt-1.5 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-lg border border-border-light dark:border-border-dark rounded-lg p-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark z-50">
          No players found matching &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
