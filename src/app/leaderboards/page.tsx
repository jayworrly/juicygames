import MainLayout from '@/components/Layout/MainLayout';

const sampleLeaderboard = [
  { rank: 1, name: 'ProGamer2024', score: 15420, games: 124 },
  { rank: 2, name: 'SpeedRunner', score: 14230, games: 98 },
  { rank: 3, name: 'PuzzleMaster', score: 13890, games: 156 },
  { rank: 4, name: 'ActionHero', score: 12750, games: 87 },
  { rank: 5, name: 'RaceChamp', score: 11990, games: 76 },
  { rank: 6, name: 'StrategyKing', score: 11450, games: 134 },
  { rank: 7, name: 'QuickWit', score: 10890, games: 92 },
  { rank: 8, name: 'GameLegend', score: 10340, games: 108 },
];

export default function Leaderboards() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboards</h1>
          <p className="text-gray-600">
            See how you rank against other players worldwide
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Global Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games Played
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleLeaderboard.map((player) => (
                  <tr key={player.rank} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {player.rank <= 3 && (
                          <span className="text-2xl mr-2">
                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900">#{player.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{player.score.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.games}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Your Rank */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Your Current Rank</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-indigo-700">#247</p>
              <p className="text-indigo-600">Score: 8,450</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-600">Games Played: 42</p>
              <p className="text-sm text-indigo-600">Win Rate: 68%</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}