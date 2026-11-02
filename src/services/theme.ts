/**
 * Multi-Theme Engine for "My Love Razma ❤️"
 * Provides 8 distinct luxury themes with instant CSS variable injection and per-user storage.
 */

export type ThemeId =
  | 'royal_purple'
  | 'pure_dark'
  | 'pure_white'
  | 'luxury_black'
  | 'romantic_pink'
  | 'midnight_blue'
  | 'elegant_white'
  | 'dark_love'
  | 'rose_gold'
  | 'ocean_dream';

export type AppFont = 'vazir' | 'nastaliq';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  colors: {
    bg: string;
    surface: string;
    card: string;
    primary: string;
    primaryGlow: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
    gradient: string;
  };
  previewColors: string[];
}

export const LUXURY_THEMES: Record<ThemeId, ThemeConfig> = {
  royal_purple: {
    id: 'royal_purple',
    name: 'بنفش سلطنتی',
    subtitle: 'بنفش عمیق، صورتی و طلایی لوکس',
    isDark: true,
    colors: {
      bg: '#0c0214',
      surface: '#150524',
      card: 'rgba(28, 7, 48, 0.75)',
      primary: '#f43f5e',
      primaryGlow: 'rgba(244, 63, 94, 0.4)',
      accent: '#fbbf24',
      text: '#fdf2f8',
      textMuted: '#f472b6',
      border: 'rgba(244, 63, 94, 0.25)',
      gradient: 'from-rose-600 via-pink-600 to-amber-500',
    },
    previewColors: ['#0c0214', '#1c0730', '#f43f5e', '#fbbf24'],
  },
  pure_dark: {
    id: 'pure_dark',
    name: 'تاریک مخملی لوکس (Dark Mode)',
    subtitle: 'مشکی عمیق آمولد، خطوط نئونی و درخشش عاشقانه',
    isDark: true,
    colors: {
      bg: '#040108',
      surface: '#0d0418',
      card: 'rgba(20, 6, 34, 0.85)',
      primary: '#f43f5e',
      primaryGlow: 'rgba(244, 63, 94, 0.5)',
      accent: '#fbbf24',
      text: '#fdf4ff',
      textMuted: '#e879f9',
      border: 'rgba(244, 63, 94, 0.3)',
      gradient: 'from-rose-600 via-pink-600 to-amber-500',
    },
    previewColors: ['#040108', '#140622', '#f43f5e', '#fbbf24'],
  },
  pure_white: {
    id: 'pure_white',
    name: 'سفید بلورین شاهانه (Light Mode)',
    subtitle: 'سفید درخشان، طلای ناب و تمیزترین حالت روشن',
    isDark: false,
    colors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      card: 'rgba(255, 255, 255, 0.95)',
      primary: '#e11d48',
      primaryGlow: 'rgba(225, 29, 72, 0.25)',
      accent: '#d97706',
      text: '#0f172a',
      textMuted: '#64748b',
      border: 'rgba(225, 29, 72, 0.2)',
      gradient: 'from-rose-600 via-pink-500 to-amber-500',
    },
    previewColors: ['#f8fafc', '#ffffff', '#e11d48', '#d97706'],
  },
  luxury_black: {
    id: 'luxury_black',
    name: 'مشکی سلطنتی و طلایی',
    subtitle: 'مشکی خالص، طلای ناب و خاکستری متالیک',
    isDark: true,
    colors: {
      bg: '#080808',
      surface: '#121212',
      card: 'rgba(24, 24, 27, 0.85)',
      primary: '#d4af37',
      primaryGlow: 'rgba(212, 175, 55, 0.45)',
      accent: '#f59e0b',
      text: '#fafaf9',
      textMuted: '#a8a29e',
      border: 'rgba(212, 175, 55, 0.35)',
      gradient: 'from-amber-600 via-yellow-500 to-amber-700',
    },
    previewColors: ['#080808', '#1a1a1a', '#d4af37', '#f59e0b'],
  },
  romantic_pink: {
    id: 'romantic_pink',
    name: 'صورتی رمانتیک',
    subtitle: 'صورتی مخملی، گل رز و رزگلد درخشان',
    isDark: true,
    colors: {
      bg: '#170412',
      surface: '#24081c',
      card: 'rgba(49, 10, 37, 0.78)',
      primary: '#fb7185',
      primaryGlow: 'rgba(251, 113, 133, 0.45)',
      accent: '#fda4af',
      text: '#fff1f2',
      textMuted: '#fecdd3',
      border: 'rgba(251, 113, 133, 0.3)',
      gradient: 'from-pink-600 via-rose-500 to-pink-400',
    },
    previewColors: ['#170412', '#310a25', '#fb7185', '#fda4af'],
  },
  midnight_blue: {
    id: 'midnight_blue',
    name: 'آبی شب کهکشانی',
    subtitle: 'سرمه‌ای عمیق، آبی فیروزه‌ای و نقره‌ای',
    isDark: true,
    colors: {
      bg: '#030712',
      surface: '#0b1329',
      card: 'rgba(17, 28, 61, 0.8)',
      primary: '#38bdf8',
      primaryGlow: 'rgba(56, 189, 248, 0.4)',
      accent: '#60a5fa',
      text: '#f0f9ff',
      textMuted: '#7dd3fc',
      border: 'rgba(56, 189, 248, 0.28)',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-400',
    },
    previewColors: ['#030712', '#111c3d', '#38bdf8', '#60a5fa'],
  },
  elegant_white: {
    id: 'elegant_white',
    name: 'سفید و عاجی اشرافی (حالت روشن)',
    subtitle: 'سفید مرمری، کرم سلطنتی و طلای ملایم',
    isDark: false,
    colors: {
      bg: '#fcfaf8',
      surface: '#ffffff',
      card: 'rgba(255, 255, 255, 0.92)',
      primary: '#d97706',
      primaryGlow: 'rgba(217, 119, 6, 0.3)',
      accent: '#b45309',
      text: '#1c1917',
      textMuted: '#78716c',
      border: 'rgba(217, 119, 6, 0.25)',
      gradient: 'from-amber-600 via-amber-500 to-yellow-600',
    },
    previewColors: ['#fcfaf8', '#ffffff', '#d97706', '#b45309'],
  },
  dark_love: {
    id: 'dark_love',
    name: 'عشق تیره نئونی',
    subtitle: 'مشکی نیمه‌شب، بنفش سایبر و سرخابی نئونی',
    isDark: true,
    colors: {
      bg: '#05010a',
      surface: '#0e021a',
      card: 'rgba(25, 4, 43, 0.85)',
      primary: '#ff007f',
      primaryGlow: 'rgba(255, 0, 127, 0.55)',
      accent: '#c084fc',
      text: '#faf5ff',
      textMuted: '#e9d5ff',
      border: 'rgba(255, 0, 127, 0.35)',
      gradient: 'from-fuchsia-600 via-purple-600 to-pink-500',
    },
    previewColors: ['#05010a', '#19042b', '#ff007f', '#c084fc'],
  },
  rose_gold: {
    id: 'rose_gold',
    name: 'رزگلد سلطنتی',
    subtitle: 'رزگلد براق، شکلاتی ملایم و شامپاینی',
    isDark: true,
    colors: {
      bg: '#14080a',
      surface: '#200e12',
      card: 'rgba(45, 20, 26, 0.8)',
      primary: '#e0a899',
      primaryGlow: 'rgba(224, 168, 153, 0.45)',
      accent: '#f3c5b8',
      text: '#fff5f3',
      textMuted: '#d49b8d',
      border: 'rgba(224, 168, 153, 0.3)',
      gradient: 'from-rose-400 via-pink-400 to-amber-300',
    },
    previewColors: ['#14080a', '#2d141a', '#e0a899', '#f3c5b8'],
  },
  ocean_dream: {
    id: 'ocean_dream',
    name: 'رویای اقیانوس آرام',
    subtitle: 'آبی اقیانوسی، فیروزه‌ای زمردین و سفید صدفی',
    isDark: true,
    colors: {
      bg: '#021019',
      surface: '#061d2d',
      card: 'rgba(12, 44, 66, 0.8)',
      primary: '#06b6d4',
      primaryGlow: 'rgba(6, 182, 212, 0.45)',
      accent: '#38bdf8',
      text: '#ecfeff',
      textMuted: '#67e8f9',
      border: 'rgba(6, 182, 212, 0.3)',
      gradient: 'from-cyan-600 via-teal-500 to-blue-500',
    },
    previewColors: ['#021019', '#0c2c42', '#06b6d4', '#38bdf8'],
  },
};

type ThemeListener = (theme: ThemeConfig, font: AppFont) => void;

class ThemeService {
  private currentThemeId: ThemeId = 'royal_purple';
  private currentFont: AppFont = 'vazir';
  private listeners: Set<ThemeListener> = new Set();

  constructor() {
    this.loadSavedTheme();
    this.loadSavedFont();
  }

  private loadSavedTheme() {
    if (typeof window === 'undefined') return;
    const userRole = localStorage.getItem('love_current_role') || 'admin';
    const saved = localStorage.getItem(`love_theme_${userRole}`) as ThemeId;
    if (saved && LUXURY_THEMES[saved]) {
      this.currentThemeId = saved;
    }
    this.applyToDocument();
  }

  private loadSavedFont() {
    if (typeof window === 'undefined') return;
    const savedFont = localStorage.getItem('app_font_preference') as AppFont;
    if (savedFont === 'nastaliq' || savedFont === 'vazir') {
      this.currentFont = savedFont;
    }
    this.applyFontToDocument();
  }

  public getTheme(): ThemeConfig {
    return LUXURY_THEMES[this.currentThemeId] || LUXURY_THEMES.royal_purple;
  }

  public getThemeId(): ThemeId {
    return this.currentThemeId;
  }

  public getFont(): AppFont {
    return this.currentFont;
  }

  public setFont(font: AppFont) {
    this.currentFont = font;
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_font_preference', font);
    }
    this.applyFontToDocument();
    this.notify();
  }

  public toggleFont() {
    const nextFont = this.currentFont === 'vazir' ? 'nastaliq' : 'vazir';
    this.setFont(nextFont);
  }

  public isDark(): boolean {
    return this.getTheme().isDark;
  }

  public toggleLightDark() {
    if (this.isDark()) {
      this.setTheme('pure_white');
    } else {
      this.setTheme('royal_purple');
    }
  }

  public setTheme(id: ThemeId) {
    if (!LUXURY_THEMES[id]) return;
    this.currentThemeId = id;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('love_current_role') || 'admin' : 'admin';
    if (typeof window !== 'undefined') {
      localStorage.setItem(`love_theme_${userRole}`, id);
    }
    this.applyToDocument();
    this.notify();
  }

  public subscribe(listener: ThemeListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const theme = this.getTheme();
    this.listeners.forEach((fn) => fn(theme, this.currentFont));
  }

  private applyFontToDocument() {
    if (typeof document === 'undefined') return;
    document.body.classList.remove('app-font-vazir', 'app-font-nastaliq');
    document.body.classList.add(`app-font-${this.currentFont}`);
    document.documentElement.style.setProperty(
      '--app-font',
      this.currentFont === 'nastaliq' ? "'Noto Nastaliq Urdu', 'IranNastaliq', 'Vazirmatn'" : "'Vazirmatn'"
    );
  }

  private applyToDocument() {
    if (typeof document === 'undefined') return;
    const theme = this.getTheme();
    const root = document.documentElement;

    root.style.setProperty('--theme-bg', theme.colors.bg);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-card', theme.colors.card);
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-primary-glow', theme.colors.primaryGlow);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
    root.style.setProperty('--theme-border', theme.colors.border);

    document.body.style.backgroundColor = theme.colors.bg;
    document.body.style.color = theme.colors.text;

    this.applyFontToDocument();

    // Theme meta color for mobile browser status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.bg);
    }
  }
}

export const themeService = new ThemeService();
