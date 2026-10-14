import { Suspense } from 'react';
import ChatCoach from '@/components/ChatCoach';

export const metadata = {
  title: 'AI Memory Coach - MemoryMatch',
  description: 'Streamed real-time cognitive strategies and memory training.',
};

export default function CoachPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 flex flex-col items-center justify-center bg-slate-950">
      <div className="w-full max-w-2xl mb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">AI Strategy Lab</h1>
        <p className="text-sm text-slate-400 mt-1">
          Stream real-time cognitive advice to sharpen your card recall score.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-[650px] w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-sm">
            Initializing AI Strategy Lab...
          </div>
        }
      >
        <ChatCoach />
      </Suspense>
    </div>
  );
}
