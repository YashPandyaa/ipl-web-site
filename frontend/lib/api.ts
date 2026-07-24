import { Match, BattingRecord, BowlingRecord, SeasonSummary, TeamStats, VenueStats, PlayerSummary, OrangeCapStat, PurpleCapStat, MatchesPerSeasonStat, StadiumStat } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      console.error(`API Error on ${path}: ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Fetch Error on ${path}:`, err);
    return null;
  }
}

// Matches
export async function getMatches(params: { season?: number | string; team?: string; venue?: string; page?: number; has_video?: boolean; video_verified?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.season) query.append('season', String(params.season));
  if (params.team) query.append('team', params.team);
  if (params.venue) query.append('venue', params.venue);
  if (params.page) query.append('page', String(params.page));
  if (params.has_video !== undefined) query.append('has_video', String(params.has_video));
  if (params.video_verified !== undefined) query.append('video_verified', String(params.video_verified));

  return fetchAPI<PaginatedResponse<Match>>(`/api/matches/?${query.toString()}`);
}

export async function getMatchDetail(id: number | string) {
  return fetchAPI<Match>(`/api/matches/${id}/`);
}

// Batting Records
export async function getBattingRecords(params: { player?: string; season?: number | string; order_by?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.player) query.append('player', params.player);
  if (params.season !== undefined) query.append('season', String(params.season));
  if (params.order_by) query.append('order_by', params.order_by);
  if (params.page) query.append('page', String(params.page));

  return fetchAPI<PaginatedResponse<BattingRecord>>(`/api/batting/?${query.toString()}`);
}

// Bowling Records
export async function getBowlingRecords(params: { player?: string; season?: number | string; order_by?: string; page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.player) query.append('player', params.player);
  if (params.season !== undefined) query.append('season', String(params.season));
  if (params.order_by) query.append('order_by', params.order_by);
  if (params.page) query.append('page', String(params.page));

  return fetchAPI<PaginatedResponse<BowlingRecord>>(`/api/bowling/?${query.toString()}`);
}

// Distinct Players
export async function getPlayers(search: string = '', page: number = 1) {
  const query = new URLSearchParams();
  if (search) query.append('search', search);
  query.append('page', String(page));
  return fetchAPI<PaginatedResponse<PlayerSummary>>(`/api/players/?${query.toString()}`);
}

// Teams
export async function getTeams() {
  return fetchAPI<TeamStats[]>('/api/teams/');
}

// Seasons
export async function getSeasons(year?: number | string) {
  const query = new URLSearchParams();
  if (year) query.append('year', String(year));
  return fetchAPI<SeasonSummary[]>(`/api/seasons/?${query.toString()}`);
}

// Venues
export async function getVenues() {
  return fetchAPI<VenueStats[]>('/api/venues/');
}

// New Real-time endpoints
export async function getStatsOrangeCap() {
  return fetchAPI<OrangeCapStat[]>('/api/stats/orange-cap/');
}

export async function getStatsPurpleCap() {
  return fetchAPI<PurpleCapStat[]>('/api/stats/purple-cap/');
}

export async function getStatsMatchesPerSeason() {
  return fetchAPI<MatchesPerSeasonStat[]>('/api/stats/matches-per-season/');
}

export async function getStadiums(season?: number | null) {
  const query = season ? `?season=${season}` : '';
  return fetchAPI<StadiumStat[]>(`/api/stadiums/${query}`);
}

// Head to Head
export async function getHeadToHead(team1: string, team2: string) {
  const query = new URLSearchParams({ team1, team2 });
  return fetchAPI<{
    team1: string;
    team2: string;
    total_matches: number;
    team1_wins: number;
    team2_wins: number;
    ties: number;
  }>(`/api/head-to-head/?${query.toString()}`);
}

// Squads
export async function getSquads(team: string = 'MI', season?: number | string) {
  const query = new URLSearchParams({ team });
  if (season) query.append('season', String(season));
  return fetchAPI<{
    team: string;
    team_code: string;
    season: number;
    available_seasons: number[];
    total_players: number;
    squad: Array<{
      id: number;
      player: string;
      role: string;
      is_captain: boolean;
      is_overseas: boolean;
      batting_style: string;
      bowling_style: string;
      runs: number;
      wickets: number;
      matches: number;
    }>;
  }>(`/api/squads/?${query.toString()}`);
}

// Hall of Records Leaderboards
export async function getRecordsMostRuns(page: number = 1) {
  return fetchAPI<PaginatedResponse<BattingRecord>>(`/api/records/most-runs/?page=${page}`);
}

export async function getRecordsMostWickets(page: number = 1) {
  return fetchAPI<PaginatedResponse<BowlingRecord>>(`/api/records/most-wickets/?page=${page}`);
}

export async function getRecordsAllRounders(page: number = 1) {
  return fetchAPI<PaginatedResponse<any>>(`/api/records/all-rounders/?page=${page}`);
}

export async function getRecordsFastestCenturies(page: number = 1) {
  return fetchAPI<PaginatedResponse<any>>(`/api/records/fastest-centuries/?page=${page}`);
}

export async function getRecordsFastestFifties(page: number = 1) {
  return fetchAPI<PaginatedResponse<any>>(`/api/records/fastest-fifties/?page=${page}`);
}

export async function getRecordsMostSixes(page: number = 1) {
  return fetchAPI<PaginatedResponse<BattingRecord>>(`/api/records/most-sixes/?page=${page}`);
}

export async function getRecordsBestEconomy(page: number = 1) {
  return fetchAPI<PaginatedResponse<BowlingRecord>>(`/api/records/best-economy/?page=${page}`);
}

// AI Actions
export async function postAICommentary(question: string) {
  return fetchAPI<{ answer: string }>('/api/ai/commentary/', {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}

export async function postAIMatchReport(matchId: number | string) {
  return fetchAPI<{ report: string }>(`/api/ai/match-report/${matchId}/`, {
    method: 'POST',
  });
}

export async function postAIPlayerBio(playerName: string) {
  return fetchAPI<{ bio: string }>(`/api/ai/player-bio/${playerName}/`, {
    method: 'POST',
  });
}

// Trivia Quiz
export async function getQuizPlayers() {
  return fetchAPI<{ correct_answer: string; hints: string[] }[]>('/api/players/quiz/');
}

