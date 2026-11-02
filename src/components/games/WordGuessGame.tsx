import React, { useState } from 'react';
import { Heart, Sparkles, RotateCcw, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BackHeader } from '../common/BackHeader';
import { HANGMAN_WORDS } from '../../data/initialData';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface WordGuessGameProps {
  onBack: () => void;
}

const PERSIAN_LETTERS = [
  'ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ',
  'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض',
  'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل',
  'م', 'ن', 'و', 'ه', 'ی', 'آ'
];

export const WordGuessGame: React.FC<WordGuessGameProps> = ({ onBack }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [lives, setLives] = useState(6);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentItem = HANGMAN_WORDS[wordIndex % HANGMAN_WORDS.length];
  const targetWord = currentItem.word.replace('‌', ''); // remove half-space for matching

  // Check victory
  const isWon = targetWord.split('').every((char) => guessedLetters.has(char));
  const isLost = lives <= 0;

  const handleGuess = (char: string) => {
    if (guessedLetters.has(char) || isWon || isLost) return;

    const nextGuessed = new Set(guessedLetters);
    nextGuessed.add(char);
    setGuessedLetters(nextGuessed);

    if (targetWord.includes(char)) {
      sound.playChime();
      if (targetWord.split('').every((c) => nextGuessed.has(c))) {
        // Solved!
        sound.playVictoryFanfare();
        const gainedScore = score + 50;
        setScore(gainedScore);
        store.recordGameScore('word-guess', 'حدس کلمه عاشقانه', gainedScore, `کلمه "${currentItem.word}" حدس زده شد`);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24'],
        });
      }
    } else {
      sound.playTileClick();
      setLives((prev) => prev - 1);
    }
  };

  const handleNextWord = () => {
    sound.playTileClick();
    setWordIndex((prev) => prev + 1);
    setGuessedLetters(new Set());
    setLives(6);
    setShowHint(false);
  };

  const handleRestart = () => {
    sound.playTileClick();
    setGuessedLetters(new Set());
    setLives(6);
    setShowHint(false);
  };

  return (
    <div className="min-h-screen bg-[#0e0319] pb-32">
      <BackHeader title="حدس کلمه عاشقانه" subtitle="رمزگشایی از واژه‌های پرمهر" onBack={onBack} />

      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between px-2">
          {/* Heart Lives */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-all ${
                  i < lives ? 'fill-rose-500 text-rose-500 scale-100' : 'text-slate-700 scale-75'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-300 font-mono">امتیاز: {score}</span>
            <button
              onClick={() => setShowHint(!showHint)}
              className="p-1.5 rounded-full bg-rose-950/60 border border-amber-500/30 text-amber-300 hover:bg-rose-900/60"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 text-center animate-in fade-in">
            راهنمای دل: {currentItem.hint}
          </div>
        )}

        {/* Secret Word Tiles */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-500/30 shadow-2xl flex flex-col items-center justify-center min-h-[140px]">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center dir-rtl">
            {targetWord.split('').map((char, idx) => {
              const isRevealed = guessedLetters.has(char) || isLost;
              return (
                <div
                  key={idx}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border flex items-center justify-center text-lg sm:text-xl font-bold transition-all shadow-md ${
                    isRevealed
                      ? 'bg-rose-950/80 border-rose-400 text-rose-100 shadow-rose-950/50'
                      : 'bg-rose-950/30 border-rose-500/20 text-transparent'
                  }`}
                >
                  {isRevealed ? char : '؟'}
                </div>
              );
            })}
          </div>

          {/* Win / Loss states */}
          {isWon && (
            <div className="mt-4 text-center animate-in zoom-in-95">
              <span className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                آفرین عشق من! واژه درست حدس زده شد (+۵۰ قلب)
              </span>
              <button
                onClick={handleNextWord}
                className="mt-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-transform"
              >
                کلمه بعدی
              </button>
            </div>
          )}

          {isLost && (
            <div className="mt-4 text-center animate-in zoom-in-95">
              <span className="text-sm font-bold text-rose-400">
                فرصت‌ها به پایان رسید! کلمه بود: «{currentItem.word}»
              </span>
              <button
                onClick={handleRestart}
                className="mt-3 px-6 py-2.5 rounded-full bg-rose-800 text-white font-bold text-xs shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>تلاش دوباره</span>
              </button>
            </div>
          )}
        </div>

        {/* Persian Virtual Keyboard */}
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 p-3 rounded-3xl bg-[#140622]/80 border border-rose-500/20">
          {PERSIAN_LETTERS.map((char) => {
            const isUsed = guessedLetters.has(char);
            return (
              <button
                key={char}
                disabled={isUsed || isWon || isLost}
                onClick={() => handleGuess(char)}
                className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isUsed
                    ? 'bg-rose-950/20 text-rose-900/40 border-transparent cursor-not-allowed'
                    : 'bg-rose-950/60 border border-rose-500/30 text-rose-200 hover:bg-rose-900/60 active:scale-90 hover:text-white shadow-sm'
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
