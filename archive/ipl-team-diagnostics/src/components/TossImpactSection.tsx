import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp } from 'lucide-react';

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

interface TossImpactSectionProps {
  teams: string[];
  matches: Match[];
}

export default function TossImpactSection({ teams, matches }: TossImpactSectionProps) {
  // 1. League-Wide Toss statistics
  const matchesWithWinner = matches.filter((m) => m.winner);
  const totalMatchesCount = matchesWithWinner.length;

  // Toss winner is also match winner
  const tossAndMatchWinners = matchesWithWinner.filter((m) => m.toss_winner === m.winner).length;
  const overallTossWinPct = totalMatchesCount > 0 ? ((tossAndMatchWinners / totalMatchesCount) * 100).toFixed(1) : '0.0';

  // Decisions outcomes
  // Chase Wins (elect to field and win, or elect to bat and lose)
  const chaseWins = matchesWithWinner.filter(
    (m) =>
      (m.toss_decision === 'field' && m.toss_winner === m.winner) ||
      (m.toss_decision === 'bat' && m.toss_winner !== m.winner)
  ).length;

  // Defend Wins (elect to bat and win, or elect to field and lose)
  const defendWins = matchesWithWinner.filter(
    (m) =>
      (m.toss_decision === 'bat' && m.toss_winner === m.winner) ||
      (m.toss_decision === 'field' && m.toss_winner !== m.winner)
  ).length;

  const chaseWinPct = totalMatchesCount > 0 ? ((chaseWins / totalMatchesCount) * 100).toFixed(1) : '0.0';
  const defendWinPct = totalMatchesCount > 0 ? ((defendWins / totalMatchesCount) * 100).toFixed(1) : '0.0';

  // 2. Franchise specific toss-to-win conversion rate
  const chartData = teams
    .map((team) => {
      // Matches where this team won the toss
      const tossWonMatches = matchesWithWinner.filter((m) => m.toss_winner === team);
      const tossWonCount = tossWonMatches.length;

      // Matches where this team won both the toss and the match
      const tossAndMatchWonCount = tossWonMatches.filter((m) => m.winner === team).length;

      const conversionRate =
        tossWonCount > 0 ? parseFloat(((tossAndMatchWonCount / tossWonCount) * 100).toFixed(1)) : 0.0;

      return {
        name: team,
        conversionRate,
        tossWon: tossWonCount,
        converted: tossAndMatchWonCount,
      };
    })
    // Sort from highest to lowest conversion rate
    .sort((a, b) => b.conversionRate - a.conversionRate);

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-navy-dark border border-gray-800 p-3 rounded-lg shadow-xl text-xs font-sans">
          <p className="font-bold text-white mb-1.5">{data.name}</p>
          <div className="space-y-1 font-mono text-gray-400">
            <p>
              Toss Won: <span className="text-white">{data.tossWon}</span>
            </p>
            <p>
              Toss & Match Won: <span className="text-white">{data.converted}</span>
            </p>
            <p className="text-amber-accent font-bold mt-1">
              Conversion: {data.conversionRate}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-3">
        TOSS IMPACT ANALYSIS
      </h3>

      {/* League Wide Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-navy-card border border-gray-800/60 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">
            Overall Toss Influence
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-accent">{overallTossWinPct}%</span>
            <span className="text-[10px] text-gray-500 font-sans font-medium">Toss winner won match</span>
          </div>
        </div>

        <div className="bg-navy-card border border-gray-800/60 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">
            Chasing Success (Field First)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-accent">{chaseWinPct}%</span>
            <span className="text-[10px] text-gray-500 font-sans font-medium">Of total matches won</span>
          </div>
        </div>

        <div className="bg-navy-card border border-gray-800/60 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">
            Defending Success (Bat First)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-accent">{defendWinPct}%</span>
            <span className="text-[10px] text-gray-500 font-sans font-medium">Of total matches won</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-navy-card border border-gray-800/60 rounded-xl p-6 shadow-md">
        <div className="mb-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-accent" />
            Toss-To-Match Win Conversion Rate per Team
          </h4>
          <p className="text-[11px] text-gray-500 mt-1">
            Percentage of matches won after winning the toss.
          </p>
        </div>

        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                stroke="#6b7280"
                fontSize={9}
                fontFamily="var(--font-mono)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                fontSize={9}
                fontFamily="var(--font-sans)"
                width={130}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="conversionRate" fill="#c8863a" radius={[0, 4, 4, 0]} barSize={12}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#f59e0b' : 'rgba(200, 134, 58, 0.85)'}
                    className="hover:opacity-100 transition-opacity duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
