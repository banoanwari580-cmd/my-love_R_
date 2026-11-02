import React, { useState } from 'react';
import {
  Settings,
  Heart,
  User,
  Shield,
  Volume2,
  Calendar,
  Save,
  LogOut,
  RefreshCw,
  Camera,
  Database,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { isFirebaseConfigured } from '../services/firebase';
import { ThemeSelector } from '../components/settings/ThemeSelector';

interface SettingsViewProps {
  onSignOut?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSignOut }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [currentRole] = useState(store.getCurrentRole());
  const [relationship, setRelationship] = useState(store.getRelationship());
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [startDate, setStartDate] = useState(relationship.startDate.split('T')[0]);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    sound.playVictoryFanfare();
    store.updateProfile(currentRole, {
      name: name.trim(),
      bio: bio.trim(),
      avatar,
    });
    store.updateRelationship({
      startDate: new Date(startDate).toISOString(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleResetData = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام داده‌های محلی را به حالت اولیه بازگردانید؟')) {
      store.resetAllToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Settings Header */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-rose-100">تنظیمات و حریم خصوصی</h3>
            <p className="text-xs text-rose-300/80">شخصی‌سازی مشخصات، عکس‌ها و تاریخ سالگرد عشق</p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>تنظیمات و مشخصات با موفقیت در دیتابیس ثبت شد!</span>
        </div>
      )}

      {/* Luxury Theme Selector (8 Complete Themes) */}
      <ThemeSelector />

      {/* Profile Editing Card */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/20 shadow-xl space-y-4">
        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>مشخصات حساب شما ({currentRole === 'admin' ? 'مدیر برنامه' : 'رزما'})</span>
        </h4>

        {/* Avatar custom upload */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-rose-400 shadow-md">
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-rose-100 block">تصویر نمایه</span>
            <p className="text-[10px] text-rose-300/70">روی آیکون دوربین بزنید تا عکس جدید بارگذاری شود</p>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-rose-300 block mb-1">نام نمایشی:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-rose-300 block mb-1">متن بیوگرافی قلبی:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* Relationship Start Date Card */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/20 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>تاریخ آغاز رابطه (شمارنده روزهای باهم بودن)</span>
        </h4>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 font-mono focus:outline-none focus:border-rose-400"
        />
        <p className="text-[10px] text-rose-300/70">
          با تغییر این تاریخ، شمارنده روزها، ساعت‌ها و ثانیه‌های صفحه اصلی بصورت خودکار بازتنظیم خواهد شد.
        </p>
      </div>

      {/* Security & 2-User Strict Policy Card */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/20 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-rose-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>امنیت و سیاست اختصاصی دو نفره</span>
        </h4>
        <p className="text-[11px] text-rose-200/80 leading-relaxed text-justify">
          این اپلیکیشن منحصراً برای دو حساب (مدیر برنامه و رزما) طراحی شده است. ثبت‌نام عمومی کاملاً غیرفعال است و هیچ شخص ثالثی اجازه دسترسی به اطلاعات، چت، تصاویر و نامه‌ها را ندارد.
        </p>

        {/* Firebase Live Status */}
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-300" />
            <span>وضعیت اتصال پایگاه داده:</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isFirebaseConfigured()
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isFirebaseConfigured() ? 'Firebase متصل' : 'همگام‌سازی محلی فعال'}
          </span>
        </div>

        <button
          onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
          className="text-[11px] text-amber-300/90 underline block hover:text-amber-200"
        >
          {showFirebaseGuide ? 'بستن راهنمای تنظیم دستی Firebase' : 'مشاهده راهنمای ساده گام‌به‌گام اتصال Firebase'}
        </button>

        {showFirebaseGuide && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 text-xs text-rose-200/90 leading-relaxed space-y-2 animate-in fade-in">
            <h5 className="font-bold text-amber-300">مراحل ساده اتصال به کنسول Firebase:</h5>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-rose-200/80">
              <li>به <span className="font-mono text-amber-300">console.firebase.google.com</span> مراجعه کنید.</li>
              <li>یک پروژه رایگان به نام <span className="font-mono text-amber-300">My Love Razma</span> بسازید.</li>
              <li>از منوی سمت چپ گزینه <strong>Firestore Database</strong> را زده و روی <strong>Create Database</strong> کلیک کنید.</li>
              <li>قوانین فایل <span className="font-mono text-amber-300">firestore.rules</span> پروژه را در بخش Rules کنسول جای‌گذاری کنید.</li>
              <li>در بخش <strong>Authentication</strong> گزینه Email/Password را فعال کنید.</li>
              <li>کلیدهای وب (<span className="font-mono text-amber-300">apiKey</span>، <span className="font-mono text-amber-300">projectId</span>) را در متغیرهای محیطی قرار دهید.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>ذخیره تمامی تغییرات</span>
      </button>

      {/* Danger Zone: Reset and Sign Out */}
      <div className="pt-2 flex gap-3">
        <button
          onClick={handleResetData}
          className="flex-1 py-3 rounded-2xl bg-rose-950/40 border border-rose-500/20 text-rose-400 hover:text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>بازنشانی پیش‌فرض</span>
        </button>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex-1 py-3 rounded-2xl bg-rose-950/40 border border-rose-500/20 text-rose-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج از حساب</span>
          </button>
        )}
      </div>
    </div>
  );
};
