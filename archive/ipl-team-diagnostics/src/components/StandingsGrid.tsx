import { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { TEAM_DETAILS, getTeamColor } from '../utils/teamUtils';

interface Match {
  match_id: string;
  date: string;
  season: string;
  team1: string;
  team2: string;
  toss_winner: string;
  toss_decision: string;
  winner: string | null;
  venue: string;
  result_margin: number | string | null;
  won_by: string;
}

interface StandingsGridProps {
  teams: string[];
  matches: Match[];
}

export default function StandingsGrid({ teams, matches }: StandingsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'winPct' | 'matches' | 'alphabetical'>('winPct');

  // Compute stats for the 15 merged franchises
  const standings = teams.map((teamName) => {
    const details = TEAM_DETAILS[teamName];
    const teamMatches = matches.filter((m) => m.team1 === teamName || m.team2 === teamName);
    const played = teamMatches.length;
    const wins = teamMatches.filter((m) => m.winner === teamName).length;
    const noResults = teamMatches.filter((m) => m.team1 === teamName || m.team2 === teamName).filter((m) => !m.winner).length;
    const losses = played - wins - noResults;

    const winPercentage = played > 0 ? parseFloat(((wins / played) * 100).toFixed(2)) : 0.00;

    return {
      team: teamName,
      details,
      played,
      wins,
      losses,
      noResults,
      winPercentage,
    };
  });

  // Filter based on search query
  const filteredStandings = standings.filter((stat) =>
    stat.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort based on selection
  const sortedStandings = [...filteredStandings].sort((a, b) => {
    if (sortBy === 'winPct') {
      if (b.winPercentage !== a.winPercentage) {
        return b.winPercentage - a.winPercentage;
      }
      return b.played - a.played; // tie breaker
    }
    if (sortBy === 'matches') {
      if (b.played !== a.played) {
        return b.played - a.played;
      }
      return b.winPercentage - a.winPercentage; // tie breaker
    }
    if (sortBy === 'alphabetical') {
      return a.team.localeCompare(b.team);
    }
    return 0;
  });

  return (
    <div className="bg-panel-bg border border-panel-border rounded-xl p-6 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panel-border pb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          All-time franchise standing metrics
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-bg-dark border border-panel-border rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-accent-orange w-full sm:w-48 transition-colors font-sans"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-bg-dark border border-panel-border rounded-lg px-2 py-1.5 cursor-pointer">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer pr-4 font-sans font-medium"
            >
              <option value="winPct">Sort by: Win %</option>
              <option value="matches">Sort by: Matches Played</option>
              <option value="alphabetical">Sort by: A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Team Cards */}
      {sortedStandings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedStandings.map((stat) => {
            const brandColor = getTeamColor(stat.team);
            const isGreen = stat.winPercentage >= 50.0;
            const pctColorClass = isGreen ? 'text-green-500' : 'text-red-500/80';
            const totalDecided = stat.wins + stat.losses;
            const winShare = totalDecided > 0 ? (stat.wins / totalDecided) * 100 : 50;
            const lossShare = totalDecided > 0 ? (stat.losses / totalDecided) * 100 : 50;

            return (
              <div
                key={stat.team}
                style={{ borderLeft: `4px solid ${brandColor}` }}
                className="bg-panel-bg border-y border-r border-panel-border rounded-r-lg p-5 flex flex-col justify-between hover:border-gray-800 transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white tracking-wide truncate">
                      {stat.team}
                    </h4>
                    {stat.details.formerNames && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {stat.details.formerNames}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm font-mono font-bold shrink-0 ${pctColorClass}`}>
                    {stat.winPercentage.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {/* Meta row */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                    <div>
                      <span>Played: </span>
                      <span className="text-white font-bold">{stat.played}</span>
                    </div>
                    <div>
                      <span className="text-green-500">W {stat.wins}</span>
                      <span className="mx-1 text-gray-600">/</span>
                      <span className="text-red-500/80">L {stat.losses}</span>
                      {stat.noResults > 0 && (
                        <>
                          <span className="mx-1 text-gray-600">/</span>
                          <span className="text-gray-500">{stat.noResults} N/R</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Split bar */}
                  <div className="w-full bg-bg-dark h-1 rounded-full overflow-hidden flex border border-panel-border/30">
                    {totalDecided > 0 ? (
                      <>
                        <div style={{ width: `${winShare}%` }} className="bg-green-500 h-full" />
                        <div style={{ width: `${lossShare}%` }} className="bg-red-500/80 h-full" />
                      </>
                    ) : (
                      <div className="bg-gray-700 w-full h-full" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 text-xs font-sans">
          No teams found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
