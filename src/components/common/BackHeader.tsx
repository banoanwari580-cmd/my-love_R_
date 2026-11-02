import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../../services/sound';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  const handleBack = () => {
    sound.playTileClick();
    onBack();
  };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-[#12061f]/85 backdrop-blur-xl border-b border-rose-500/15">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          aria-label="بازگشت"
          className="w-9 h-9 rounded-full bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-900/80 active:scale-95 transition-all shadow-md shadow-rose-950/40"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 via-pink-100 to-amber-200 flex items-center gap-1.5">
            {title}
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </h2>
          {subtitle && (
            <p className="text-xs text-rose-200/60 font-normal">{subtitle}</p>
          )}
        </div>
      </div>

      {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
    </div>
  );
};
