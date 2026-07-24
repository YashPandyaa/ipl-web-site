import { z } from 'zod';

export const PlayerSchema = z.object({
  id: z.string().optional(),
  player: z.string(),
  matches: z.number(),
  innings: z.number().optional(),
  team: z.string().optional(),
  avatarUrl: z.string().optional()
});

export const BattingLeaderSchema = PlayerSchema.extend({
  runs: z.number(),
  average: z.number().nullable().optional(),
  strike_rate: z.number().nullable().optional(),
  isLive: z.boolean().optional(),
  delta: z.object({
    runs: z.number(),
    average: z.number().optional(),
    strike_rate: z.number().optional()
  }).optional()
});

export const BowlingLeaderSchema = PlayerSchema.extend({
  wickets: z.number(),
  economy: z.number().nullable().optional(),
  strike_rate: z.number().nullable().optional(),
  isLive: z.boolean().optional(),
  delta: z.object({
    wickets: z.number(),
    economy: z.number().optional(),
    strike_rate: z.number().optional()
  }).optional()
});

export const AllRounderLeaderSchema = PlayerSchema.extend({
  runs: z.number(),
  wickets: z.number(),
  score: z.number(), // calculated rating: runs + wickets * 20
  isLive: z.boolean().optional(),
  delta: z.object({
    runs: z.number(),
    wickets: z.number(),
    score: z.number()
  }).optional()
});

export const StatUpdateSchema = z.object({
  type: z.literal('STAT_UPDATE'),
  panel: z.enum(['batting', 'bowling', 'all-rounders']),
  playerId: z.string(),
  playerName: z.string().optional(),
  delta: z.object({
    runs: z.number().optional(),
    wickets: z.number().optional(),
    overs: z.number().optional(),
    econ: z.number().optional(),
    score: z.number().optional(),
    average: z.number().optional(),
    strike_rate: z.number().optional()
  }),
  newRank: z.number(),
  isLiveMatch: z.boolean().optional()
});

export type BattingLeader = z.infer<typeof BattingLeaderSchema>;
export type BowlingLeader = z.infer<typeof BowlingLeaderSchema>;
export type AllRounderLeader = z.infer<typeof AllRounderLeaderSchema>;
export type StatUpdatePayload = z.infer<typeof StatUpdateSchema>;
