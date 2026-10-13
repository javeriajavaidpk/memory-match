export default function LeaderboardPage() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-white">Global Leaderboard</h1>
      <p className="text-xs text-zinc-400 mt-1">
        High scores across endless levels and AI bot challenges.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-300">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3">Max Level</th>
              <th className="px-4 py-3">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <tr>
              <td className="px-4 py-3 text-white font-bold">#1</td>
              <td className="px-4 py-3">Neural AI (Bot)</td>
              <td className="px-4 py-3 text-indigo-400 font-mono">Level 42</td>
              <td className="px-4 py-3 text-emerald-400">99.2%</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-white font-bold">#2</td>
              <td className="px-4 py-3">Player One</td>
              <td className="px-4 py-3 text-indigo-400 font-mono">Level 18</td>
              <td className="px-4 py-3 text-emerald-400">91.4%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}