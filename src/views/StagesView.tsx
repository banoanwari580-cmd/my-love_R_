import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle,
  Lock,
  Sparkles,
  Heart,
  ChevronLeft,
  X,
  Award,
  Calendar,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { Stage } from '../types';

export const StagesView: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>(store.getStages());
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [partnerNote, setPartnerNote] = useState('');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'completed'>('all');

  useEffect(() => {
    return store.subscribe(() => {
      setStages(store.getStages());
    });
  }, []);

  const completedCount = stages.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  const handleOpenStage = (stage: Stage) => {
    if (!stage.isUnlocked) {
      sound.playTileClick();
      return;
    }
    sound.playTileClick();
    setSelectedStage(stage);
    setPartnerNote(stage.partnerNotes || '');
  };

  const handleCompleteStage = () => {
    if (!selectedStage) return;
    store.completeStage(selectedStage.id, partnerNote);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24'],
    });
    setSelectedStage(null);
  };

  const filteredStages = stages.filter((s) => {
    if (filter === 'unlocked') return s.isUnlocked && !s.isCompleted;
    if (filter === 'completed') return s.isCompleted;
    return true;
  });

  return (
    <div className="min-h-screen pb-36 px-4 pt-3 max-w-md mx-auto space-y-5">
      {/* Progression Banner */}
      <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 to-amber-300">
                سفر ۳۰ گام دلدادگی
              </h2>
              <p className="text-[11px] text-rose-300/80">پیشرفت مشترک ما در فتح قله عشق</p>
            </div>
          </div>

          <div className="text-left font-mono">
            <span className="text-lg font-extrabold text-amber-300">
              {completedCount}
            </span>
            <span className="text-xs text-rose-300/70">/۳۰</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-rose-950/60 h-2.5 rounded-full overflow-hidden border border-rose-500/20">
          <div
            className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-rose-300/70 mt-1.5 font-medium">
          <span>{progressPercent}% تکمیل شده</span>
          <span>{30 - completedCount} گام تا تاج ابدیت</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'unlocked', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              sound.playTileClick();
              setFilter(tab);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              filter === tab
                ? 'bg-rose-900/60 border-rose-400 text-rose-100 shadow'
                : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70 hover:bg-rose-900/30'
            }`}
          >
            {tab === 'all' ? 'همه (۳۰)' : tab === 'unlocked' ? 'در جریان' : 'تکمیل‌شده'}
          </button>
        ))}
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {filteredStages.map((stage) => {
          const isDone = stage.isCompleted;
          const isUnlocked = stage.isUnlocked;

          return (
            <div
              key={stage.id}
              onClick={() => handleOpenStage(stage)}
              className={`p-4 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 cursor-pointer shadow-md'
                  : isUnlocked
                  ? 'glass-panel border-rose-400/50 cursor-pointer shadow-xl hover:scale-101 active:scale-98'
                  : 'bg-black/40 border-rose-950/40 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator / Number Badge */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 border shadow-inner ${
                      isDone
                        ? 'bg-emerald-600/30 border-emerald-400/50 text-emerald-300'
                        : isUnlocked
                        ? 'bg-gradient-to-tr from-rose-600 to-amber-500 border-amber-400/40 text-white shadow-rose-950/50'
                        : 'bg-rose-950/40 border-rose-900/30 text-rose-500/50'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : isUnlocked ? (
                      <span>{stage.id}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-rose-400/60" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-amber-300/80 font-mono">
                        مرحله {stage.id}
                      </span>
                      {stage.badgeName && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-950 border border-rose-500/30 text-rose-300">
                          {stage.badgeName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-rose-100 truncate mt-0.5">
                      {stage.title}
                    </h3>
                    <p className="text-[11px] text-rose-300/70 truncate">{stage.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                  <div className="text-left font-mono">
                    <span className="text-xs font-bold text-amber-300">
                      +{stage.rewardPoints}
                    </span>
                    <Heart className="w-3 h-3 text-rose-400 inline-block mr-0.5 fill-rose-500" />
                  </div>
                  {isUnlocked && <ChevronLeft className="w-4 h-4 text-rose-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Detail & Mission Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#140523] border border-rose-500/40 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-rose-600/40 border border-rose-400/40 flex items-center justify-center text-xs font-bold text-amber-300">
                  {selectedStage.id}
                </span>
                <span className="text-sm font-bold text-rose-100">{selectedStage.title}</span>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Cover Image */}
            {selectedStage.imageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-rose-500/30 shadow-lg">
                <img
                  src={selectedStage.imageUrl}
                  alt={selectedStage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140523] via-transparent to-transparent" />
                <span className="absolute bottom-2 right-3 text-xs font-semibold text-rose-200">
                  {selectedStage.subtitle}
                </span>
              </div>
            )}

            {/* Story Text */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20">
              <h4 className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>داستان دلدادگی این مرحله:</span>
              </h4>
              <p className="text-xs text-rose-100/90 leading-relaxed text-justify">
                {selectedStage.story}
              </p>
            </div>

            {/* Challenge / Mission */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-900/40 to-purple-950/40 border border-rose-400/30">
              <h4 className="text-xs font-bold text-rose-200 mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>ماموریت و فعالیت تعاملی:</span>
              </h4>
              <p className="text-xs text-rose-200 leading-relaxed">{selectedStage.challenge}</p>
            </div>

            {/* Partner completion notes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-rose-300">
                  یادداشت یا احساس شما از انجام این مرحله:
                </label>
                {selectedStage.partnerNotes && (
                  <button
                    onClick={() => {
                      if (window.confirm('آیا از پاک کردن یادداشت این مرحله اطمینان دارید؟')) {
                        store.deleteStageNotes(selectedStage.id);
                        setPartnerNote('');
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>حذف یادداشت</span>
                  </button>
                )}
              </div>
              <textarea
                value={partnerNote}
                onChange={(e) => setPartnerNote(e.target.value)}
                placeholder="حسی که در این لحظه دارید را برای یادگاری بنویسید..."
                rows={2}
                className="w-full p-3 rounded-2xl bg-rose-950/50 border border-rose-500/20 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* Completion Timestamp if already completed */}
            {selectedStage.isCompleted && selectedStage.completedAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>تکمیل‌شده در تاریخ: {selectedStage.completedAt}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedStage(null)}
                className="flex-1 py-3 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-bold"
              >
                انصراف
              </button>

              <button
                onClick={handleCompleteStage}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <CheckCircle className="w-4 h-4" />
                <span>
                  {selectedStage.isCompleted
                    ? 'بروزرسانی یادداشت'
                    : `تکمیل و بازگشایی مرحله بعد (+${selectedStage.rewardPoints} قلب)`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
