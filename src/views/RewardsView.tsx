import React, { useState, useEffect } from 'react';
import { Award, Heart, Sparkles, Trophy, CheckCircle, Clock } from 'lucide-react';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { RewardBadge, GameScore } from '../types';

export const RewardsView: React.FC = () => {
  const [badges, setBadges] = useState<RewardBadge[]>(store.getBadges());
  const [scores, setScores] = useState<GameScore[]>(store.getScores());
  const currentUser = store.getCurrentUser();
  const partnerUser = store.getPartnerUser();

  useEffect(() => {
    return store.subscribe(() => {
      setBadges(store.getBadges());
      setScores(store.getScores());
    });
  }, []);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Total Score Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current user */}
        <div className="glass-panel rounded-3xl p-4 border border-rose-500/30 text-center relative overflow-hidden shadow-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2 border border-rose-400">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] text-rose-200/80 font-bold block truncate">{currentUser.name}</span>
          <div className="flex items-center justify-center gap-1 mt-1 text-xl font-extrabold text-amber-300 font-mono">
            <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{currentUser.heartScore}</span>
          </div>
          <span className="text-[9px] text-rose-300/60">قلب‌های کسب‌شده</span>
        </div>

        {/* Partner */}
        <div className="glass-panel rounded-3xl p-4 border border-amber-500/30 text-center relative overflow-hidden shadow-xl">
          <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2 border border-amber-400">
            <img src={partnerUser.avatar} alt={partnerUser.name} className="w-full h-full object-cover" />
          </div>
          <span className="text-[11px] text-rose-200/80 font-bold block truncate">{partnerUser.name}</span>
          <div className="flex items-center justify-center gap-1 mt-1 text-xl font-extrabold text-rose-300 font-mono">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{partnerUser.heartScore}</span>
          </div>
          <span className="text-[9px] text-amber-300/70">قلب‌های کسب‌شده</span>
        </div>
      </div>

      {/* Badges Overview Card */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <h3 className="text-sm font-bold text-rose-100">نشان‌های افتخار و یادبود</h3>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300">
            {unlockedCount} از {badges.length} بازگشایی‌شده
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                badge.isUnlocked
                  ? 'bg-rose-950/40 border-amber-500/40 shadow-md'
                  : 'bg-black/30 border-rose-950/40 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl filter drop-shadow">{badge.icon}</span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-rose-100 truncate">{badge.title}</h4>
                  <p className="text-[10px] text-rose-300/70 leading-tight mt-0.5 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
              {badge.isUnlocked && badge.unlockedAt && (
                <div className="flex items-center gap-1 text-[9px] text-emerald-400 mt-2 font-mono">
                  <CheckCircle className="w-3 h-3" />
                  <span>بازشده در: {badge.unlockedAt}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Game Scores Log */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/20 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-300" />
          <h4 className="text-xs font-bold text-rose-100">تاریخچه رکوردهای بازی‌ها</h4>
        </div>

        {scores.length === 0 ? (
          <p className="text-xs text-rose-300/60 text-center py-4">
            هنوز رکوردی ثبت نشده است. یکی از ۶ بازی عاشقانه را شروع کنید!
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scores.slice(0, 5).map((sc) => (
              <div
                key={sc.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/15 text-xs"
              >
                <div>
                  <span className="font-bold text-rose-200">{sc.gameName}</span>
                  {sc.details && <p className="text-[10px] text-rose-400/80">{sc.details}</p>}
                </div>
                <div className="text-left font-mono">
                  <span className="font-bold text-amber-300">+{sc.score} امتیاز</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
