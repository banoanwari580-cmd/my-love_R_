import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Eye,
  Clock,
  X,
  Sparkles,
  Camera,
  Video,
  Calendar,
} from 'lucide-react';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { Story } from '../types';

export const StoriesView: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(store.getActiveStories());
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState<string | null>(null);
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const currentUser = store.getCurrentUser();

  useEffect(() => {
    return store.subscribe(() => {
      setStories(store.getActiveStories());
    });
  }, []);

  const openStory = (idx: number) => {
    sound.playTileClick();
    setActiveStoryIdx(idx);
    const story = stories[idx];
    if (story) {
      store.recordStoryView(story.id);
    }
  };

  const handleHeartStory = (storyId: string) => {
    store.heartStory(storyId);
  };

  const handleNextStory = () => {
    if (activeStoryIdx !== null && activeStoryIdx + 1 < stories.length) {
      openStory(activeStoryIdx + 1);
    } else {
      setActiveStoryIdx(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIdx !== null && activeStoryIdx > 0) {
      openStory(activeStoryIdx - 1);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setNewMediaType(isVid ? 'video' : 'image');

      const reader = new FileReader();
      reader.onload = () => {
        setNewMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishStory = () => {
    if (!newMediaUrl) return;
    store.addStory(newMediaUrl, newMediaType, caption.trim() || undefined);
    setNewMediaUrl(null);
    setCaption('');
    setShowAddModal(false);
  };

  const calculateRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'منقضی شده';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعت و ${minutes} دقیقه`;
  };

  const activeStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;

  return (
    <div className="space-y-4">
      {/* Stories Circular Preview Reel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1 no-scrollbar">
        {/* Add story button */}
        <div
          onClick={() => {
            sound.playTileClick();
            setShowAddModal(true);
          }}
          className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <div className="relative w-16 h-16 rounded-full p-0.5 border-2 border-dashed border-rose-400/60 flex items-center justify-center bg-rose-950/40 hover:bg-rose-900/40 transition-colors">
            <img
              src={currentUser.avatar}
              alt="My Avatar"
              className="w-full h-full rounded-full object-cover opacity-80"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 border border-[#0f031b] flex items-center justify-center text-white">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[10px] text-rose-200 font-medium">استوری جدید</span>
        </div>

        {/* Existing active stories */}
        {stories.map((story, idx) => {
          const isViewed = story.viewers.some((v) => v.userId === currentUser.role);

          return (
            <div
              key={story.id}
              onClick={() => openStory(idx)}
              className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <div
                className={`w-16 h-16 rounded-full p-0.5 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                  isViewed
                    ? 'border-2 border-rose-500/40'
                    : 'bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-md shadow-rose-950/60'
                }`}
              >
                <div className="w-full h-full rounded-full p-0.5 bg-[#0f031b]">
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[10px] text-rose-200/90 max-w-[64px] truncate font-medium">
                {story.authorName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Immersive Story Viewer */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 animate-in fade-in">
          {/* Top Story Progress Bar Segments */}
          <div className="flex gap-1.5 pt-2">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx < (activeStoryIdx ?? 0)
                      ? 'w-full'
                      : idx === activeStoryIdx
                      ? 'w-full animate-pulse'
                      : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Top Author Bar */}
          <div className="flex items-center justify-between mt-3 text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={activeStory.authorAvatar}
                alt={activeStory.authorName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-400"
              />
              <div>
                <h4 className="text-xs font-bold">{activeStory.authorName}</h4>
                <div className="flex items-center gap-1 text-[10px] text-white/70">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>انقضا تا {calculateRemainingTime(activeStory.expiresAt)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveStoryIdx(null)}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Story Media (Image or Video) */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            {activeStory.mediaType === 'video' ? (
              <video
                src={activeStory.mediaUrl}
                autoPlay
                playsInline
                loop
                className="max-h-[70vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
              />
            ) : (
              <img
                src={activeStory.mediaUrl}
                alt="Story Content"
                className="max-h-[70vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
              />
            )}

            {/* Tap left / right navigate */}
            <div onClick={handlePrevStory} className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer" />
            <div onClick={handleNextStory} className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer" />
          </div>

          {/* Bottom Caption & Interactive Reactions */}
          <div className="space-y-3 pb-safe">
            {activeStory.caption && (
              <p className="text-xs sm:text-sm text-center text-white/90 bg-black/50 p-3 rounded-2xl backdrop-blur-md">
                {activeStory.caption}
              </p>
            )}

            <div className="flex items-center justify-between px-2">
              {/* Eye Viewers Button */}
              <button
                onClick={() => setShowViewersModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs border border-white/20 transition-colors"
              >
                <Eye className="w-4 h-4 text-rose-300" />
                <span>{activeStory.viewers.length} بازدید</span>
              </button>

              {/* Heart reaction button */}
              <button
                onClick={() => handleHeartStory(activeStory.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md text-white text-xs font-bold shadow-lg shadow-rose-950 active:scale-95 transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    activeStory.likedBy.includes(currentUser.role) ? 'fill-white' : ''
                  }`}
                />
                <span>{activeStory.heartsCount}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewers Details Sheet Modal */}
      {showViewersModal && activeStory && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160626] border border-rose-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">فهرست بینندگان این استوری</h3>
              </div>
              <button
                onClick={() => setShowViewersModal(false)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeStory.viewers.length === 0 ? (
              <p className="text-xs text-rose-300/70 text-center py-6">
                هنوز بازدیدی برای این استوری ثبت نشده است.
              </p>
            ) : (
              <div className="space-y-2.5">
                {activeStory.viewers.map((viewer, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/40 border border-rose-500/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-600/40 border border-rose-400/40 flex items-center justify-center text-xs text-amber-200">
                        ❤️
                      </div>
                      <span className="text-xs font-bold text-rose-100">{viewer.userName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-rose-300/80 font-mono">
                      <Calendar className="w-3 h-3 text-amber-300" />
                      <span>{new Date(viewer.viewedAt).toLocaleTimeString('fa-IR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">ارسال استوری ۱۲ ساعته</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Upload Area */}
            {newMediaUrl ? (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-rose-400/40 bg-black">
                {newMediaType === 'video' ? (
                  <video src={newMediaUrl} autoPlay playsInline loop className="w-full h-full object-cover" />
                ) : (
                  <img src={newMediaUrl} alt="Story upload" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => setNewMediaUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 cursor-pointer p-4 transition-colors">
                <div className="flex gap-2 mb-2">
                  <Camera className="w-8 h-8 text-rose-400/80" />
                  <Video className="w-8 h-8 text-amber-400/80" />
                </div>
                <span className="text-xs font-bold text-rose-200">انتخاب عکس یا ویدیوی استوری</span>
                <span className="text-[10px] text-rose-300/60 mt-1">این استوری پس از ۱۲ ساعت منقضی خواهد شد</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">متن یا کپشن استوری:</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="جمله قشنگ امروز برای عشقت..."
                className="w-full p-3 rounded-2xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              onClick={handlePublishStory}
              disabled={!newMediaUrl}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-xl active:scale-95 disabled:opacity-40 transition-all"
            >
              انتشار استوری ۱۲ ساعته (+۲۰ قلب)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
