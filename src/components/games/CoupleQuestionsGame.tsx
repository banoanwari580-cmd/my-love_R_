import React, { useState, useEffect } from 'react';
import { Eye, Heart, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BackHeader } from '../common/BackHeader';
import { DEEP_QUESTIONS_36 } from '../../data/initialData';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface CoupleQuestionsGameProps {
  onBack: () => void;
}

export const CoupleQuestionsGame: React.FC<CoupleQuestionsGameProps> = ({ onBack }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [partnerTurn, setPartnerTurn] = useState<'admin' | 'razma'>('admin');
  const [gazeTimer, setGazeTimer] = useState<number | null>(null);
  const [gazeActive, setGazeActive] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState(0);

  const level = DEEP_QUESTIONS_36[currentLevelIdx];
  const question = level.questions[currentQIdx];

  useEffect(() => {
    let interval: number | undefined;
    if (gazeActive && gazeTimer !== null && gazeTimer > 0) {
      interval = window.setInterval(() => {
        setGazeTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (gazeActive && gazeTimer === 0) {
      sound.playVictoryFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setGazeActive(false);
    }
    return () => clearInterval(interval);
  }, [gazeActive, gazeTimer]);

  const handleNextQuestion = () => {
    sound.playChime();
    setCompletedQuestions((prev) => prev + 1);
    store.recordGameScore('couple-questions', 'پرسش‌های دونفره', 25, `پاسخ به سوال سطح ${level.level}`);

    // Switch turn
    setPartnerTurn((prev) => (prev === 'admin' ? 'razma' : 'admin'));

    if (currentQIdx + 1 < level.questions.length) {
      setCurrentQIdx((prev) => prev + 1);
    } else if (currentLevelIdx + 1 < DEEP_QUESTIONS_36.length) {
      setCurrentLevelIdx((prev) => prev + 1);
      setCurrentQIdx(0);
    }
  };

  const handlePrevQuestion = () => {
    sound.playTileClick();
    if (currentQIdx > 0) {
      setCurrentQIdx((prev) => prev - 1);
    } else if (currentLevelIdx > 0) {
      setCurrentLevelIdx((prev) => prev - 1);
      setCurrentQIdx(DEEP_QUESTIONS_36[currentLevelIdx - 1].questions.length - 1);
    }
  };

  const startGazeChallenge = () => {
    sound.playChime();
    setGazeTimer(180); // 3 minutes eye contact
    setGazeActive(true);
  };

  const formatGazeTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#0e0319] pb-32">
      <BackHeader title="پرسش‌های دونفره" subtitle="۳۶ سوال برای صمیمیت و پیوند جان‌ها" onBack={onBack} />

      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* Level Tabs */}
        <div className="flex gap-2">
          {DEEP_QUESTIONS_36.map((lvl, idx) => (
            <button
              key={lvl.level}
              onClick={() => {
                sound.playTileClick();
                setCurrentLevelIdx(idx);
                setCurrentQIdx(0);
              }}
              className={`flex-1 py-2 px-1 rounded-2xl text-[11px] font-bold border transition-all ${
                idx === currentLevelIdx
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-transparent shadow-lg'
                  : 'bg-rose-950/40 border-rose-500/20 text-rose-300 hover:bg-rose-900/30'
              }`}
            >
              سطح {lvl.level}
            </button>
          ))}
        </div>

        {/* Level Title */}
        <div className="text-center">
          <span className="text-xs text-amber-300 font-bold">{level.title}</span>
          <p className="text-[11px] text-rose-300/70 mt-0.5">
            سوال {currentQIdx + 1} از {level.questions.length}
          </p>
        </div>

        {/* Turn Pill */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-1.5 rounded-full glass-panel border border-rose-400/40 text-xs font-semibold flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
            <span>نوبت پاسخگویی:</span>
            <span className="text-amber-300 font-bold">
              {partnerTurn === 'admin' ? 'حمید (مدیر)' : 'رزما من ❤️'}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-panel rounded-3xl p-6 border border-rose-400/30 shadow-2xl relative min-h-[180px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center text-rose-200">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>

            <p className="text-base sm:text-lg font-bold text-rose-100 leading-relaxed">
              {question}
            </p>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-rose-500/15 text-xs text-rose-300/70">
            <span>صادقانه و بدون شتاب پاسخ دهید</span>
            <span className="font-mono text-amber-300">+{completedQuestions * 25} قلب</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevQuestion}
            className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextQuestion}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>پاسخ دادیم! سوال بعدی</span>
          </button>

          <button
            onClick={handleNextQuestion}
            className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Minute Silent Eye-Contact Ritual */}
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-300" />
              <h4 className="text-xs font-bold text-rose-100">آیین نگاه چشم‌درچشم</h4>
            </div>
            {gazeActive && gazeTimer !== null && (
              <span className="text-sm font-mono font-extrabold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-500/40">
                {formatGazeTime(gazeTimer)}
              </span>
            )}
          </div>

          <p className="text-[11px] text-rose-200/80 leading-relaxed">
            پس از پایان پرسش‌ها، ۳ دقیقه در سکوت مطلق بدون حرف زدن در چشمان یکدیگر خیره شوید تا معجزه پیوند ناخودآگاه رخ دهد.
          </p>

          <button
            onClick={startGazeChallenge}
            disabled={gazeActive}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>{gazeActive ? 'آیین نگاه در جریان است...' : 'شروع آیین ۳ دقیقه نگاه عاشقانه'}</span>
          </button>
        </div>
      </main>
    </div>
  );
};
