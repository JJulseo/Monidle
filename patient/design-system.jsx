// Monidle Design System — Apple Health-inspired, minimal modern
// Themes, typography, brain character, icons

// ─────────── THEME PALETTES ───────────
const monidleThemes = {
  medical: {
    name: 'Medical Blue',
    bg: '#F2F2F7',
    card: '#FFFFFF',
    cardElev: '#FFFFFF',
    text: '#1C1C1E',
    textSec: '#6E6E73',
    textTer: '#A1A1A6',
    border: 'rgba(0,0,0,0.06)',
    divider: 'rgba(60,60,67,0.10)',
    primary: '#007AFF',
    primarySoft: '#E5F0FF',
    good: '#30B57A',
    goodSoft: '#E1F5EB',
    warn: '#FF9F0A',
    warnSoft: '#FFF1DC',
    danger: '#FF3B30',
    dangerSoft: '#FFE5E3',
    gfap: '#007AFF',
    uchl1: '#5E5CE6',
    auc: '#30B57A',
  },
  warm: {
    name: 'Warm Care',
    bg: '#F7F4EF',
    card: '#FFFFFF',
    cardElev: '#FFFCF7',
    text: '#2A241E',
    textSec: '#7A6F62',
    textTer: '#B0A595',
    border: 'rgba(120,90,60,0.08)',
    divider: 'rgba(120,90,60,0.12)',
    primary: '#D97757',
    primarySoft: '#FBEEE7',
    good: '#7A9E5B',
    goodSoft: '#EBF1E0',
    warn: '#E8A33D',
    warnSoft: '#FBEDD3',
    danger: '#C8453A',
    dangerSoft: '#F8DDD9',
    gfap: '#D97757',
    uchl1: '#A66D9E',
    auc: '#7A9E5B',
  },
  mono: {
    name: 'Monochrome',
    bg: '#FAFAFA',
    card: '#FFFFFF',
    cardElev: '#FFFFFF',
    text: '#0A0A0A',
    textSec: '#666666',
    textTer: '#A0A0A0',
    border: 'rgba(0,0,0,0.08)',
    divider: 'rgba(0,0,0,0.10)',
    primary: '#0A0A0A',
    primarySoft: '#EFEFEF',
    good: '#1F1F1F',
    goodSoft: '#EFEFEF',
    warn: '#5A5A5A',
    warnSoft: '#E8E8E8',
    danger: '#0A0A0A',
    dangerSoft: '#DDDDDD',
    gfap: '#0A0A0A',
    uchl1: '#7A7A7A',
    auc: '#3A3A3A',
  },
};

// ─────────── TYPOGRAPHY ───────────
const monidleType = {
  family: '-apple-system, "SF Pro Display", "SF Pro Text", "Pretendard", system-ui, sans-serif',
  mono: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
};

// ─────────── CUTE ABSTRACT MASCOT (status-aware) ───────────
// Soft rounded blob with simple face — no realistic brain folds.
function BrainCharacter({ status = 'good', size = 140, theme }) {
  const palette = {
    good:   { fill: '#FFB7C5', shade: '#F592A6', cheek: '#FF7AA0', accent: '#FFE5EC' },
    warn:   { fill: '#FFC78A', shade: '#F0A65A', cheek: '#FF9A4D', accent: '#FFEED4' },
    danger: { fill: '#FF8A88', shade: '#E56462', cheek: '#FF5050', accent: '#FFD8D6' },
  }[status];

  const eyeOpen = status !== 'danger';
  const showCheeks = status === 'good';
  const sparkle = status === 'good';

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`mas-grad-${status}`} cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="35%" stopColor={palette.fill} />
          <stop offset="100%" stopColor={palette.shade} />
        </radialGradient>
        <filter id={`mas-shadow-${status}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
          <feOffset dy="4" />
          <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Floating body */}
      <g style={{ animation: 'monidleBlobFloat 4s ease-in-out infinite', transformOrigin: '70px 75px' }}
         filter={`url(#mas-shadow-${status})`}>
        {/* Soft blob silhouette — gently lobed but abstract */}
        <path d="
          M 70 22
          C 92 22, 112 34, 116 56
          C 122 64, 122 80, 116 90
          C 114 106, 96 116, 80 114
          C 74 118, 66 118, 60 114
          C 44 116, 26 106, 24 90
          C 18 80, 18 64, 24 56
          C 28 34, 48 22, 70 22 Z"
          fill={`url(#mas-grad-${status})`} />

        {/* Subtle highlight on top-left */}
        <ellipse cx="52" cy="44" rx="14" ry="8" fill="#FFFFFF" opacity="0.28" />

        {/* Tiny antenna with dot */}
        <line x1="70" y1="22" x2="70" y2="14" stroke={palette.shade} strokeWidth="2" strokeLinecap="round" />
        <circle cx="70" cy="11" r="3" fill={palette.shade} />
      </g>

      {/* Eyes */}
      {eyeOpen ? (
        <g>
          <ellipse cx="56" cy="72" rx="3.6" ry="4.2" fill="#2A2A35"
                   style={{ animation: 'monidleBlink 5s infinite', transformOrigin: '56px 72px' }} />
          <ellipse cx="84" cy="72" rx="3.6" ry="4.2" fill="#2A2A35"
                   style={{ animation: 'monidleBlink 5s infinite', transformOrigin: '84px 72px' }} />
          {/* Eye glints */}
          <circle cx="57.5" cy="70.5" r="1.2" fill="#FFFFFF" />
          <circle cx="85.5" cy="70.5" r="1.2" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          {/* Closed/squinted eyes when in danger — caring concern */}
          <path d="M 50 73 Q 56 69 62 73" stroke="#2A2A35" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 78 73 Q 84 69 90 73" stroke="#2A2A35" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Mouth */}
      {status === 'good' && (
        <path d="M 63 86 Q 70 92 77 86" stroke="#2A2A35" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}
      {status === 'warn' && (
        <ellipse cx="70" cy="87" rx="3" ry="2" fill="#2A2A35" />
      )}
      {status === 'danger' && (
        <path d="M 64 90 Q 70 84 76 90" stroke="#2A2A35" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}

      {/* Cheeks (only when happy) */}
      {showCheeks && (
        <>
          <ellipse cx="48" cy="84" rx="4.5" ry="2.8" fill={palette.cheek} opacity="0.55" />
          <ellipse cx="92" cy="84" rx="4.5" ry="2.8" fill={palette.cheek} opacity="0.55" />
        </>
      )}

      {/* Sparkles when good */}
      {sparkle && (
        <g opacity="0.85">
          <path d="M 28 50 l 0 -4 M 26 48 l 4 0" stroke={palette.shade} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 112 60 l 0 -3 M 110.5 58.5 l 3 0" stroke={palette.shade} strokeWidth="1.3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

// ─────────── ICONS (SF-style outline, 24px) ───────────
const Icon = ({ name, size = 24, color = 'currentColor', strokeWidth = 1.8 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
    case 'trends': return <svg {...p}><path d="M3 17l5-5 4 4 8-9" /><path d="M14 7h6v6" /></svg>;
    case 'device': return <svg {...p}><rect x="6" y="3" width="12" height="18" rx="3" /><circle cx="12" cy="17" r="1.2" fill={color} /></svg>;
    case 'profile': return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 5-6 8-6s7 2 8 6" /></svg>;
    case 'chevron-right': return <svg {...p}><path d="M9 6l6 6-6 6" /></svg>;
    case 'chevron-left': return <svg {...p}><path d="M15 6l-6 6 6 6" /></svg>;
    case 'chevron-down': return <svg {...p}><path d="M6 9l6 6 6-6" /></svg>;
    case 'bell': return <svg {...p}><path d="M6 16V11a6 6 0 1112 0v5l1.5 2H4.5L6 16z" /><path d="M10 21h4" /></svg>;
    case 'share': return <svg {...p}><path d="M12 3v13" /><path d="M7 8l5-5 5 5" /><path d="M5 12v8h14v-8" /></svg>;
    case 'settings': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12c0 .5 0 1-.1 1.4l2 1.5-2 3.5-2.4-.9c-.7.5-1.5 1-2.4 1.2L13.5 21h-3l-.5-2.3c-.9-.2-1.7-.7-2.4-1.2l-2.4.9-2-3.5 2-1.5C5.1 13 5 12.5 5 12s0-1 .1-1.4L3 9 5 5.5l2.4.9c.7-.5 1.5-1 2.4-1.2L10.5 3h3l.5 2.3c.9.2 1.7.7 2.4 1.2l2.4-.9 2 3.5-2 1.5c.1.4.1.9.1 1.4z" /></svg>;
    case 'edit': return <svg {...p}><path d="M4 20h4l11-11-4-4L4 16v4z" /><path d="M14 6l4 4" /></svg>;
    case 'doctor': return <svg {...p}><path d="M9 4v3a3 3 0 006 0V4" /><path d="M6 4v6c0 4 3 7 6 7s6-3 6-7V4" /><circle cx="18" cy="17" r="3" /><path d="M18 14v-2" /></svg>;
    case 'family': return <svg {...p}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="11" r="2.5" /><path d="M3 19c0-3 3-5 6-5s6 2 6 5" /><path d="M14 19c0-2 2-3 3-3s4 1 4 3" /></svg>;
    case 'battery': return <svg {...p}><rect x="3" y="8" width="16" height="8" rx="2" /><path d="M21 11v2" /></svg>;
    case 'firmware': return <svg {...p}><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M4 21h16" /></svg>;
    case 'replace': return <svg {...p}><path d="M3 12a9 9 0 0114-7l3 3" /><path d="M21 5v4h-4" /><path d="M21 12a9 9 0 01-14 7l-3-3" /><path d="M3 19v-4h4" /></svg>;
    case 'info': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v.5M12 11v5" /></svg>;
    case 'pair': return <svg {...p}><path d="M12 5v14" /><path d="M5 8h14" /><path d="M5 16h14" /></svg>;
    case 'check': return <svg {...p}><path d="M5 12l5 5L20 7" /></svg>;
    case 'close': return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case 'live': return <svg {...p}><circle cx="12" cy="12" r="3" fill={color} /><path d="M5 5a10 10 0 000 14M19 5a10 10 0 010 14" /></svg>;
    case 'lock': return <svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>;
    case 'phone': return <svg {...p}><path d="M5 4h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A18 18 0 013 6a2 2 0 012-2z" /></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'minus': return <svg {...p}><path d="M5 12h14" /></svg>;
    case 'alert': return <svg {...p}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18v.5" /></svg>;
    case 'arrow-up': return <svg {...p}><path d="M12 19V5M5 12l7-7 7 7" /></svg>;
    case 'arrow-down': return <svg {...p}><path d="M12 5v14M5 12l7 7 7-7" /></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" /></svg>;
    case 'shield': return <svg {...p}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    default: return null;
  }
};

// Expose globally
Object.assign(window, { monidleThemes, monidleType, BrainCharacter, Icon });
