import React, { useState } from 'react';
import {
  Heart,
  Gamepad2,
  Trophy,
  Flame,
  HelpCircle,
  Puzzle,
  MessageCircleQuestion,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { QuizGame } from '../components/games/QuizGame';
import { TruthOrDareGame } from '../components/games/TruthOrDareGame';
import { WordGuessGame } from '../components/games/WordGuessGame';
import { PhotoPuzzleGame } from '../components/games/PhotoPuzzleGame';
import { CoupleQuestionsGame } from '../components/games/CoupleQuestionsGame';
import { HeartCatcherGame } from '../components/games/HeartCatcherGame';
import { store } from '../services/store';
import { sound } from '../services/sound';

export const GamesView: React.FC = () => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const games = [
    {
      id: 'quiz',
      title: 'حدس بزن چقدر مرا می‌شناسی',
      subtitle: '۵ سوال شناخت عمیق قلب با نمره درصدی',
      icon: HelpCircle,
      gradient: 'from-rose-600 to-pink-600',
      badge: 'آزمون شناخت',
    },
    {
      id: 'truth-dare',
      title: 'حقیقت یا چالش عاشقانه',
      subtitle: 'اسرار قلبی، شوخی‌های شیرین و ماموریت‌های عاشقانه',
      icon: Flame,
      gradient: 'from-amber-600 to-rose-600',
      badge: 'گردونه سرنوشت',
    },
    {
      id: 'word-guess',
      title: 'حدس کلمه عاشقانه',
      subtitle: 'حدس واژه‌های شاعرانه با کیبورد فارسی و فرصت قلب',
      icon: Heart,
      gradient: 'from-purple-600 to-rose-600',
      badge: 'رمزگشایی دل',
    },
    {
      id: 'photo-puzzle',
      title: 'پازل عکس خاطرات',
      subtitle: 'مرتب‌سازی تکه‌های خاطره مشترک در کمترین زمان',
      icon: Puzzle,
      gradient: 'from-pink-600 to-amber-600',
      badge: 'جورچین عشق',
    },
    {
      id: 'couple-questions',
      title: 'پرسش‌های عمیق دونفره',
      subtitle: '۳۶ پرسش روان‌شناختی برای یگانگی روح و آیین ۳ دقیقه نگاه',
      icon: MessageCircleQuestion,
      gradient: 'from-rose-700 to-indigo-600',
      badge: 'پیوند جان‌ها',
    },
    {
      id: 'heart-catcher',
      title: 'مسابقه طپش قلب‌ها',
      subtitle: 'شکار هیجان‌انگیز قلب‌های آسمانی با سرعت و کمبو',
      icon: Trophy,
      gradient: 'from-amber-500 to-pink-600',
      badge: 'آرکید ۶۰ فریم',
    },
  ];

  const handleOpenGame = (id: string) => {
    sound.playTileClick();
    setActiveGameId(id);
  };

  const handleBackToHub = () => {
    setActiveGameId(null);
  };

  if (activeGameId === 'quiz') return <QuizGame onBack={handleBackToHub} />;
  if (activeGameId === 'truth-dare') return <TruthOrDareGame onBack={handleBackToHub} />;
  if (activeGameId === 'word-guess') return <WordGuessGame onBack={handleBackToHub} />;
  if (activeGameId === 'photo-puzzle') return <PhotoPuzzleGame onBack={handleBackToHub} />;
  if (activeGameId === 'couple-questions') return <CoupleQuestionsGame onBack={handleBackToHub} />;
  if (activeGameId === 'heart-catcher') return <HeartCatcherGame onBack={handleBackToHub} />;

  return (
    <div className="min-h-screen pb-36 px-4 pt-3 max-w-md mx-auto space-y-5">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/60">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 via-pink-100 to-amber-300 flex items-center gap-1.5">
              ۶ بازی اختصاصی عاشقانه
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </h2>
            <p className="text-xs text-rose-300/80">بازی‌های دو نفره با ثبت امتیاز و پاداش قلب</p>
          </div>
        </div>
      </div>

      {/* Game Cards List */}
      <div className="space-y-3">
        {games.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div
              key={g.id}
              onClick={() => handleOpenGame(g.id)}
              className="glass-panel rounded-3xl p-4 border border-rose-500/20 hover:border-rose-400/50 cursor-pointer shadow-lg active:scale-98 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${g.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/30 text-amber-300 font-medium">
                      {g.badge}
                    </span>
                    <span className="text-[11px] text-rose-300/50 font-mono">#{idx + 1}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-rose-100 mt-1 truncate group-hover:text-amber-200 transition-colors">
                    {g.title}
                  </h3>
                  <p className="text-[11px] text-rose-300/70 truncate mt-0.5">{g.subtitle}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-300 group-hover:bg-rose-900/60 group-hover:text-white transition-all flex-shrink-0 mr-2">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
