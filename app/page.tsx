"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Extensive procedural emoji vault for endless levels
const EMOJI_VAULT = [
  "🚀", "⚡", "🧠", "💎", "🔥", "🎯", "🛡️", "🔮",
  "🌟", "👾", "🤖", "🪐", "🍕", "🎸", "🏆", "🏎️",
  "🦄", "🍉", "🧩", "⚓", "👑", "💡", "🎨", "🦁",
  "🌈", "⚡", "🛸", "🕹️", "🧪", "🔑", "🍿", "🏹"
];

export default function MemoryMatchApp() {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  // Procedural level generator: picks 8 random unique emojis per level
  const generateLevel = useCallback((targetLevel: number) => {
    const shuffledVault = [...EMOJI_VAULT].sort(() => Math.random() - 0.5);
    const levelPool = shuffledVault.slice(0, 8); // 8 pairs = 16 cards per level

    const paired = [...levelPool, ...levelPool]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(paired);
    setSelectedCards([]);
    setMoves(0);
    setTime(0);
    setIsLevelCleared(false);
    setAiFeedback(null);
    setHint(null);
    setIsTimerRunning(true);
  }, []);

  // Initialize level
  useEffect(() => {
    generateLevel(level);
  }, [level, generateLevel]);

  // Timer counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && !isLevelCleared) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isLevelCleared]);

  // AI Cognitive Performance Call
  const fetchAiPerformanceFeedback = useCallback(async (currentLevel: number, totalMoves: number, totalSeconds: number) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: currentLevel, moves: totalMoves, time: totalSeconds }),
      });
      const data = await res.json();
      setAiFeedback(data.feedback);
    } catch {
      setAiFeedback(`Level ${currentLevel} conquered! Excellent neural plasticity and spatial recall.`);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  // Card interaction
  const handleCardClick = (index: number) => {
    if (
      selectedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      isLevelCleared
    ) {
      return;
    }

    // Native mobile haptic vibration
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(25);
    }

    const updated = [...cards];
    updated[index].isFlipped = true;
    setCards(updated);

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newSelected;

      if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);
        }, 300);
      } else {
        // Mismatch - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  // Check level completion
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched)) {
      setIsTimerRunning(false);
      setIsLevelCleared(true);
      fetchAiPerformanceFeedback(level, moves, time);
    }
  }, [cards, level, moves, time, fetchAiPerformanceFeedback]);

  // Next procedural level trigger
  const advanceToNextLevel = () => {
    setLevel((prev) => prev + 1);
  };

  // Reset to Level 1
  const restartArena = () => {
    setLevel(1);
    generateLevel(1);
  };

  // AI Hint Hook
  const requestAiHint = () => {
    setHint(`Level ${level} Tactical Tip: Scan the outer corners first to lock coordinate memory anchors.`);
    setTimeout(() => setHint(null), 4500);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-sm flex flex-col space-y-3.5">
        
        {/* Top Mobile Bar */}
        <header className="flex justify-between items-center bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                MemoryMatch AI
              </h1>
              <span className="text-[10px] px-2 py-0.5 font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50 rounded-full">
                Level {level}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Infinite Procedural Arena</p>
          </div>
          <button
            onClick={restartArena}
            aria-label="Restart Arena"
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 border border-neutral-700 rounded-xl transition"
          >
            Restart
          </button>
        </header>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Level</span>
            <p className="text-lg font-bold text-emerald-400">{level}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Moves</span>
            <p className="text-lg font-bold text-indigo-400">{moves}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Time</span>
            <p className="text-lg font-bold text-pink-400">{time}s</p>
          </div>
        </div>

        {/* 4x4 Touch Matrix */}
        <section 
          className="grid grid-cols-4 gap-2 bg-neutral-900/60 p-2.5 border border-neutral-800 rounded-2xl aspect-square"
          aria-label={`Memory Matrix Grid Level ${level}`}
        >
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              aria-label={
                card.isFlipped || card.isMatched
                  ? `Card ${idx + 1} revealed: ${card.emoji}`
                  : `Hidden card ${idx + 1}`
              }
              className={`flex items-center justify-center text-2xl sm:text-3xl rounded-xl font-bold transition-all duration-300 select-none ${
                card.isFlipped || card.isMatched
                  ? card.isMatched
                    ? "bg-emerald-950/40 border-2 border-emerald-500 scale-95 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-indigo-600 border border-indigo-400 text-white"
                  : "bg-neutral-900 hover:bg-neutral-800 active:scale-95 border border-neutral-800 text-neutral-500"
              }`}
            >
              {card.isFlipped || card.isMatched ? card.emoji : "?"}
            </button>
          ))}
        </section>

        {/* Tactical AI Assist Button */}
        <div className="flex justify-between items-center bg-neutral-900/50 border border-neutral-800/80 rounded-xl px-3.5 py-2">
          <span className="text-xs text-neutral-400">Stuck on Level {level}?</span>
          <button
            onClick={requestAiHint}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 active:scale-95 transition"
          >
            Tactical Hint ✨
          </button>
        </div>

        {/* Dynamic In-Game Hint Popup */}
        {hint && (
          <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-xl p-3 text-xs text-indigo-200">
            {hint}
          </div>
        )}

        {/* Level Cleared & AI Progression Modal */}
        {isLevelCleared && (
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-emerald-500/50 rounded-2xl p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <h2 className="text-sm font-bold text-neutral-100">Level {level} Cleared!</h2>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-semibold">
                {time}s | {moves} moves
              </span>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-2.5">
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">AI Performance Audit</span>
              {isAiLoading ? (
                <p className="text-xs text-neutral-400 animate-pulse mt-1">Analyzing memory retention rate...</p>
              ) : (
                <p className="text-xs text-neutral-300 leading-relaxed mt-1">{aiFeedback}</p>
              )}
            </div>

            <button
              onClick={advanceToNextLevel}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Advance to Level {level + 1} ➔
            </button>
          </div>
        )}

      </div>
    </main>
  );
}