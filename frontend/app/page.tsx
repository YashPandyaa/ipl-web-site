'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import PlayersSearchNew from './players/PlayerSearch';
import LeadersPanelNew from './players/LeaderboardPanel';
import ProfilesDrawerNew from './players/ProfileDrawer';
import StatCard from '../components/StatCard';
import TrendingVenuesMap from '../components/TrendingVenuesMap';
import ShareableCard from '../components/ShareableCard';
import PlayerSearch from '../components/PlayerSearch';
import AIChatBot from '../components/AIChatBot';
import WhoAmIQuiz from '../components/WhoAmIQuiz';
import DreamXIBuilder from '../components/DreamXIBuilder';
import AuctionSimulator from '../components/AuctionSimulator';
import RadarChart from '../components/RadarChart';
import HeatmapGrid from '../components/HeatmapGrid';
import BarChartRace from '../components/BarChartRace';
import ChartWrapper from '../components/ChartWrapper';
import SquadsView from '../components/SquadsView';
import { ThemeProvider, useTheme } from '../components/ThemeProvider';
import { getTeamColor, getTeamShortName, TEAM_DETAILS } from '../lib/teamUtils';

import {
  getMatches,
  getBattingRecords,
  getBowlingRecords,
  getPlayers,
  getTeams,
  getSeasons,
  getVenues,
  getHeadToHead,
  getRecordsMostRuns,
  getRecordsMostWickets,
  getRecordsAllRounders,
  getRecordsFastestCenturies,
  getRecordsFastestFifties,
  getRecordsMostSixes,
  getRecordsBestEconomy,
  postAICommentary,
  postAIMatchReport,
  postAIPlayerBio,
  getStatsOrangeCap,
  getStatsPurpleCap,
  getStatsMatchesPerSeason,
  getStadiums
} from '../lib/api';

import { Match, BattingRecord, BowlingRecord, SeasonSummary, TeamStats, VenueStats, PlayerSummary, CombinedSeasonData } from '../lib/types';
import {
  Users, Calendar, Trophy, Activity, Sparkles, Plus, Search,
  Share2, FileSpreadsheet, Cpu, MapPin, RotateCcw, AlertTriangle,
  HelpCircle, Shield, GitCompare, Landmark, Download, ChevronLeft, ChevronRight, CheckCircle2, Award, Loader2,
  MessageSquare, Coins, RefreshCw, ArrowUpDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ChartSkeleton, TableSkeleton } from '../components/SkeletonLoaders';
import SeasonMomentumTimeline from '../components/SeasonMomentumTimeline';


export default function Home() {
  const { state, dispatch } = useAppState();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  useEffect(() => {
    if (state.activePage === 'players') {
      router.push('/players');
    }
  }, [state.activePage, router]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [stadiumFilterYear, setStadiumFilterYear] = useState<number | null>(null);

  // TanStack Queries
  const orangeCapQuery = useQuery({
    queryKey: ['orange-cap'],
    queryFn: getStatsOrangeCap,
    enabled: state.activePage === 'stats'
  });

  const purpleCapQuery = useQuery({
    queryKey: ['purple-cap'],
    queryFn: getStatsPurpleCap,
    enabled: state.activePage === 'stats'
  });

  const matchesQuery = useQuery({
    queryKey: ['matches-per-season'],
    queryFn: getStatsMatchesPerSeason,
    enabled: state.activePage === 'stats'
  });

  const stadiumsQuery = useQuery({
    queryKey: ['stadiums', stadiumFilterYear],
    queryFn: () => getStadiums(stadiumFilterYear),
    enabled: state.activePage === 'stats'
  });

  const [playgroundTab, setPlaygroundTab] = useState<'bot' | 'quiz' | 'dream' | 'auction'>('bot');
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);

  // General lists loaded on mount
  const [teamsList, setTeamsList] = useState<TeamStats[]>([]);
  const [seasonsList, setSeasonsList] = useState<SeasonSummary[]>([]);
  const [venuesList, setVenuesList] = useState<VenueStats[]>([]);

  // Stadium table sorting and virtual scrolling states at top level
  const [stadiumSortField, setStadiumSortField] = useState<'venue' | 'city' | 'matchesHosted' | 'avgFirstInningsScore' | 'bestPerformer'>('matchesHosted');
  const [stadiumSortOrder, setStadiumSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stadiumScrollTop, setStadiumScrollTop] = useState(0);

  // Stats view states
  const [statsLoading, setStatsLoading] = useState(true);

  // Player view states
  const [selectedPlayerObj, setSelectedPlayerObj] = useState<PlayerSummary | null>(null);
  const [aiBioText, setAiBioText] = useState('');
  const [aiBioLoading, setAiBioLoading] = useState(false);
  const [aiBioCooldown, setAiBioCooldown] = useState(0);

  // Team view states
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [h2hResult, setH2hResult] = useState<any>(null);
  const [h2hLoading, setH2hLoading] = useState(false);
  const [selectedTeamObj, setSelectedTeamObj] = useState<TeamStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'winPct' | 'matches' | 'alphabetical'>('winPct');

  // Season view states
  const [activeSeasonYear, setActiveSeasonYear] = useState<number>(2026);
  const [seasonMatches, setSeasonMatches] = useState<Match[]>([]);
  const [seasonMatchesPage, setSeasonMatchesPage] = useState(1);
  const [seasonMatchesCount, setSeasonMatchesCount] = useState(0);
  const [seasonMatchesLoading, setSeasonMatchesLoading] = useState(false);

  // Records view states
  const [recordsTab, setRecordsTab] = useState<'runs' | 'wickets' | 'sixes' | 'economy' | 'centuries' | 'fifties'>('runs');
  const [recordsPage, setRecordsPage] = useState(1);
  const [recordsData, setRecordsData] = useState<any>(null);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Compare view states
  const [compareP1, setCompareP1] = useState<PlayerSummary | null>(null);
  const [compareP2, setCompareP2] = useState<PlayerSummary | null>(null);
  const [compareAIResult, setCompareAIResult] = useState('');
  const [compareAILoading, setCompareAILoading] = useState(false);
  const [compareAICooldown, setCompareAICooldown] = useState(0);

  // AI view states
  const [aiMatches, setAiMatches] = useState<Match[]>([]);
  const [selectedMatchReport, setSelectedMatchReport] = useState<Match | null>(null);
  const [aiReportText, setAiReportText] = useState('');
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportCooldown, setAiReportCooldown] = useState(0);

  const [searchPlayerQuery, setSearchPlayerQuery] = useState('');
  const [aiBioSearchLoading, setAiBioSearchLoading] = useState(false);
  const [aiBioSearchText, setAiBioSearchText] = useState('');

  // Default top players for players page
  const [topBattingPlayers, setTopBattingPlayers] = useState<BattingRecord[]>([]);
  const [topBowlingPlayers, setTopBowlingPlayers] = useState<BowlingRecord[]>([]);
  const [topAllRounderPlayers, setTopAllRounderPlayers] = useState<any[]>([]);
  const [topPlayersLoading, setTopPlayersLoading] = useState(false);
  const [playerLoadingName, setPlayerLoadingName] = useState<string | null>(null);

  // Load lists on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [teams, seasons, venues, matchesRes] = await Promise.all([
          getTeams(),
          getSeasons(),
          getVenues(),
          getMatches({ page: 1 })
        ]);
        if (teams) setTeamsList(teams);
        if (seasons) setSeasonsList(seasons);
        if (venues) setVenuesList(venues);
        if (matchesRes && matchesRes.results) {
          setRecentMatches(matchesRes.results.slice(0, 10));
        }
      } catch (err) {
        console.error('Error loading metadata lists:', err);
      }
      setStatsLoading(false);
    }
    loadData();
  }, []);

  // Cooldown timers
  useEffect(() => {
    if (aiBioCooldown <= 0) return;
    const t = setInterval(() => setAiBioCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [aiBioCooldown]);

  useEffect(() => {
    if (compareAICooldown <= 0) return;
    const t = setInterval(() => setCompareAICooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [compareAICooldown]);

  useEffect(() => {
    if (aiReportCooldown <= 0) return;
    const t = setInterval(() => setAiReportCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [aiReportCooldown]);

  // Load season data when season tab changes
  useEffect(() => {
    const loadSeasonMatches = async () => {
      setSeasonMatchesLoading(true);
      const res = await getMatches({ season: activeSeasonYear, page: seasonMatchesPage });
      if (res) {
        setSeasonMatches(res.results);
        setSeasonMatchesCount(res.count);
      }
      setSeasonMatchesLoading(false);
    };

    if (state.activePage === 'seasons') {
      loadSeasonMatches();
    }
  }, [state.activePage, activeSeasonYear, seasonMatchesPage]);

  // Load records data
  useEffect(() => {
    const loadRecords = async () => {
      setRecordsLoading(true);
      let res = null;
      switch (recordsTab) {
        case 'runs':
          res = await getRecordsMostRuns(recordsPage);
          break;
        case 'wickets':
          res = await getRecordsMostWickets(recordsPage);
          break;
        case 'sixes':
          res = await getRecordsMostSixes(recordsPage);
          break;
        case 'economy':
          res = await getRecordsBestEconomy(recordsPage);
          break;
        case 'centuries':
          res = await getRecordsFastestCenturies(recordsPage);
          break;
        case 'fifties':
          res = await getRecordsFastestFifties(recordsPage);
          break;
      }
      setRecordsData(res);
      setRecordsLoading(false);
    };

    if (state.activePage === 'records') {
      loadRecords();
    }
  }, [state.activePage, recordsTab, recordsPage]);

  // Load matches for AI match reports tab
  useEffect(() => {
    const loadAIMatches = async () => {
      const res = await getMatches({ page: 1 });
      if (res) {
        setAiMatches(res.results.slice(0, 20)); // show recent 20 matches to generate report
      }
    };

    if (state.activePage === 'ai-insights') {
      loadAIMatches();
    }
  }, [state.activePage]);



  // Load default top players for players page when activePage is 'players'
  useEffect(() => {
    const loadTopPlayers = async () => {
      if (topBattingPlayers.length > 0 && topBowlingPlayers.length > 0 && topAllRounderPlayers.length > 0) return;
      setTopPlayersLoading(true);
      try {
        const [runsRes, wicketsRes, allRoundersRes] = await Promise.all([
          getRecordsMostRuns(1),
          getRecordsMostWickets(1),
          getRecordsAllRounders(1)
        ]);
        if (runsRes && runsRes.results) {
          setTopBattingPlayers(runsRes.results.slice(0, 10));
        }
        if (wicketsRes && wicketsRes.results) {
          setTopBowlingPlayers(wicketsRes.results.slice(0, 10));
        }
        if (allRoundersRes && allRoundersRes.results) {
          setTopAllRounderPlayers(allRoundersRes.results.slice(0, 10));
        }
      } catch (err) {
        console.error('Error loading default top players:', err);
      }
      setTopPlayersLoading(false);
    };

    if (state.activePage === 'players') {
      loadTopPlayers();
    }
  }, [state.activePage, topBattingPlayers.length, topBowlingPlayers.length, topAllRounderPlayers.length]);

  // Select player by clicking on a leaderboard row
  const handleSelectPlayerByName = async (name: string) => {
    setPlayerLoadingName(name);
    try {
      const res = await getPlayers(name);
      if (res && res.results && res.results.length > 0) {
        const matched = res.results.find(p => p.player.toLowerCase() === name.toLowerCase()) || res.results[0];
        setSelectedPlayerObj(matched);
        setAiBioText(''); // reset bio
      }
    } catch (err) {
      console.error('Error selecting player by name:', err);
    }
    setPlayerLoadingName(null);
  };

  // Handle head-to-head fetch
  const handleFetchH2H = async () => {
    if (!teamA || !teamB || teamA === teamB) return;
    setH2hLoading(true);
    const data = await getHeadToHead(teamA, teamB);
    setH2hResult(data);
    setH2hLoading(false);
  };

  // Trigger AI Player Biography
  const handleGenerateAIBio = async (name: string) => {
    if (aiBioCooldown > 0) return;
    setAiBioLoading(true);
    setAiBioCooldown(5);
    const data = await postAIPlayerBio(name);
    if (data) {
      setAiBioText(data.bio);
    }
    setAiBioLoading(false);
  };

  // Trigger AI comparison
  const handleGenerateCompareAI = async () => {
    if (!compareP1 || !compareP2 || compareAICooldown > 0) return;
    setCompareAILoading(true);
    setCompareAICooldown(5);
    const prompt = `Compare the career stats of batter/bowler ${compareP1.player} and ${compareP2.player}. Evaluate their match impact, batting/bowling differences, and who is more suited for anchor or finishing roles in a team.`;
    const res = await postAICommentary(prompt);
    if (res) {
      setCompareAIResult(res.answer);
    }
    setCompareAILoading(false);
  };

  // Trigger AI match report
  const handleGenerateMatchReport = async (matchId: number) => {
    if (aiReportCooldown > 0) return;
    setAiReportLoading(true);
    setAiReportCooldown(5);
    const data = await postAIMatchReport(matchId);
    if (data) {
      setAiReportText(data.report);
    }
    setAiReportLoading(false);
  };

  // CSV download generator
  const downloadRecordsCSV = () => {
    if (!recordsData || !recordsData.results) return;
    const rows = recordsData.results;
    let csvContent = "data:text/csv;charset=utf-8,";

    // Headers
    if (recordsTab === 'runs' || recordsTab === 'sixes') {
      csvContent += "Rank,Player,Matches,Innings,Runs,Average,Strike Rate,Sixes,Fours\n";
      rows.forEach((r: BattingRecord, i: number) => {
        csvContent += `${(recordsPage - 1) * 50 + i + 1},"${r.player}",${r.matches},${r.innings},${r.runs},${r.average},${r.strike_rate},${r.sixes},${r.fours}\n`;
      });
    } else if (recordsTab === 'wickets' || recordsTab === 'economy') {
      csvContent += "Rank,Player,Matches,Innings,Overs,Wickets,Economy,Average,Strike Rate\n";
      rows.forEach((r: BowlingRecord, i: number) => {
        csvContent += `${(recordsPage - 1) * 50 + i + 1},"${r.player}",${r.matches},${r.innings},${r.overs},${r.wickets},${r.economy},${r.strike_rate}\n`;
      });
    } else {
      csvContent += "Rank,Player,Balls,Runs,Against,Venue,Season\n";
      rows.forEach((r: any, i: number) => {
        csvContent += `${(recordsPage - 1) * 50 + i + 1},"${r.player}",${r.balls},${r.runs},"${r.against}","${r.venue}",${r.season}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IPL_Records_${recordsTab}_Page${recordsPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // Home View Renderer
  // ----------------------------------------------------
  const renderHome = () => {
    return (
      <div className="space-y-8 animate-fadeIn font-sans">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-sm bg-surface border border-line p-8 md:p-12 transition-colors duration-300">
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sage">
              19-year historical dataset
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-normal text-chalk uppercase tracking-wide leading-none">
              explore the <span className="text-accent">ipl stats universe</span>
            </h1>
            <p className="text-sage text-xs md:text-sm leading-relaxed max-w-xl">
              Analyze player evolution, compare head-to-head franchise metrics, run fantasy auction simulations, build your dream XI, and generate AI insights directly from 1,240+ matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'stats' })}
                className="bg-accent text-accent-contrast rounded-sm font-mono text-xs tracking-wider font-bold py-2 px-4 hover:opacity-90 transition-opacity w-full sm:w-auto text-center"
              >
                view seasonal stats
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'trending' })}
                className="bg-transparent border border-line-strong text-chalk rounded-sm font-mono text-xs tracking-wider font-bold py-2 px-4 hover:bg-surface-2 transition-colors w-full sm:w-auto text-center"
              >
                open live map
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard Panel */}
        <div className="border border-line bg-surface grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-line rounded-sm overflow-hidden transition-colors duration-300">
          {[
            { value: "1243", label: "matches ingested", tag: "100% complete" },
            { value: "19", label: "seasons", tag: "2008–2026" },
            { value: "30+", label: "stadium venues", tag: "gps interactive" },
            { value: "650+", label: "cricketers", tag: "profile radar cards" }
          ].map((seg, idx) => (
            <div key={idx} className="p-6 flex flex-col justify-between min-h-[120px]">
              <span className="text-accent font-mono text-4xl font-bold leading-none">{seg.value}</span>
              <span className="text-sage text-[11px] font-sans mt-1">{seg.label}</span>
              <span className="text-[9px] text-sage-dim font-mono border border-line px-1.5 py-0.5 rounded-sm inline-block mt-3 bg-surface-2 self-start uppercase tracking-wider">
                {seg.tag}
              </span>
            </div>
          ))}
        </div>

        {/* 3-column records strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-line border border-line bg-surface-2 rounded-sm p-4 text-xs font-mono transition-colors duration-300">
          <div className="py-2 md:py-0 md:px-4 flex justify-between items-center">
            <span className="text-sage uppercase text-[10px]">highest individual score</span>
            <span className="text-accent font-bold">175* <span className="text-sage-dim font-normal text-[9px]">by c. gayle</span></span>
          </div>
          <div className="py-2 md:py-0 md:px-4 flex justify-between items-center">
            <span className="text-sage uppercase text-[10px]">most team runs</span>
            <span className="text-accent font-bold">287/3 <span className="text-sage-dim font-normal text-[9px]">by srh</span></span>
          </div>
          <div className="py-2 md:py-0 md:px-4 flex justify-between items-center">
            <span className="text-sage uppercase text-[10px]">best career strike rate</span>
            <span className="text-accent font-bold">180+ <span className="text-sage-dim font-normal text-[9px]">by a. russell</span></span>
          </div>
        </div>

        {/* Two-Column Panel Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Standings Sidebar */}
          <div className="bg-surface p-5 rounded-sm border border-line transition-colors duration-300">
            <h3 className="font-display uppercase tracking-widest text-lg text-chalk mb-4 flex justify-between items-center border-b border-line pb-3">
              <span>franchise leaderboard</span>
              <span className="text-[9px] font-mono text-sage font-normal uppercase">win ratio</span>
            </h3>

            {teamsList.length > 0 ? (
              <div className="space-y-3">
                {teamsList.slice(0, 5).map((team, idx) => (
                  <div key={team.team} className="flex items-center justify-between text-xs hover:bg-surface-2 p-1.5 rounded-sm transition-colors font-mono">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sage-dim font-mono text-[10px] w-4">{idx + 1}</span>
                      <span className="font-sans font-semibold text-chalk truncate" title={team.team}>
                        {team.team}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-sage font-mono">({team.wins} wins)</span>
                      <span className="font-mono font-bold text-accent bg-surface-2 border border-line px-1.5 py-0.5 rounded-sm text-[10px]">
                        {team.win_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'teams' })}
                  className="w-full text-center text-[10px] font-mono font-bold text-accent hover:opacity-85 uppercase tracking-wider pt-3 border-t border-line block mt-2"
                >
                  view all teams standing →
                </button>
              </div>
            ) : (
              <p className="text-xs text-sage italic text-center py-4 font-mono">loading standings...</p>
            )}
          </div>

          {/* Trending Venues Sidebar */}
          <div className="bg-surface p-5 rounded-sm border border-line transition-colors duration-300">
            <h3 className="font-display uppercase tracking-widest text-lg text-chalk mb-4 flex justify-between items-center border-b border-line pb-3">
              <span>trending ipl venues</span>
              <span className="text-[9px] font-mono text-sage font-normal uppercase">activity</span>
            </h3>

            <div className="space-y-3 font-mono">
              {[
                { name: "Narendra Modi Stadium", city: "Ahmedabad", activity: 98 },
                { name: "Wankhede Stadium", city: "Mumbai", activity: 92 },
                { name: "M. Chinnaswamy Stadium", city: "Bengaluru", activity: 85 }
              ].map((venue, idx) => (
                <div key={venue.name} className="flex items-center justify-between text-xs hover:bg-surface-2 p-1.5 rounded-sm transition-colors">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sage-dim font-mono text-[10px] w-4">{idx + 1}</span>
                    <div className="min-w-0 pr-1">
                      <span className="font-sans font-semibold text-chalk truncate block">
                        {venue.name}
                      </span>
                      <span className="text-[9px] text-sage truncate block font-sans font-normal lowercase">
                        {venue.city}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-[10px] text-accent">{venue.activity}%</span>
                    <div className="w-16 h-1 bg-surface-2 rounded-sm overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${venue.activity}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'trending' })}
                className="w-full text-center text-[10px] font-mono font-bold text-accent hover:opacity-85 uppercase tracking-wider pt-3 border-t border-line block mt-2"
              >
                open live map →
              </button>
            </div>
          </div>
        </div>

        {/* Universe Navigation Hub */}
        <div className="space-y-4">
          <h2 className="font-display uppercase tracking-wider text-xl text-chalk">universe navigation hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'stats', title: 'seasonal statistics', desc: 'Average run trends and boundary graphs.', color: 'border-l-accent' },
              { id: 'players', title: 'player profiles', desc: 'Radar skill score overlay & career calendars.', color: 'border-l-danger' },
              { id: 'teams', title: 'team head-to-head', desc: 'Franchise comparison matrices and toss insights.', color: 'border-l-accent' },
              { id: 'squads', title: 'franchise squads', desc: 'All 19 season squad rosters for MI, CSK, RCB, etc.', color: 'border-l-accent' },
              { id: 'seasons', title: 'cap winners & racer', desc: 'Yearly points tables and Bar Chart Race simulator.', color: 'border-l-danger' },
              { id: 'records', title: 'hall of records', desc: 'Historic leaderboards and data sheet downloads.', color: 'border-l-accent' },
              { id: 'compare', title: 'player comparator', desc: 'Side-by-side batting/bowling comparisons.', color: 'border-l-danger' },
              { id: 'trending', title: 'trending venues map', desc: 'Real-time analytics of weekly played matches.', color: 'border-l-accent' },
            ].map((link) => {
              return (
                <div
                  key={link.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_PAGE', payload: link.id })}
                  className={`bg-surface p-5 rounded-sm border border-line border-l-[3px] ${link.color} cursor-pointer hover:bg-surface-2 transition-colors select-none`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display uppercase tracking-widest text-chalk text-sm">{link.title}</h3>
                    <span className="text-[10px] font-mono text-accent">GO →</span>
                  </div>
                  <p className="text-xs text-sage leading-relaxed mt-2">
                    {link.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Report Modal */}
        {selectedMatchReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-surface max-w-lg w-full rounded-sm overflow-hidden border border-line">
              {/* Header */}
              <div className="px-6 py-4 border-b border-line flex justify-between items-center bg-surface-2">
                <div>
                  <h4 className="font-display uppercase tracking-widest text-sm text-chalk">
                    {selectedMatchReport.team1} vs {selectedMatchReport.team2}
                  </h4>
                  <span className="text-[10px] text-sage font-mono">
                    season {selectedMatchReport.season} · date: {selectedMatchReport.date}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedMatchReport(null);
                    setAiReportText('');
                  }}
                  className="text-sage hover:text-chalk font-mono text-sm"
                >
                  [✕]
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto font-mono text-xs">
                <div className="bg-surface-2 p-4 rounded-sm border border-line text-[10px] flex justify-between items-center text-center text-sage">
                  <div>
                    <span className="block uppercase font-bold text-sage-dim">venue</span>
                    <span className="font-semibold text-chalk block mt-1">{selectedMatchReport.venue}</span>
                  </div>
                  <div>
                    <span className="block uppercase font-bold text-sage-dim">toss winner</span>
                    <span className="font-semibold text-chalk block mt-1">{selectedMatchReport.toss_winner} ({selectedMatchReport.toss_decision})</span>
                  </div>
                  <div>
                    <span className="block uppercase font-bold text-sage-dim">pom</span>
                    <span className="font-semibold text-accent block mt-1">{selectedMatchReport.player_of_match}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-widest text-danger flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse"></span>
                    ai match analysis report
                  </h5>
                  {aiReportLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mb-2"></div>
                      <span className="text-[10px] text-sage">Drafting report...</span>
                    </div>
                  ) : aiReportText ? (
                    <div className="text-chalk leading-relaxed space-y-2 whitespace-pre-line text-[11px]">
                      {aiReportText}
                    </div>
                  ) : (
                    <p className="text-[10px] text-sage-dim italic">No report text loaded.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-line bg-surface-2 text-[9px] text-sage-dim text-center font-mono">
                match analytics powered by Claude LLM context analysis.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // Stats View Renderer
  // ----------------------------------------------------
  const renderStats = () => {
    // Determine loading state
    const isStatsLoading = orangeCapQuery.isLoading || purpleCapQuery.isLoading || matchesQuery.isLoading || stadiumsQuery.isLoading;

    if (isStatsLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">IPL Seasonal Analytics</h2>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Explore trendlines of performance thresholds across seasons</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartSkeleton height={250} />
            <ChartSkeleton height={250} />
          </div>
          <ChartSkeleton height={250} />
          <TableSkeleton rows={8} />
        </div>
      );
    }

    // Resolve Orange Cap Runs
    const orangeCapData = orangeCapQuery.data || [];
    const orangeCapLabels = orangeCapData.map(d => d.year);
    const orangeCapValues = orangeCapData.map(d => d.runs);

    // Resolve Purple Cap Wickets
    const purpleCapData = purpleCapQuery.data || [];
    const purpleCapLabels = purpleCapData.map(d => d.year);
    const purpleCapValues = purpleCapData.map(d => d.wickets);

    // Resolve Matches Played
    const matchesData = matchesQuery.data || [];
    const matchesLabels = matchesData.map(d => d.year);
    const matchesValues = matchesData.map(d => d.totalMatches);

    // Resolve Stadiums list
    const stadiumsData = stadiumsQuery.data || [];

    // Compile combined season data for Season Momentum Timeline
    const yearsSet = new Set([
      ...orangeCapData.map(d => d.year),
      ...purpleCapData.map(d => d.year),
      ...matchesData.map(d => d.year)
    ]);
    const years = Array.from(yearsSet).sort();

    const combinedSeasonData: CombinedSeasonData[] = years.map(y => {
      const o = orangeCapData.find(d => d.year === y);
      const p = purpleCapData.find(d => d.year === y);
      const m = matchesData.find(d => d.year === y);
      return {
        year: y,
        runs: o?.runs || 0,
        wickets: p?.wickets || 0,
        matches: m?.totalMatches || 0,
        runsLeader: o?.playerName || 'N/A',
        wicketsLeader: p?.playerName || 'N/A'
      };
    });

    // Chart.js data config
    const runChartData = {
      labels: orangeCapLabels,
      datasets: [
        {
          label: 'Orange Cap Runs (Peak Score)',
          data: orangeCapValues,
          borderColor: isDark ? '#e8a33d' : '#b45309', // amber / orange
          backgroundColor: isDark ? 'rgba(232, 163, 61, 0.08)' : 'rgba(180, 83, 9, 0.08)',
          fill: true,
          tension: 0.3
        }
      ]
    };

    const wicketsChartData = {
      labels: purpleCapLabels,
      datasets: [
        {
          label: 'Purple Cap Wickets (Peak Bowler)',
          data: purpleCapValues,
          borderColor: isDark ? '#a855f7' : '#6b21a8', // purple
          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(107, 33, 168, 0.08)',
          fill: true,
          tension: 0.3
        }
      ]
    };

    const matchesChartData = {
      labels: matchesLabels,
      datasets: [
        {
          label: 'Total Matches in Season',
          data: matchesValues,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.55)' : 'rgba(26, 86, 219, 0.55)',
          borderColor: isDark ? '#3B82F6' : '#1A56DB',
          borderWidth: 1
        }
      ]
    };

    // Sort stadiums table
    const handleSort = (field: typeof stadiumSortField) => {
      if (stadiumSortField === field) {
        setStadiumSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setStadiumSortField(field);
        setStadiumSortOrder('desc');
      }
    };

    const sortedStadiums = [...stadiumsData].sort((a, b) => {
      const valA = a[stadiumSortField];
      const valB = b[stadiumSortField];

      if (typeof valA === 'string') {
        return stadiumSortOrder === 'asc'
          ? valA.localeCompare(valB as string)
          : (valB as string).localeCompare(valA);
      } else {
        return stadiumSortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    // Virtualization variables
    const rowHeight = 50;
    const containerHeight = 350;
    const totalRows = sortedStadiums.length;

    const startIndex = Math.max(0, Math.floor(stadiumScrollTop / rowHeight) - 2);
    const endIndex = Math.min(totalRows - 1, Math.floor((stadiumScrollTop + containerHeight) / rowHeight) + 2);

    const visibleStadiums = sortedStadiums.slice(startIndex, endIndex + 1);
    const paddingTop = startIndex * rowHeight;
    const paddingBottom = (totalRows - endIndex - 1) * rowHeight;

    const getTrackSpeed = (avgScore: number) => {
      if (!avgScore || avgScore === 0) return { label: 'N/A', color: 'text-text-muted' };
      if (avgScore >= 170) return { label: '⚡ Fast', color: 'text-emerald-500 dark:text-emerald-400' };
      if (avgScore >= 160) return { label: '⚖️ Balanced', color: 'text-amber-500 dark:text-amber-400' };
      return { label: '🐌 Slow', color: 'text-rose-500 dark:text-rose-400' };
    };

    const renderErrorWidget = (title: string, refetchFn: () => void) => (
      <div className="glass-card p-5 rounded-2xl flex flex-col items-center justify-center h-[290px] border border-danger/20 text-center bg-surface">
        <AlertTriangle className="w-10 h-10 text-danger mb-3" />
        <h4 className="text-xs font-bold text-chalk uppercase tracking-wider mb-1">Failed to load data</h4>
        <p className="text-[10px] text-sage max-w-xs mb-4">The widget was unable to fetch benchmarks from the server.</p>
        <button
          onClick={() => refetchFn()}
          className="bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 px-4 py-1.5 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
        >
          Retry Widget
        </button>
      </div>
    );

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-display text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">IPL Seasonal Analytics</h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Explore trendlines of performance thresholds across seasons</p>
          </div>
        </div>

        {/* Chart grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orange Cap Runs Widget */}
          {orangeCapQuery.isError ? (
            renderErrorWidget("Orange Cap Scoring Benchmarks", orangeCapQuery.refetch)
          ) : (
            <div className="glass-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-medium tracking-widest text-chalk uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e8a33d] shadow-[0_0_6px_#e8a33d]"></span>
                  Orange Cap Scoring Benchmarks
                </h3>
                <button
                  onClick={() => orangeCapQuery.refetch()}
                  className="text-[10px] text-sage hover:text-accent font-bold cursor-pointer font-mono"
                  title="Refresh chart"
                >
                  [Refresh]
                </button>
              </div>
              <ChartWrapper id="run-trend-chart" type="line" data={runChartData} height={250} />
            </div>
          )}

          {/* Purple Cap Wickets Widget */}
          {purpleCapQuery.isError ? (
            renderErrorWidget("Purple Cap Bowler Benchmarks", purpleCapQuery.refetch)
          ) : (
            <div className="glass-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-medium tracking-widest text-chalk uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7] shadow-[0_0_6px_#a855f7]"></span>
                  Purple Cap Bowler Benchmarks
                </h3>
                <button
                  onClick={() => purpleCapQuery.refetch()}
                  className="text-[10px] text-sage hover:text-accent font-bold cursor-pointer font-mono"
                  title="Refresh chart"
                >
                  [Refresh]
                </button>
              </div>
              <ChartWrapper id="wicket-trend-chart" type="line" data={wicketsChartData} height={250} />
            </div>
          )}
        </div>

        {/* League Expansion Matches Widget */}
        {matchesQuery.isError ? (
          renderErrorWidget("League Expansion: Matches Played", matchesQuery.refetch)
        ) : (
          <div className="glass-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-medium tracking-widest text-chalk uppercase">League Expansion: Matches Played</h3>
              <button
                onClick={() => matchesQuery.refetch()}
                className="text-[10px] text-sage hover:text-accent font-bold cursor-pointer font-mono"
                title="Refresh chart"
              >
                [Refresh]
              </button>
            </div>
            <ChartWrapper id="matches-bar-chart" type="bar" data={matchesChartData} height={250} />
          </div>
        )}

        {/* Stadium Averages Table */}
        {stadiumsQuery.isError ? (
          renderErrorWidget("Stadium Averages & Track Speeds", stadiumsQuery.refetch)
        ) : (
          <div className="glass-card p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-[10px] font-medium tracking-widest text-chalk uppercase">Stadium Averages & Track Speeds</h3>
                {stadiumFilterYear && (
                  <p className="text-[10px] text-accent mt-0.5 font-mono">Showing stats for Season {stadiumFilterYear}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {stadiumFilterYear && (
                  <button
                    onClick={() => {
                      setStadiumFilterYear(null);
                    }}
                    className="text-[9px] bg-accent/15 hover:bg-accent/25 text-accent border border-accent/20 px-2 py-0.5 rounded-sm font-mono transition-colors"
                  >
                    Clear Filter [✕]
                  </button>
                )}
                <button
                  onClick={() => stadiumsQuery.refetch()}
                  className="text-[10px] text-sage hover:text-accent font-bold cursor-pointer font-mono"
                  title="Refresh table"
                >
                  [Refresh]
                </button>
              </div>
            </div>

            {/* Virtualized Table Container */}
            <div
              className="overflow-y-auto mt-4 border border-line/60 rounded-sm"
              style={{ height: `${containerHeight}px` }}
              onScroll={(e) => setStadiumScrollTop(e.currentTarget.scrollTop)}
            >
              <table className="w-full text-sm text-left text-text-primary-light dark:text-text-primary-dark table-fixed">
                <thead className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase bg-surface-2 sticky top-0 z-10 border-b border-line shadow-sm">
                  <tr className="h-[40px]">
                    <th className="px-4 py-2 cursor-pointer hover:text-chalk select-none w-[30%]" onClick={() => handleSort('venue')}>
                      Venue Name {stadiumSortField === 'venue' ? (stadiumSortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-4 py-2 cursor-pointer hover:text-chalk select-none w-[15%]" onClick={() => handleSort('city')}>
                      City {stadiumSortField === 'city' ? (stadiumSortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-4 py-2 cursor-pointer hover:text-chalk select-none text-center w-[12%]" onClick={() => handleSort('matchesHosted')}>
                      Matches {stadiumSortField === 'matchesHosted' ? (stadiumSortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-4 py-2 cursor-pointer hover:text-chalk select-none text-center w-[13%]" onClick={() => handleSort('avgFirstInningsScore')}>
                      Avg 1st Inn {stadiumSortField === 'avgFirstInningsScore' ? (stadiumSortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="px-4 py-2 cursor-pointer hover:text-chalk select-none text-center w-[15%]" onClick={() => handleSort('avgFirstInningsScore')}>
                      Track Speed
                    </th>
                    <th className="px-4 py-2 cursor-pointer hover:text-chalk select-none w-[15%]" onClick={() => handleSort('bestPerformer')}>
                      MVP {stadiumSortField === 'bestPerformer' ? (stadiumSortOrder === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Virtual padding top */}
                  {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }}><td colSpan={6}></td></tr>}

                  {visibleStadiums.map((v) => {
                    const speedInfo = getTrackSpeed(v.avgFirstInningsScore);
                    return (
                      <tr
                        key={v.venue}
                        className="border-b border-line/50 hover:bg-surface-2 transition-all duration-300 font-mono text-xs"
                        style={{ height: `${rowHeight}px` }}
                      >
                        <td className="px-4 py-2 font-semibold text-text-primary-light dark:text-text-primary-dark truncate font-sans" title={v.venue}>
                          {v.venue}
                        </td>
                        <td className="px-4 py-2 text-text-secondary-light dark:text-text-secondary-dark truncate font-sans" title={v.city}>
                          {v.city}
                        </td>
                        <td className="px-4 py-2 text-center font-bold">
                          {v.matchesHosted}
                        </td>
                        <td className="px-4 py-2 text-center text-gold font-bold">
                          {v.avgFirstInningsScore}
                        </td>
                        <td className={`px-4 py-2 text-center font-bold ${speedInfo.color}`}>
                          {speedInfo.label}
                        </td>
                        <td className="px-4 py-2 text-text-primary-light dark:text-text-primary-dark">
                          <div className="flex items-center gap-1 font-sans truncate" title={v.bestPerformer}>
                            <Award className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span className="truncate">{v.bestPerformer}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Virtual padding bottom */}
                  {paddingBottom > 0 && <tr style={{ height: `${paddingBottom}px` }}><td colSpan={6}></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5th Widget: Season Momentum Timeline combo chart */}
        <SeasonMomentumTimeline
          data={combinedSeasonData}
          liveYear={2026}
          onYearSelect={(year) => {
            if (year === 0) {
              setStadiumFilterYear(null);
            } else {
              setStadiumFilterYear(year);
            }
          }}
        />
      </div>
    );
  };


  // ----------------------------------------------------
  // Players View Renderer
  // ----------------------------------------------------
  const renderPlayers = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Superstar Player Profiles</h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5 font-mono uppercase tracking-wider">
              Interactive radar skills, consistency heatmaps, and PNG exports
            </p>
          </div>
          <div>
            <PlayersSearchNew
              onSelect={(player) => {
                setSelectedPlayerId(player.id);
              }}
            />
          </div>
        </div>

        {/* Selector Banner Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white/4 to-brand-dark/10 border border-border-light dark:border-border-dark p-6 shadow-lg mb-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8a33d]/5 rounded-full blur-3xl -z-10"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-[#e8a33d] animate-pulse" />
                <span>Select a Legend to Profile</span>
              </h3>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 max-w-2xl">
                Click on any player in the live leaderboards below to load their skill ratings, seasonal consistency heatmaps, streamed career bio, and exportable stat card.
              </p>
            </div>
          </div>
        </div>

        {/* Three Leaderboards Side-by-side */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Batting Leaderboard */}
          <LeadersPanelNew
            title="All-Time Batting Leaders"
            category="batting"
            metricOptions={[
              { value: 'runs', label: 'Runs' },
              { value: 'average', label: 'Avg', decimals: 1 },
              { value: 'strike_rate', label: 'S/R', decimals: 1 }
            ]}
            badgeColorClass="text-[#e8a33d] bg-[#e8a33d]/5 border-[#e8a33d]/10"
            badgeLabel="Runs"
            iconType="trophy"
            onPlayerSelect={(id) => setSelectedPlayerId(id)}
          />

          {/* All-Rounder Leaderboard */}
          <LeadersPanelNew
            title="All-Time All-Rounders"
            category="all-rounders"
            metricOptions={[
              { value: 'rating', label: 'Rating' }
            ]}
            badgeColorClass="text-emerald-400 bg-emerald-400/5 border-emerald-400/10"
            badgeLabel="Rating"
            iconType="award"
            onPlayerSelect={(id) => setSelectedPlayerId(id)}
          />

          {/* Bowling Leaderboard */}
          <LeadersPanelNew
            title="All-Time Bowling Leaders"
            category="bowling"
            metricOptions={[
              { value: 'wickets', label: 'Wickets' },
              { value: 'economy', label: 'Econ', decimals: 2 },
              { value: 'strike_rate', label: 'S/R', decimals: 2 }
            ]}
            badgeColorClass="text-[#a855f7] bg-[#a855f7]/5 border-[#a855f7]/10"
            badgeLabel="Wickets"
            iconType="activity"
            onPlayerSelect={(id) => setSelectedPlayerId(id)}
          />

        </div>

        {/* Side Drawer Profile Detail Panel */}
        <ProfilesDrawerNew
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      </div>
    );
  };



  const renderTeams = () => {
    // Dynamic calculations for 2x2 stats grid
    const totalFranchises = teamsList.length;
    const totalMatches = seasonsList.reduce((acc, s) => acc + (s.total_matches || 0), 0);
    const seasonsCount = seasonsList.length;

    const mostMatchesTeamObj = teamsList.length > 0
      ? [...teamsList].sort((a, b) => b.matches - a.matches)[0]
      : null;
    const mostMatchesTeamName = mostMatchesTeamObj ? mostMatchesTeamObj.team : 'N/A';
    const mostMatchesTeamCount = mostMatchesTeamObj ? mostMatchesTeamObj.matches : 0;

    // Filter and Sort for standing metrics
    const filteredTeams = teamsList.filter((t) =>
      t.team.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedTeams = [...filteredTeams].sort((a, b) => {
      if (sortBy === 'winPct') {
        if (b.win_percentage !== a.win_percentage) {
          return b.win_percentage - a.win_percentage;
        }
        return b.matches - a.matches;
      }
      if (sortBy === 'matches') {
        if (b.matches !== a.matches) {
          return b.matches - a.matches;
        }
        return b.win_percentage - a.win_percentage;
      }
      if (sortBy === 'alphabetical') {
        return a.team.localeCompare(b.team);
      }
      return 0;
    });

    const handleQuickMatchup = async (t1: string, t2: string) => {
      setTeamA(t1);
      setTeamB(t2);
      setH2hLoading(true);
      const data = await getHeadToHead(t1, t2);
      setH2hResult(data);
      setH2hLoading(false);
    };

    const quickMatchups = [
      { label: 'MI vs CSK', t1: 'Mumbai Indians', t2: 'Chennai Super Kings' },
      { label: 'RCB vs KKR', t1: 'Royal Challengers Bangalore', t2: 'Kolkata Knight Riders' },
      { label: 'DC vs RR', t1: 'Delhi Capitals', t2: 'Rajasthan Royals' },
    ];

    // Helper check for light backgrounds (for initials badge text contrast)
    const isLight = (hex: string) => {
      const lightColors = ['#fdb913', '#ffd300', '#ea6c00', '#e96525', '#ff6e00'];
      return lightColors.includes(hex.toLowerCase());
    };

    return (
      <div className="space-y-6 animate-fadeIn font-sans">
        <div>
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">IPL Team Diagnostics</h2>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            Compare head-to-head match histories and evaluate franchise standing metrics
          </p>
        </div>

        {/* Two-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
          
          {/* LEFT SIDEBAR: Head-to-Head Generator */}
          <div className="bg-surface border border-line rounded-sm p-6 space-y-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-line pb-2">
                <GitCompare className="w-4 h-4 text-accent" />
                Head-to-head generator
              </h3>

              {/* Selector Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Team 1
                  </label>
                  <select
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    className="w-full bg-surface-2 border border-line rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer font-sans"
                  >
                    <option value="">-- Choose Team A --</option>
                    {teamsList.map((t) => (
                      <option key={t.team} value={t.team} disabled={t.team === teamB}>
                        {t.team}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Team 2
                  </label>
                  <select
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    className="w-full bg-surface-2 border border-line rounded-sm px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent cursor-pointer font-sans"
                  >
                    <option value="">-- Choose Team B --</option>
                    {teamsList.map((t) => (
                      <option key={t.team} value={t.team} disabled={t.team === teamA}>
                        {t.team}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleFetchH2H}
                  disabled={h2hLoading || !teamA || !teamB || teamA === teamB}
                  className="w-full py-2.5 bg-accent hover:bg-accent-strong text-accent-contrast disabled:opacity-30 disabled:hover:bg-accent text-xs font-bold rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  {h2hLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Comparing...</span>
                    </>
                  ) : (
                    <>
                      <GitCompare className="w-4 h-4" />
                      <span>Compare head-to-head</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Matchup Chips */}
            <div className="border-t border-line pt-4">
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">
                Popular Matchups
              </span>
              <div className="flex flex-wrap gap-2">
                {quickMatchups.map((m) => {
                  const isActive =
                    (teamA === m.t1 && teamB === m.t2) || (teamA === m.t2 && teamB === m.t1);
                  return (
                    <button
                      key={m.label}
                      onClick={() => handleQuickMatchup(m.t1, m.t2)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'bg-surface-2 border-line text-text-secondary hover:border-text-muted hover:text-text-primary'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stat Tiles 2x2 Grid */}
            <div className="border-t border-line pt-4">
              <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-3">
                Franchise Stats
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* Tile 1: Total Franchises */}
                <div className="bg-surface-2 border border-line rounded-sm p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Teams</span>
                    <Users className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <span className="text-base font-mono font-bold text-text-primary mt-1">{totalFranchises}</span>
                </div>

                {/* Tile 2: Total Matches */}
                <div className="bg-surface-2 border border-line rounded-sm p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Matches</span>
                    <Activity className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <span className="text-base font-mono font-bold text-text-primary mt-1">{totalMatches}</span>
                </div>

                {/* Tile 3: Most Matches */}
                <div className="bg-surface-2 border border-line rounded-sm p-3 flex flex-col justify-between col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Most Matches Played</span>
                    <Trophy className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <div className="flex items-baseline justify-between mt-1 gap-2">
                    <span className="text-[11px] font-bold text-text-primary truncate max-w-[140px]">{mostMatchesTeamName}</span>
                    <span className="text-xs font-mono font-bold text-accent shrink-0">{mostMatchesTeamCount}</span>
                  </div>
                </div>

                {/* Tile 4: Seasons */}
                <div className="bg-surface-2 border border-line rounded-sm p-3 flex flex-col justify-between col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Seasons Covered</span>
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <span className="text-xs font-mono font-bold text-text-primary mt-1">{seasonsCount} Seasons</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 w-full space-y-6">
            
            {/* RIGHT TOP PANEL: Head-to-Head Result */}
            {h2hResult ? (
              (() => {
                let team1ColorClass = 'text-text-secondary';
                let team2ColorClass = 'text-text-secondary';
                let team1BarColor = 'bg-text-muted';
                let team2BarColor = 'bg-text-muted';

                if (h2hResult.team1_wins > h2hResult.team2_wins) {
                  team1ColorClass = 'text-green-500 font-bold';
                  team2ColorClass = 'text-red-500/80 font-medium';
                  team1BarColor = 'bg-green-500';
                  team2BarColor = 'bg-red-500/80';
                } else if (h2hResult.team2_wins > h2hResult.team1_wins) {
                  team1ColorClass = 'text-red-500/80 font-medium';
                  team2ColorClass = 'text-green-500 font-bold';
                  team1BarColor = 'bg-red-500/80';
                  team2BarColor = 'bg-green-500';
                } else if (h2hResult.total_matches > 0) {
                  team1ColorClass = 'text-accent font-bold';
                  team2ColorClass = 'text-accent font-bold';
                  team1BarColor = 'bg-accent/70';
                  team2BarColor = 'bg-accent/70';
                }

                const totalDecided = h2hResult.team1_wins + h2hResult.team2_wins;
                const team1Share = totalDecided > 0 ? (h2hResult.team1_wins / totalDecided) * 100 : 50;
                const team2Share = totalDecided > 0 ? (h2hResult.team2_wins / totalDecided) * 100 : 50;

                const team1Color = getTeamColor(h2hResult.team1);
                const team2Color = getTeamColor(h2hResult.team2);

                const team1Initials = getTeamShortName(h2hResult.team1);
                const team2Initials = getTeamShortName(h2hResult.team2);

                const textContrast1 = isLight(team1Color) ? 'text-slate-950 font-extrabold' : 'text-white font-bold';
                const textContrast2 = isLight(team2Color) ? 'text-slate-950 font-extrabold' : 'text-white font-bold';

                return (
                  <div className="bg-surface border border-line rounded-sm p-6 space-y-6 shadow-sm">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-line pb-2">
                      Head-to-head result
                    </h3>

                    <div className="flex items-center justify-between gap-4 py-4">
                      {/* Team 1 Badge & Wins */}
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 min-w-0">
                        <div
                          style={{ backgroundColor: team1Color }}
                          className="w-14 h-14 rounded-full flex items-center justify-center text-lg tracking-wider select-none shrink-0"
                        >
                          <span className={textContrast1}>{team1Initials}</span>
                        </div>
                        <span className="text-xs font-bold text-text-primary truncate w-full max-w-[100px] md:max-w-[180px]" title={h2hResult.team1}>
                          {h2hResult.team1}
                        </span>
                        <span className={`text-2xl font-mono ${team1ColorClass}`}>
                          {h2hResult.team1_wins}
                        </span>
                      </div>

                      {/* Matches Played */}
                      <div className="flex flex-col items-center justify-center shrink-0 px-2 text-center">
                        <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">
                          Matches
                        </span>
                        <span className="text-xl font-mono font-bold text-text-primary bg-surface-2 border border-line rounded-sm px-3 py-1 min-w-[44px]">
                          {h2hResult.total_matches}
                        </span>
                        {h2hResult.ties > 0 && (
                          <span className="text-[9px] text-text-muted font-mono mt-1">
                            ({h2hResult.ties} N/R)
                          </span>
                        )}
                      </div>

                      {/* Team 2 Badge & Wins */}
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 min-w-0">
                        <div
                          style={{ backgroundColor: team2Color }}
                          className="w-14 h-14 rounded-full flex items-center justify-center text-lg tracking-wider select-none shrink-0"
                        >
                          <span className={textContrast2}>{team2Initials}</span>
                        </div>
                        <span className="text-xs font-bold text-text-primary truncate w-full max-w-[100px] md:max-w-[180px]" title={h2hResult.team2}>
                          {h2hResult.team2}
                        </span>
                        <span className={`text-2xl font-mono ${team2ColorClass}`}>
                          {h2hResult.team2_wins}
                        </span>
                      </div>
                    </div>

                    {/* Proportional Split Bar */}
                    {h2hResult.total_matches > 0 && totalDecided > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-mono text-text-secondary">
                          <span>{team1Share.toFixed(1)}% Share</span>
                          <span className="uppercase tracking-wider font-bold">Win Share</span>
                          <span>{team2Share.toFixed(1)}% Share</span>
                        </div>
                        <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden flex border border-line/40">
                          <div style={{ width: `${team1Share}%` }} className={`${team1BarColor} h-full transition-all duration-300`} />
                          <div style={{ width: `${team2Share}%` }} className={`${team2BarColor} h-full transition-all duration-300`} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-xs font-mono text-text-muted">
                        No decided matchups recorded.
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="bg-surface border border-line rounded-sm p-12 text-center flex flex-col items-center justify-center min-h-[220px] shadow-sm">
                <div className="w-12 h-12 rounded-full bg-surface-2 border border-line flex items-center justify-center mb-3">
                  <GitCompare className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-text-secondary font-sans text-xs max-w-xs leading-relaxed">
                  Select two franchises on the left panel to compare their head-to-head match histories
                </p>
              </div>
            )}

            {/* RIGHT BOTTOM PANEL: Standing Metrics */}
            <div className="bg-surface border border-line rounded-sm p-6 space-y-6 shadow-sm">
              
              {/* Standings Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  All-time franchise standing metrics
                </h3>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search team..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-surface-2 border border-line rounded-sm pl-8 pr-3 py-1 text-xs text-text-primary focus:outline-none focus:border-accent w-full sm:w-44 transition-colors font-sans"
                    />
                  </div>

                  {/* Sort dropdown */}
                  <div className="relative flex items-center bg-surface-2 border border-line rounded-sm px-2 py-1 cursor-pointer">
                    <ArrowUpDown className="w-3 h-3 text-text-muted mr-1.5" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer pr-3 font-sans font-medium"
                    >
                      <option value="winPct">Sort by: Win %</option>
                      <option value="matches">Sort by: Matches Played</option>
                      <option value="alphabetical">Sort by: A–Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              {sortedTeams.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {sortedTeams.map((team) => {
                    const brandColor = getTeamColor(team.team);
                    const isGreen = team.win_percentage >= 50.0;
                    const pctColorClass = isGreen ? 'text-green-500' : 'text-red-500/80';
                    const formerNames = TEAM_DETAILS[team.team]?.formerNames;
                    const totalDecided = team.wins + team.losses;
                    const winShare = totalDecided > 0 ? (team.wins / totalDecided) * 100 : 50;
                    const lossShare = totalDecided > 0 ? (team.losses / totalDecided) * 100 : 50;

                    return (
                      <div
                        key={team.team}
                        style={{ borderLeft: `4px solid ${brandColor}` }}
                        onClick={() => setSelectedTeamObj(team)}
                        className={`bg-surface-2 border border-line border-l-0 rounded-r-sm p-4 flex flex-col justify-between hover:border-text-muted transition-colors cursor-pointer ${
                          selectedTeamObj?.team === team.team ? 'ring-1 ring-accent' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-text-primary tracking-wide truncate">
                              {team.team}
                            </h4>
                            {formerNames && (
                              <p className="text-[9px] text-text-muted mt-0.5 font-sans leading-none">
                                {formerNames}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs font-mono font-bold shrink-0 ${pctColorClass}`}>
                            {team.win_percentage.toFixed(2)}%
                          </span>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono text-text-secondary">
                            <div>
                              <span>Played: </span>
                              <span className="text-text-primary font-bold">{team.matches}</span>
                            </div>
                            <div>
                              <span className="text-green-500">W {team.wins}</span>
                              <span className="mx-1 text-line-strong">/</span>
                              <span className="text-red-500/80">L {team.losses}</span>
                            </div>
                          </div>

                          {/* Split Bar */}
                          <div className="w-full bg-surface h-1 rounded-full overflow-hidden flex border border-line/20">
                            {totalDecided > 0 ? (
                              <>
                                <div style={{ width: `${winShare}%` }} className="bg-green-500 h-full" />
                                <div style={{ width: `${lossShare}%` }} className="bg-red-500/80 h-full" />
                              </>
                            ) : (
                              <div className="bg-surface-2 w-full h-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted text-xs font-sans">
                  No franchises found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // Seasons View Renderer
  // ----------------------------------------------------
  const renderSeasons = () => {
    // Find active season summary
    const activeSeasonSummary = seasonsList.find(s => s.season === activeSeasonYear);

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">IPL Seasonal Archives</h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Explore cap standings, points tables, and cumulative leaderboards</p>
          </div>
          <div>
            <select
              value={activeSeasonYear}
              onChange={(e) => {
                setActiveSeasonYear(Number(e.target.value));
                setSeasonMatchesPage(1);
              }}
              className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 rounded-lg px-4 py-2 text-xs text-text-primary-light dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand font-semibold"
            >
              {Array.from({ length: 19 }, (_, i) => 2008 + i).map(year => (
                <option key={year} value={year}>Season {year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cap Winners Summary Card */}
        {activeSeasonSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <span className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark block uppercase tracking-wider">Champion</span>
              <span className="text-sm font-bold text-gold block mt-1">{activeSeasonSummary.champion}</span>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <span className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark block uppercase tracking-wider">Runner-Up</span>
              <span className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark block mt-1">{activeSeasonSummary.runner_up}</span>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <span className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark block uppercase tracking-wider">Orange Cap (Batting)</span>
              <span className="text-sm font-bold text-gold block mt-1">
                {activeSeasonSummary.orange_cap} <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-mono">({activeSeasonSummary.orange_cap_runs} runs)</span>
              </span>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <span className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark block uppercase tracking-wider">Purple Cap (Bowling)</span>
              <span className="text-sm font-bold text-accent-purple block mt-1">
                {activeSeasonSummary.purple_cap} <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-mono">({activeSeasonSummary.purple_cap_wickets} wkts)</span>
              </span>
            </div>
          </div>
        )}

        {/* Bar Chart Race Component */}
        <BarChartRace
          selectedYear={activeSeasonYear}
          onYearChange={(year) => setActiveSeasonYear(year)}
        />

        {/* Season Matches List */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider mb-4">Matches played in Season {activeSeasonYear}</h3>

          {seasonMatchesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {seasonMatches.map((match) => (
                <div key={match.match_id} className="bg-base-light dark:bg-slate-950 p-3 rounded-lg border border-border-light dark:border-slate-850 flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-slate-800 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark font-mono font-medium">{match.date}</span>
                    <span className="font-bold text-text-primary-light dark:text-text-primary-dark">{match.team1} vs {match.team2}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-[10px] text-gold font-mono font-semibold bg-gold/10 px-2 py-0.5 rounded">
                      Winner: {match.winner}
                    </span>
                    <span className="text-text-secondary-light dark:text-text-secondary-dark text-[10px] hidden md:block">{match.win_by_runs > 0 ? `by ${match.win_by_runs} runs` : `by ${match.win_by_wickets} wickets`}</span>

                  </div>
                </div>
              ))}

              {/* Matches Pagination */}
              <div className="flex justify-between items-center pt-4">
                <button
                  disabled={seasonMatchesPage <= 1}
                  onClick={() => setSeasonMatchesPage(prev => prev - 1)}
                  className="px-3 py-1.5 bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-30 rounded text-[10px] font-bold text-text-primary-light dark:text-slate-200 border border-border-light dark:border-slate-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Page
                </button>
                <span className="text-[10px] text-text-secondary-light dark:text-slate-400 font-semibold font-mono">
                  Page {seasonMatchesPage} (Total: {seasonMatchesCount})
                </span>
                <button
                  disabled={seasonMatchesPage * 50 >= seasonMatchesCount}
                  onClick={() => setSeasonMatchesPage(prev => prev + 1)}
                  className="px-3 py-1.5 bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-30 rounded text-[10px] font-bold text-text-primary-light dark:text-slate-200 border border-border-light dark:border-slate-700 flex items-center gap-1"
                >
                  Next Page <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // Records View (Hall of Records)
  // ----------------------------------------------------
  const renderRecords = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">IPL Hall of Records</h2>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Explore historic leaderboards and export data rosters</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadRecordsCSV}
              disabled={!recordsData || recordsLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold rounded-lg text-text-primary-light dark:text-slate-100 transition-colors disabled:opacity-30"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
              <span>Download CSV Sheet</span>
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2 border-b border-border-light dark:border-slate-800 pb-3">
          {[
            { id: 'runs', label: 'Most Runs' },
            { id: 'wickets', label: 'Most Wickets' },
            { id: 'sixes', label: 'Most Sixes' },
            { id: 'economy', label: 'Best Economy' },
            { id: 'centuries', label: 'Fastest Centuries' },
            { id: 'fifties', label: 'Fastest Fifties' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setRecordsTab(tab.id as any);
                setRecordsPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${recordsTab === tab.id
                ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20'
                : 'text-text-secondary-light dark:text-slate-400 bg-surface-light dark:bg-slate-950 border-border-light dark:border-slate-850 hover:text-text-primary-light hover:dark:text-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Records Paginated Table */}
        <div className="glass-card p-5 rounded-2xl">
          {recordsLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
          ) : recordsData && recordsData.results ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-primary-light dark:text-text-primary-dark">
                  <thead className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase bg-base-light dark:bg-slate-950/80">
                    <tr>
                      <th className="px-4 py-3 text-center">Rank</th>
                      <th className="px-4 py-3">Player Name</th>
                      {recordsTab === 'runs' || recordsTab === 'sixes' ? (
                        <>
                          <th className="px-4 py-3 text-center">Matches</th>
                          <th className="px-4 py-3 text-center">Innings</th>
                          <th className="px-4 py-3 text-center">Runs</th>
                          <th className="px-4 py-3 text-center">Avg</th>
                          <th className="px-4 py-3 text-center">S/R</th>
                          <th className="px-4 py-3 text-center">Sixes</th>
                          <th className="px-4 py-3 text-center">Fours</th>
                        </>
                      ) : recordsTab === 'wickets' || recordsTab === 'economy' ? (
                        <>
                          <th className="px-4 py-3 text-center">Matches</th>
                          <th className="px-4 py-3 text-center">Overs</th>
                          <th className="px-4 py-3 text-center">Wickets</th>
                          <th className="px-4 py-3 text-center">Economy</th>
                          <th className="px-4 py-3 text-center">S/R</th>
                          <th className="px-4 py-3">Best Bowling</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-center">Balls</th>
                          <th className="px-4 py-3 text-center">Runs</th>
                          <th className="px-4 py-3">Against</th>
                          <th className="px-4 py-3">Venue</th>
                          <th className="px-4 py-3 text-center">Season</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-slate-800">
                    {recordsData.results.map((item: any, i: number) => (
                      <tr key={item.id || i} className="hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-center font-bold font-mono text-text-secondary-light dark:text-text-secondary-dark">
                          {(recordsPage - 1) * 50 + i + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-text-primary-light dark:text-text-primary-dark">{item.player}</td>
                        {recordsTab === 'runs' || recordsTab === 'sixes' ? (
                          <>
                            <td className="px-4 py-3 text-center font-mono">{item.matches}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.innings}</td>
                            <td className="px-4 py-3 text-center font-mono text-gold font-semibold">{item.runs}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.average}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.strike_rate}</td>
                            <td className="px-4 py-3 text-center font-mono text-text-primary-light dark:text-text-primary-dark">{item.sixes}</td>
                            <td className="px-4 py-3 text-center font-mono text-text-secondary-light dark:text-text-secondary-dark">{item.fours}</td>
                          </>
                        ) : recordsTab === 'wickets' || recordsTab === 'economy' ? (
                          <>
                            <td className="px-4 py-3 text-center font-mono">{item.matches}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.overs}</td>
                            <td className="px-4 py-3 text-center font-mono text-gold font-semibold">{item.wickets}</td>
                            <td className="px-4 py-3 text-center font-mono text-brand font-semibold">{item.economy}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.strike_rate}</td>
                            <td className="px-4 py-3 font-mono">{item.best_bowling || 'N/A'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-center font-mono text-gold font-bold">{item.balls}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.runs}</td>
                            <td className="px-4 py-3 text-text-primary-light dark:text-text-primary-dark">{item.against}</td>
                            <td className="px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[150px]">{item.venue}</td>
                            <td className="px-4 py-3 text-center font-mono">{item.season}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Records Pagination */}
              <div className="flex justify-between items-center pt-4 border-t border-border-light dark:border-slate-800">
                <button
                  disabled={recordsPage <= 1}
                  onClick={() => setRecordsPage(prev => prev - 1)}
                  className="px-3 py-1.5 bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-30 rounded text-[10px] font-bold text-text-primary-light dark:text-slate-200 border border-border-light dark:border-slate-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev Page
                </button>
                <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-semibold font-mono">
                  Page {recordsPage} (Showing 50 items)
                </span>
                <button
                  disabled={!recordsData.next}
                  onClick={() => setRecordsPage(prev => prev + 1)}
                  className="px-3 py-1.5 bg-base-light dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-30 rounded text-[10px] font-bold text-text-primary-light dark:text-slate-200 border border-border-light dark:border-slate-700 flex items-center gap-1"
                >
                  Next Page <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary-light dark:text-text-secondary-dark">No records found.</div>
          )}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // Compare View (Player Comparator)
  // ----------------------------------------------------
  const renderCompare = () => {
    return (
      <div className="w-full h-[82vh] rounded-2xl overflow-hidden border border-line bg-surface shadow-2xl">
        <iframe
          src="/player_comparator.html"
          className="w-full h-full border-none"
          title="Superstar Player Comparator"
        />
      </div>
    );
  };

  // ----------------------------------------------------
  // Main Render Layout
  // ----------------------------------------------------
  const renderActiveView = () => {
    switch (state.activePage) {
      case 'home':
        return renderHome();
      case 'stats':
        return renderStats();
      case 'players':
        return renderPlayers();
      case 'teams':
        return renderTeams();
      case 'squads':
        return <SquadsView />;
      case 'seasons':
        return renderSeasons();
      case 'records':
        return renderRecords();

      case 'compare':
        return renderCompare();
      case 'trending':
        return <TrendingVenuesMap />;
      default:
        return renderHome();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-chalk selection:bg-accent/35 selection:text-accent-contrast font-sans transition-colors duration-300">
      {/* Navigation Topbar */}
      <Nav />

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-[1180px] mx-auto w-full px-8 py-8">
        {renderActiveView()}
      </main>

      {/* Bottom Footer Section */}
      <footer className="bg-surface border-t border-line py-6 px-8 text-center text-xs text-sage font-medium flex flex-col md:flex-row justify-between items-center max-w-[1180px] mx-auto w-full transition-colors duration-300">
        <p>© {new Date().getFullYear()} IPL Mega-Website Stats Universe. All rights reserved.</p>
        <p className="mt-1 md:mt-0 text-[10px] text-sage-dim font-mono">Compiled across 19 seasons of historical cricket logs (2008–2026).</p>
      </footer>
    </div>
  );
}
