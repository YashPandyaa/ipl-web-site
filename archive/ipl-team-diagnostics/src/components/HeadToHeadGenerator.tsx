import { GitCompare, Calendar, Hash, Milestone, Trophy } from 'lucide-react';

interface HeadToHeadGeneratorProps {
  teams: string[];
  onCompare: (team1: string, team2: string) => void;
  selectedTeam1: string;
  selectedTeam2: string;
  setSelectedTeam1: (team: string) => void;
  setSelectedTeam2: (team: string) => void;
  totalFranchises: number;
  totalMatches: number;
  mostMatchesTeam: string;
  mostMatchesCount: number;
  seasonsCount: number;
}

export default function HeadToHeadGenerator({
  teams,
  onCompare,
  selectedTeam1,
  selectedTeam2,
  setSelectedTeam1,
  setSelectedTeam2,
  totalFranchises,
  totalMatches,
  mostMatchesTeam,
  mostMatchesCount,
  seasonsCount,
}: HeadToHeadGeneratorProps) {
  const isEnabled = selectedTeam1 && selectedTeam2 && selectedTeam1 !== selectedTeam2;

  const handleCompare = () => {
    if (isEnabled) {
      onCompare(selectedTeam1, selectedTeam2);
    }
  };

  const handleQuickMatchup = (t1: string, t2: string) => {
    setSelectedTeam1(t1);
    setSelectedTeam2(t2);
    onCompare(t1, t2);
  };

  const quickMatchups = [
    { label: 'MI vs CSK', t1: 'Mumbai Indians', t2: 'Chennai Super Kings' },
    { label: 'RCB vs KKR', t1: 'Royal Challengers Bangalore', t2: 'Kolkata Knight Riders' },
    { label: 'DC vs RR', t1: 'Delhi Capitals', t2: 'Rajasthan Royals' },
  ];

  return (
    <div className="bg-panel-bg border border-panel-border rounded-xl p-6 space-y-6 flex flex-col justify-between">
      {/* Title */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-accent-orange" />
          Head-to-head generator
        </h2>

        {/* Dropdowns */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Team 1
            </label>
            <select
              value={selectedTeam1}
              onChange={(e) => setSelectedTeam1(e.target.value)}
              className="w-full bg-bg-dark border border-panel-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-orange transition-colors cursor-pointer font-sans"
            >
              <option value="">-- Choose Team A --</option>
              {teams.map((t) => (
                <option key={t} value={t} disabled={t === selectedTeam2}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Team 2
            </label>
            <select
              value={selectedTeam2}
              onChange={(e) => setSelectedTeam2(e.target.value)}
              className="w-full bg-bg-dark border border-panel-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-orange transition-colors cursor-pointer font-sans"
            >
              <option value="">-- Choose Team B --</option>
              {teams.map((t) => (
                <option key={t} value={t} disabled={t === selectedTeam1}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={!isEnabled}
            className={`w-full py-2.5 px-4 rounded-lg font-bold font-sans text-xs uppercase tracking-wider transition-colors duration-250 cursor-pointer ${
              isEnabled
                ? 'bg-accent-orange hover:bg-amber-500 text-bg-dark font-extrabold'
                : 'bg-gray-800/40 text-gray-600 border border-panel-border cursor-not-allowed'
            }`}
          >
            Compare head-to-head
          </button>
        </div>
      </div>

      {/* Quick Comparison Chips */}
      <div className="border-t border-panel-border pt-4">
        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Popular Matchups
        </span>
        <div className="flex flex-wrap gap-2">
          {quickMatchups.map((m) => {
            const isActive =
              (selectedTeam1 === m.t1 && selectedTeam2 === m.t2) ||
              (selectedTeam1 === m.t2 && selectedTeam2 === m.t1);
            return (
              <button
                key={m.label}
                onClick={() => handleQuickMatchup(m.t1, m.t2)}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-accent-orange/10 border-accent-orange text-accent-orange'
                    : 'bg-bg-dark/40 border-panel-border text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat Tiles 2x2 Grid */}
      <div className="border-t border-panel-border pt-4">
        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Franchise Stats
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Tile 1: Total Franchises */}
          <div className="bg-bg-dark/50 border border-panel-border rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Teams</span>
              <Milestone className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-lg font-mono font-bold text-white mt-1.5">{totalFranchises}</span>
          </div>

          {/* Tile 2: Total Matches */}
          <div className="bg-bg-dark/50 border border-panel-border rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Matches</span>
              <Hash className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-lg font-mono font-bold text-white mt-1.5">{totalMatches}</span>
          </div>

          {/* Tile 3: Most Matches Played */}
          <div className="bg-bg-dark/50 border border-panel-border rounded-lg p-3 flex flex-col justify-between col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Most Matches Played</span>
              <Trophy className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <div className="flex items-baseline justify-between mt-1.5 gap-2">
              <span className="text-xs font-bold text-white truncate max-w-[150px]">{mostMatchesTeam}</span>
              <span className="text-sm font-mono font-bold text-accent-orange shrink-0">{mostMatchesCount}</span>
            </div>
          </div>

          {/* Tile 4: Seasons Covered */}
          <div className="bg-bg-dark/50 border border-panel-border rounded-lg p-3 flex flex-col justify-between col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Seasons Covered</span>
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <span className="text-lg font-mono font-bold text-white mt-1.5">{seasonsCount} Seasons</span>
          </div>
        </div>
      </div>
    </div>
  );
}
