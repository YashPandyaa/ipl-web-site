import { GitCompare } from 'lucide-react';
import { getTeamColor, getTeamShortName } from '../utils/teamUtils';

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

interface HeadToHeadResultProps {
  team1: string;
  team2: string;
  matches: Match[];
}

export default function HeadToHeadResult({ team1, team2, matches }: HeadToHeadResultProps) {
  // Empty state before selection
  if (!team1 || !team2) {
    return (
      <div className="bg-panel-bg border border-panel-border rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-bg-dark border border-panel-border flex items-center justify-center mb-4">
          <GitCompare className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 font-sans text-sm max-w-xs leading-relaxed">
          Select two franchises on the left panel to compare their head-to-head match histories
        </p>
      </div>
    );
  }

  // Filter matches played between the two teams
  const h2hMatches = matches.filter(
    (m) =>
      (m.team1 === team1 && m.team2 === team2) ||
      (m.team1 === team2 && m.team2 === team1)
  );

  const totalPlayed = h2hMatches.length;

  // Wins count
  const team1Wins = h2hMatches.filter((m) => m.winner === team1).length;
  const team2Wins = h2hMatches.filter((m) => m.winner === team2).length;
  const tiesOrNoResult = totalPlayed - team1Wins - team2Wins;

  // Win colors
  let team1ColorClass = 'text-gray-400';
  let team2ColorClass = 'text-gray-400';
  let team1BarColor = 'bg-gray-600';
  let team2BarColor = 'bg-gray-600';

  if (team1Wins > team2Wins) {
    team1ColorClass = 'text-green-500 font-bold';
    team2ColorClass = 'text-red-500/80 font-medium';
    team1BarColor = 'bg-green-500';
    team2BarColor = 'bg-red-500/80';
  } else if (team2Wins > team1Wins) {
    team1ColorClass = 'text-red-500/80 font-medium';
    team2ColorClass = 'text-green-500 font-bold';
    team1BarColor = 'bg-red-500/80';
    team2BarColor = 'bg-green-500';
  } else if (totalPlayed > 0) {
    // Equal wins
    team1ColorClass = 'text-accent-orange font-bold';
    team2ColorClass = 'text-accent-orange font-bold';
    team1BarColor = 'bg-accent-orange/70';
    team2BarColor = 'bg-accent-orange/70';
  }

  // Proportional split (ignoring no-result matches if totalPlayed > 0, or distributing evenly if 0 matches won)
  const totalDecided = team1Wins + team2Wins;
  const team1Share = totalDecided > 0 ? (team1Wins / totalDecided) * 100 : 50;
  const team2Share = totalDecided > 0 ? (team2Wins / totalDecided) * 100 : 50;

  const team1Color = getTeamColor(team1);
  const team2Color = getTeamColor(team2);

  const team1Initials = getTeamShortName(team1);
  const team2Initials = getTeamShortName(team2);

  // Check if color is light (e.g. yellow or orange/yellow) to set initials text color
  const isLight = (hex: string) => {
    const lightColors = ['#fdb913', '#ffd300', '#ea6c00', '#e96525', '#ff6e00'];
    return lightColors.includes(hex.toLowerCase());
  };

  const textContrast1 = isLight(team1Color) ? 'text-bg-dark font-extrabold' : 'text-white font-bold';
  const textContrast2 = isLight(team2Color) ? 'text-bg-dark font-extrabold' : 'text-white font-bold';

  return (
    <div className="bg-panel-bg border border-panel-border rounded-xl p-6 space-y-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-panel-border pb-3">
        Head-to-Head Result
      </h3>

      <div className="flex items-center justify-between gap-4 py-4">
        {/* Team 1 Panel */}
        <div className="flex flex-col items-center text-center space-y-3 flex-1 min-w-0">
          <div
            style={{ backgroundColor: team1Color }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl tracking-wider select-none shrink-0"
          >
            <span className={textContrast1}>{team1Initials}</span>
          </div>
          <span className="text-sm font-bold text-white truncate w-full max-w-[120px] md:max-w-[200px]" title={team1}>
            {team1}
          </span>
          <span className={`text-2xl font-mono ${team1ColorClass}`}>
            {team1Wins}
          </span>
        </div>

        {/* Center Panel (Matches Played) */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
            Matches
          </span>
          <span className="text-2xl font-mono font-bold text-white bg-bg-dark border border-panel-border rounded-lg px-4 py-1.5 min-w-[50px]">
            {totalPlayed}
          </span>
          {tiesOrNoResult > 0 && (
            <span className="text-[9px] text-gray-500 font-mono mt-1.5">
              ({tiesOrNoResult} N/R)
            </span>
          )}
        </div>

        {/* Team 2 Panel */}
        <div className="flex flex-col items-center text-center space-y-3 flex-1 min-w-0">
          <div
            style={{ backgroundColor: team2Color }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl tracking-wider select-none shrink-0"
          >
            <span className={textContrast2}>{team2Initials}</span>
          </div>
          <span className="text-sm font-bold text-white truncate w-full max-w-[120px] md:max-w-[200px]" title={team2}>
            {team2}
          </span>
          <span className={`text-2xl font-mono ${team2ColorClass}`}>
            {team2Wins}
          </span>
        </div>
      </div>

      {/* Proportional Split Win Share Bar */}
      {totalPlayed > 0 && totalDecided > 0 ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
            <span>{team1Share.toFixed(1)}% Share</span>
            <span className="uppercase tracking-wider font-bold">Win Share</span>
            <span>{team2Share.toFixed(1)}% Share</span>
          </div>
          <div className="w-full bg-bg-dark rounded-full h-2 overflow-hidden flex border border-panel-border">
            <div
              style={{ width: `${team1Share}%` }}
              className={`${team1BarColor} h-full transition-all duration-500`}
            />
            <div
              style={{ width: `${team2Share}%` }}
              className={`${team2BarColor} h-full transition-all duration-500`}
            />
          </div>
        </div>
      ) : totalPlayed > 0 ? (
        <div className="text-center py-2 text-xs font-mono text-gray-500">
          All matchups ended with No Result/Ties.
        </div>
      ) : (
        <div className="text-center py-2 text-xs font-mono text-gray-500">
          No matches recorded between these two teams.
        </div>
      )}
    </div>
  );
}
