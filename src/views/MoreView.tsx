import React, { useState } from 'react';
import {
  Image,
  Clock,
  Mail,
  Award,
  Settings,
  ArrowLeft,
  Heart,
  Sparkles,
} from 'lucide-react';
import { BackHeader } from '../components/common/BackHeader';
import { StoriesView } from './StoriesView';
import { MemoriesView } from './MemoriesView';
import { LettersView } from './LettersView';
import { RewardsView } from './RewardsView';
import { SettingsView } from './SettingsView';
import { sound } from '../services/sound';

export const MoreView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'menu' | 'stories' | 'memories' | 'letters' | 'rewards' | 'settings'
  >('menu');

  const menuItems = [
    {
      id: 'stories',
      title: 'استوری‌های ۱۲ ساعته',
      desc: 'مشاهده و ارسال استوری با زمان‌سنج انقضا و آیکن بازدید چشم',
      icon: Clock,
      gradient: 'from-pink-600 to-rose-600',
    },
    {
      id: 'memories',
      title: 'آلبوم خاطرات مشترک',
      desc: 'تصاویر و ویدیوهای ثبت‌شده با تفکیک سفر، دیدار و لحظه‌های خاص',
      icon: Image,
      gradient: 'from-amber-600 to-rose-600',
    },
    {
      id: 'letters',
      title: 'نامه‌های عاشقانه سر به مهر',
      desc: 'نگارش و گشودن نامه‌ها با مهر و موم سنتی و جلوه کاغذ پوستی',
      icon: Mail,
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      id: 'rewards',
      title: 'امتیازها، نشان‌ها و افتخارات',
      desc: 'بررسی مجموع قلب‌ها، نشان‌های بازگشایی‌شده و تاریخچه رکوردها',
      icon: Award,
      gradient: 'from-amber-500 to-yellow-600',
    },
    {
      id: 'settings',
      title: 'تنظیمات و حریم خصوصی',
      desc: 'ویرایش مشخصات دو طرف، تاریخ آغاز رابطه و راهنمای پایگاه داده',
      icon: Settings,
      gradient: 'from-rose-700 to-purple-800',
    },
  ];

  const handleSelect = (id: typeof activeSection) => {
    sound.playTileClick();
    setActiveSection(id);
  };

  const handleBackToMenu = () => {
    sound.playTileClick();
    setActiveSection('menu');
  };

  if (activeSection === 'stories') {
    return (
      <div className="min-h-screen pb-36">
        <BackHeader title="استوری‌های ۱۲ ساعته" subtitle="لحظه‌های زنده با انقضای خودکار" onBack={handleBackToMenu} />
        <main className="max-w-md mx-auto p-4">
          <StoriesView />
        </main>
      </div>
    );
  }

  if (activeSection === 'memories') {
    return (
      <div className="min-h-screen pb-36">
        <BackHeader title="آلبوم خاطرات مشترک" subtitle="گنجینه عکس‌ها و فیلم‌های ماندگار" onBack={handleBackToMenu} />
        <main className="max-w-md mx-auto p-4">
          <MemoriesView />
        </main>
      </div>
    );
  }

  if (activeSection === 'letters') {
    return (
      <div className="min-h-screen pb-36">
        <BackHeader title="نامه‌های عاشقانه" subtitle="صندوقچه نامه‌های سر به مهر" onBack={handleBackToMenu} />
        <main className="max-w-md mx-auto p-4">
          <LettersView />
        </main>
      </div>
    );
  }

  if (activeSection === 'rewards') {
    return (
      <div className="min-h-screen pb-36">
        <BackHeader title="نشان‌ها و افتخارات" subtitle="گنجینه قلب‌ها و دستاوردهای عشق" onBack={handleBackToMenu} />
        <main className="max-w-md mx-auto p-4">
          <RewardsView />
        </main>
      </div>
    );
  }

  if (activeSection === 'settings') {
    return (
      <div className="min-h-screen pb-36">
        <BackHeader title="تنظیمات برنامه" subtitle="مشخصات و حریم خصوصی" onBack={handleBackToMenu} />
        <main className="max-w-md mx-auto p-4">
          <SettingsView />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36 px-4 pt-3 max-w-md mx-auto space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 to-amber-300 flex items-center gap-1.5">
              امکانات بیشتر و اختصاصی
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </h2>
            <p className="text-xs text-rose-300/80">خاطرات، استوری، نامه‌های مهر و موم و تنظیمات</p>
          </div>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id as typeof activeSection)}
              className="glass-panel rounded-3xl p-4 border border-rose-500/20 hover:border-rose-400/50 cursor-pointer shadow-lg active:scale-98 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-rose-100 group-hover:text-amber-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-rose-300/70 truncate mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-300 group-hover:text-white transition-all flex-shrink-0 mr-2">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
