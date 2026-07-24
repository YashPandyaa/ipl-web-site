export interface Match {
  id?: number;
  match_id: number;
  season: number;
  city: string;
  date: string;
  team1: string;
  team2: string;
  toss_winner: string;
  toss_decision: string;
  winner: string;
  win_by_runs: number;
  win_by_wickets: number;
  venue: string;
  player_of_match: string;
  youtube_url?: string;
  video_verified?: boolean;
}

export interface BattingRecord {
  id?: number;
  player: string;
  season: number;
  matches: number;
  innings: number;
  runs: number;
  balls_faced: number;
  highest_score: string;
  average: number;
  strike_rate: number;
  hundreds: number;
  fifties: number;
  fours: number;
  sixes: number;
  dot_balls: number;
  not_outs: number;
}

export interface BowlingRecord {
  id?: number;
  player: string;
  season: number;
  matches: number;
  innings: number;
  overs: number;
  runs_conceded: number;
  wickets: number;
  economy: number;
  strike_rate: number;
  best_bowling: string;
  four_wickets: number;
  five_wickets: number;
}

export interface SeasonSummary {
  season: number;
  champion: string;
  runner_up: string;
  orange_cap: string;
  orange_cap_runs: number;
  purple_cap: string;
  purple_cap_wickets: number;
  total_matches: number;
}

export interface TeamStats {
  team: string;
  matches: number;
  wins: number;
  losses: number;
  toss_wins: number;
  win_percentage: number;
}

export interface VenueStats {
  venue: string;
  city: string;
  matches: number;
  avg_first_innings_score: number;
  top_scorer: string;
}

export interface PlayerSummary {
  player: string;
  batting: BattingRecord | null;
  bowling: BowlingRecord | null;
}

export interface OrangeCapStat {
  year: number;
  playerName: string;
  runs: number;
}

export interface PurpleCapStat {
  year: number;
  playerName: string;
  wickets: number;
}

export interface MatchesPerSeasonStat {
  year: number;
  totalMatches: number;
}

export interface StadiumStat {
  venue: string;
  city: string;
  matchesHosted: number;
  avgFirstInningsScore: number;
  bestPerformer: string;
}

export interface LiveScorecard {
  isLive: boolean;
  teamA: string;
  teamB: string;
  runs: number;
  wickets: number;
  overs: number;
  target: number;
  battingTeam: string;
  bowler: string;
  batsman: string;
  viewers: number;
  venue: string;
}

export interface CombinedSeasonData {
  year: number;
  runs: number;
  wickets: number;
  matches: number;
  runsLeader: string;
  wicketsLeader: string;
}

