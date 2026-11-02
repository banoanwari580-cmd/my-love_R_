import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  MapPin,
  Calendar,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Camera,
} from 'lucide-react';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { Memory } from '../types';

export const MemoriesView: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>(store.getMemories());
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Memory State
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCategory, setEditCategory] = useState<Memory['category']>('لحظه‌های خاص');

  // New Memory Form State
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<Memory['category']>('لحظه‌های خاص');

  useEffect(() => {
    return store.subscribe(() => {
      setMemories(store.getMemories());
    });
  }, []);

  const categories = ['همه', 'سفر', 'اولین دیدار', 'جشن و کادو', 'قرارهای عاشقانه', 'لحظه‌های خاص'];

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory === 'همه') return true;
    return m.category === selectedCategory;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMemory = () => {
    if (!newImage || !newTitle.trim()) return;
    store.addMemory({
      title: newTitle.trim(),
      description: newDesc.trim(),
      imageUrl: newImage,
      date: newDate,
      location: newLocation.trim() || undefined,
      category: newCategory,
    });

    setNewImage(null);
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('آیا از حذف این خاطره اطمینان دارید؟')) return;
    sound.playTileClick();
    store.deleteMemory(id);
    if (activeMemory?.id === id) {
      setActiveMemory(null);
    }
  };

  const handleOpenEdit = (mem: Memory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playTileClick();
    setEditingMemory(mem);
    setEditTitle(mem.title);
    setEditDesc(mem.description || '');
    setEditDate(mem.date);
    setEditLocation(mem.location || '');
    setEditCategory(mem.category);
  };

  const handleSaveEdit = () => {
    if (!editingMemory || !editTitle.trim()) return;
    store.updateMemory(editingMemory.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      date: editDate,
      location: editLocation.trim() || undefined,
      category: editCategory,
    });
    if (activeMemory?.id === editingMemory.id) {
      setActiveMemory({
        ...activeMemory,
        title: editTitle.trim(),
        description: editDesc.trim(),
        date: editDate,
        location: editLocation.trim() || undefined,
        category: editCategory,
      });
    }
    setEditingMemory(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-100 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-300" />
            <span>آلبوم خاطرات مشترک ({memories.length})</span>
          </h3>
          <p className="text-[11px] text-rose-300/70">ثبت زیباترین لحظات زندگی ما دو نفر</p>
        </div>

        <button
          onClick={() => {
            sound.playTileClick();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-950/60 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت خاطره جدید</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playTileClick();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-rose-600/30 border-rose-400 text-rose-100 shadow'
                : 'bg-rose-950/20 border-rose-500/15 text-rose-300/70 hover:bg-rose-900/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-3xl p-6 border border-rose-500/20">
          <ImageIcon className="w-10 h-10 text-rose-400/40 mx-auto mb-2" />
          <p className="text-xs text-rose-300/70">خاطره‌ای در این دسته‌بندی یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => {
                sound.playTileClick();
                setActiveMemory(mem);
              }}
              className="glass-panel rounded-3xl overflow-hidden border border-rose-500/25 hover:border-rose-400/50 cursor-pointer shadow-lg active:scale-98 transition-all group relative"
            >
              <div className="aspect-square w-full relative overflow-hidden bg-rose-950/40">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0319] via-transparent to-transparent opacity-80" />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] text-amber-200 backdrop-blur-sm">
                  {mem.category}
                </span>

                {/* Edit & Delete Action Buttons on Card */}
                <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(mem, e)}
                    className="p-1 rounded-full bg-black/70 text-amber-300 hover:text-white hover:bg-black/90 shadow transition-colors"
                    title="ویرایش خاطره"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(mem.id, e)}
                    className="p-1 rounded-full bg-black/70 text-rose-400 hover:text-white hover:bg-rose-900/80 shadow transition-colors"
                    title="حذف خاطره"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3">
                <h4 className="text-xs font-bold text-rose-100 truncate group-hover:text-amber-200 transition-colors">
                  {mem.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-rose-300/70 mt-1">
                  <Calendar className="w-3 h-3 text-rose-400" />
                  <span>{mem.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox View */}
      {activeMemory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white pt-2">
            <div>
              <h3 className="text-sm font-bold text-amber-200">{activeMemory.title}</h3>
              <div className="flex items-center gap-2 text-xs text-rose-300/80 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {activeMemory.date}
                </span>
                {activeMemory.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {activeMemory.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => handleOpenEdit(activeMemory, e)}
                className="p-2 rounded-full bg-amber-950/60 text-amber-300 hover:text-white hover:bg-amber-900 transition-colors"
                title="ویرایش خاطره"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(activeMemory.id, e)}
                className="p-2 rounded-full bg-rose-950/60 text-rose-300 hover:text-white hover:bg-rose-900 transition-colors"
                title="حذف خاطره"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveMemory(null)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 my-4 flex items-center justify-center">
            <img
              src={activeMemory.imageUrl}
              alt={activeMemory.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>

          {activeMemory.description && (
            <div className="bg-black/60 p-4 rounded-2xl backdrop-blur-md text-xs text-rose-100/90 leading-relaxed text-center pb-safe">
              {activeMemory.description}
            </div>
          )}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#160626] border border-rose-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-rose-100">ثبت خاطره عاشقانه جدید</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Picker */}
            {newImage ? (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-rose-400/40">
                <img src={newImage} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setNewImage(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[16/9] rounded-2xl border-2 border-dashed border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 cursor-pointer p-4 transition-colors">
                <Camera className="w-8 h-8 text-rose-400/70 mb-2" />
                <span className="text-xs font-bold text-rose-200">انتخاب تصویر خاطره</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">عنوان خاطره:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: شام رمانتیک شب یلدا"
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">دسته‌بندی:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Memory['category'])}
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
              >
                <option value="سفر">سفر</option>
                <option value="اولین دیدار">اولین دیدار</option>
                <option value="جشن و کادو">جشن و کادو</option>
                <option value="قرارهای عاشقانه">قرارهای عاشقانه</option>
                <option value="لحظه‌های خاص">لحظه‌های خاص</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-rose-300 block mb-1">تاریخ ثبت:</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="1403/05/12"
                  className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-rose-300 block mb-1">مکان یا شهر:</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="کافه، پارک، شمال..."
                  className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">شرح خاطره و حس و حال:</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="توضیحات و احساس آن روز..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 focus:outline-none focus:border-rose-400"
              />
            </div>

            <button
              onClick={handleSaveMemory}
              disabled={!newImage || !newTitle.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-xl active:scale-95 disabled:opacity-40 transition-all"
            >
              افزودن به گنجینه خاطرات (+۳۰ قلب)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
