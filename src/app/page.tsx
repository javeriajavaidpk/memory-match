import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
        Phase 1: Foundations Skeleton
      </span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
        MemoryMatch
      </h1>
      <p className="mt-4 max-w-xl text-zinc-400 text-base sm:text-lg">
        Infinite procedural levels, AI opponents, and dynamic memory matching. Built for Mobile & Web.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/game"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
        >
          Enter Game Arena
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 font-semibold text-zinc-200 hover:bg-zinc-800 transition"
        >
          View Rankings
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full text-left">
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <h3 className="font-semibold text-indigo-300">🎮 Unlimited Levels</h3>
          <p className="text-xs text-zinc-400 mt-1">Procedural difficulty scaling with expanding card matrices.</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <h3 className="font-semibold text-indigo-300">🤖 AI Bot Opponents</h3>
          <p className="text-xs text-zinc-400 mt-1">Real-time memory tracking algorithms to play against.</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
          <h3 className="font-semibold text-indigo-300">📱 Mobile Ready</h3>
          <p className="text-xs text-zinc-400 mt-1">Optimized touch controls ready for Android Play Store deployment.</p>
        </div>
      </div>
    </div>
  );
}
