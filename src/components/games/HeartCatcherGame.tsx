import React, { useRef, useEffect, useState } from 'react';
import { Heart, Trophy, RotateCcw, Volume2, VolumeX, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BackHeader } from '../common/BackHeader';
import { store } from '../../services/store';
import { sound } from '../../services/sound';

interface HeartCatcherGameProps {
  onBack: () => void;
}

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'heart' | 'goldenHeart' | 'brokenHeart' | 'letter';
  size: number;
}

export const HeartCatcherGame: React.FC<HeartCatcherGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(sound.getMuted());

  // Mutable game state held in ref for 60fps loop isolation
  const gameRef = useRef({
    score: 0,
    lives: 3,
    combo: 0,
    playerX: 180,
    playerWidth: 70,
    playerHeight: 22,
    items: [] as FallingItem[],
    nextItemId: 1,
    spawnTimer: 0,
    feverTime: 0,
    lastTime: performance.now(),
    isRunning: false,
  });

  const touchMoveRef = useRef<(e: TouchEvent) => void>(() => {});

  const startGame = () => {
    sound.playTileClick();
    const g = gameRef.current;
    g.score = 0;
    g.lives = 3;
    g.combo = 0;
    g.items = [];
    g.feverTime = 0;
    g.isRunning = true;
    g.lastTime = performance.now();

    setScore(0);
    setLives(3);
    setCombo(0);
    setGameState('playing');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = (currentTime: number) => {
      const g = gameRef.current;
      const rawDt = (currentTime - g.lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // clamp delta
      g.lastTime = currentTime;

      if (g.isRunning) {
        // Fever countdown
        if (g.feverTime > 0) {
          g.feverTime -= dt;
        }

        // Spawn items
        g.spawnTimer += dt;
        const spawnInterval = g.feverTime > 0 ? 0.35 : 0.6;
        if (g.spawnTimer > spawnInterval) {
          g.spawnTimer = 0;
          const rand = Math.random();
          let type: FallingItem['type'] = 'heart';
          if (rand < 0.15) type = 'goldenHeart';
          else if (rand < 0.3) type = 'brokenHeart';
          else if (rand < 0.42) type = 'letter';

          g.items.push({
            id: g.nextItemId++,
            x: Math.random() * (canvas.width - 30) + 15,
            y: -20,
            speed: (120 + Math.random() * 80) * (g.feverTime > 0 ? 1.3 : 1),
            type,
            size: type === 'goldenHeart' ? 24 : 20,
          });
        }

        // Update items
        for (let i = g.items.length - 1; i >= 0; i--) {
          const item = g.items[i];
          item.y += item.speed * dt;

          // Check catch collision with player paddle
          const playerY = canvas.height - 35;
          if (
            item.y + item.size >= playerY &&
            item.y <= playerY + g.playerHeight &&
            item.x >= g.playerX - g.playerWidth / 2 &&
            item.x <= g.playerX + g.playerWidth / 2
          ) {
            // Caught!
            if (item.type === 'heart') {
              sound.playHeartPop();
              const gain = (g.feverTime > 0 ? 20 : 10) + Math.min(g.combo, 10);
              g.score += gain;
              g.combo += 1;
            } else if (item.type === 'goldenHeart') {
              sound.playVictoryFanfare();
              g.score += 50;
              g.combo += 3;
              g.feverTime = 5; // 5s fever
            } else if (item.type === 'letter') {
              sound.playChime();
              g.score += 30;
              g.combo += 2;
            } else if (item.type === 'brokenHeart') {
              sound.playTileClick();
              g.lives -= 1;
              g.combo = 0;
              if (g.lives <= 0) {
                // Game Over
                g.isRunning = false;
                setGameState('gameover');
                store.recordGameScore('heart-catcher', 'مسابقه قلب‌ها', g.score, `امتیاز: ${g.score}`);
                if (g.score > highScore) setHighScore(g.score);
                confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
              }
            }

            setScore(g.score);
            setLives(g.lives);
            setCombo(g.combo);
            g.items.splice(i, 1);
            continue;
          }

          // Off screen bottom
          if (item.y > canvas.height + 20) {
            if (item.type === 'heart') {
              g.combo = 0;
              setCombo(0);
            }
            g.items.splice(i, 1);
          }
        }
      }

      // --- Render Canvas ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#10031d');
      grad.addColorStop(1, '#080110');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Falling Items
      g.items.forEach((item) => {
        ctx.save();
        ctx.font = `${item.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (item.type === 'heart') {
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.fillText('❤️', item.x, item.y);
        } else if (item.type === 'goldenHeart') {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 15;
          ctx.fillText('💖', item.x, item.y);
        } else if (item.type === 'brokenHeart') {
          ctx.shadowColor = '#475569';
          ctx.shadowBlur = 4;
          ctx.fillText('💔', item.x, item.y);
        } else if (item.type === 'letter') {
          ctx.shadowColor = '#e2e8f0';
          ctx.shadowBlur = 8;
          ctx.fillText('💌', item.x, item.y);
        }
        ctx.restore();
      });

      // Render Player Paddle (Romantic Rose Gold Vessel)
      const playerY = canvas.height - 35;
      ctx.save();
      const pGrad = ctx.createLinearGradient(
        g.playerX - g.playerWidth / 2,
        0,
        g.playerX + g.playerWidth / 2,
        0
      );
      if (g.feverTime > 0) {
        pGrad.addColorStop(0, '#fbbf24');
        pGrad.addColorStop(0.5, '#f59e0b');
        pGrad.addColorStop(1, '#d97706');
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 18;
      } else {
        pGrad.addColorStop(0, '#f43f5e');
        pGrad.addColorStop(0.5, '#ec4899');
        pGrad.addColorStop(1, '#fbbf24');
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
      }

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.roundRect(g.playerX - g.playerWidth / 2, playerY, g.playerWidth, g.playerHeight, 12);
      ctx.fill();

      // Golden border & heart emblem in center
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.feverTime > 0 ? '✨' : '❤️', g.playerX, playerY + g.playerHeight / 2);
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    // Touch & Pointer interaction on canvas
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const scaleX = canvas.width / rect.width;
      const targetX = clientX * scaleX;
      gameRef.current.playerX = Math.max(35, Math.min(canvas.width - 35, targetX));
    };

    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const toggleMute = () => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
  };

  return (
    <div className="min-h-screen bg-[#0e0319] pb-32">
      <BackHeader title="مسابقه قلب‌ها" subtitle="شکار قلب‌های آسمانی با سرعت عشق" onBack={onBack} />

      <main className="max-w-md mx-auto p-4 flex flex-col items-center">
        {/* Perimeter HUD Status Cluster */}
        <div className="w-full flex items-center justify-between mb-3 px-2 text-xs">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all ${
                  i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono font-bold">
            {combo > 2 && (
              <span className="text-amber-300 flex items-center gap-0.5 animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                کمبو x{combo}
              </span>
            )}
            <span className="text-rose-200">امتیاز: {score}</span>
          </div>

          <button
            onClick={toggleMute}
            className="p-1 rounded-full text-rose-300 hover:text-white"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 60fps Game Shell Viewport */}
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden border-2 border-rose-500/30 shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            width={360}
            height={480}
            className="w-full h-full touch-none select-none"
          />

          {/* Title Screen Overlay */}
          {gameState === 'title' && (
            <div className="absolute inset-0 bg-[#0e0319]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white mb-4 shadow-xl shadow-rose-950/80">
                <Heart className="w-9 h-9 fill-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-rose-200 via-pink-100 to-amber-300 mb-1 font-serif">
                مسابقه قلب‌ها
              </h2>
              <p className="text-xs text-rose-300/80 mb-6">
                سبد عشق را با انگشت حرکت بده، قلب‌ها و نامه‌ها را صید کن و از دل‌شکستگی‌ها دوری کن!
              </p>

              <button
                onClick={startGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-bold text-sm shadow-xl active:scale-95 transition-all"
              >
                شروع مسابقه (+۵۰ امتیاز)
              </button>
            </div>
          )}

          {/* Game Over Modal */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-in zoom-in-95">
              <Trophy className="w-14 h-14 text-amber-400 mb-2" />
              <h3 className="text-xl font-extrabold text-rose-100 mb-1">پایان مسابقه</h3>
              <p className="text-xs text-rose-300/70 mb-4">رکورد کسب شده در این دور:</p>

              <div className="text-3xl font-extrabold text-amber-300 font-mono mb-4">
                {score} امتیاز
              </div>

              <div className="w-full flex gap-3">
                <button
                  onClick={startGame}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>بازی دوباره</span>
                </button>
                <button
                  onClick={onBack}
                  className="py-3 px-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs font-bold"
                >
                  خروج
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
