'use client';

import React, { useState, useEffect } from 'react';
import { getBattingRecords, getBowlingRecords } from '@/lib/api';
import { BattingRecord, BowlingRecord } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface HeatmapGridProps {
  playerName: string;
}

const SEASONS = Array.from({ length: 19 }, (_, i) => 2008 + i); // 2008 to 2026

export default function HeatmapGrid({ playerName }: HeatmapGridProps) {
  const [battingData, setBattingData] = useState<Record<number, BattingRecord>>({});
  const [bowlingData, setBowlingData] = useState<Record<number, BowlingRecord>>({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'batting' | 'bowling'>('batting');

  useEffect(() => {
    async function loadStats() {
      if (!playerName) return;
      setLoading(true);
      
      const [batRes, bowlRes] = await Promise.all([
        getBattingRecords({ player: playerName }),
        getBowlingRecords({ player: playerName })
      ]);

      const batMap: Record<number, BattingRecord> = {};
      if (batRes && batRes.results) {
        batRes.results.forEach(r => {
          if (r.season > 0) batMap[r.season] = r;
        });
      }

      const bowlMap: Record<number, BowlingRecord> = {};
      if (bowlRes && bowlRes.results) {
        bowlRes.results.forEach(r => {
          if (r.season > 0) bowlMap[r.season] = r;
        });
      }

      setBattingData(batMap);
      setBowlingData(bowlMap);
      
      // Auto switch mode if player is bowler only
      if (Object.keys(batMap).length === 0 && Object.keys(bowlMap).length > 0) {
        setMode('bowling');
      } else {
        setMode('batting');
      }

      setLoading(false);
    }
    loadStats();
  }, [playerName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-brand" />
        Loading career heatmap...
      </div>
    );
  }

  interface HeatmapRow {
    key: string;
    label: string;
    max: number;
    invert?: boolean;
  }

  // Batting categories
  const BATTING_ROWS: HeatmapRow[] = [
    { key: 'runs', label: 'Runs', max: 973 }, // Kohli 2016 record
    { key: 'average', label: 'Average', max: 80 },
    { key: 'strike_rate', label: 'Strike Rate', max: 200 },
    { key: 'sixes', label: 'Sixes', max: 59 }, // Gayle record
    { key: 'fifties', label: 'Fifties', max: 9 }
  ];

  // Bowling categories
  const BOWLING_ROWS: HeatmapRow[] = [
    { key: 'wickets', label: 'Wickets', max: 32 }, // Bravo 2013 record
    { key: 'economy', label: 'Economy', max: 12, invert: true }, // lower is better (max econ is worst)
    { key: 'strike_rate', label: 'Strike Rate', max: 35, invert: true },
    { key: 'overs', label: 'Overs', max: 70 },
    { key: 'runs_conceded', label: 'Runs Conceded', max: 550, invert: true }
  ];

  const rows = mode === 'batting' ? BATTING_ROWS : BOWLING_ROWS;
  const data = mode === 'batting' ? battingData : bowlingData;

  const getCellColor = (val: number, max: number, invert = false) => {
    if (val === 0) return 'bg-slate-800/40 text-slate-600';
    
    // Normalize percentage (0 to 1)
    let pct = Math.min(1, val / max);
    if (invert) {
      pct = 1 - pct; // lower is better
    }
    
    // Lightness scales between 25% (dark/intense for high values) and 85% (light/faded for low values)
    const lightness = 85 - (pct * 60); 
    return {
      background: `hsl(224, 80%, ${lightness}%)`,
      color: lightness < 50 ? '#ffffff' : '#0B0F1A'
    };
  };

  return (
    <div className="bg-surface p-5 rounded-xl border border-border/60">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-300">Career Heatmap</h4>
        <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => setMode('batting')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'batting' ? 'bg-brand text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Batting
          </button>
          <button
            onClick={() => setMode('bowling')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'bowling' ? 'bg-brand text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bowling
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px] select-none">
          {/* Header Row */}
          <div className="grid grid-cols-[100px_repeat(19,_1fr)] gap-1 mb-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase flex items-end">Stat \ Year</div>
            {SEASONS.map(year => (
              <div key={year} className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
                {year}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          <div className="space-y-1">
            {rows.map(row => {
              return (
                <div key={row.key} className="grid grid-cols-[100px_repeat(19,_1fr)] gap-1">
                  {/* Category label */}
                  <div className="text-xs font-semibold text-slate-300 flex items-center pr-2 py-1.5 border-r border-border">
                    {row.label}
                  </div>

                  {/* Season cells */}
                  {SEASONS.map(year => {
                    const record = data[year];
                    const val = record ? (record as any)[row.key] ?? 0 : 0;
                    const style = getCellColor(val, row.max, row.invert);
                    
                    return (
                      <div
                        key={year}
                        style={typeof style === 'object' ? style : undefined}
                        className={`text-xs font-bold text-center py-2.5 rounded transition-all cursor-help flex items-center justify-center ${
                          typeof style === 'string' ? style : ''
                        }`}
                        title={`${row.label} in ${year}: ${val || 'DNP'}`}
                      >
                        {val ? (row.key === 'average' || row.key === 'economy' || row.key === 'strike_rate' ? val.toFixed(1) : val) : '-'}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end space-x-4 text-[10px] text-slate-500 font-semibold">
        <span>Color Intensity:</span>
        <div className="flex space-x-1">
          <div className="w-4 h-4 rounded bg-slate-800/40 border border-slate-700" />
          <span>Low</span>
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(224, 80%, 80%)' }} />
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(224, 80%, 60%)' }} />
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(224, 80%, 40%)' }} />
          <div className="w-4 h-4 rounded" style={{ background: 'hsl(224, 80%, 25%)' }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
