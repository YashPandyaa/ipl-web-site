import { BattingRecord, BowlingRecord } from './types';

export const strikeRate = (runs: number, balls: number): number =>
  balls > 0 ? parseFloat(((runs / balls) * 100).toFixed(2)) : 0;

export const economyRate = (runs: number, overs: number): number =>
  overs > 0 ? parseFloat((runs / overs).toFixed(2)) : 0;

export const consistencyIndex = (scores: number[]): number => {
  if (!scores.length) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  return parseFloat((mean / (Math.sqrt(variance) + 1)).toFixed(2));
};

export const formWeightedAverage = (scores: number[]): number => {
  // Exponentially weight recent seasons more
  const weights = scores.map((_, i) => Math.pow(1.2, i));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  return parseFloat(
    (scores.reduce((sum, score, i) => sum + score * weights[i], 0) / totalWeight).toFixed(2)
  );
};

export const radarScore = (batting: BattingRecord | null, bowling: BowlingRecord | null) => ({
  runs: Math.min(100, ((batting?.runs ?? 0) / 8)),
  strikeRate: Math.min(100, ((batting?.strike_rate ?? 0) / 2)),
  average: Math.min(100, ((batting?.average ?? 0) * 2)),
  sixes: Math.min(100, ((batting?.sixes ?? 0) * 2)),
  wickets: Math.min(100, ((bowling?.wickets ?? 0) * 4)),
  economy: bowling ? Math.max(0, 100 - (bowling.economy * 8)) : 0,
});
export type RadarScoresType = ReturnType<typeof radarScore>;
