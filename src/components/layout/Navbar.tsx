import React, { useState, useEffect } from 'react';
import { Heart, Volume2, VolumeX, Sparkles, User } from 'lucide-react';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface NavbarProps {
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
    if (!next) sound.playHeartPop();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#10041d]/90 backdrop-blur-xl border-b border-rose-500/20 px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* App Title & Crown Icon */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 shadow-md shadow-rose-950/40 border border-rose-300/30">
            <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-l from-rose-200 via-pink-100 to-amber-300 flex items-center gap-1 font-serif">
              My Love Razma <span className="text-rose-400">❤️</span>
            </h1>
            <p className="text-[10px] text-rose-300/70 font-medium">حریم خصوصی دو نفره ما</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hearts score pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/50 border border-amber-500/30 text-amber-300 shadow-inner">
            <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold font-mono">{currentUser.heartScore}</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'فعالسازی صدا' : 'قطع صدا'}
            className="w-8 h-8 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400/60" /> : <Volume2 className="w-4 h-4 text-rose-300" />}
          </button>

          {/* Authenticated User Profile Pill (Opens Settings/Profile on click) */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-gradient-to-l from-rose-950/70 to-purple-950/70 border border-rose-400/30 hover:border-rose-400/60 transition-all active:scale-95"
          >
            <span className="text-xs font-semibold text-rose-100 max-w-[80px] sm:max-w-[110px] truncate">
              {currentUser.name}
            </span>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-400/50"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
