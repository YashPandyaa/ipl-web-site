'use client';

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { getSquads } from '@/lib/api';
import { Users, Search, Crown, Globe, Shield, Calendar, Filter, Award } from 'lucide-react';

const TEAMS_LIST = [
  { code: 'MI', name: 'Mumbai Indians', color: 'border-blue-500 text-blue-400 bg-blue-500/10' },
  { code: 'CSK', name: 'Chennai Super Kings', color: 'border-yellow-500 text-yellow-400 bg-yellow-500/10' },
  { code: 'RCB', name: 'Royal Challengers Bengaluru', color: 'border-red-500 text-red-400 bg-red-500/10' },
  { code: 'KKR', name: 'Kolkata Knight Riders', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
  { code: 'DC', name: 'Delhi Capitals', color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
  { code: 'RR', name: 'Rajasthan Royals', color: 'border-pink-500 text-pink-400 bg-pink-500/10' },
  { code: 'SRH', name: 'Sunrisers Hyderabad', color: 'border-orange-500 text-orange-400 bg-orange-500/10' },
  { code: 'PBKS', name: 'Punjab Kings', color: 'border-rose-600 text-rose-400 bg-rose-600/10' },
  { code: 'GT', name: 'Gujarat Titans', color: 'border-teal-500 text-teal-400 bg-teal-500/10' },
  { code: 'LSG', name: 'Lucknow Super Giants', color: 'border-sky-400 text-sky-300 bg-sky-400/10' },
];

export default function SquadsView() {
  const { dispatch } = useAppState();
  const [selectedTeam, setSelectedTeam] = useState('MI');
  const [selectedSeason, setSelectedSeason] = useState(2024);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [squadData, setSquadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-adjust selected season if it falls outside the active range of the selected team
  useEffect(() => {
    if ((selectedTeam === 'GT' || selectedTeam === 'LSG') && selectedSeason < 2022) {
      setSelectedSeason(2022);
    } else if (selectedTeam === 'SRH' && selectedSeason < 2013) {
      setSelectedSeason(2013);
    }
  }, [selectedTeam, selectedSeason]);

  const getAvailableSeasons = () => {
    let startYear = 2008;
    if (selectedTeam === 'GT' || selectedTeam === 'LSG') {
      startYear = 2022;
    } else if (selectedTeam === 'SRH') {
      startYear = 2013;
    }
    
    const years = [];
    for (let yr = 2026; yr >= startYear; yr--) {
      years.push(yr);
    }
    return years;
  };

  useEffect(() => {
    async function fetchSquad() {
      // Prevent fetching invalid seasons
      let targetSeason = selectedSeason;
      if ((selectedTeam === 'GT' || selectedTeam === 'LSG') && selectedSeason < 2022) {
        targetSeason = 2022;
      } else if (selectedTeam === 'SRH' && selectedSeason < 2013) {
        targetSeason = 2013;
      }

      setLoading(true);
      const data = await getSquads(selectedTeam, targetSeason);
      if (data) {
        setSquadData(data);
      }
      setLoading(false);
    }
    fetchSquad();
  }, [selectedTeam, selectedSeason]);

  const activeTeamInfo = TEAMS_LIST.find(t => t.code === selectedTeam) || TEAMS_LIST[0];

  const filteredSquad = squadData?.squad ? squadData.squad.filter((player: any) => {
    const matchesRole = roleFilter === 'ALL' || 
      (roleFilter === 'BATSMAN' && player.role === 'Batsman') ||
      (roleFilter === 'BOWLER' && player.role === 'Bowler') ||
      (roleFilter === 'ALL-ROUNDER' && player.role === 'All-Rounder') ||
      (roleFilter === 'WICKETKEEPER' && player.role === 'Wicketkeeper');
    
    const matchesSearch = player.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.role.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesRole && matchesSearch;
  }) : [];

  const handleSelectPlayer = (playerName: string) => {
    dispatch({ type: 'SET_PLAYER', payload: playerName });
    dispatch({ type: 'SET_ACTIVE_PAGE', payload: 'players' });
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-sm border border-line transition-colors duration-300">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-xs font-bold text-accent uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            IPL Franchise Squad Roster
          </div>
          <h2 className="text-2xl font-bold text-chalk font-display uppercase tracking-wider">All-Season Franchise Squads</h2>
          <p className="text-xs text-sage mt-0.5 max-w-2xl">
            Inspect official squad rosters for all 10 IPL franchises across 19 seasons (2008–2026). Select a franchise tab and season to view player roles, captaincy badges, overseas status, and seasonal stats.
          </p>
        </div>

        {/* Season Selector Dropdown */}
        <div className="flex items-center gap-2 bg-surface-2 p-2 rounded-sm border border-line shrink-0">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono font-bold text-sage uppercase">Season:</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="bg-surface text-chalk border border-line rounded-sm px-3 py-1 text-xs font-mono font-bold focus:outline-none focus:border-accent"
          >
            {getAvailableSeasons().map((yr) => (
              <option key={yr} value={yr}>
                {yr} Season {yr === 2024 ? '(Ingested)' : yr === 2026 ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Franchise Selector Bar */}
      <div className="flex sm:grid items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none whitespace-nowrap sm:grid-cols-5 lg:grid-cols-10">
        {TEAMS_LIST.map((team) => {
          const isSelected = selectedTeam === team.code;
          return (
            <button
              key={team.code}
              onClick={() => setSelectedTeam(team.code)}
              className={`py-2.5 px-4 sm:px-2 rounded-sm border font-mono text-xs font-bold transition-all flex flex-row sm:flex-col items-center justify-center gap-1.5 sm:gap-1 select-none shrink-0 w-24 sm:w-auto ${
                isSelected
                  ? `bg-accent text-accent-contrast border-accent shadow-md scale-[1.02]`
                  : `bg-surface border-line text-sage hover:text-chalk hover:bg-surface-2`
              }`}
            >
              <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-accent-contrast' : 'text-accent'}`} />
              <span>{team.code}</span>
            </button>
          );
        })}
      </div>

      {/* Roster Controls & Filter Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-sm border border-line">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none whitespace-nowrap">
          {[
            { id: 'ALL', label: 'All Players' },
            { id: 'BATSMAN', label: 'Batsmen' },
            { id: 'BOWLER', label: 'Bowlers' },
            { id: 'ALL-ROUNDER', label: 'All-Rounders' },
            { id: 'WICKETKEEPER', label: 'Wicketkeepers' },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setRoleFilter(role.id)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all shrink-0 ${
                roleFilter === role.id
                  ? 'bg-accent text-accent-contrast'
                  : 'text-sage hover:text-chalk bg-surface-2 hover:bg-surface-2/80 border border-line'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-sage absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${activeTeamInfo.name} squad...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-2 text-chalk placeholder:text-sage-dim border border-line rounded-sm text-xs font-mono focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Squad Grid Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface border border-line rounded-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-3"></div>
          <p className="text-xs font-mono text-sage">Loading {activeTeamInfo.name} squad for season {selectedSeason}...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Subheader info */}
          <div className="flex justify-between items-center px-1 font-mono text-xs text-sage">
            <span>
              Showing <strong className="text-accent">{filteredSquad.length}</strong> players for <strong className="text-chalk">{squadData?.team || activeTeamInfo.name}</strong> ({selectedSeason})
            </span>
            <span>Franchise Code: <strong className="text-accent">{squadData?.team_code || selectedTeam}</strong></span>
          </div>

          {/* Player Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSquad.map((player: any) => (
              <div
                key={player.id || player.player}
                className="bg-surface p-4 rounded-sm border border-line flex flex-col justify-between space-y-4 hover:border-accent/60 transition-all duration-200 group relative overflow-hidden"
              >
                {/* Top badges */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent bg-surface-2 border border-line px-2 py-0.5 rounded-sm">
                    {player.role}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {player.is_captain && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-sm">
                        <Crown className="w-3 h-3" /> Captain
                      </span>
                    )}
                    {player.is_overseas && (
                      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 px-1.5 py-0.5 rounded-sm" title="Overseas Player">
                        <Globe className="w-3 h-3" /> Overseas
                      </span>
                    )}
                  </div>
                </div>

                {/* Player Name & Styles */}
                <div>
                  <h3 
                    onClick={() => handleSelectPlayer(player.player)}
                    className="font-sans font-bold text-base text-chalk group-hover:text-accent cursor-pointer transition-colors truncate"
                  >
                    {player.player}
                  </h3>
                  <div className="text-[10px] text-sage font-mono mt-1 space-y-0.5">
                    <p>Batting: <span className="text-chalk">{player.batting_style}</span></p>
                    <p>Bowling: <span className="text-chalk">{player.bowling_style}</span></p>
                  </div>
                </div>

                {/* Stats Summary Pill */}
                <div className="bg-surface-2 p-2.5 rounded-sm border border-line grid grid-cols-3 text-center text-xs font-mono">
                  <div>
                    <span className="block text-[9px] text-sage-dim uppercase">Matches</span>
                    <span className="font-bold text-chalk">{player.matches}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-sage-dim uppercase">Runs</span>
                    <span className="font-bold text-accent">{player.runs}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-sage-dim uppercase">Wickets</span>
                    <span className="font-bold text-chalk">{player.wickets}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleSelectPlayer(player.player)}
                  className="w-full py-1.5 text-center text-[10px] font-mono font-bold text-accent bg-surface-2 hover:bg-accent hover:text-accent-contrast border border-line hover:border-accent rounded-sm uppercase tracking-wider transition-all"
                >
                  View Profile Stats →
                </button>
              </div>
            ))}
          </div>

          {filteredSquad.length === 0 && (
            <div className="text-center py-16 bg-surface border border-line rounded-sm space-y-2">
              <Shield className="w-10 h-10 text-sage mx-auto" />
              <p className="text-xs font-mono text-sage">No players found matching your filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
