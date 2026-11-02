import React, { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  CheckCircle,
  Type,
} from 'lucide-react';
import { themeService, LUXURY_THEMES, ThemeId, ThemeConfig, AppFont } from '../../services/theme';
import { sound } from '../../services/sound';
import { store } from '../../services/store';

export const ThemeSelector: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themeService.getTheme());
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(themeService.getThemeId());
  const [currentFont, setCurrentFont] = useState<AppFont>(themeService.getFont());
  const [currentUser] = useState(store.getCurrentUser());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return themeService.subscribe((theme, font) => {
      setCurrentTheme(theme);
      setCurrentThemeId(theme.id);
      setCurrentFont(font);
    });
  }, []);

  const handleSelectTheme = (id: ThemeId) => {
    sound.playTileClick();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {
        // ignore if not permitted
      }
    }
    themeService.setTheme(id);
    const themeName = LUXURY_THEMES[id].name;
    setToastMessage(`تم «${themeName}» با موفقیت فعال شد`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResetDefault = () => {
    sound.playTileClick();
    themeService.setTheme('royal_purple');
    setToastMessage('تم پیش‌فرض بنفش سلطنتی بازگردانی شد');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const themeList = Object.values(LUXURY_THEMES);

  return (
    <div className="glass-panel rounded-3xl p-5 border border-rose-500/25 shadow-xl space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-100 flex items-center gap-1.5">
              <span>ظاهر و تم برنامه</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h4>
            <p className="text-[10px] text-rose-300/80">
              انتخاب از میان ۸ تم اختصاصی و لوکس با جلوه‌های نوری
            </p>
          </div>
        </div>

        {/* Reset to default button */}
        {currentThemeId !== 'royal_purple' && (
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/50 border border-rose-500/30 text-[10px] text-rose-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>پیش‌فرض</span>
          </button>
        )}
      </div>

      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Font Selection Control: Vazirmatn vs Nastaliq */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/40 to-amber-950/30 border border-rose-500/25 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Type className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold text-rose-100">فونت و قلم برنامه</span>
          </div>
          <span className="text-[10px] text-amber-300/80 font-mono">
            {currentFont === 'nastaliq' ? 'خط نستعلیق فعال است' : 'فونت وزیرمتن فعال است'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playTileClick();
              themeService.setFont('vazir');
              setToastMessage('فونت وزیرمتن فعال شد');
              setTimeout(() => setToastMessage(null), 2000);
            }}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              currentFont === 'vazir'
                ? 'bg-rose-600/30 border-rose-400 text-rose-100 shadow-md ring-1 ring-rose-400/50'
                : 'bg-black/20 border-white/10 text-rose-300/70 hover:bg-white/5'
            }`}
          >
            <span className="text-xs font-bold font-vazir">وزیر متن (Vazirmatn)</span>
            <span className="text-[9px] text-rose-300/60">مدرن، خوانا و استاندارد</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTileClick();
              themeService.setFont('nastaliq');
              setToastMessage('خط خوشنویسی نستعلیق فعال شد');
              setTimeout(() => setToastMessage(null), 2000);
            }}
            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              currentFont === 'nastaliq'
                ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/50'
                : 'bg-black/20 border-white/10 text-rose-300/70 hover:bg-white/5'
            }`}
          >
            <span className="text-sm font-bold font-nastaliq">خط نستعلیق (Nastaliq)</span>
            <span className="text-[9px] text-amber-300/60">خوشنویسی اصیل و رمانتیک</span>
          </button>
        </div>
      </div>

      {/* Light / Dark Mode Quick Switch */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20">
        <div className="flex items-center gap-2">
          {currentTheme.isDark ? (
            <Moon className="w-4 h-4 text-purple-300" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
          <div>
            <span className="text-xs font-bold text-rose-100 block">
              حالت کنونی: {currentTheme.isDark ? 'تم تاریک (Dark Mode)' : 'تم سفید (Light Mode)'}
            </span>
            <span className="text-[10px] text-rose-300/70">
              تغییر سریع میان حالت روز روشن و شب تیره
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playTileClick();
            themeService.toggleLightDark();
            setToastMessage(currentTheme.isDark ? 'تم سفید فعال شد' : 'تم تاریک فعال شد');
            setTimeout(() => setToastMessage(null), 2000);
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold shadow active:scale-95 transition-all flex items-center gap-1.5"
        >
          {currentTheme.isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span>{currentTheme.isDark ? 'روشن (سفید)' : 'تاریک (شب)'}</span>
        </button>
      </div>

      {/* Account Independent Setting Notice */}
      <div className="p-2.5 rounded-2xl bg-rose-950/35 border border-rose-500/15 text-[10px] text-rose-200/80 leading-relaxed">
        💡 تم و فونت انتخابی شما منحصراً برای حساب <strong>«{currentUser.name}»</strong> ذخیره می‌شود و سلیقه بصری هر دو نفر جداگانه حفظ خواهد شد.
      </div>

      {/* 8 Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {themeList.map((t) => {
          const isSelected = t.id === currentThemeId;

          return (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={`group relative text-right p-3.5 rounded-2xl transition-all duration-300 border text-white flex flex-col justify-between overflow-hidden active:scale-[0.98] ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]'
                  : 'border-white/10 hover:border-white/25 hover:bg-white/5 opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: t.colors.surface,
                boxShadow: isSelected ? `0 0 20px ${t.colors.primaryGlow}` : undefined,
              }}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 flex items-center justify-center text-black font-bold shadow-md z-10 animate-in zoom-in-75">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Theme Header with Mode Badge */}
              <div className="flex items-start justify-between w-full mb-2">
                <div>
                  <h5 className="text-xs font-extrabold flex items-center gap-1.5" style={{ color: t.colors.text }}>
                    <span>{t.name}</span>
                  </h5>
                  <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: t.colors.textMuted }}>
                    {t.subtitle}
                  </p>
                </div>

                {/* Dark / Light Pill */}
                <div
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: t.colors.card,
                    color: t.colors.text,
                    border: `1px solid ${t.colors.border}`,
                  }}
                >
                  {t.isDark ? (
                    <>
                      <Moon className="w-2.5 h-2.5" />
                      <span>تیره</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-2.5 h-2.5 text-amber-500" />
                      <span>روشن</span>
                    </>
                  )}
                </div>
              </div>

              {/* Color Swatch Circles Preview */}
              <div className="w-full flex items-center justify-between pt-2 border-t" style={{ borderColor: t.colors.border }}>
                <span className="text-[9px]" style={{ color: t.colors.textMuted }}>
                  پالت رنگی:
                </span>
                <div className="flex items-center gap-1.5">
                  {t.previewColors.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span
                    className="w-10 h-3 rounded-full bg-gradient-to-r shadow-inner ml-1"
                    style={{
                      background: `linear-gradient(90deg, ${t.colors.primary}, ${t.colors.accent})`,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
