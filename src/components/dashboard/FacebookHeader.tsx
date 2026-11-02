import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  Bell,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  CloudCheck,
  MessageCircle,
  Sun,
  Moon,
  Type,
} from 'lucide-react';
import { store } from '../../services/store';
import { sound } from '../../services/sound';
import { AppLogo } from '../common/AppLogo';
import { themeService, ThemeConfig } from '../../services/theme';

interface FacebookHeaderProps {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenChat: () => void;
  onSearch: (query: string) => void;
}

export const FacebookHeader: React.FC<FacebookHeaderProps> = ({
  onOpenSettings,
  onOpenProfile,
  onOpenChat,
  onSearch,
}) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [partnerUser, setPartnerUser] = useState(store.getPartnerUser());
  const [connStatus, setConnStatus] = useState(store.getConnectionStatus());
  const [theme, setTheme] = useState<ThemeConfig>(themeService.getTheme());
  const [currentFont, setCurrentFont] = useState(themeService.getFont());
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubStore = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setPartnerUser(store.getPartnerUser());
      setConnStatus(store.getConnectionStatus());
      const msgs = store.getMessages();
      const current = store.getCurrentRole();
      setUnreadCount(msgs.filter((m) => m.receiverId === current && !m.readAt).length);
    });
    const unsubTheme = themeService.subscribe((newTheme, newFont) => {
      setTheme(newTheme);
      setCurrentFont(newFont);
    });

    return () => {
      unsubStore();
      unsubTheme();
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-2xl border-b px-3 py-2 shadow-lg transition-colors duration-300"
      style={{
        backgroundColor: `${theme.colors.bg}f0`,
        borderColor: theme.colors.border,
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left: App Logo & Title */}
        <div className="flex items-center gap-2">
          <AppLogo size={36} className="cursor-pointer active:scale-95 transition-transform" />

          <div>
            <h1
              className="text-sm sm:text-base font-extrabold text-transparent bg-clip-text font-serif flex items-center gap-1"
              style={{
                backgroundImage: `linear-gradient(to left, ${theme.colors.text}, ${theme.colors.accent})`,
              }}
            >
              My Love Razma <span className="text-rose-400">❤️</span>
            </h1>
            <div className="flex items-center gap-1 text-[9px] text-rose-300/80">
              <span className={`w-1.5 h-1.5 rounded-full ${connStatus.isFirebaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{connStatus.isFirebaseLive ? 'ابری زنده' : 'همگام‌سازی محلی'}</span>
            </div>
          </div>
        </div>

        {/* Search Bar / Action Buttons */}
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-1 bg-[#1a072d] border border-rose-500/30 rounded-2xl px-2 py-1 animate-in fade-in">
            <Search className="w-4 h-4 text-rose-400/70" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="جستجو در پست‌ها و خاطرات..."
              className="w-full bg-transparent text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none"
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
                onSearch('');
              }}
              className="text-xs text-rose-300/70 hover:text-white px-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Font Toggle: Nastaliq vs Vazirmatn */}
            <button
              onClick={() => {
                sound.playTileClick();
                themeService.toggleFont();
              }}
              title={currentFont === 'nastaliq' ? 'تغییر به خط وزیرمتن' : 'تغییر به خط نستعلیق'}
              className="px-2 py-1 rounded-full bg-rose-950/50 border border-rose-500/20 flex items-center gap-1 text-[10px] text-rose-200 hover:text-white hover:bg-rose-900/40 transition-colors"
            >
              <Type className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline font-bold">
                {currentFont === 'nastaliq' ? 'نستعلیق' : 'وزیر'}
              </span>
            </button>

            {/* Quick Light / Dark Mode Toggle */}
            <button
              onClick={() => {
                sound.playTileClick();
                themeService.toggleLightDark();
              }}
              title={theme.isDark ? 'تغییر به تم سفید (روز)' : 'تغییر به تم تاریک (شب)'}
              aria-label="تغییر حالت شب و روز"
              className="w-8 h-8 rounded-full bg-rose-950/50 border border-rose-500/20 flex items-center justify-center text-amber-300 hover:text-white hover:bg-rose-900/40 transition-colors"
            >
              {theme.isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-rose-600" />}
            </button>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="جستجو"
              className="w-8 h-8 rounded-full bg-rose-950/50 border border-rose-500/20 flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification / Messages Bell with Unread Badge */}
            <button
              onClick={() => {
                sound.playTileClick();
                onOpenChat();
              }}
              aria-label="پیام‌ها"
              className="relative w-8 h-8 rounded-full bg-rose-950/50 border border-rose-500/20 flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold border border-[#11041f] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                sound.playTileClick();
                onOpenSettings();
              }}
              aria-label="تنظیمات"
              className="w-8 h-8 rounded-full bg-rose-950/50 border border-rose-500/20 flex items-center justify-center text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={() => {
                sound.playTileClick();
                onOpenProfile();
              }}
              className="relative w-8 h-8 rounded-full ring-2 ring-rose-400/60 overflow-hidden flex-shrink-0 active:scale-95 transition-transform"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#11041f]" />
            </button>
          </div>
        )}
      </div>

      {/* Both Partners Online Presence Bar */}
      <div className="max-w-md mx-auto pt-2 pb-0.5 flex items-center justify-between border-t border-rose-500/10 mt-1.5 text-[10px]">
        {/* Admin presence */}
        <div className="flex items-center gap-1.5 text-rose-200">
          <div className="relative w-4 h-4 rounded-full overflow-hidden">
            <img src={currentUser.role === 'admin' ? currentUser.avatar : partnerUser.avatar} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold">{currentUser.role === 'admin' ? currentUser.name : partnerUser.name}:</span>
          <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            آنلاین
          </span>
        </div>

        {/* Razma presence */}
        <div className="flex items-center gap-1.5 text-rose-200">
          <div className="relative w-4 h-4 rounded-full overflow-hidden">
            <img src={currentUser.role === 'razma' ? currentUser.avatar : partnerUser.avatar} alt="Razma" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold">{currentUser.role === 'razma' ? currentUser.name : partnerUser.name}:</span>
          <span className="text-emerald-400 flex items-center gap-0.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            آنلاین در قصر عشق
          </span>
        </div>
      </div>
    </header>
  );
};
