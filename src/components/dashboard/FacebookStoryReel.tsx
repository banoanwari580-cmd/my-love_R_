import React, { useState, useEffect } from 'react';
import { Plus, Eye, Clock, Heart, Camera, Video, Sparkles, X } from 'lucide-react';
import { store } from '../../services/store';
import { sound } from '../../services/sound';
import { uploadMediaToStorage } from '../../services/firebase';
import { Story } from '../../types';

interface FacebookStoryReelProps {
  onOpenStoryViewer: (index: number) => void;
}

export const FacebookStoryReel: React.FC<FacebookStoryReelProps> = ({ onOpenStoryViewer }) => {
  const [stories, setStories] = useState<Story[]>(store.getActiveStories());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState<string | null>(null);
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const currentUser = store.getCurrentUser();

  useEffect(() => {
    return store.subscribe(() => {
      setStories(store.getActiveStories());
    });
  }, []);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setNewMediaType(isVid ? 'video' : 'image');
      setIsUploading(true);

      try {
        const url = await uploadMediaToStorage(file, 'stories');
        setNewMediaUrl(url);
      } catch {
        const reader = new FileReader();
        reader.onload = () => setNewMediaUrl(reader.result as string);
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handlePublishStory = () => {
    if (!newMediaUrl) return;
    store.addStory(newMediaUrl, newMediaType, caption.trim() || undefined);
    setNewMediaUrl(null);
    setCaption('');
    setShowAddModal(false);
  };

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'منقضی';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}س`;
  };

  return (
    <div className="py-2">
      {/* Horizontal Facebook Story Cards Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 px-1 no-scrollbar">
        {/* Card 1: Add Story (Facebook style with user cover & bottom plus button) */}
        <div
          onClick={() => {
            sound.playTileClick();
            setShowAddModal(true);
          }}
          className="relative w-28 h-44 rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-rose-500/30 bg-[#160626] shadow-lg group active:scale-95 transition-all flex flex-col justify-between"
        >
          {/* Top user profile photo */}
          <div className="h-28 w-full overflow-hidden bg-rose-950/40 relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Plus icon emblem */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 border-2 border-[#160626] flex items-center justify-center text-white shadow-md z-10">
            <Plus className="w-4 h-4" />
          </div>

          {/* Bottom text */}
          <div className="p-2 pt-4 text-center">
            <span className="text-[11px] font-bold text-rose-100 block">افزودن استوری</span>
            <span className="text-[9px] text-rose-300/70">۱۲ ساعته</span>
          </div>
        </div>

        {/* Story Cards */}
        {stories.map((story, idx) => {
          const isViewed = story.viewers.some((v) => v.userId === currentUser.role);

          return (
            <div
              key={story.id}
              onClick={() => onOpenStoryViewer(idx)}
              className="relative w-28 h-44 rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 border border-rose-500/25 shadow-lg group active:scale-95 transition-all"
            >
              {/* Story media background */}
              {story.mediaType === 'video' ? (
                <video
                  src={story.mediaUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={story.mediaUrl}
                  alt={story.authorName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />

              {/* Top-Right: Author Avatar with Facebook-style glowing ring */}
              <div className="absolute top-2.5 right-2.5">
                <div
                  className={`w-9 h-9 rounded-full p-0.5 shadow-md ${
                    isViewed
                      ? 'border-2 border-slate-400'
                      : 'bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5'
                  }`}
                >
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-full h-full rounded-full object-cover border border-black"
                  />
                </div>
              </div>

              {/* Top-Left: Time remaining pill */}
              <div className="absolute top-2.5 left-2 px-1.5 py-0.5 rounded-full bg-black/60 border border-white/20 text-[9px] text-amber-200 font-mono flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-amber-300" />
                <span>{formatTimeLeft(story.expiresAt)}</span>
              </div>

              {/* Bottom: Author name and live view counter */}
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="text-[11px] font-bold block truncate shadow-sm">
                  {story.authorName}
                </span>
                <div className="flex items-center justify-between text-[9px] text-white/80 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3 text-rose-300" />
                    {story.viewers.length}
                  </span>
                  <span className="flex items-center gap-0.5 text-rose-300 font-bold">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    {story.heartsCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Story Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">ارسال استوری فیسبوکی ۱۲ ساعته</h3>
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
                <span className="text-xs font-bold text-rose-200">
                  {isUploading ? 'در حال آپلود...' : 'انتخاب عکس یا ویدیوی استوری'}
                </span>
                <span className="text-[10px] text-rose-300/60 mt-1">این استوری پس از ۱۲ ساعت منقضی خواهد شد</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  disabled={isUploading}
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
                placeholder="جمله قشنگ برای عشقت بنویس..."
                className="w-full p-3 rounded-2xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              onClick={handlePublishStory}
              disabled={!newMediaUrl || isUploading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-xl active:scale-95 disabled:opacity-40 transition-all"
            >
              انتشار استوری (+۲۰ قلب)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
