import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Plus,
  Heart,
  CheckCheck,
  Calendar,
  X,
  Sparkles,
  Scroll,
  Edit3,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { LoveLetter } from '../types';

export const LettersView: React.FC = () => {
  const [letters, setLetters] = useState<LoveLetter[]>(store.getLetters());
  const [activeLetter, setActiveLetter] = useState<LoveLetter | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Compose State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [paperTheme, setPaperTheme] = useState<LoveLetter['paperTheme']>('gold');

  // Edit State
  const [editingLetter, setEditingLetter] = useState<LoveLetter | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPaperTheme, setEditPaperTheme] = useState<LoveLetter['paperTheme']>('gold');

  const currentUser = store.getCurrentUser();

  useEffect(() => {
    return store.subscribe(() => {
      setLetters(store.getLetters());
    });
  }, []);

  const receivedLetters = letters.filter((l) => l.receiverId === currentUser.role);
  const sentLetters = letters.filter((l) => l.senderId === currentUser.role);
  const displayedLetters = activeTab === 'received' ? receivedLetters : sentLetters;

  const handleOpenLetter = (letter: LoveLetter) => {
    sound.playTileClick();
    if (letter.isSealed && letter.receiverId === currentUser.role) {
      store.unsealLetter(letter.id);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e'],
      });
    }
    setActiveLetter(letter);
  };

  const handleDeleteLetter = (letterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('آیا از حذف این نامه عاشقانه اطمینان دارید؟ این عمل غیرقابل بازگشت است.')) return;
    sound.playTileClick();
    store.deleteLetter(letterId);
    if (activeLetter?.id === letterId) setActiveLetter(null);
    if (editingLetter?.id === letterId) setEditingLetter(null);
  };

  const handleOpenEdit = (letter: LoveLetter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playTileClick();
    setEditingLetter(letter);
    setEditTitle(letter.title);
    setEditContent(letter.content);
    setEditPaperTheme(letter.paperTheme);
  };

  const handleSaveEdit = () => {
    if (!editingLetter || !editTitle.trim() || !editContent.trim()) return;
    store.updateLetter(editingLetter.id, editTitle, editContent, editPaperTheme);
    if (activeLetter?.id === editingLetter.id) {
      setActiveLetter({
        ...activeLetter,
        title: editTitle.trim(),
        content: editContent.trim(),
        paperTheme: editPaperTheme,
      });
    }
    setEditingLetter(null);
  };

  const handleSendLetter = () => {
    if (!title.trim() || !content.trim()) return;
    store.sendLetter(title.trim(), content.trim(), paperTheme);
    setTitle('');
    setContent('');
    setShowComposeModal(false);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24'],
    });
  };

  const getThemeStyle = (theme: LoveLetter['paperTheme']) => {
    switch (theme) {
      case 'parchment':
        return 'bg-[#2a1a10] border-amber-700/50 text-[#fde68a]';
      case 'rose':
        return 'bg-gradient-to-br from-[#2d091e] to-[#1a0513] border-rose-500/40 text-rose-100';
      case 'night':
        return 'bg-gradient-to-br from-[#0c051a] to-[#04010a] border-purple-500/40 text-purple-100';
      case 'gold':
      default:
        return 'bg-gradient-to-br from-[#251706] to-[#140b02] border-amber-500/50 text-amber-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-100 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-amber-300" />
            <span>صندوقچه نامه‌های سر به مهر</span>
          </h3>
          <p className="text-[11px] text-rose-300/70">کلمات عاشقانه که تا ابد باقی می‌مانند</p>
        </div>

        <button
          onClick={() => {
            sound.playTileClick();
            setShowComposeModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>نگارش نامه</span>
        </button>
      </div>

      {/* Received / Sent Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            sound.playTileClick();
            setActiveTab('received');
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            activeTab === 'received'
              ? 'bg-rose-900/60 border-rose-400 text-rose-100 shadow'
              : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70 hover:bg-rose-900/30'
          }`}
        >
          نامه‌های دریافتی ({receivedLetters.length})
        </button>
        <button
          onClick={() => {
            sound.playTileClick();
            setActiveTab('sent');
          }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            activeTab === 'sent'
              ? 'bg-rose-900/60 border-rose-400 text-rose-100 shadow'
              : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70 hover:bg-rose-900/30'
          }`}
        >
          نامه‌های ارسالی من ({sentLetters.length})
        </button>
      </div>

      {/* Letters List */}
      {displayedLetters.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-3xl p-6 border border-rose-500/20">
          <Scroll className="w-10 h-10 text-rose-400/40 mx-auto mb-2" />
          <p className="text-xs text-rose-300/70">هنوز نامه‌ای در این بخش ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedLetters.map((letter) => {
            const isUnopened = letter.isSealed && letter.receiverId === currentUser.role;

            return (
              <div
                key={letter.id}
                onClick={() => handleOpenLetter(letter)}
                className={`p-4 rounded-3xl border cursor-pointer shadow-lg active:scale-98 transition-all duration-300 relative overflow-hidden group ${
                  isUnopened
                    ? 'glass-gold border-amber-400/60 shadow-amber-950/50 animate-pulse'
                    : 'glass-panel border-rose-500/20 hover:border-rose-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Wax Stamp Emblem */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md border ${
                        isUnopened
                          ? 'bg-gradient-to-tr from-amber-600 via-rose-600 to-amber-400 border-amber-300 text-white animate-bounce'
                          : 'bg-rose-950/50 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {isUnopened ? (
                        <span className="text-xs font-bold font-serif">مهر</span>
                      ) : (
                        <Mail className="w-5 h-5 text-amber-300" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-300/80">از: {letter.senderName}</span>
                        {isUnopened && (
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                            سر به مهر (جدید)
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-rose-100 truncate mt-0.5 group-hover:text-amber-200 transition-colors">
                        {letter.title}
                      </h4>
                      <p className="text-[11px] text-rose-300/60 truncate mt-0.5">
                        {letter.content.substring(0, 45)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 mr-2">
                    <span className="text-[10px] text-rose-400/80 font-mono">
                      {new Date(letter.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!letter.isSealed && (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {letter.senderId === currentUser.role && (
                        <>
                          <button
                            onClick={(e) => handleOpenEdit(letter, e)}
                            title="ویرایش نامه"
                            className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteLetter(letter.id, e)}
                            title="حذف نامه"
                            className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Open Letter Modal (Unfolding Wax Sealed Paper) */}
      {activeLetter && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 max-h-[85vh] overflow-y-auto ${getThemeStyle(
              activeLetter.paperTheme
            )}`}
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-3 border-b border-current/20">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-500 animate-pulse" />
                <span className="text-sm font-bold">{activeLetter.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {activeLetter.senderId === currentUser.role && (
                  <>
                    <button
                      onClick={() => handleOpenEdit(activeLetter)}
                      title="ویرایش این نامه"
                      className="p-1.5 rounded-full hover:bg-black/20 text-amber-300 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLetter(activeLetter.id)}
                      title="حذف این نامه"
                      className="p-1.5 rounded-full hover:bg-black/20 text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveLetter(null)}
                  className="p-1 rounded-full hover:bg-black/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Letter Metadata */}
            <div className="flex items-center justify-between text-[11px] opacity-75">
              <span>نویسنده: {activeLetter.senderName}</span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3" />
                {new Date(activeLetter.createdAt).toLocaleDateString('fa-IR')}
              </span>
            </div>

            {/* Letter Content - Romantic Calligraphy Vibe */}
            <div className="p-4 rounded-2xl bg-black/20 border border-current/15 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-serif text-justify min-h-[160px]">
              {activeLetter.content}
            </div>

            <div className="text-center pt-2">
              <span className="text-xs opacity-60">My Love Razma ❤️ تا ابدیت و فراتر از آن</span>
            </div>
          </div>
        </div>
      )}

      {/* Compose Letter Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">نگارش نامه سر به مهر</h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">عنوان نامه:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="سوگند قلبی، برای ملکه رویاهایم..."
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">تم کاغذ نامه:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gold', name: 'زرین سلطنتی' },
                  { id: 'rose', name: 'رز ارغوانی' },
                  { id: 'parchment', name: 'پاپیروس کهن' },
                  { id: 'night', name: 'شب ستاره‌باران' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setPaperTheme(th.id as LoveLetter['paperTheme'])}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                      paperTheme === th.id
                        ? 'border-amber-400 bg-rose-900/60 text-amber-300 shadow'
                        : 'border-rose-500/20 bg-rose-950/20 text-rose-300/70 hover:bg-rose-900/30'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">متن نامه:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="تمام احساسات، کلمات عاشقانه و رازهای قلبی‌ات را در اینجا بنویس..."
                rows={6}
                className="w-full p-3 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400 leading-relaxed font-serif"
              />
            </div>

            <button
              onClick={handleSendLetter}
              disabled={!title.trim() || !content.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-xl active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>مهر و موم و ارسال نامه (+۵۰ قلب)</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Letter Modal */}
      {editingLetter && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160626] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">ویرایش نامه سر به مهر</h3>
              </div>
              <button
                onClick={() => setEditingLetter(null)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">عنوان نامه:</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">تم کاغذ نامه:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gold', name: 'زرین سلطنتی' },
                  { id: 'rose', name: 'رز ارغوانی' },
                  { id: 'parchment', name: 'پاپیروس کهن' },
                  { id: 'night', name: 'شب ستاره‌باران' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setEditPaperTheme(th.id as LoveLetter['paperTheme'])}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                      editPaperTheme === th.id
                        ? 'border-amber-400 bg-rose-900/60 text-amber-300 shadow'
                        : 'border-rose-500/20 bg-rose-950/20 text-rose-300/70 hover:bg-rose-900/30'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">متن نامه:</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-amber-400 leading-relaxed font-serif"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || !editContent.trim()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs shadow-xl active:scale-95 disabled:opacity-40 transition-all"
              >
                ذخیره تغییرات نامه
              </button>
              <button
                onClick={() => setEditingLetter(null)}
                className="px-4 py-3 rounded-2xl bg-white/10 text-rose-200 text-xs font-bold hover:bg-white/15"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
