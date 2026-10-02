import React from 'react';

export interface LogoProps {
  /** Size preset or custom pixel number for the logo mark */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  /** Visual theme variant */
  variant?: 'default' | 'dark' | 'light' | 'monochrome';
  /** Whether to render the 'MENTISERA OBE360™' typography alongside mark */
  showText?: boolean;
  /** Whether to render the educational tagline underneath the brand name */
  showTagline?: boolean;
  /** Custom tagline text */
  taglineText?: string;
  /** Optional badge text next to the brand name (e.g. 'OBE360', 'ENTERPRISE', 'HIGHER ED') */
  badgeText?: string;
  /** Additional container classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

const SIZE_MAP: Record<string, { iconSize: number; titleClass: string; taglineClass: string }> = {
  xs: { iconSize: 20, titleClass: 'text-[11px] font-bold', taglineClass: 'text-[8px]' },
  sm: { iconSize: 28, titleClass: 'text-xs font-bold', taglineClass: 'text-[9px]' },
  md: { iconSize: 34, titleClass: 'text-sm font-extrabold', taglineClass: 'text-[10px]' },
  lg: { iconSize: 44, titleClass: 'text-base font-extrabold', taglineClass: 'text-xs' },
  xl: { iconSize: 56, titleClass: 'text-xl font-extrabold', taglineClass: 'text-xs' },
  '2xl': { iconSize: 72, titleClass: 'text-2xl font-black', taglineClass: 'text-sm' },
};

/**
 * High-fidelity Vector Logo Mark for MENTISERA OBE360™
 * Encapsulating:
 * 1. 360-degree outcome alignment orbital spiral with golden satellite
 * 2. Academic knowledge book of learning
 * 3. Apex graduation mortarboard beacon
 * 4. Crisp high-resolution SVG vectors compatible with any theme or zoom level
 */
export const LogoMark: React.FC<{ size?: number; className?: string; variant?: 'default' | 'dark' | 'light' | 'monochrome' }> = ({
  size = 32,
  className = '',
  variant = 'default',
}) => {
  const isDarkBg = variant === 'light'; // Light logo for dark backgrounds

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-label="MENTISERA OBE360 Logo Mark"
    >
      <defs>
        <linearGradient id={`m-grad-primary-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        <linearGradient id={`m-grad-gold-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <filter id={`m-glow-${size}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* Rounded Squircle Shield Base */}
      <rect
        x="6"
        y="6"
        width="116"
        height="116"
        rx="28"
        fill={isDarkBg ? 'url(#m-grad-primary-' + size + ')' : 'url(#m-grad-primary-' + size + ')'}
        filter={`url(#m-glow-${size})`}
      />

      {/* Subtle Inner Border Ring */}
      <rect
        x="8"
        y="8"
        width="112"
        height="112"
        rx="26"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
      />

      {/* 360-Degree Continuous Outcome Orbital Loop */}
      <path
        d="M 64 20 A 44 44 0 1 1 20 74"
        fill="none"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="6 4"
      />
      <path
        d="M 30 38 A 44 44 0 0 1 98 38"
        fill="none"
        stroke={`url(#m-grad-gold-${size})`}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Outcome Satellite Target */}
      <circle cx="98" cy="38" r="5" fill="#fde047" stroke="#ffffff" strokeWidth="2" />

      {/* Academic Open Book of Learning (CLO/Curriculum Foundation) */}
      <g transform="translate(64, 76)">
        {/* Left Page */}
        <path
          d="M 0 4 C -12 -6 -24 -2 -34 4 C -36 5 -36 21 -34 20 C -24 14 -12 10 0 20 Z"
          fill="#ffffff"
          fillOpacity="0.95"
        />
        <path d="M -5 7 C -14 -1 -24 2 -30 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        <path d="M -5 13 C -14 5 -22 8 -28 13" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />

        {/* Right Page */}
        <path
          d="M 0 4 C 12 -6 24 -2 34 4 C 36 5 36 21 34 20 C 24 14 12 10 0 20 Z"
          fill="#ffffff"
          fillOpacity="0.95"
        />
        <path d="M 5 7 C 14 -1 24 2 30 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        <path d="M 5 13 C 14 5 22 8 28 13" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" />

        {/* Central Spine */}
        <line x1="0" y1="2" x2="0" y2="22" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Mortarboard Academic Cap Beacon */}
      <g transform="translate(64, 46)">
        <polygon points="0,-16 22,-7 0,2 -22,-7" fill="#ffffff" />
        <path d="M -12 -3 L -12 7 C -12 12 12 12 12 7 L 12 -3 Z" fill="#e0e7ff" />
        <path d="M 16 -5 C 20 0 22 8 22 14" fill="none" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="15" r="2.2" fill="#fbbf24" />
        <circle cx="0" cy="-7" r="2.5" fill="#4338ca" />
      </g>

      {/* 360 Emblem Pill */}
      <g transform="translate(64, 114)">
        <rect x="-20" y="-10" width="40" height="15" rx="7.5" fill="#0f172a" />
        <text
          x="0"
          y="1"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="8.5"
          fill="#38bdf8"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          OBE360
        </text>
      </g>
    </svg>
  );
};

export const MentiseraLogo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showText = true,
  showTagline = true,
  taglineText,
  badgeText,
  className = '',
  onClick,
}) => {
  const sizeConfig = typeof size === 'number'
    ? { iconSize: size, titleClass: 'text-sm font-extrabold', taglineClass: 'text-[10px]' }
    : SIZE_MAP[size] || SIZE_MAP.md;

  const isLight = variant === 'light'; // Text styling for dark background

  const content = (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <LogoMark
        size={sizeConfig.iconSize}
        variant={variant}
        className={onClick ? 'group-hover:scale-105 group-hover:rotate-1' : ''}
      />

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center space-x-1.5">
            <span
              className={`tracking-tight uppercase font-sans ${sizeConfig.titleClass} ${
                isLight ? 'text-white' : 'text-slate-900'
              }`}
            >
              MENTISERA <span className="text-indigo-600">OBE360™</span>
            </span>

            {badgeText && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider font-mono ${
                  isLight
                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/60'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>

          {showTagline && (
            <span
              className={`font-medium ${sizeConfig.taglineClass} ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {taglineText || 'Outcome-Based Course Creator'}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return content;
};

export default MentiseraLogo;
