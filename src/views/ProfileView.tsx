import React, { useState, useEffect } from 'react';
import {
  Heart,
  Camera,
  Edit3,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Grid,
  FileText,
  User,
  X,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { PostCard } from '../components/dashboard/PostCard';
import { UserRole } from '../types';

export const ProfileView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [partnerUser, setPartnerUser] = useState(store.getPartnerUser());
  const [relationship, setRelationship] = useState(store.getRelationship());
  const [viewRole, setViewRole] = useState<UserRole>(store.getCurrentRole());
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'relationship'>('posts');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editCover, setEditCover] = useState(currentUser.coverImage || '');

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setPartnerUser(store.getPartnerUser());
      setRelationship(store.getRelationship());
    });
  }, []);

  const profile = viewRole === store.getCurrentRole() ? currentUser : partnerUser;
  const isOwner = viewRole === store.getCurrentRole();

  const userPosts = store.getPosts().filter((p) => p.authorId === viewRole);
  const userMemories = store.getMemories().filter((m) => m.authorId === viewRole);

  const calculateDaysTogether = () => {
    const start = new Date(relationship.startDate).getTime();
    const diff = Math.max(0, Date.now() - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleSaveProfile = () => {
    sound.playVictoryFanfare();
    store.updateProfile(store.getCurrentRole(), {
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar,
      coverImage: editCover,
    });
    setIsEditingProfile(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setEditCover(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-36 max-w-md mx-auto space-y-4">
      {/* Profile Selector Strip (View My Profile or Partner's Profile) */}
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={() => {
            sound.playTileClick();
            setViewRole(currentUser.role);
          }}
          className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            viewRole === currentUser.role
              ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white border-transparent shadow-lg'
              : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>پروفایل من</span>
        </button>

        <button
          onClick={() => {
            sound.playTileClick();
            setViewRole(partnerUser.role);
          }}
          className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            viewRole === partnerUser.role
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-transparent shadow-lg'
              : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          <span>پروفایل {partnerUser.name.split(' ')[0]}</span>
        </button>
      </div>

      {/* Facebook-style Cover and Avatar Card */}
      <div className="glass-panel mx-4 rounded-3xl overflow-hidden border border-rose-500/25 shadow-2xl relative">
        {/* Cover Photo */}
        <div className="relative h-44 w-full bg-gradient-to-r from-purple-900 via-rose-900 to-amber-900 overflow-hidden">
          {profile.coverImage ? (
            <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold font-serif">
              قصر اختصاصی My Love Razma ❤️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#11041f] via-transparent to-transparent opacity-80" />

          {/* Edit Cover button if owner */}
          {isOwner && (
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditBio(currentUser.bio || '');
                setEditAvatar(currentUser.avatar);
                setEditCover(currentUser.coverImage || '');
                setIsEditingProfile(true);
              }}
              className="absolute top-3 left-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs border border-white/20 flex items-center gap-1 backdrop-blur-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ویرایش کاور</span>
            </button>
          )}
        </div>

        {/* Profile Avatar & Details Overlap */}
        <div className="px-5 pb-5 -mt-14 relative z-10 text-center flex flex-col items-center">
          {/* Avatar with luxury golden ring */}
          <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 shadow-2xl shadow-rose-950/80">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#11041f]"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#11041f]" />
          </div>

          <h2 className="text-lg font-bold text-rose-100 mt-2 flex items-center justify-center gap-1.5">
            {profile.name}
            <Sparkles className="w-4 h-4 text-amber-300" />
          </h2>

          <p className="text-xs text-rose-300/80 mt-1 max-w-xs leading-relaxed font-serif">
            {profile.bio || 'همیشه و تا ابد در کنار عشق جاودانم ✨'}
          </p>

          {/* Stats Summary Strip (Facebook-style) */}
          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-rose-500/15">
            <div className="text-center">
              <span className="text-base font-bold text-amber-300 font-mono block">
                {userPosts.length}
              </span>
              <span className="text-[10px] text-rose-300/70">پست‌ها</span>
            </div>

            <div className="text-center border-r border-l border-rose-500/15">
              <span className="text-base font-bold text-rose-300 font-mono block">
                {userMemories.length}
              </span>
              <span className="text-[10px] text-rose-300/70">خاطرات</span>
            </div>

            <div className="text-center">
              <span className="text-base font-bold text-amber-300 font-mono block">
                {profile.heartScore}
              </span>
              <span className="text-[10px] text-rose-300/70">قلب‌ها</span>
            </div>
          </div>

          {/* Edit Profile CTA */}
          {isOwner && (
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditBio(currentUser.bio || '');
                setEditAvatar(currentUser.avatar);
                setEditCover(currentUser.coverImage || '');
                setIsEditingProfile(true);
              }}
              className="w-full mt-4 py-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ویرایش مشخصات پروفایل</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Strip (پست‌های من / گالری عکس / مشخصات) */}
      <div className="px-4 flex gap-2">
        <button
          onClick={() => {
            sound.playTileClick();
            setActiveTab('posts');
          }}
          className={`flex-1 py-2 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'posts'
              ? 'bg-rose-900/60 border-rose-400 text-rose-100 shadow'
              : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>پست‌ها ({userPosts.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playTileClick();
            setActiveTab('photos');
          }}
          className={`flex-1 py-2 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'photos'
              ? 'bg-rose-900/60 border-rose-400 text-rose-100 shadow'
              : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>گالری عکس ({userMemories.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playTileClick();
            setActiveTab('relationship');
          }}
          className={`flex-1 py-2 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'relationship'
              ? 'bg-rose-900/60 border-rose-400 text-rose-100 shadow'
              : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>سالگرد پیوند</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="px-4 space-y-3">
        {activeTab === 'posts' && (
          <>
            {userPosts.length === 0 ? (
              <div className="glass-panel rounded-3xl p-6 text-center text-xs text-rose-300/70 border border-rose-500/20">
                هنوز پستی توسط {profile.name} منتشر نشده است.
              </div>
            ) : (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </>
        )}

        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-2">
            {userMemories.map((mem) => (
              <div
                key={mem.id}
                className="aspect-square rounded-2xl overflow-hidden border border-rose-500/25 relative group"
              >
                <img src={mem.imageUrl} alt={mem.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                  <span className="text-[10px] text-white font-bold truncate">{mem.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'relationship' && (
          <div className="glass-panel rounded-3xl p-5 border border-rose-500/30 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Calendar className="w-4 h-4" />
              <span>پیمان عاشقی ما</span>
            </div>

            <div className="text-center py-3 bg-rose-950/40 rounded-2xl border border-rose-500/20">
              <span className="text-3xl font-extrabold text-amber-300 font-mono block">
                {calculateDaysTogether()}
              </span>
              <span className="text-xs text-rose-200">روز دلدادگی تا ابدیت</span>
            </div>

            <p className="text-xs text-rose-200/90 leading-relaxed font-serif text-justify">
              تاریخ ثبت‌شده برای آغاز این داستان رویایی: {new Date(relationship.startDate).toLocaleDateString('fa-IR')}
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160526] border border-rose-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">ویرایش پروفایل اختصاصی</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar & Cover Uploaders */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-rose-300 block mb-1">تصویر نمایه (آواتار):</label>
                <div className="flex items-center gap-3">
                  <img src={editAvatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-400" />
                  <label className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-200 cursor-pointer hover:bg-rose-900/60 transition-colors">
                    <span>تغییر عکس نمایه</span>
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-rose-300 block mb-1">تصویر پس‌زمینه (کاور):</label>
                <label className="block p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 cursor-pointer text-center hover:bg-rose-900/40 transition-colors">
                  <span>انتخاب عکس کاور جدید</span>
                  <input type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">نام نمایشی:</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">متن بیوگرافی قلبی:</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره تغییرات در دیتابیس ابری</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
