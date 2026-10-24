"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const LEVELS_PER_PAGE = 12;

// Dark, vibrant, high-contrast emojis jo white background par chamkein
const KIDS_THEMES = [
  { emojis: ["🦁", "🐼", "🦊", "🐸", "🐯", "🐵", "🐘", "🦄"] },
  { emojis: ["🍓", "🍉", "🍒", "🍕", "🍔", "🍟", "🍩", "🌮"] },
  { emojis: ["🚀", "🛸", "👾", "⭐", "🪐", "🌍", "⚡", "🔥"] },
  { emojis: ["🐬", "🐙", "🦀", "🦈", "🐠", "🐳", "🐢", "🐡"] },
  { emojis: ["🚗", "🏎️", "🚁", "🚂", "🚜", "⛵", "🚒", "🏍️"] },
  { emojis: ["🎮", "🎨", "⚽", "🏀", "🏆", "🎯", "🎸", "🎲"] },
];

export default function KidsMemoryWorld() {
  const [currentScreen, setCurrentScreen] = useState<"map" | "playing">("map");
  const [highestUnlocked, setHighestUnlocked] = useState<number>(1);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [mapPage, setMapPage] = useState<number>(0);

  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLost, setIsLost] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number>(0);
  const [aiCheer, setAiCheer] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const launchPartyBlast = () => {
    try {
      const end = Date.now() + 1.2 * 1000;
      const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {}
  };

  const startLevel = useCallback((lvlNum: number) => {
    setActiveLevel(lvlNum);
    const themeIndex = (lvlNum - 1) % KIDS_THEMES.length;
    const currentTheme = KIDS_THEMES[themeIndex];
    const paired = [...currentTheme.emojis, ...currentTheme.emojis];

    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }

    setCards(
      paired.map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
    );

    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    const allocatedTime = Math.max(25, 50 - Math.floor((lvlNum - 1) * 1.5));
    setTimeLeft(allocatedTime);
    setIsWon(false);
    setIsLost(false);
    setStarsEarned(0);
    setAiCheer("");
    setCurrentScreen("playing");
  }, []);

  useEffect(() => {
    if (currentScreen === "playing" && timeLeft > 0 && !isWon && !isLost) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentScreen === "playing" && !isWon) {
      setIsLost(true);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, currentScreen, isWon, isLost]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || isWon || isLost) return;
    const target = cards.find((c) => c.id === id);
    if (!target || target.isFlipped || target.isMatched) return;

    const updated = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(updated);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
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
            const nextP = p + 1;
            if (nextP === 8) {
              handleWin();
            }
            return nextP;
          });
        }, 300);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 700);
      }
    }
  };

  const handleWin = () => {
    setIsWon(true);
    launchPartyBlast();

    let earned = 1;
    if (moves <= 14 && timeLeft >= 15) {
      earned = 3;
    } else if (moves <= 20) {
      earned = 2;
    }
    setStarsEarned(earned);

    setLevelStars((prev) => ({
      ...prev,
      [activeLevel]: Math.max(prev[activeLevel] || 0, earned),
    }));

    const nextLevelNum = activeLevel + 1;
    setHighestUnlocked((prev) => Math.max(prev, nextLevelNum));

    const targetPage = Math.floor((nextLevelNum - 1) / LEVELS_PER_PAGE);
    if (targetPage > mapPage) {
      setMapPage(targetPage);
    }

    fetchAiEvaluation(earned);
  };

  const fetchAiEvaluation = async (stars: number) => {
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: activeLevel,
          moves: moves + 1,
          timeRemaining: timeLeft,
        }),
      });
      const data = await res.json();
      setAiCheer(data.analysis);
    } catch {
      if (stars === 3) setAiCheer("Superstar! Your memory is lightning fast! ⭐⭐⭐");
      else if (stars === 2) setAiCheer("Awesome Job! You have a super sharp brain! ⭐⭐");
      else setAiCheer("Great effort! Play again to collect all 3 stars! ⭐");
    }
  };

  const currentLevels = Array.from({ length: LEVELS_PER_PAGE }, (_, i) => {
    const lvlNum = mapPage * LEVELS_PER_PAGE + (i + 1);
    return {
      levelNumber: lvlNum,
      unlocked: lvlNum <= highestUnlocked,
      stars: levelStars[lvlNum] || 0,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-3 select-none relative font-sans overflow-x-hidden">
      
      {/* SCREEN 1: LEVEL MAP */}
      {currentScreen === "map" && (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="text-3xl mb-1">🏰</div>
          <h1 className="text-2xl font-black text-amber-300 drop-shadow-md tracking-wide">
            SUPER MEMORY
          </h1>
          <div className="flex items-center gap-2 mt-0.5 mb-4">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/80 text-white shadow">
              World {mapPage + 1}
            </span>
            <span className="text-xs font-semibold text-pink-200">
              ∞ Infinite Levels
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3.5 w-full">
            {currentLevels.map((lvl) => (
              <button
                key={lvl.levelNumber}
                disabled={!lvl.unlocked}
                onClick={() => startLevel(lvl.levelNumber)}
                aria-label={`Level ${lvl.levelNumber}${lvl.unlocked ? "" : " Locked"}`}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border-4 shadow-lg transition-all active:scale-95 ${
                  lvl.unlocked
                    ? "bg-gradient-to-b from-yellow-300 to-amber-500 border-amber-200 text-amber-950 hover:brightness-110 cursor-pointer shadow-amber-500/30"
                    : "bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                }`}
              >
                {lvl.unlocked ? (
                  <>
                    <span className="text-2xl font-black">{lvl.levelNumber}</span>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map((starIdx) => (
                        <span
                          key={starIdx}
                          className={`text-xs ${
                            starIdx <= lvl.stars ? "text-amber-950 font-bold" : "text-amber-950/25"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <span className="text-2xl">🔒</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between w-full mt-4 pt-3 border-t border-white/10">
            <button
              disabled={mapPage === 0}
              onClick={() => setMapPage((p) => Math.max(0, p - 1))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapPage === 0
                  ? "opacity-30 cursor-not-allowed text-slate-400"
                  : "bg-white/20 hover:bg-white/30 text-white cursor-pointer active:scale-95"
              }`}
            >
              ⬅ Prev World
            </button>

            <span className="text-xs font-extrabold text-amber-300">
              Levels {mapPage * LEVELS_PER_PAGE + 1} - {(mapPage + 1) * LEVELS_PER_PAGE}
            </span>

            <button
              onClick={() => setMapPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 cursor-pointer"
            >
              Next World ➡
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: GAMEPLAY ARENA */}
      {currentScreen === "playing" && (
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <button
              onClick={() => setCurrentScreen("map")}
              aria-label="Back to Level Map"
              className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition-all active:scale-95 flex items-center gap-1 border border-white/20"
            >
              <span>⬅</span> Levels
            </button>

            <span className="text-sm font-black bg-pink-500/80 px-3 py-1 rounded-full border border-pink-400">
              Level {activeLevel}
            </span>

            <button
              onClick={() => startLevel(activeLevel)}
              aria-label="Restart Level"
              className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold transition-all active:scale-95 border border-white/20"
            >
              🔄 Retry
            </button>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 mb-3 border border-white/20 shadow-lg text-center">
            <div>
              <div className="text-[10px] text-pink-200 font-bold uppercase">Time</div>
              <div
                className={`text-lg font-black ${
                  timeLeft <= 10 ? "text-rose-400 animate-bounce" : "text-amber-300"
                }`}
              >
                ⏱ {timeLeft}s
              </div>
            </div>
            <div>
              <div className="text-[10px] text-pink-200 font-bold uppercase">Moves</div>
              <div className="text-lg font-black text-cyan-300">🎯 {moves}</div>
            </div>
            <div>
              <div className="text-[10px] text-pink-200 font-bold uppercase">Pairs</div>
              <div className="text-lg font-black text-emerald-300">✨ {matchedPairs}/8</div>
            </div>
          </div>

          {/* 4x4 Cards Grid */}
          <div className="grid grid-cols-4 gap-2.5 w-full aspect-square bg-white/10 backdrop-blur-lg p-3 rounded-3xl border border-white/20 shadow-2xl">
            {cards.map((card) => {
              const isRevealed = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  aria-label={
                    card.isMatched
                      ? `Matched: ${card.emoji}`
                      : card.isFlipped
                      ? `Revealed: ${card.emoji}`
                      : "Hidden Card"
                  }
                  className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-md ${
                    card.isMatched
                      ? "bg-emerald-400/90 border-4 border-emerald-200 scale-95 opacity-90 shadow-emerald-400/40"
                      : isRevealed
                      ? "bg-white text-slate-900 border-4 border-yellow-400 shadow-2xl shadow-yellow-400/30 scale-100"
                      : "bg-gradient-to-tr from-pink-500 to-purple-600 border-2 border-pink-300/60 hover:brightness-110"
                  }`}
                >
                  {isRevealed ? (
                    <span className="text-4xl sm:text-5xl filter drop-shadow-md select-none transform transition-transform animate-in zoom-in-75 duration-200">
                      {card.emoji}
                    </span>
                  ) : (
                    <span className="text-pink-200 text-2xl font-black">?</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* POPUP 1: 3-STAR VICTORY MODAL */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-950 border-4 border-yellow-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-90 duration-300">
            <div className="flex items-end justify-center gap-2 mb-3 mt-1">
              <div
                className={`text-4xl transition-all duration-500 transform ${
                  starsEarned >= 2
                    ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)] scale-100"
                    : "text-slate-600 scale-90"
                }`}
              >
                ★
              </div>

              <div
                className={`text-6xl -translate-y-2 transition-all duration-700 transform ${
                  starsEarned >= 1
                    ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)] scale-110 animate-pulse"
                    : "text-slate-600"
                }`}
              >
                ★
              </div>

              <div
                className={`text-4xl transition-all duration-500 transform ${
                  starsEarned >= 3
                    ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,1)] scale-100"
                    : "text-slate-600 scale-90"
                }`}
              >
                ★
              </div>
            </div>

            <h2 className="text-3xl font-black text-amber-300 tracking-wider drop-shadow-md">
              YOU WIN!
            </h2>

            <p className="text-xs text-pink-200 font-medium my-3 px-2 leading-relaxed">
              {aiCheer || "Super memory skills! Keep shining! 🌟"}
            </p>

            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={() => startLevel(activeLevel + 1)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 text-amber-950 font-black text-sm shadow-lg shadow-yellow-500/40 active:scale-95 transition-all"
              >
                NEXT LEVEL {activeLevel + 1} ➡
              </button>

              <button
                onClick={() => startLevel(activeLevel)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95"
              >
                🔄 Play Again (Get 3 Stars)
              </button>

              <button
                onClick={() => setCurrentScreen("map")}
                className="w-full py-2 rounded-xl text-pink-300 font-bold text-xs hover:underline transition-all"
              >
                Levels Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: TIME OVER MODAL */}
      {isLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-rose-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-90 duration-300">
            <div className="text-5xl mb-2">⏰</div>
            <h2 className="text-2xl font-black text-rose-400 tracking-wider">
              TIME'S UP!
            </h2>
            <p className="text-xs text-slate-300 my-3">
              Don't worry! Try again, you can do it! 💪
            </p>

            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={() => startLevel(activeLevel)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-rose-500/40 active:scale-95 transition-all"
              >
                TRY AGAIN 🔄
              </button>

              <button
                onClick={() => setCurrentScreen("map")}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs border border-white/20 active:scale-95 transition-all"
              >
                Levels Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}