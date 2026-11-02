import React, { useState, useEffect } from 'react';
import {
  Home,
  Sparkles,
  MessageCircle,
  Film,
  User,
} from 'lucide-react';
import { store } from '../../services/store';
import { sound } from '../../services/sound';
import { themeService, ThemeConfig } from '../../services/theme';

export type TabType = 'home' | 'stories' | 'messages' | 'memories' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<ThemeConfig>(themeService.getTheme());

  useEffect(() => {
    const updateUnread = () => {
      const msgs = store.getMessages();
      const current = store.getCurrentRole();
      const unread = msgs.filter((m) => m.receiverId === current && !m.readAt).length;
      setUnreadCount(unread);
    };

    updateUnread();
    const unsubStore = store.subscribe(updateUnread);
    const unsubTheme = themeService.subscribe((newTheme) => setTheme(newTheme));

    return () => {
      unsubStore();
      unsubTheme();
    };
  }, []);

  const handleSelect = (tab: TabType) => {
    sound.playTileClick();
    onChangeTab(tab);
  };

  const navItems: {
    tab: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    badge?: number;
  }[] = [
    { tab: 'home', label: 'خانه', icon: Home },
    { tab: 'stories', label: 'استوری', icon: Sparkles },
    { tab: 'messages', label: 'پیام‌ها', icon: MessageCircle, badge: unreadCount },
    { tab: 'memories', label: 'خاطرات', icon: Film },
    { tab: 'profile', label: 'پروفایل', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl border-t pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-colors duration-300"
      style={{
        backgroundColor: `${theme.colors.bg}ee`,
        borderColor: theme.colors.border,
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleSelect(item.tab)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 active:scale-95 ${
                isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {/* Active glow background pill */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-2xl -z-10 transition-all duration-300 animate-in fade-in"
                  style={{
                    background: `radial-gradient(ellipse at bottom, ${theme.colors.primaryGlow}, transparent 70%)`,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              )}

              <div className="relative">
                <Icon
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: isActive ? theme.colors.accent : theme.colors.textMuted,
                    filter: isActive ? `drop-shadow(0 0 6px ${theme.colors.primary})` : undefined,
                  }}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-white text-[9px] font-bold shadow animate-pulse border border-black/30"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className="text-[10px] mt-1 font-medium transition-colors"
                style={{
                  color: isActive ? theme.colors.text : theme.colors.textMuted,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.label}
              </span>

              {/* Active dot indicator */}
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full mt-0.5 shadow-sm"
                  style={{
                    backgroundColor: theme.colors.accent,
                    boxShadow: `0 0 8px ${theme.colors.accent}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
