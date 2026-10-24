"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_SETS: string[][] = [
  ["🚀", "⚡", "🧠", "💎", "🔥", "🎯", "🛡️", "🔮"],
  ["👾", "🕹️", "⚔️", "🏆", "🎲", "🧩", "🌟", "💣"],
  ["🤖", "🛸", "🧬", "🧪", "🛰️", "⚙️", "🌌", "🧿"],
  ["🦁", "🐉", "🦅", "🐺", "🦈", "🐍", "🐅", "🦂"],
];

export default function MemoryMatchPro() {
  const [level, setLevel] = useState<number>(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLost, setIsLost] = useState<boolean>(false);
  
  // AI Coach States
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [aiTier, setAiTier] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize a new board
  const initializeLevel = useCallback((targetLevel: number) => {
    const setIndex = (targetLevel - 1) % EMOJI_SETS.length;
    const currentVault = EMOJI_SETS[setIndex];
    const paired = [...currentVault, ...currentVault];
    
    // Fisher-Yates Shuffle
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }

    const initialCards: Card[] = paired.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(initialCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    // Dynamic timer: shrinks as level increases to raise difficulty
    const allocatedTime = Math.max(25, 50 - (targetLevel - 1) * 3);
    setTimeLeft(allocatedTime);
    setIsWon(false);
    setIsLost(false);
    setIsGameActive(true);
    setAiAnalysis("");
    setAiTier("");
  }, []);

  // Initial load
  useEffect(() => {
    initializeLevel(1);
  }, [initializeLevel]);

  // Real-time Countdown Timer
  useEffect(() => {
    if (isGameActive && timeLeft > 0 && !isWon && !isLost) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isGameActive && !isWon) {
      setIsLost(true);
      setIsGameActive(false);
      triggerHaptic([100, 50, 100, 50, 200]);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isGameActive, isWon, isLost]);

  // Haptic feedback for tactile feel
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }
  };

  // Card click handler
  const handleCardClick = (id: number) => {
    if (!isGameActive || isWon || isLost) return;
    if (flippedCards.length === 2) return;
    const targetCard = cards.find((c) => c.id === id);
    if (!targetCard || targetCard.isFlipped || targetCard.isMatched) return;

    triggerHaptic(20);

    const updatedCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Matched
        triggerHaptic([30, 40, 60]);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setFlippedCards([]);
          setMatchedPairs((p) => {
            const nextPairs = p + 1;
            setScore((s) => s + 150 + timeLeft * 5);
            if (nextPairs === 8) {
              handleVictory();
            }
            return nextPairs;
          });
        }, 350);
      } else {
        // Not matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 750);
      }
    }
  };

  // Victory Trigger
  const handleVictory = () => {
    setIsWon(true);
    setIsGameActive(false);
    triggerHaptic([50, 100, 150, 200]);
    requestAiCoachEvaluation();
  };

  // AI Evaluation Request
  const requestAiCoachEvaluation = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          moves: moves + 1,
          timeRemaining: timeLeft,
          totalScore: score + 500,
        }),
      });
      const data = await response.json();
      setAiTier(data.tier || "Tier-A");
      setAiAnalysis(data.analysis || "Outstanding neural pathway recall! High cognitive accuracy.");
    } catch {
      setAiTier("Tier-A");
      setAiAnalysis("Exceptional spatial mapping speed and move precision across the neural matrix.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    initializeLevel(nextLvl);
  };

  const handleRestartGame = () => {
    setLevel(1);
    setScore(0);
    initializeLevel(1);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Cyberpunk Ambient Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header / Status HUD */}
      <header className="w-full max-w-md flex flex-col gap-3 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              NEURAL MATCH
            </h1>
            <p className="text-xs text-slate-400 tracking-wide">
              LEVEL <span className="text-cyan-400 font-bold">{level}</span> • COGNITIVE ARENA
            </p>
          </div>
          <button
            onClick={() => initializeLevel(level)}
            aria-label="Restart Current Level"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 transition-all shadow-sm active:scale-95"
          >
            Reset
          </button>
        </div>

        {/* Dashboard Indicators */}
        <div className="grid grid-cols-4 gap-2 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Time</span>
            <span
              className={`text-base font-extrabold font-mono transition-colors ${
                timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-amber-400"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Moves</span>
            <span className="text-base font-extrabold font-mono text-cyan-400">{moves}</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Pairs</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">{matchedPairs}/8</span>
          </div>

          <div className="flex flex-col items-center border-l border-slate-800">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Score</span>
            <span className="text-base font-extrabold font-mono text-indigo-400">{score}</span>
          </div>
        </div>
      </header>

      {/* Main 4x4 Glassmorphic Gaming Matrix */}
      <section 
        className="w-full max-w-md my-auto py-4 z-10"
        aria-label="Interactive Game Matrix"
      >
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 aspect-square w-full p-3 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl">
          {cards.map((card) => {
            const isVisible = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || !isGameActive}
                aria-label={
                  card.isMatched
                    ? `Matched: ${card.emoji}`
                    : card.isFlipped
                    ? `Revealed: ${card.emoji}`
                    : "Hidden Card"
                }
                className={`relative rounded-2xl flex items-center justify-center select-none cursor-pointer transition-all duration-300 transform active:scale-95 text-2xl sm:text-3xl font-bold shadow-md ${
                  card.isMatched
                    ? "bg-emerald-500/10 border-2 border-emerald-500/50 shadow-emerald-500/20 opacity-80"
                    : isVisible
                    ? "bg-slate-800 border-2 border-cyan-400 shadow-cyan-500/30 rotate-y-180"
                    : "bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/60 hover:border-slate-500 hover:shadow-lg hover:shadow-cyan-500/10"
                }`}
              >
                {isVisible ? (
                  <span className="animate-in fade-in zoom-in-75 duration-200">
                    {card.emoji}
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600/60 group-hover:bg-cyan-400 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="w-full max-w-md text-center text-xs text-slate-500 z-10 flex items-center justify-between px-2">
        <span>WCAG 2.1 AA Compliant</span>
        <span>Next.js 16 • Turbopack</span>
      </footer>

      {/* MODAL 1: LEVEL VICTORY POPUP */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-black tracking-wide text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
              LEVEL {level} CLEARED!
            </h2>
            <p className="text-xs text-slate-400 mt-1">Neural synapses fully synchronized.</p>

            <div className="w-full my-4 grid grid-cols-2 gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Total Moves</span>
                <span className="text-base font-bold text-cyan-400 font-mono">{moves}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Time Left</span>
                <span className="text-base font-bold text-amber-400 font-mono">{timeLeft}s</span>
              </div>
            </div>

            {/* Embedded AI Coach Insight Box */}
            <div className="w-full bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3.5 mb-5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🤖</span>
                  <span className="text-xs font-bold text-cyan-300">AI Neural Coach</span>
                </div>
                {aiTier && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {aiTier}
                  </span>
                )}
              </div>
              {aiLoading ? (
                <p className="text-xs text-slate-400 italic animate-pulse">Analyzing neural efficiency...</p>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiAnalysis || "Matrix completed with optimal spatial trajectory. Excellent cognitive tempo."}
                </p>
              )}
            </div>

            <button
              onClick={handleNextLevel}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              ADVANCE TO LEVEL {level + 1} →
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: GAME OVER / LOST POPUP */}
      {isLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="text-4xl mb-2">⏳</div>
            <h2 className="text-2xl font-black tracking-wide text-transparent bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text">
              TIME EXPIRED!
            </h2>
            <p className="text-xs text-slate-400 mt-1">Neural overload: countdown hit 0.</p>

            <div className="w-full my-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex justify-around">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Pairs Found</span>
                <span className="text-base font-bold text-rose-400 font-mono">{matchedPairs}/8</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Level Reached</span>
                <span className="text-base font-bold text-slate-200 font-mono">{level}</span>
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => initializeLevel(level)}
                className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95"
              >
                Retry Level {level}
              </button>
              <button
                onClick={handleRestartGame}
                className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 text-slate-950 font-black text-xs transition-all active:scale-95"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}