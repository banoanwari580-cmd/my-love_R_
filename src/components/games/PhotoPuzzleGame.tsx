import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Clock, Trophy, Eye, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BackHeader } from '../common/BackHeader';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface PhotoPuzzleGameProps {
  onBack: () => void;
}

const PUZZLE_IMAGE = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80';
const SIZE = 3; // 3x3 puzzle (8 tiles, 1 empty)

export const PhotoPuzzleGame: React.FC<PhotoPuzzleGameProps> = ({ onBack }) => {
  const [board, setBoard] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]); // 8 is empty tile
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Check victory
  const checkVictory = (currentBoard: number[]) => {
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] !== i) return false;
    }
    return true;
  };

  const shuffle = () => {
    sound.playTileClick();
    let current = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Perform 80 random valid moves to ensure solvability
    let emptyIdx = 8;
    for (let i = 0; i < 80; i++) {
      const neighbors: number[] = [];
      const row = Math.floor(emptyIdx / SIZE);
      const col = emptyIdx % SIZE;

      if (row > 0) neighbors.push(emptyIdx - SIZE);
      if (row < SIZE - 1) neighbors.push(emptyIdx + SIZE);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < SIZE - 1) neighbors.push(emptyIdx + 1);

      const target = neighbors[Math.floor(Math.random() * neighbors.length)];
      current[emptyIdx] = current[target];
      current[target] = 8;
      emptyIdx = target;
    }

    setBoard([...current]);
    setMoves(0);
    setSeconds(0);
    setIsWon(false);
    setIsPlaying(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    shuffle();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTileClick = (index: number) => {
    if (!isPlaying || isWon) return;

    const emptyIndex = board.indexOf(8);
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    const emptyRow = Math.floor(emptyIndex / SIZE);
    const emptyCol = emptyIndex % SIZE;

    // Check if adjacent
    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      sound.playTileClick();
      const newBoard = [...board];
      newBoard[emptyIndex] = board[index];
      newBoard[index] = 8;
      setBoard(newBoard);
      setMoves((prev) => prev + 1);

      if (checkVictory(newBoard)) {
        setIsWon(true);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        sound.playVictoryFanfare();
        const score = Math.max(50, 300 - moves * 2 - seconds);
        store.recordGameScore('photo-puzzle', 'پازل عکس خاطرات', score, `حل در ${moves + 1} حرکت و ${seconds} ثانیه`);
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0e0319] pb-32">
      <BackHeader title="پازل عکس خاطرات" subtitle="چیدن تکه‌های عشق در کنار هم" onBack={onBack} />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Status Bar */}
        <div className="glass-panel rounded-2xl p-3 flex items-center justify-between border border-rose-500/20 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Clock className="w-4 h-4" />
            <span>زمان: {formatTime(seconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-300">
            <Trophy className="w-4 h-4" />
            <span>حرکات: {moves}</span>
          </div>

          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-200 hover:bg-rose-900/60"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showOriginal ? 'پازل' : 'اصل عکس'}</span>
          </button>
        </div>

        {/* Puzzle Board / Original Image */}
        <div className="glass-panel rounded-3xl p-3 border border-rose-500/30 shadow-2xl relative">
          {showOriginal ? (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-rose-400/50">
              <img src={PUZZLE_IMAGE} alt="Original" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full">
                  تصویر اصلی خاطره عاشقانه
                </span>
              </div>
            </div>
          ) : (
            <div className="aspect-square w-full grid grid-cols-3 gap-1 rounded-2xl overflow-hidden bg-rose-950/40 p-1">
              {board.map((tileNumber, idx) => {
                if (tileNumber === 8 && !isWon) {
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#090212]/90 border border-rose-500/10 flex items-center justify-center text-rose-900/30"
                    >
                      <Heart className="w-6 h-6 opacity-20" />
                    </div>
                  );
                }

                // Calculate image background slice
                const tileRow = Math.floor(tileNumber / SIZE);
                const tileCol = tileNumber % SIZE;
                const bgX = (tileCol / (SIZE - 1)) * 100;
                const bgY = (tileRow / (SIZE - 1)) * 100;

                return (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(idx)}
                    className="relative rounded-xl overflow-hidden border border-rose-400/30 shadow-md active:scale-95 transition-transform"
                    style={{
                      backgroundImage: `url(${PUZZLE_IMAGE})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${bgX}% ${bgY}%`,
                    }}
                  >
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] text-amber-200 font-mono">
                      {tileNumber + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Victory Celebration */}
        {isWon && (
          <div className="glass-panel rounded-3xl p-5 border border-emerald-500/50 text-center animate-in zoom-in-95 space-y-2">
            <h4 className="text-base font-extrabold text-emerald-300">
              🎉 تبریک عشق من! پازل تکمیل شد!
            </h4>
            <p className="text-xs text-rose-200/80">
              خاطره زیبایمان را در {moves} حرکت و {formatTime(seconds)} مرتب کردی (+۱۰۰ قلب اختصاصی)
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={shuffle}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            <span>چیدن مجدد پازل</span>
          </button>
          <button
            onClick={onBack}
            className="py-3 px-5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-bold hover:bg-rose-900/60 transition-colors"
          >
            بازگشت
          </button>
        </div>
      </main>
    </div>
  );
};
