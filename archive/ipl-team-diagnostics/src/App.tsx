import { useState } from 'react';
import Header from './components/Header';
import HeadToHeadGenerator from './components/HeadToHeadGenerator';
import HeadToHeadResult from './components/HeadToHeadResult';
import StandingsGrid from './components/StandingsGrid';
import matchesData from './data/matches.json';
import { getMergedTeam, TEAM_DETAILS } from './utils/teamUtils';

export default function App() {
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [activeCompare, setActiveCompare] = useState<{ team1: string; team2: string } | null>(null);

  // Pre-process matches to merge old/split franchise names into unified names
  const mergedMatches = matchesData.map((m) => ({
    ...m,
    team1: getMergedTeam(m.team1),
    team2: getMergedTeam(m.team2),
    winner: m.winner ? getMergedTeam(m.winner) : null,
    toss_winner: getMergedTeam(m.toss_winner),
  }));

  // Unique merged franchises (sorted alphabetically)
  const uniqueTeams = Object.keys(TEAM_DETAILS).sort();

  // Statistics calculation for the 2x2 grid
  const totalFranchises = uniqueTeams.length;
  const totalMatches = mergedMatches.length;

  const seasons = Array.from(new Set(mergedMatches.map((m) => m.season).filter(Boolean)));
  const seasonsCount = seasons.length;

  // Calculate franchise with most matches played
  const matchCounts: { [key: string]: number } = {};
  uniqueTeams.forEach((teamName) => {
    matchCounts[teamName] = 0;
  });
  mergedMatches.forEach((m) => {
    if (matchCounts[m.team1] !== undefined) matchCounts[m.team1]++;
    if (matchCounts[m.team2] !== undefined) matchCounts[m.team2]++;
  });

  let mostMatchesTeam = '';
  let mostMatchesCount = 0;
  Object.entries(matchCounts).forEach(([teamName, count]) => {
    if (count > mostMatchesCount) {
      mostMatchesCount = count;
      mostMatchesTeam = teamName;
    }
  });

  const handleCompare = (t1: string, t2: string) => {
    setActiveCompare({ team1: t1, team2: t2 });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-6">
      <Header />

      {/* Two-Column Responsive Grid Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Fixed Left Sidebar (~300px) */}
        <div className="w-full md:w-[300px] shrink-0">
          <HeadToHeadGenerator
            teams={uniqueTeams}
            onCompare={handleCompare}
            selectedTeam1={selectedTeam1}
            selectedTeam2={selectedTeam2}
            setSelectedTeam1={setSelectedTeam1}
            setSelectedTeam2={setSelectedTeam2}
            totalFranchises={totalFranchises}
            totalMatches={totalMatches}
            mostMatchesTeam={mostMatchesTeam}
            mostMatchesCount={mostMatchesCount}
            seasonsCount={seasonsCount}
          />
        </div>

        {/* Flexible Right Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Panel: Head-to-Head Result */}
          <HeadToHeadResult
            team1={activeCompare?.team1 || ''}
            team2={activeCompare?.team2 || ''}
            matches={mergedMatches}
          />

          {/* Bottom Panel: All-Time Standing Metrics */}
          <StandingsGrid
            teams={uniqueTeams}
            matches={mergedMatches}
          />
        </div>
      </div>
    </div>
  );
}
