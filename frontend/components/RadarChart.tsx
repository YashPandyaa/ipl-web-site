'use client';

import React from 'react';
import ChartWrapper from './ChartWrapper';
import { PlayerSummary } from '@/lib/types';
import { radarScore } from '@/lib/metrics';
import { useTheme } from './ThemeProvider';

interface RadarChartProps {
  player1: PlayerSummary | null;
  player2?: PlayerSummary | null; // Optional second player for comparison
  player1Name?: string;
  player2Name?: string;
}

export default function RadarChart({
  player1,
  player2,
  player1Name = 'Player 1',
  player2Name = 'Player 2'
}: RadarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!player1) {
    return (
      <div className="flex items-center justify-center h-[300px] border border-dashed border-line rounded-sm text-sage text-sm bg-surface p-4">
        Select a player to load radar chart
      </div>
    );
  }

  const p1Scores = radarScore(player1.batting, player1.bowling);
  const datasets = [
    {
      label: player1Name,
      data: [
        p1Scores.runs,
        p1Scores.strikeRate,
        p1Scores.average,
        p1Scores.sixes,
        p1Scores.wickets,
        p1Scores.economy
      ],
      backgroundColor: isDark ? 'rgba(244, 169, 59, 0.25)' : 'rgba(31, 111, 74, 0.20)',
      borderColor: isDark ? '#F4A93B' : '#1F6F4A',
      pointBackgroundColor: isDark ? '#F4A93B' : '#1F6F4A',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: isDark ? '#F4A93B' : '#1F6F4A'
    }
  ];

  if (player2) {
    const p2Scores = radarScore(player2.batting, player2.bowling);
    datasets.push({
      label: player2Name,
      data: [
        p2Scores.runs,
        p2Scores.strikeRate,
        p2Scores.average,
        p2Scores.sixes,
        p2Scores.wickets,
        p2Scores.economy
      ],
      backgroundColor: isDark ? 'rgba(214, 85, 59, 0.25)' : 'rgba(178, 58, 46, 0.20)',
      borderColor: isDark ? '#D6553B' : '#B23A2E',
      pointBackgroundColor: isDark ? '#D6553B' : '#B23A2E',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: isDark ? '#D6553B' : '#B23A2E'
    });
  }

  const data = {
    labels: ['Runs Potential', 'Strike Rate', 'Average', 'Sixes Power', 'Wickets Potential', 'Economy Control'],
    datasets
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: isDark ? 'rgba(241, 237, 225, 0.16)' : 'rgba(22, 36, 28, 0.18)' },
        grid: { color: isDark ? 'rgba(241, 237, 225, 0.09)' : 'rgba(22, 36, 28, 0.10)' },
        pointLabels: {
          color: isDark ? '#8FA396' : '#4C5C51',
          font: { size: 10, weight: 'bold' }
        },
        ticks: {
          display: false, // hide numbers
          maxTicksLimit: 5
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  return (
    <div className="bg-surface p-4 rounded-sm border border-line transition-colors duration-300">
      <ChartWrapper
        id={`radar-chart-${player1Name.replace(/\s+/g, '-')}`}
        type="radar"
        data={data}
        options={options}
        height={320}
      />
    </div>
  );
}
