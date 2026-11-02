import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  className = '',
  withGlow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={withGlow ? 'filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}
      >
        <defs>
          {/* Royal Purple Background Gradient */}
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#831843" />
            <stop offset="50%" stopColor="#4c0519" />
            <stop offset="100%" stopColor="#1e0538" />
          </linearGradient>

          {/* Luxury Gold Calligraphy Gradient */}
          <linearGradient id="logoGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Radiant Rose Heart Stroke */}
          <linearGradient id="heartStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Gentle 3D shadow */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Rounded Hexagonal / Squircle Luxury Shield Container */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="26"
          fill="url(#logoBgGrad)"
          stroke="url(#logoGoldGrad)"
          strokeWidth="2.5"
          filter="url(#softShadow)"
        />

        {/* Outer Radiant Heart Contour */}
        <path
          d="M50 82C50 82 17 61 17 38C17 25 27 16 39 16C45 16 50 20 50 20C50 20 55 16 61 16C73 16 83 25 83 38C83 61 50 82 50 82Z"
          fill="none"
          stroke="url(#heartStrokeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Miniature Royal Crown at top center */}
        <path
          d="M42 22L46 27L50 19L54 27L58 22L56 31H44L42 22Z"
          fill="url(#logoGoldGrad)"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Intertwined 'M' & 'R' Monogram (My Love & Razma) */}
        <g filter="url(#softShadow)">
          {/* Letter M (Left Anchor) */}
          <path
            d="M31 63V41L41 54L50 41V63"
            stroke="url(#logoGoldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Letter R (Intertwined on Right) */}
          <path
            d="M53 63V41H64C68 41 71 44 71 48C71 52 68 54 64 54H53M63 54L71 63"
            stroke="#fce7f3"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Tiny Sparkling Stars */}
        <circle cx="27" cy="27" r="1.5" fill="#fef08a" />
        <circle cx="73" cy="26" r="1.5" fill="#fef08a" />
        <path
          d="M74 46L75.5 49L79 49.5L76 52L77 55L74 53L71 55L72 52L69 49.5L72.5 49L74 46Z"
          fill="url(#logoGoldGrad)"
          transform="scale(0.5) translate(65, 30)"
        />
      </svg>
    </div>
  );
};
