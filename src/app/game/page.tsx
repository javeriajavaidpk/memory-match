export default function GamePage() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-4 gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Arena: Infinite Match</h1>
          <p className="text-xs text-zinc-400 mt-1">Level 1 (Grid 4x4) · Procedural Engine Skeleton</p>
        </div>
        <div className="flex gap-3">
          <span className="rounded bg-zinc-800 px-3 py-1 font-mono text-xs text-indigo-300 border border-zinc-700">Time: 00:00</span>
          <span className="rounded bg-zinc-800 px-3 py-1 font-mono text-xs text-emerald-300 border border-zinc-700">Level: 1</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-md mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((card) => (
          <div
            key={card}
            className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 text-zinc-500 font-bold text-2xl"
          >
            ?
          </div>
        ))}
      </div>
      
      <p className="text-center text-xs text-zinc-500 mt-8">
        Full card shuffling, interactive flip mechanics, and AI bots will be hooked in Phase 3.
      </p>
    </div>
  );
}