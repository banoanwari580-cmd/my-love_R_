import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  ShieldCheck,
  Sparkles,
  Calendar,
  Lock,
  MessageCircle,
} from 'lucide-react';
import { store } from '../services/store';
import { sound } from '../services/sound';

interface FriendsViewProps {
  onOpenChat: () => void;
  onOpenProfile: () => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({ onOpenChat, onOpenProfile }) => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [partnerUser, setPartnerUser] = useState(store.getPartnerUser());
  const [relationship, setRelationship] = useState(store.getRelationship());

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setPartnerUser(store.getPartnerUser());
      setRelationship(store.getRelationship());
    });
  }, []);

  const calculateDaysTogether = () => {
    const start = new Date(relationship.startDate).getTime();
    const diff = Math.max(0, Date.now() - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="pb-36 px-4 pt-2 max-w-md mx-auto space-y-4">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 via-pink-100 to-amber-300 flex items-center gap-1.5 font-serif">
              دوستان ما (۲ حساب اختصاصی)
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </h2>
            <p className="text-xs text-rose-300/80">جهان ما فقط جای دو نفر است: تو و من</p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-3 p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center gap-2 text-[11px] text-amber-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>ثبت‌نام عمومی غیرفعال؛ حساب سوم توسط سرور فایربیس رد می‌شود.</span>
        </div>
      </div>

      {/* The 2 Partner Cards */}
      <div className="space-y-3">
        {/* Partner 1 Card (Hamid / Admin) */}
        <div className="glass-panel rounded-3xl p-4 border border-rose-500/25 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-rose-500 to-amber-400">
              <img
                src={currentUser.role === 'admin' ? currentUser.avatar : partnerUser.avatar}
                alt="Admin"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#11041f]" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-mono">حساب مدیر برنامه</span>
              <h3 className="text-sm font-bold text-rose-100">
                {currentUser.role === 'admin' ? currentUser.name : partnerUser.name}
              </h3>
              <p className="text-[10px] text-rose-300/70 truncate max-w-[170px]">
                {currentUser.role === 'admin' ? currentUser.bio : partnerUser.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-mono font-bold text-amber-300">
              {currentUser.role === 'admin' ? currentUser.heartScore : partnerUser.heartScore} ❤️
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              آنلاین
            </span>
          </div>
        </div>

        {/* Partner 2 Card (Razma) */}
        <div className="glass-panel rounded-3xl p-4 border border-rose-500/25 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-400">
              <img
                src={currentUser.role === 'razma' ? currentUser.avatar : partnerUser.avatar}
                alt="Razma"
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#11041f]" />
            </div>
            <div>
              <span className="text-[10px] text-rose-300 font-mono">حساب ملکه عشق</span>
              <h3 className="text-sm font-bold text-rose-100">
                {currentUser.role === 'razma' ? currentUser.name : partnerUser.name}
              </h3>
              <p className="text-[10px] text-rose-300/70 truncate max-w-[170px]">
                {currentUser.role === 'razma' ? currentUser.bio : partnerUser.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="text-xs font-mono font-bold text-amber-300">
              {currentUser.role === 'razma' ? currentUser.heartScore : partnerUser.heartScore} ❤️
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              آنلاین در قصر عشق
            </span>
          </div>
        </div>
      </div>

      {/* Bond Statistics Card */}
      <div className="glass-panel rounded-3xl p-5 border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>مدت زمان باهم بودن</span>
          </span>
          <span className="text-xs font-mono text-rose-300">{calculateDaysTogether()} روز</span>
        </div>

        <p className="text-xs text-rose-200/90 leading-relaxed font-serif text-justify">
          شما دو نفر تنها ساکنین این شبکه اجتماعی خصوصی هستید. تمام پست‌ها، استوری‌ها و عکس‌ها فقط و فقط میان تلفن‌های همراه شما به صورت رمزنگاری‌شده و اختصاصی رد و بدل می‌شوند.
        </p>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => {
              sound.playTileClick();
              onOpenChat();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>گفتگوی خصوصی</span>
          </button>

          <button
            onClick={() => {
              sound.playTileClick();
              onOpenProfile();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-bold hover:bg-rose-900/50"
          >
            مشاهده پروفایل
          </button>
        </div>
      </div>
    </div>
  );
};
