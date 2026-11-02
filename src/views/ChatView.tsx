import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  CheckCheck,
  Check,
  Heart,
  Trash2,
  X,
  Play,
  Pause,
  Square,
  AlertCircle,
} from 'lucide-react';
import { store } from '../services/store';
import { sound } from '../services/sound';
import { LoveMessage } from '../types';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<LoveMessage[]>(store.getMessages());
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [partnerUser, setPartnerUser] = useState(store.getPartnerUser());
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  // Real Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const currentAudioElemRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    store.markMessagesAsRead();
    const unsubscribe = store.subscribe(() => {
      setMessages(store.getMessages());
      setCurrentUser(store.getCurrentUser());
      setPartnerUser(store.getPartnerUser());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real Voice Recording logic using MediaRecorder
  const startRecording = async () => {
    setRecordingError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('دستگاه شما از ضبط صدا در مرورگر پشتیبانی نمی‌کند.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          store.sendMessage('', undefined, base64Audio, recordingSeconds);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      sound.playHeartPop();

      recordIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.warn('Microphone error:', err);
      setRecordingError('دسترسی به میکروفون داده نشد. لطفاً مجوز میکروفون را در مرورگر فعال کنید.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      sound.playChime();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      audioChunksRef.current = [];
    }
  };

  const handlePlayVoice = (msgId: string, audioUrl: string) => {
    if (playingAudioId === msgId && currentAudioElemRef.current) {
      currentAudioElemRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    if (currentAudioElemRef.current) {
      currentAudioElemRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    currentAudioElemRef.current = audio;
    setPlayingAudioId(msgId);

    audio.play().catch(() => {
      setPlayingAudioId(null);
    });

    audio.onended = () => {
      setPlayingAudioId(null);
    };
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;
    store.sendMessage(inputText.trim(), selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    setShowEmojiBar(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatVoiceSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-md mx-auto px-3 pt-2">
      {/* Partner Header Strip */}
      <div className="glass-panel rounded-2xl p-2.5 px-4 flex items-center justify-between border border-rose-500/20 mb-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={partnerUser.avatar}
              alt={partnerUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-400"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-1 ring-[#12061f]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-rose-100 flex items-center gap-1">
              {partnerUser.name}
              <Heart className="w-3 h-3 text-rose-400 fill-rose-500" />
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium">همگام‌سازی ابری و امن فعال</span>
          </div>
        </div>

        <div className="text-[11px] text-amber-300 font-mono font-bold bg-rose-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
          چت خصوصی ۲ نفره
        </div>
      </div>

      {/* Recording Error Banner */}
      {recordingError && (
        <div className="mb-2 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-[11px] text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{recordingError}</span>
          </div>
          <button onClick={() => setRecordingError(null)} className="text-rose-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 rounded-3xl bg-black/30 border border-rose-500/10">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.role;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-3.5 shadow-xl relative transition-all ${
                  isMe
                    ? 'bg-gradient-to-l from-rose-700 via-rose-600 to-pink-600 text-white rounded-br-none border border-rose-300/30'
                    : 'bg-[#1e0a2d] text-rose-100 rounded-bl-none border border-rose-500/25 shadow-rose-950/50'
                }`}
              >
                {/* Photo attachment */}
                {msg.imageUrl && (
                  <div className="rounded-2xl overflow-hidden mb-2 max-h-56 border border-white/20">
                    <img src={msg.imageUrl} alt="attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Voice note player */}
                {msg.audioUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-2xl bg-black/25 border border-white/10 mb-1">
                    <button
                      onClick={() => handlePlayVoice(msg.id, msg.audioUrl!)}
                      className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 active:scale-90 transition-all flex-shrink-0"
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white mr-0.5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="w-1 h-3 bg-amber-300 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-rose-300 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-2 bg-pink-300 rounded-full animate-pulse delay-150" />
                        <span className="w-1 h-5 bg-amber-300 rounded-full animate-pulse" />
                        <span className="w-1 h-3 bg-rose-200 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-pink-300 rounded-full animate-pulse delay-75" />
                      </div>
                      <span className="text-[10px] opacity-80 font-mono">
                        صدای ضبط‌شده ({formatVoiceSeconds(msg.audioDuration || 5)})
                      </span>
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {msg.text && (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {msg.text}
                  </p>
                )}

                {/* Time & Read Receipt */}
                <div
                  className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                    isMe ? 'text-rose-200/90' : 'text-rose-400/80'
                  }`}
                >
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <span>
                      {msg.readAt ? (
                        <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-rose-300/70" />
                      )}
                    </span>
                  )}
                </div>

                {/* Reaction badge */}
                {msg.reaction && (
                  <div className="absolute -bottom-2.5 right-2 px-1.5 py-0.5 rounded-full bg-[#180726] border border-rose-400/40 text-xs shadow-md">
                    {msg.reaction}
                  </div>
                )}
              </div>

              {/* Quick Reactions bar */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1">
                {['❤️', '😘', '💍', '💖'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => store.reactToMessage(msg.id, emoji)}
                    className="text-xs hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
                {isMe && (
                  <button
                    onClick={() => store.deleteMessage(msg.id)}
                    className="text-rose-400/50 hover:text-rose-400 mr-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview bar before sending */}
      {selectedImage && (
        <div className="relative mt-2 p-2 rounded-2xl bg-[#190828] border border-rose-500/30 flex items-center gap-2">
          <img src={selectedImage} alt="preview" className="w-12 h-12 rounded-xl object-cover" />
          <span className="text-xs text-rose-200">عکس آماده ارسال است</span>
          <button
            onClick={() => setSelectedImage(null)}
            className="mr-auto p-1 rounded-full text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Bar */}
      {showEmojiBar && (
        <div className="flex items-center justify-around p-2 rounded-2xl bg-[#170624] border border-rose-500/30 mt-1">
          {['❤️', '😍', '😘', '🌹', '💍', '✨', '💖', '🥰', '🕊️'].map((em) => (
            <button
              key={em}
              onClick={() => {
                setInputText((prev) => prev + em);
              }}
              className="text-lg hover:scale-125 transition-transform"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Live Recording Active Strip */}
      {isRecording ? (
        <div className="mt-2 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-rose-200 text-xs font-bold">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span>در حال ضبط صدای واقعی: {formatVoiceSeconds(recordingSeconds)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1 rounded-xl bg-black/40 text-[11px] text-rose-300 hover:text-white"
            >
              لغو
            </button>
            <button
              onClick={stopRecording}
              className="p-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center gap-1 text-xs font-bold shadow-md"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>ارسال صدا</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Input Controls */
        <div className="flex items-center gap-2 mt-2 pb-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImagePick}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-900/60 active:scale-95 transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={startRecording}
            className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-900/60 active:scale-95 transition-all"
            title="ضبط صدای واقعی"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowEmojiBar(!showEmojiBar)}
            className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white transition-all"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="پیام عاشقانه‌ات را بنویس..."
            className="flex-1 p-3 rounded-2xl bg-[#1c082b] border border-rose-500/30 text-xs sm:text-sm text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() && !selectedImage}
            className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-950/60 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all"
          >
            <Send className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
};
