import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit3,
  BookmarkCheck,
  Send,
  Sparkles,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../../services/store';
import { sound } from '../../services/sound';
import { Post, ReactionType } from '../../types';

interface PostCardProps {
  post: Post;
}

const REACTION_ICONS: Record<ReactionType, { emoji: string; label: string }> = {
  love: { emoji: '❤️', label: 'عشق' },
  adore: { emoji: '😍', label: 'شیفته' },
  kiss: { emoji: '😘', label: 'بوسه' },
  fire: { emoji: '🔥', label: 'پرشور' },
  eternity: { emoji: '💍', label: 'ابدی' },
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [savedToMemories, setSavedToMemories] = useState(false);

  const currentUser = store.getCurrentUser();
  const currentRole = store.getCurrentRole();
  const isAuthor = post.authorId === currentRole;

  const userReaction = post.reactions.find((r) => r.userId === currentRole);

  const handleReactionSelect = (type: ReactionType) => {
    store.addReactionToPost(post.id, type);
    setShowReactionsMenu(false);
  };

  const handleToggleLike = () => {
    handleReactionSelect('love');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    store.addCommentToPost(post.id, commentText.trim(), replyToId);
    setCommentText('');
    setReplyingToName(null);
    setReplyToId(undefined);
  };

  const handleSaveToMemories = () => {
    sound.playVictoryFanfare();
    store.addMemory({
      title: post.content.substring(0, 30) || 'پست خاطره فید',
      description: post.content,
      imageUrl: post.mediaUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
      date: new Date(post.createdAt).toLocaleDateString('fa-IR'),
      category: 'لحظه‌های خاص',
    });

    setSavedToMemories(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setSavedToMemories(false), 2500);
  };

  const handleUpdate = () => {
    if (!editContent.trim()) return;
    store.updatePost(post.id, editContent.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('آیا از حذف این پست اطمینان دارید؟')) {
      store.deletePost(post.id);
    }
  };

  const formatPostTime = (iso: string) => {
    try {
      const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
      if (diffMin < 1) return 'همین الان';
      if (diffMin < 60) return `${diffMin} دقیقه پیش`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} ساعت پیش`;
      return new Date(iso).toLocaleDateString('fa-IR');
    } catch {
      return '';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-rose-500/25 shadow-xl space-y-3.5 transition-all">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-400/60"
          />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-100 flex items-center gap-1">
              {post.authorName}
              <Sparkles className="w-3 h-3 text-amber-300" />
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-rose-300/70 font-mono">
              <Calendar className="w-3 h-3 text-rose-400" />
              <span>{formatPostTime(post.createdAt)}</span>
              {post.updatedAt && <span className="text-amber-300">(ویرایش شده)</span>}
            </div>
          </div>
        </div>

        {/* Post Options Menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full text-rose-300/70 hover:text-white hover:bg-rose-900/30 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute left-0 mt-1 w-36 glass-panel rounded-2xl p-1.5 border border-rose-500/30 shadow-xl z-20 animate-in fade-in">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full p-2 text-right text-xs text-rose-200 hover:bg-rose-900/40 rounded-xl flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش پست</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full p-2 text-right text-xs text-rose-400 hover:bg-rose-900/40 rounded-xl flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف پست</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Text / Edit mode */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl bg-[#1a062b] border border-rose-500/40 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 rounded-xl text-xs text-rose-300"
            >
              انصراف
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow"
            >
              ذخیره ویرایش
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-rose-100 leading-relaxed font-serif whitespace-pre-wrap select-text">
          {post.content}
        </p>
      )}

      {/* Post Media (Image or Video) */}
      {post.mediaUrl && (
        <div className="rounded-2xl overflow-hidden border border-rose-500/20 max-h-96 w-full bg-black flex items-center justify-center">
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls playsInline className="w-full max-h-96 object-contain" />
          ) : (
            <img src={post.mediaUrl} alt="Post Media" className="w-full max-h-96 object-cover" />
          )}
        </div>
      )}

      {/* Counts Summary Bar */}
      <div className="flex items-center justify-between text-[11px] text-rose-300/80 px-1 pt-1">
        <div className="flex items-center gap-1.5">
          {post.reactions.length > 0 && (
            <div className="flex items-center -space-x-1">
              {Array.from(new Set(post.reactions.map((r) => r.type)))
                .slice(0, 3)
                .map((t) => (
                  <span key={t} className="text-sm">
                    {REACTION_ICONS[t].emoji}
                  </span>
                ))}
              <span className="font-mono font-bold mr-1.5 text-amber-300">
                {post.reactions.length} واکنش
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline text-rose-300/80"
          >
            {post.comments.length} نظر
          </button>
        </div>
      </div>

      {/* Action Buttons Bar (Facebook style) */}
      <div className="relative border-t border-b border-rose-500/15 py-1.5 flex items-center justify-around">
        {/* Floating Facebook Reactions Popup Menu */}
        {showReactionsMenu && (
          <div className="absolute -top-12 right-2 flex items-center gap-2 p-1.5 rounded-full bg-[#1b062c] border border-rose-400/40 shadow-2xl z-30 animate-in zoom-in-95">
            {(['love', 'adore', 'kiss', 'fire', 'eternity'] as ReactionType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleReactionSelect(type)}
                className="text-xl hover:scale-130 active:scale-95 transition-transform p-1"
                title={REACTION_ICONS[type].label}
              >
                {REACTION_ICONS[type].emoji}
              </button>
            ))}
          </div>
        )}

        {/* Reaction Button */}
        <button
          onClick={handleToggleLike}
          onMouseEnter={() => setShowReactionsMenu(true)}
          className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${
            userReaction
              ? 'text-rose-400 bg-rose-950/40'
              : 'text-rose-300/70 hover:text-white hover:bg-rose-900/30'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${userReaction ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{userReaction ? REACTION_ICONS[userReaction.type].label : 'عشق'}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300/70 hover:text-white hover:bg-rose-900/30 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>نظر</span>
        </button>

        {/* Save to Memories / Share */}
        <button
          onClick={handleSaveToMemories}
          className="flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300/70 hover:text-amber-300 hover:bg-rose-900/30 transition-colors"
        >
          {savedToMemories ? (
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4 text-amber-400" />
          )}
          <span>{savedToMemories ? 'در خاطرات ذخیره شد' : 'ثبت در خاطرات'}</span>
        </button>
      </div>

      {/* Comments Drawer Section */}
      {showComments && (
        <div className="space-y-3 pt-2">
          {/* Comments List */}
          {post.comments.length > 0 && (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {post.comments.map((comm) => (
                <div key={comm.id} className="flex items-start gap-2.5">
                  <img
                    src={comm.authorAvatar}
                    alt={comm.authorName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-400/50 mt-0.5"
                  />
                  <div className="flex-1 bg-[#1a072c] border border-rose-500/20 rounded-2xl p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-200">
                        {comm.authorName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-rose-400/70 font-mono">
                          {formatPostTime(comm.createdAt)}
                        </span>
                        {comm.authorId === currentRole && (
                          <div className="flex items-center gap-1 mr-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(comm.id);
                                setEditingCommentText(comm.text);
                              }}
                              className="text-rose-400/60 hover:text-amber-300 p-0.5"
                              title="ویرایش نظر"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('آیا از حذف این نظر اطمینان دارید؟')) {
                                  store.deleteCommentFromPost(post.id, comm.id);
                                }
                              }}
                              className="text-rose-400/60 hover:text-rose-400 p-0.5"
                              title="حذف نظر"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingCommentId === comm.id ? (
                      <div className="mt-1.5 space-y-1.5">
                        <input
                          type="text"
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-xl bg-black/40 border border-rose-400/40 text-rose-100 focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            className="px-2 py-0.5 rounded-lg text-rose-300/70 hover:text-white"
                          >
                            انصراف
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCommentText.trim()) {
                                store.updateCommentInPost(post.id, comm.id, editingCommentText);
                                setEditingCommentId(null);
                              }
                            }}
                            className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold"
                          >
                            ذخیره
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-rose-100/90 mt-1 select-text">{comm.text}</p>
                        <button
                          onClick={() => {
                            setReplyingToName(comm.authorName);
                            setReplyToId(comm.id);
                          }}
                          className="text-[10px] text-amber-300/80 hover:underline mt-1 block"
                        >
                          پاسخ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Input Form */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-rose-400/50 flex-shrink-0"
            />
            <div className="flex-1 relative">
              {replyingToName && (
                <div className="text-[9px] text-amber-300 px-2 py-0.5 flex items-center justify-between">
                  <span>در پاسخ به {replyingToName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToName(null);
                      setReplyToId(undefined);
                    }}
                    className="text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="یک جمله عاشقانه بنویس..."
                className="w-full py-2 px-3 pl-8 rounded-full bg-[#1c082e] border border-rose-500/25 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute left-2.5 top-2.5 text-rose-400 hover:text-white disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
