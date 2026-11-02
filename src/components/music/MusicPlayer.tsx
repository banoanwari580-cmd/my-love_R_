import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Disc,
  ChevronUp,
  X,
  ListMusic,
  Heart,
} from 'lucide-react';
import { music } from '../../services/music';
import { sound } from '../../services/sound';

export const MusicPlayer: React.FC = () => {
  const [state, setState] = useState(music.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    return music.subscribe(() => {
      setState(music.getState());
    });
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playTileClick();
    music.togglePlay();
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playTileClick();
    music.prev();
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playTileClick();
    music.next();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    music.seek(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    music.setVolume(val);
  };

  return (
    <>
      {/* Minimized Floating Bar (Docked right above bottom navigation) */}
      <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-30 transition-all duration-300">
        <div
          onClick={() => setIsExpanded(true)}
          className="cursor-pointer glass-panel rounded-2xl p-2.5 flex items-center justify-between shadow-xl border border-rose-500/30 hover:border-rose-400/50 bg-[#170624]/90 backdrop-blur-xl group"
        >
          {/* Track Cover & Details */}
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-rose-400/40 shadow-sm">
              <img
                src={state.currentTrack.cover}
                alt={state.currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  state.isPlaying ? 'scale-110' : ''
                }`}
              />
              {state.isPlaying && (
                <div className="absolute inset-0 bg-rose-950/30 flex items-center justify-center">
                  <Disc className="w-5 h-5 text-rose-300 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Music className="w-3 h-3 text-amber-300 flex-shrink-0 animate-bounce" />
                <h4 className="text-xs font-bold text-rose-100 truncate group-hover:text-amber-200 transition-colors">
                  {state.currentTrack.title}
                </h4>
              </div>
              <p className="text-[10px] text-rose-300/70 truncate">{state.currentTrack.artist}</p>
            </div>
          </div>

          {/* Quick Play Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlayToggle}
              aria-label={state.isPlaying ? 'توقف' : 'پخش'}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-900/50 active:scale-95 hover:brightness-110"
            >
              {state.isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white mr-0.5" />}
            </button>
            <button
              onClick={handleNext}
              aria-label="آهنگ بعدی"
              className="w-7 h-7 rounded-full flex items-center justify-center text-rose-300/80 hover:text-white active:scale-90"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <ChevronUp className="w-4 h-4 text-rose-400/60 ml-1 group-hover:translate-y-[-2px] transition-transform" />
          </div>
        </div>
      </div>

      {/* Expanded Fullscreen Romantic Vinyl Player Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#130521] border border-rose-500/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-500 animate-pulse" />
                <span className="text-sm font-bold text-rose-100">پخش‌کننده ملودی‌های عاشقانه</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
                    showPlaylist
                      ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                      : 'border-rose-500/20 text-rose-300 hover:bg-rose-900/30'
                  }`}
                >
                  <ListMusic className="w-4 h-4" />
                  <span>لیست</span>
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full hover:bg-rose-900/40 text-rose-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: Either Playlist or Vinyl Disc Player */}
            {showPlaylist ? (
              <div className="py-4 space-y-2.5 my-auto">
                <h3 className="text-xs font-bold text-amber-300 mb-2">قطعات عاشقانه اختصاصی:</h3>
                {state.playlist.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => {
                      music.setTrack(idx);
                      setShowPlaylist(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${
                      idx === state.currentIndex
                        ? 'bg-rose-900/40 border-rose-400/60 shadow-lg'
                        : 'bg-rose-950/20 border-rose-500/10 hover:bg-rose-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={track.cover} alt={track.title} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-100">{track.title}</h4>
                        <p className="text-[10px] text-rose-300/70">{track.artist}</p>
                      </div>
                    </div>
                    {idx === state.currentIndex && state.isPlaying && (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-rose-400 animate-pulse rounded-full" />
                        <span className="w-1 h-4 bg-amber-400 animate-pulse delay-75 rounded-full" />
                        <span className="w-1 h-2 bg-pink-400 animate-pulse delay-150 rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center">
                {/* Vinyl Record Centerpiece */}
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-tr from-amber-600/30 via-rose-900/40 to-purple-900/50 border-2 border-rose-400/40 shadow-2xl shadow-rose-950/80 flex items-center justify-center">
                  <div
                    className={`relative w-full h-full rounded-full bg-[#0a0210] border-4 border-slate-900 shadow-inner overflow-hidden flex items-center justify-center ${
                      state.isPlaying ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '10s' }}
                  >
                    {/* Vinyl grooves */}
                    <div className="absolute inset-4 rounded-full border border-rose-500/10" />
                    <div className="absolute inset-8 rounded-full border border-rose-500/10" />
                    <div className="absolute inset-12 rounded-full border border-rose-500/10" />

                    {/* Album Art Label */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-lg relative">
                      <img
                        src={state.currentTrack.cover}
                        alt={state.currentTrack.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#130521] border border-rose-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Track Title and Artist */}
                <div className="text-center mt-6">
                  <h3 className="text-base sm:text-lg font-bold text-rose-100 flex items-center justify-center gap-1.5">
                    {state.currentTrack.title}
                  </h3>
                  <p className="text-xs text-rose-300/80 mt-1">{state.currentTrack.artist}</p>
                </div>

                {/* Progress Bar & Timestamps */}
                <div className="w-full mt-6">
                  <input
                    type="range"
                    min="0"
                    max={state.duration || 180}
                    value={state.currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-rose-950/70 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[11px] text-rose-300/70 mt-1.5 font-mono">
                    <span>{formatTime(state.currentTime)}</span>
                    <span>{formatTime(state.duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-6 mt-6">
                  <button
                    onClick={handlePrev}
                    aria-label="قبلی"
                    className="p-3 text-rose-300 hover:text-white active:scale-95 transition-all"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handlePlayToggle}
                    aria-label={state.isPlaying ? 'توقف' : 'پخش'}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-900/60 hover:scale-105 active:scale-95 transition-all"
                  >
                    {state.isPlaying ? (
                      <Pause className="w-7 h-7 fill-white" />
                    ) : (
                      <Play className="w-7 h-7 fill-white mr-1" />
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    aria-label="بعدی"
                    className="p-3 text-rose-300 hover:text-white active:scale-95 transition-all"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="w-full flex items-center gap-3 mt-6 px-4">
                  <VolumeX className="w-4 h-4 text-rose-400/60" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={state.volume}
                    onChange={handleVolume}
                    className="w-full h-1.5 bg-rose-950/70 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <Volume2 className="w-4 h-4 text-amber-300" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
