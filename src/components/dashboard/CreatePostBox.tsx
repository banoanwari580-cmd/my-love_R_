import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Heart,
  Send,
  X,
  Sparkles,
  Camera,
  Loader2,
} from 'lucide-react';
import { store } from '../../services/store';
import { sound } from '../../services/sound';
import { uploadMediaToStorage } from '../../services/firebase';

export const CreatePostBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUser = store.getCurrentUser();

  const handleMediaPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      setMediaType(isVid ? 'video' : 'image');
      setIsUploading(true);

      try {
        const url = await uploadMediaToStorage(file, 'posts');
        setMediaUrl(url);
      } catch {
        const reader = new FileReader();
        reader.onload = () => setMediaUrl(reader.result as string);
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    await store.createPost(content.trim(), mediaUrl || undefined, mediaType);
    setContent('');
    setMediaUrl(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Facebook-style Closed Post Trigger Card */}
      <div className="glass-panel rounded-3xl p-4 border border-rose-500/25 shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-400/50 flex-shrink-0"
          />
          <button
            onClick={() => {
              sound.playTileClick();
              setIsOpen(true);
            }}
            className="flex-1 text-right py-2.5 px-4 rounded-full bg-[#1b072c] hover:bg-[#230a38] border border-rose-500/20 text-xs text-rose-300/70 transition-colors"
          >
            چه چیزی در قلبت می‌گذرد، {currentUser.name.split(' ')[0]}؟
          </button>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between border-t border-rose-500/15 mt-3 pt-2.5 px-2">
          <button
            onClick={() => {
              sound.playTileClick();
              setIsOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-200/90 hover:text-rose-100 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>عکس خاطره</span>
          </button>

          <button
            onClick={() => {
              sound.playTileClick();
              setIsOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-200/90 hover:text-rose-100 transition-colors"
          >
            <Video className="w-4 h-4 text-rose-400" />
            <span>ویدیوی عاشقانه</span>
          </button>

          <button
            onClick={() => {
              sound.playTileClick();
              setIsOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
          >
            <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>حس قلبی</span>
          </button>
        </div>
      </div>

      {/* Expanded Modal to Create Post */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160526] border border-rose-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">ایجاد پست جدید در فید اختصاصی</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-400"
              />
              <div>
                <span className="text-xs font-bold text-rose-100 block">{currentUser.name}</span>
                <span className="text-[10px] text-amber-300 bg-rose-950 px-2 py-0.5 rounded-full border border-amber-500/20">
                  فید اختصاصی دو نفره
                </span>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`چه احساس یا خاطره‌ای در قلبت می‌گذرد، ${currentUser.name}؟`}
              rows={4}
              className="w-full p-3 rounded-2xl bg-[#1d0730] border border-rose-500/30 text-xs sm:text-sm text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400 resize-none leading-relaxed font-serif"
            />

            {/* Media Preview if attached */}
            {mediaUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-rose-400/30 max-h-56 bg-black">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => setMediaUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Media Attachment Action Box */}
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-between">
              <span className="text-xs text-rose-300 font-medium">افزودن به پست:</span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={handleMediaPick}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 rounded-xl bg-[#140422] border border-rose-500/30 text-rose-200 hover:text-white flex items-center gap-1.5 text-xs"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  ) : (
                    <Camera className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{isUploading ? 'آپلود...' : 'عکس یا ویدیو'}</span>
                </button>
              </div>
            </div>

            {/* Publish Button */}
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaUrl) || isUploading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>انتشار پست (+۱۵ قلب)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
