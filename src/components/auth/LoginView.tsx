import React, { useState } from 'react';
import {
  Heart,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { store } from '../../services/store';
import { sound } from '../../services/sound';
import { AppLogo } from '../common/AppLogo';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('لطفاً ایمیل و رمز عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    sound.playTileClick();

    const res = await store.loginWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      sound.playVictoryFanfare();
      onSuccess();
    } else {
      sound.playTileClick();
      setErrorMessage(res.error || 'ورود ناموفق بود.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('لطفاً آدرس ایمیل حساب خود را وارد کنید.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const res = await store.sendResetPassword(email);
    setLoading(false);

    if (res.success) {
      setResetSuccess(true);
      sound.playChime();
    } else {
      setErrorMessage(res.error || 'خطا در ارسال لینک بازیابی رمز.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090210] flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Vazirmatn',sans-serif]">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl relative z-10 animate-in zoom-in-95">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <AppLogo size={68} className="mx-auto mb-3" />

          <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 via-pink-100 to-amber-300 font-serif">
            My Love Razma ❤️
          </h1>
          <p className="text-xs text-rose-300/80 mt-1">حریم امن و خصوصی دو نفره ما</p>
        </div>

        {/* Security Policy Badge */}
        <div className="mb-5 p-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center gap-1.5 text-[11px] text-amber-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ثبت‌نام عمومی غیرفعال؛ منحصراً برای دو حساب مجاز</span>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Reset Password Success */}
        {resetSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>لینک بازیابی رمز عبور به ایمیل شما ارسال شد.</span>
          </div>
        )}

        {/* Forms */}
        {!isResetMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">
                ایمیل حساب کاربری:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل حساب خود را وارد نمایید"
                  className="w-full p-3 pl-10 rounded-2xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400 font-sans"
                />
                <Mail className="w-4 h-4 text-rose-400/60 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">کد عبور:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد نمایید"
                  className="w-full p-3 pl-10 rounded-2xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-rose-400/60 hover:text-rose-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setErrorMessage(null);
                  setResetSuccess(false);
                }}
                className="text-amber-300/80 hover:text-amber-200 underline"
              >
                فراموشی رمز عبور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/80 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'در حال تایید هویت...' : 'ورود به حریم عشق'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-rose-300 block mb-1">
                ایمیل حساب برای بازیابی:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل خود را وارد کنید..."
                  className="w-full p-3 pl-10 rounded-2xl bg-[#1c082b] border border-rose-500/30 text-xs text-rose-100 placeholder:text-rose-400/40 focus:outline-none focus:border-rose-400"
                />
                <Mail className="w-4 h-4 text-rose-400/60 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs shadow-xl active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? 'در حال ارسال...' : 'ارسال لینک بازیابی رمز'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs text-rose-300/70 hover:text-rose-200 pt-2 block"
            >
              بازگشت به صفحه ورود
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
