import React, { useMemo } from 'react';

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const FloatingHearts: React.FC = () => {
  // Generate a fixed set of floating hearts with varied positions
  const hearts = useMemo<HeartParticle[]>(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: Math.random() * 94 + 3,
      size: Math.floor(Math.random() * 14) + 10,
      duration: Math.floor(Math.random() * 9) + 12,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.25 + 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute text-rose-400 select-none animate-bounce"
          style={{
            left: `${h.left}%`,
            bottom: '-20px',
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            filter: 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.4))',
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};
