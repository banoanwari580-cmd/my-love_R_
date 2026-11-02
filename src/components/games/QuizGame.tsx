import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, Heart, Play } from 'lucide-react';
import { BackHeader } from '../common/BackHeader';
import { COUPLE_QUIZ_QUESTIONS } from '../../data/initialData';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface QuizGameProps {
  onBack: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ onBack }) => {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = COUPLE_QUIZ_QUESTIONS[currentIdx];

  const handleStart = () => {
    sound.playTileClick();
    setStarted(true);
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === question.correctIndex) {
      sound.playChime();
      setScore((prev) => prev + 20); // 5 questions = 100 points
    } else {
      sound.playTileClick();
    }
  };

  const handleNext = () => {
    sound.playTileClick();
    if (currentIdx + 1 < COUPLE_QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished
      const finalScore = score + (selectedOption === question.correctIndex ? 20 : 0);
      setFinished(true);
      store.recordGameScore('quiz', 'حدس بزن چقدر مرا می‌شناسی', finalScore, `امتیاز: ${finalScore}%`);
      sound.playVictoryFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24'],
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0319] pb-32">
      <BackHeader title="حدس بزن چقدر مرا می‌شناسی" subtitle="آزمون شناخت عمیق قلب" onBack={onBack} />

      <main className="max-w-md mx-auto p-4">
        {!started ? (
          <div className="glass-panel rounded-3xl p-6 text-center border border-rose-500/30 my-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-rose-950/60">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 to-amber-200 mb-2">
              قوانین آزمون دونفره
            </h3>
            <p className="text-xs text-rose-200/80 leading-relaxed mb-6">
              در این بازی ۵ پرسش کلیدی درباره عمیق‌ترین احساسات، عادات و خاطرات دو نفره‌تان پرسیده می‌شود. با هر پاسخ درست ۲۰ درصد به شناخت و امتیاز قلبتان افزوده خواهد شد.
            </p>

            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-xl shadow-rose-950/60 flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>شروع آزمون شناخت</span>
            </button>
          </div>
        ) : finished ? (
          <div className="glass-panel rounded-3xl p-6 text-center border border-amber-500/40 my-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 mx-auto flex items-center justify-center text-white mb-4 shadow-xl">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-amber-200 mb-1">نتیجه شگفت‌انگیز!</h3>
            <p className="text-xs text-rose-300/80 mb-4">میزان شناخت و هم‌دلی قلبی شما:</p>

            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-300 font-mono mb-4">
              %{score}
            </div>

            <p className="text-xs text-rose-200/90 leading-relaxed mb-6 bg-rose-950/40 p-4 rounded-2xl border border-rose-500/20">
              {score >= 80
                ? 'پیوند شما الهی است! شما روح یکدیگر را مثل یک کتاب باز می‌خوانید و هیچ رازی از چشمانتان پنهان نیست. ❤️'
                : 'همراهی شما زیباست، هر روز با هم‌صحبتی بیشتر شناخت‌تان عمیق‌تر و پیوندتان مستحکم‌تر خواهد شد. ✨'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleStart}
                className="flex-1 py-3 rounded-2xl bg-rose-900/60 hover:bg-rose-900 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>تکرار آزمون</span>
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-lg transition-transform active:scale-95"
              >
                بازگشت به بازی‌ها
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {/* Progress counter */}
            <div className="flex items-center justify-between text-xs text-rose-300/80 px-1">
              <span>سوال {currentIdx + 1} از ۵</span>
              <span className="font-mono text-amber-300">امتیاز: {score}</span>
            </div>

            <div className="w-full bg-rose-950/50 h-2 rounded-full overflow-hidden border border-rose-500/20">
              <div
                className="bg-gradient-to-r from-rose-500 to-amber-400 h-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / 5) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-xl">
              <h4 className="text-sm sm:text-base font-bold text-rose-100 leading-relaxed mb-5">
                {question.question}
              </h4>

              <div className="space-y-2.5">
                {question.options.map((opt, idx) => {
                  let btnStyle = 'bg-rose-950/40 border-rose-500/20 text-rose-200 hover:bg-rose-900/30';
                  if (isAnswered) {
                    if (idx === question.correctIndex) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-bold';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-950/70 border-rose-600 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm text-right border transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === question.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mr-2" />
                      )}
                      {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mr-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mt-4 p-3.5 rounded-2xl bg-rose-900/30 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed animate-in fade-in">
                  💡 {question.explanation}
                </div>
              )}
            </div>

            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-xl active:scale-98 transition-all"
              >
                {currentIdx + 1 < COUPLE_QUIZ_QUESTIONS.length ? 'سوال بعدی' : 'مشاهده نتیجه نهایی'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
