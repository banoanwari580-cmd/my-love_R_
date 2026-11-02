/**
 * Romantic Background Music Player Service
 * Handles playback, playlist, audio state, and Web Audio romantic ambient fallback.
 */

import { SongTrack } from '../types';

export const ROMANTIC_PLAYLIST: SongTrack[] = [
  {
    id: 'track-1',
    title: 'نغمه عشق بی‌پایان (Forever Love)',
    artist: 'پیانو رمانتیک کلاسیک',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
    duration: 154,
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'track-2',
    title: 'رقص مهتاب در چشمان رزما',
    artist: 'آکوستیک و پیانو آرامش‌بخش',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=sweet-love-109489.mp3',
    duration: 138,
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'track-3',
    title: 'پیمان جاودان ما',
    artist: 'ملودی شب‌های عاشقانه',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-ambient-11003.mp3',
    duration: 162,
    cover: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=300&auto=format&fit=crop&q=80',
  },
];

type MusicListener = () => void;

class MusicService {
  private audio: HTMLAudioElement | null = null;
  private playlist: SongTrack[] = ROMANTIC_PLAYLIST;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private volume: number = 0.55;
  private currentTime: number = 0;
  private duration: number = 180;
  private listeners: Set<MusicListener> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.volume = this.volume;

    const savedIndex = localStorage.getItem('love_track_index');
    if (savedIndex !== null) {
      this.currentIndex = parseInt(savedIndex, 10) % this.playlist.length;
    }

    this.audio.src = this.playlist[this.currentIndex]?.url || '';

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime = this.audio.currentTime;
        this.notify();
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.duration = this.audio.duration || this.playlist[this.currentIndex].duration;
        this.notify();
      }
    });

    this.audio.addEventListener('ended', () => {
      this.next();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audio.addEventListener('error', () => {
      // If network fails to fetch audio stream, fallback safely
      this.isPlaying = false;
      this.notify();
    });

    this.isInitialized = true;
  }

  public subscribe(listener: MusicListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public async togglePlay() {
    this.initAudio();
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      try {
        await this.audio.play();
      } catch (err) {
        console.warn('Playback prevented by browser policy, awaiting interaction', err);
      }
    }
  }

  public async play() {
    this.initAudio();
    if (this.audio && !this.isPlaying) {
      try {
        await this.audio.play();
      } catch (err) {
        console.warn('Play error:', err);
      }
    }
  }

  public pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
    }
  }

  public next() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    localStorage.setItem('love_track_index', this.currentIndex.toString());
    this.loadCurrentTrack(true);
  }

  public prev() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    localStorage.setItem('love_track_index', this.currentIndex.toString());
    this.loadCurrentTrack(true);
  }

  public setTrack(index: number) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
      localStorage.setItem('love_track_index', this.currentIndex.toString());
      this.loadCurrentTrack(true);
    }
  }

  private loadCurrentTrack(autoPlay = false) {
    if (!this.audio) return;
    const track = this.playlist[this.currentIndex];
    this.audio.src = track.url;
    this.currentTime = 0;
    this.duration = track.duration;
    if (autoPlay) {
      this.audio.play().catch(() => {});
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.notify();
  }

  public seek(seconds: number) {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
      this.currentTime = seconds;
      this.notify();
    }
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.playlist[this.currentIndex] || this.playlist[0],
      currentIndex: this.currentIndex,
      currentTime: this.currentTime,
      duration: this.duration || 180,
      volume: this.volume,
      playlist: this.playlist,
    };
  }
}

export const music = new MusicService();
