import React, { useState } from 'react';
import { Compass, Flame, Shield, CheckCircle, RotateCw, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BackHeader } from '../common/BackHeader';
import { TRUTH_OR_DARE_DATA } from '../../data/initialData';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface TruthOrDareGameProps {
  onBack: () => void;
}

export const TruthOrDareGame: React.FC<TruthOrDareGameProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'truth' | 'dare' | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const handlePick = (type: 'truth' | 'dare') => {
    setIsSpinning(true);
    sound.playWhoosh();

    setTimeout(() => {
      setMode(type);
      const list = type === 'truth' ? TRUTH_OR_DARE_DATA.truths : TRUTH_OR_DARE_DATA.dares;
      const randomItem = list[Math.floor(Math.random() * list.length)];
      setCurrentText(randomItem);
      setIsSpinning(false);
      sound.playChime();
    }, 600);
  };

  const handleComplete = () => {
    sound.playVictoryFanfare();
    const nextCount = completedCount + 1;
    setCompletedCount(nextCount);
    store.recordGameScore('truth-dare', 'حقیقت یا چالش عاشقانه', nextCount * 15, `${nextCount} چالش و حقیقت با موفقیت انجام شد`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fbbf24'],
    });
    setMode(null);
    setCurrentText('');
  };

  return (
    <div className="min-h-screen bg-[#0e0319] pb-32">
      <BackHeader title="حقیقت یا چالش عاشقانه" subtitle="رمزگشایی از احساسات و ماجراجویی دونفره" onBack={onBack} />

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Rules Card */}
        <div className="glass-panel rounded-3xl p-5 border border-rose-500/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-amber-300" />
            <h3 className="text-sm font-bold text-rose-100">قوانین بازی</h3>
          </div>
          <p className="text-xs text-rose-200/80 leading-relaxed">
            یکی از گزینه‌های «حقیقت عاشقانه» یا «چالش پرشور» را انتخاب کنید. با صداقت پاسخ دهید یا با عشق چالش را انجام دهید!
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-amber-300 font-bold">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>چالش‌های تکمیل شده: {completedCount}</span>
          </div>
        </div>

        {/* Action Choice Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={isSpinning}
            onClick={() => handlePick('truth')}
            className={`p-5 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              isSpinning
                ? 'opacity-60 scale-95'
                : 'glass-rose border-rose-400/40 hover:scale-103 active:scale-95'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-600/40 border border-rose-400/50 flex items-center justify-center text-rose-200">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-rose-100">حقیقت عاشقانه</span>
            <span className="text-[10px] text-rose-300/70">اسرار قلبی ناگفته</span>
          </button>

          <button
            disabled={isSpinning}
            onClick={() => handlePick('dare')}
            className={`p-5 rounded-3xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              isSpinning
                ? 'opacity-60 scale-95'
                : 'glass-gold border-amber-400/40 hover:scale-103 active:scale-95'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-600/40 border border-amber-400/50 flex items-center justify-center text-amber-200">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-sm font-extrabold text-amber-100">چالش عاشقانه</span>
            <span className="text-[10px] text-amber-300/70">ماموریت‌های پرشور</span>
          </button>
        </div>

        {/* Card Display Area */}
        {isSpinning && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 animate-pulse">
            <RotateCw className="w-10 h-10 text-rose-400 animate-spin" />
            <span className="text-xs font-bold text-rose-200">در حال انتخاب تصادفی سرنوشت...</span>
          </div>
        )}

        {!isSpinning && mode && currentText && (
          <div className="glass-panel rounded-3xl p-6 border border-rose-400/40 shadow-2xl animate-in zoom-in-95 text-center space-y-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                mode === 'truth' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
              }`}
            >
              {mode === 'truth' ? '🛡️ حقیقت عاشقانه' : '🔥 چالش رمانتیک'}
            </span>

            <p className="text-sm sm:text-base font-bold text-rose-100 leading-relaxed py-2">
              {currentText}
            </p>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => handlePick(mode)}
                className="flex-1 py-3 rounded-2xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
              >
                تغییر سوال
              </button>
              <button
                onClick={handleComplete}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <CheckCircle className="w-4 h-4" />
                <span>انجام شد (+۱۵ قلب)</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
