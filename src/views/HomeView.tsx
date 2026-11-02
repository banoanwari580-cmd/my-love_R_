import React, { useState, useEffect } from 'react';
import {
  Compass,
  Gamepad2,
  Mail,
  Image as ImageIcon,
  Heart,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { FacebookStoryReel } from '../components/dashboard/FacebookStoryReel';
import { CreatePostBox } from '../components/dashboard/CreatePostBox';
import { PostCard } from '../components/dashboard/PostCard';
import { ROMANTIC_QUOTES } from '../data/initialData';
import { Post } from '../types';

interface HomeViewProps {
  searchFilter?: string;
  onOpenStoryViewer: (index: number) => void;
  onOpenStages: () => void;
  onOpenGames: () => void;
  onOpenLetters: () => void;
  onOpenMemories: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  searchFilter = '',
  onOpenStoryViewer,
  onOpenStages,
  onOpenGames,
  onOpenLetters,
  onOpenMemories,
}) => {
  const [posts, setPosts] = useState<Post[]>(store.getPosts());
  const [relationship, setRelationship] = useState(store.getRelationship());
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [heartBeats, setHeartBeats] = useState(0);

  useEffect(() => {
    return store.subscribe(() => {
      setPosts(store.getPosts());
      setRelationship(store.getRelationship());
    });
  }, []);

  const calculateDaysTogether = () => {
    const start = new Date(relationship.startDate).getTime();
    const diff = Math.max(0, Date.now() - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleHeartBeat = () => {
    sound.playHeartPop();
    setHeartBeats((prev) => prev + 1);
    confetti({
      particleCount: 20,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24'],
    });

    if (heartBeats > 0 && heartBeats % 10 === 0) {
      sound.playVictoryFanfare();
      store.recordGameScore('heart-catcher', 'تپش قلب عاشقانه', 10, '۱۰ تپش برای عشق من');
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (!searchFilter.trim()) return true;
    const query = searchFilter.toLowerCase().trim();
    return (
      p.content.toLowerCase().includes(query) ||
      p.authorName.toLowerCase().includes(query) ||
      p.comments.some((c) => c.text.toLowerCase().includes(query))
    );
  });

  const completedStages = store.getStages().filter((s) => s.isCompleted).length;

  return (
    <div className="pb-36 px-3 sm:px-4 pt-2 max-w-md mx-auto space-y-3.5">
      {/* 1. Facebook-style Stories Horizontal Strip */}
      <FacebookStoryReel onOpenStoryViewer={onOpenStoryViewer} />

      {/* 2. Facebook-style Create Post Box */}
      <CreatePostBox />

      {/* 3. Romantic Love Widget Strip (Days Counter & Interactive Beating Heart) */}
      <div className="glass-panel rounded-3xl p-3 px-4 border border-rose-500/20 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            onClick={handleHeartBeat}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-950/60 cursor-pointer active:scale-90 transition-transform flex-shrink-0 animate-pulse"
          >
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-[10px] text-amber-300 font-bold block">روزهای دلدادگی ما</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-rose-100">
              <span className="text-amber-300">{calculateDaysTogether()}</span>
              <span className="text-[11px] font-normal text-rose-300/80">روز در کنار هم</span>
            </div>
          </div>
        </div>

        {/* Quick App Modules Toggle Drawer Button */}
        <button
          onClick={() => {
            sound.playTileClick();
            setShowShortcuts(!showShortcuts);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-[11px] text-rose-200 font-bold transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-amber-300" />
          <span>امکانات ویژه</span>
          {showShortcuts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 4. Expandable Quick Modules Drawer (Stages, Games, Letters, Memories) */}
      {showShortcuts && (
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-3xl bg-[#140422] border border-rose-500/30 shadow-2xl animate-in zoom-in-95">
          <button
            onClick={onOpenStages}
            className="p-3 rounded-2xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/20 flex items-center gap-2.5 text-right transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-100 block">۳۰ مرحله</span>
              <span className="text-[10px] text-amber-300/80 font-mono">{completedStages} از ۳۰ مرحله</span>
            </div>
          </button>

          <button
            onClick={onOpenGames}
            className="p-3 rounded-2xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/20 flex items-center gap-2.5 text-right transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-100 block">۶ بازی دونفره</span>
              <span className="text-[10px] text-rose-300/70">کوییز، پازل و...</span>
            </div>
          </button>

          <button
            onClick={onOpenLetters}
            className="p-3 rounded-2xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/20 flex items-center gap-2.5 text-right transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600/30 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-100 block">نامه‌های مهر و موم</span>
              <span className="text-[10px] text-amber-300/80">کاغذ پوستی</span>
            </div>
          </button>

          <button
            onClick={onOpenMemories}
            className="p-3 rounded-2xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/20 flex items-center gap-2.5 text-right transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-pink-600/30 border border-pink-400/30 flex items-center justify-center text-pink-300">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-100 block">آلبوم خاطرات</span>
              <span className="text-[10px] text-rose-300/70">گالری عکس و فیلم</span>
            </div>
          </button>
        </div>
      )}

      {/* 5. Facebook-style Main Feed */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center text-xs text-rose-300/70 border border-rose-500/20 space-y-2">
            <Heart className="w-8 h-8 text-rose-400/40 mx-auto" />
            <p>پستی یافت نشد. اولین خاطره یا دلنوشته را در کادر بالا منتشر کنید!</p>
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
