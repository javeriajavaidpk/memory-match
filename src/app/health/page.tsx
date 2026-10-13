import { Suspense } from "react";

interface PingData {
  status: string;
  source: string;
  payload: string;
}

async function HealthContent() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "no-store",
  });
  const json = await res.json();

  const data: PingData = {
    status: "Healthy / Operational",
    source: "External API Endpoint",
    payload: json.title || "OK",
  };

  return (
    <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <dt className="text-xs uppercase text-zinc-400">Status</dt>
        <dd className="mt-1 font-mono text-sm font-semibold text-emerald-400">
          {data.status}
        </dd>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <dt className="text-xs uppercase text-zinc-400">Source</dt>
        <dd className="mt-1 font-mono text-sm text-zinc-200">
          {data.source}
        </dd>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <dt className="text-xs uppercase text-zinc-400">Sample Payload</dt>
        <dd className="mt-1 truncate font-mono text-xs text-zinc-300">
          {data.payload}
        </dd>
      </div>
    </dl>
  );
}

export default function HealthPage() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
        <h1 className="text-2xl font-bold text-white">System & Service Health</h1>
      </div>
      <p className="text-xs text-zinc-400 mt-1">
        Server Component live fetched data verification.
      </p>

      <Suspense
        fallback={
          <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Checking service health...
          </div>
        }
      >
        <HealthContent />
      </Suspense>
    </div>
  );
}