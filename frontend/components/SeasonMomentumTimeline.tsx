'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChartWrapper from './ChartWrapper';
import { CombinedSeasonData } from '../lib/types';
import { useTheme } from './ThemeProvider';
import { Calendar, Activity } from 'lucide-react';

interface SeasonMomentumTimelineProps {
  data: CombinedSeasonData[];
  liveYear?: number;
  onYearSelect: (year: number) => void;
}

export default function SeasonMomentumTimeline({
  data,
  liveYear = 2026,
  onYearSelect
}: SeasonMomentumTimelineProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const orangeColor = isDark ? '#F4A93B' : '#B45309';
  const purpleColor = isDark ? '#A855F7' : '#6B21A8';
  const matchesColor = isDark ? '#3B82F6' : '#1A56DB';

  // Toggle states for datasets
  const [showOrange, setShowOrange] = useState(true);
  const [showPurple, setShowPurple] = useState(true);
  const [showMatches, setShowMatches] = useState(true);
  const [activeFilterYear, setActiveFilterYear] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border border-dashed border-line rounded-sm text-sage bg-surface">
        Loading momentum timeline data...
      </div>
    );
  }

  // Extract series
  const labels = data.map(d => d.year);
  const orangeRuns = data.map(d => d.runs);
  const purpleWickets = data.map(d => d.wickets);
  const totalMatches = data.map(d => d.matches);

  const handleYearClick = (year: number) => {
    if (activeFilterYear === year) {
      setActiveFilterYear(null);
      onYearSelect(0); // clear filter
    } else {
      setActiveFilterYear(year);
      onYearSelect(year);
    }
  };

  // Build datasets dynamically based on toggles
  const datasets: any[] = [];

  if (showMatches) {
    datasets.push({
      type: 'bar',
      label: 'Total Matches',
      data: totalMatches,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(26, 86, 219, 0.15)',
      borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(26, 86, 219, 0.4)',
      borderWidth: 1,
      yAxisID: 'yMatches',
      order: 3,
      barThickness: 16
    });
  }

  if (showOrange) {
    datasets.push({
      type: 'line',
      label: 'Orange Cap Runs',
      data: orangeRuns,
      borderColor: orangeColor,
      backgroundColor: isDark ? 'rgba(244, 169, 59, 0.05)' : 'rgba(180, 83, 9, 0.05)',
      borderWidth: 2,
      tension: 0.3,
      fill: false,
      yAxisID: 'yRuns',
      order: 1
    });
  }

  if (showPurple) {
    datasets.push({
      type: 'line',
      label: 'Purple Cap Wickets',
      data: purpleWickets,
      borderColor: purpleColor,
      backgroundColor: isDark ? 'rgba(168, 85, 247, 0.05)' : 'rgba(107, 33, 168, 0.05)',
      borderWidth: 2,
      tension: 0.3,
      fill: false,
      yAxisID: 'yWickets',
      order: 2
    });
  }

  const chartData = {
    labels,
    datasets
  };

  const chartOptions = {
    onClick: (event: any, elements: any[], chart: any) => {
      if (elements && elements.length > 0) {
        const firstElement = elements[0];
        const dataIndex = firstElement.index;
        const year = chart.data.labels[dataIndex];
        handleYearClick(year);
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const year = tooltipItems[0].label;
            return `Season ${year}`;
          },
          label: (context: any) => {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            const index = context.dataIndex;
            const yearData = data[index];
            if (datasetLabel.includes('Runs')) {
              return `🟠 Runs: ${value} (Leader: ${yearData.runsLeader})`;
            }
            if (datasetLabel.includes('Wickets')) {
              return `🟣 Wickets: ${value} (Leader: ${yearData.wicketsLeader})`;
            }
            return `🔵 Matches: ${value}`;
          }
        }
      }
    },
    scales: {
      yRuns: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Runs Scale',
          color: orangeColor,
          font: { size: 10, weight: 'bold' }
        },
        ticks: { color: orangeColor, font: { size: 9 } },
        grid: { color: isDark ? 'rgba(241, 237, 225, 0.06)' : 'rgba(22, 36, 28, 0.08)' }
      },
      yWickets: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Wickets Scale',
          color: purpleColor,
          font: { size: 10, weight: 'bold' }
        },
        ticks: { color: purpleColor, font: { size: 9 } },
        grid: { drawOnChartArea: false }
      },
      yMatches: {
        type: 'linear',
        position: 'right',
        display: false, // hide matches scale but align
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 pb-3 border-b border-line">
        <div>
          <h3 className="text-[10px] font-medium tracking-widest text-chalk uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span>SEASON MOMENTUM TIMELINE</span>
          </h3>
          <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            Scrub combined metrics across all seasons. Click a year node to filter the stadium table.
          </p>
        </div>
      </div>

      {/* Legend Checkboxes */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs font-mono select-none">
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-90">
          <input
            type="checkbox"
            checked={showOrange}
            onChange={(e) => setShowOrange(e.target.checked)}
            className="rounded-sm border-line text-accent bg-surface-2 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1.5 font-bold" style={{ color: orangeColor }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: orangeColor }}></span>
            Orange Cap Runs
          </span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-90">
          <input
            type="checkbox"
            checked={showPurple}
            onChange={(e) => setShowPurple(e.target.checked)}
            className="rounded-sm border-line text-accent-purple bg-surface-2 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1.5 font-bold" style={{ color: purpleColor }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: purpleColor }}></span>
            Purple Cap Wickets
          </span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer hover:opacity-90">
          <input
            type="checkbox"
            checked={showMatches}
            onChange={(e) => setShowMatches(e.target.checked)}
            className="rounded-sm border-line text-brand-light bg-surface-2 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
          />
          <span className="flex items-center gap-1.5 font-bold" style={{ color: matchesColor }}>
            <span className="w-2.5 h-2 border rounded-sm" style={{ backgroundColor: `${matchesColor}80`, borderColor: matchesColor }}></span>
            Matches Played
          </span>
        </label>
      </div>

      {/* Filter Chip Indicator */}
      {activeFilterYear && (
        <div className="flex items-center gap-1.5 mb-3 animate-fadeIn">
          <span className="text-[10px] font-mono bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Filtered by Season: {activeFilterYear}
            <button 
              onClick={() => handleYearClick(activeFilterYear)}
              className="hover:text-chalk font-bold ml-1 text-[9px]"
              title="Clear Filter"
            >
              [✕]
            </button>
          </span>
        </div>
      )}

      {/* Chart Canvas */}
      <ChartWrapper
        id="momentum-combo-chart"
        type="bar" // Base type is bar, line datasets override
        data={chartData}
        options={chartOptions}
        height={280}
      />
    </div>
  );
}
