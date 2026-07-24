'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getBattingRecords } from '@/lib/api';
import { BattingRecord } from '@/lib/types';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';

interface BarChartRaceProps {
  selectedYear: number;
  onYearChange?: (year: number) => void;
}

interface CumulativePlayer {
  player: string;
  runs: number;
}

export default function BarChartRace({ selectedYear, onYearChange }: BarChartRaceProps) {
  const [dataByYear, setDataByYear] = useState<Record<number, BattingRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const playTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch all years 2008 to 2022 on mount
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const years = Array.from({ length: 19 }, (_, i) => 2008 + i);
        const promises = years.map(async (y) => {
          const res = await getBattingRecords({ season: y, order_by: '-runs' });
          return { year: y, records: res?.results || [] };
        });

        const results = await Promise.all(promises);
        const map: Record<number, BattingRecord[]> = {};
        results.forEach(r => {
          map[r.year] = r.records;
        });

        setDataByYear(map);
      } catch (err) {
        console.error('Error loading bar chart race data:', err);
      }
      setLoading(false);
    }
    loadAllData();
  }, []);

  // Keep refs of latest values to avoid resetting the interval on every render
  const onYearChangeRef = useRef(onYearChange);
  const selectedYearRef = useRef(selectedYear);

  useEffect(() => {
    onYearChangeRef.current = onYearChange;
  }, [onYearChange]);

  useEffect(() => {
    selectedYearRef.current = selectedYear;
  }, [selectedYear]);

  // Play controls
  useEffect(() => {
    if (playing) {
      // If user starts autoplay while at the end (2026), automatically reset to the beginning (2008)
      if (selectedYearRef.current >= 2026) {
        onYearChangeRef.current?.(2008);
      }

      const interval = setInterval(() => {
        const currentYear = selectedYearRef.current;
        if (currentYear < 2026) {
          onYearChangeRef.current?.(currentYear + 1);
        } else {
          setPlaying(false); // stop at the end
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [playing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2 text-brand" />
        Pre-loading historical data for Bar Chart Race...
      </div>
    );
  }

  // Calculate cumulative runs up to selectedYear
  const cumulative: Record<string, number> = {};
  for (let y = 2008; y <= selectedYear; y++) {
    const records = dataByYear[y] || [];
    records.forEach(r => {
      cumulative[r.player] = (cumulative[r.player] || 0) + r.runs;
    });
  }

  // Sort and take top 10
  const top10: CumulativePlayer[] = Object.entries(cumulative)
    .map(([player, runs]) => ({ player, runs }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 10);

  const maxRuns = top10.length > 0 ? top10[0].runs : 1000;

  const handleReset = () => {
    setPlaying(false);
    onYearChange?.(2008);
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h4 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark flex items-center">
            🏆 All-Time Cumulative Leaderboard Race (2008–{selectedYear})
          </h4>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-xs mt-1">Watch the all-time IPL run-scoring leaderboard evolve year-on-year.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPlaying(!playing)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition-all"
          >
            {playing ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Autoplay</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-text-primary-light dark:text-text-primary-dark text-xs font-semibold transition-all border border-border-light dark:border-border-dark"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Race Track Container */}
      <div className="relative h-[420px] w-full overflow-hidden mt-2">
        {top10.map((player, idx) => {
          const widthPct = maxRuns > 0 ? (player.runs / maxRuns) * 90 : 0; // scale to max 90% width
          return (
            <div
              key={player.player}
              className="absolute left-0 w-full flex items-center transition-all duration-1000 ease-out"
              style={{
                top: `${idx * 40}px`,
                height: '32px'
              }}
            >
              {/* Rank Badge */}
              <div className="w-6 text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark font-mono text-center">
                {idx + 1}
              </div>

              {/* Bar Content */}
              <div className="flex-1 flex items-center ml-2 relative">
                {/* Visual Bar */}
                <div
                  style={{ width: `${widthPct}%` }}
                  className="h-7 rounded bg-gradient-to-r from-brand to-gold dark:from-brand-dark dark:to-brand hover:to-gold hover:dark:to-gold text-white flex items-center px-3 shadow transition-all duration-1000 ease-out relative overflow-hidden"
                >
                  {/* Player Name */}
                  <span className="text-xs font-extrabold truncate z-10 pr-2">
                    {player.player}
                  </span>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
                </div>

                {/* Runs Value */}
                <span className="text-xs font-extrabold text-text-primary-light dark:text-text-primary-dark ml-3 font-mono">
                  {player.runs.toLocaleString()} runs
                </span>
              </div>
            </div>
          );
        })}

        {top10.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark text-sm">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
