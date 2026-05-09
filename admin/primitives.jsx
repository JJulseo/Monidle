/* Shared UI primitives — icons, badges, status pills, mini charts */

// ── Icons (line, 1.5px stroke) ─────────────────────────
const Icon = {
  Search: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke={color} strokeWidth="1.5"/>
      <path d="M11 11l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Bell: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3.5 11.5h9l-1-1.3V7.2A3.5 3.5 0 008 3.7 3.5 3.5 0 004.5 7.2v3l-1 1.3z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M6.5 13a1.5 1.5 0 003 0" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Chevron: ({ size = 14, color = 'currentColor', dir = 'right' }) => {
    const rot = { right: 0, down: 90, left: 180, up: 270 }[dir];
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M6 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  ArrowUp: ({ size = 12, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 9.5V2.5M6 2.5l-3 3M6 2.5l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ArrowDown: ({ size = 12, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 2.5v7M6 9.5l-3-3M6 9.5l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Back: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10 4l-4 4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Home: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 7L8 2.5 13.5 7v6.5h-3.5v-4h-4v4H2.5V7z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Pulse: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M1.5 8h3l1.5-3 2 6 1.5-3h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Device: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="4.5" y="2" width="7" height="12" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <path d="M7 11.5h2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Chat: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 3.5h11v8h-6l-3 2.5v-2.5h-2v-8z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  Visit: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="3" width="11" height="10" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <path d="M2.5 6h11M5.5 2v3M10.5 2v3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Pill: ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="5" width="12" height="6" rx="3" stroke={color} strokeWidth="1.5"/>
      <path d="M8 5v6" stroke={color} strokeWidth="1.5"/>
    </svg>
  ),
  Filter: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2.5 4h11M4.5 8h7M6.5 12h3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Sort: ({ size = 12, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M3.5 2v8M3.5 10l-2-2M3.5 10l2-2M8.5 10V2M8.5 2l-2 2M8.5 2l2 2" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Calendar: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="10" rx="1.5" stroke={color} strokeWidth="1.5"/>
      <path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Dot: ({ size = 8, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 8 8"><circle cx="4" cy="4" r="3.5" fill={color}/></svg>
  ),
  Check: ({ size = 12, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Logo: ({ size = 22, color = '#0E5FB5' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5c3.5 0 6 2.5 6 5.5 0 1.6-.7 3-1.8 4 .5.6.8 1.4.8 2.2 0 2-1.6 3.6-3.6 3.6-.6 0-1.2-.1-1.7-.4-.5.3-1.1.4-1.7.4-2 0-3.6-1.6-3.6-3.6 0-.8.3-1.6.8-2.2C6.7 12 6 10.6 6 9c0-3 2.5-5.5 6-5.5z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 8.5v8M9.5 11.5h5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Status meta ────────────────────────────────────────
const STATUS = {
  danger:  { label: '위험', label_en: 'Dangerous', fg: '#DC2626', bg: '#FEE2E2', bg2: '#FEF2F2', dot: '#DC2626' },
  warning: { label: '주의', label_en: 'Warning',   fg: '#B45309', bg: '#FEF3C7', bg2: '#FFFBEB', dot: '#D97706' },
  good:    { label: '정상', label_en: 'Good',      fg: '#15803D', bg: '#DCFCE7', bg2: '#F0FDF4', dot: '#16A34A' },
};

function StatusPill({ status, size = 'md', en = false }) {
  const s = STATUS[status];
  const small = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '2px 8px' : '4px 10px',
      borderRadius: 999,
      background: s.bg,
      color: s.fg,
      fontSize: small ? 11 : 12,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, display: 'inline-block', flexShrink: 0 }} />
      {en ? s.label_en : s.label}
    </span>
  );
}

function StatusDot({ status, pulse = false }) {
  const s = STATUS[status];
  return (
    <span className={pulse ? 'pulse-dot' : ''} style={{
      width: 8, height: 8, borderRadius: 999, background: s.dot, display: 'inline-block', flexShrink: 0,
    }} />
  );
}

// ── Connection indicator ───────────────────────────────
function ConnectionIndicator({ connected }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, color: connected ? '#16A34A' : '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span className={connected ? 'pulse-dot' : ''} style={{
        width: 6, height: 6, borderRadius: 999,
        background: connected ? '#16A34A' : '#CBD5E1',
      }}/>
      {connected ? '연결됨' : '연결 없음'}
    </span>
  );
}

// ── Delta arrow text ───────────────────────────────────
function Delta({ value, color }) {
  const positive = value >= 0;
  const c = color || (positive ? '#DC2626' : '#16A34A');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: c, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {positive ? <Icon.ArrowUp size={11} color={c}/> : <Icon.ArrowDown size={11} color={c}/>}
      {positive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

// ── Mini sparkline ─────────────────────────────────────
function Sparkline({ data, w = 88, h = 28, color = '#0E5FB5', threshold = null, fill = true }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data, threshold ?? Infinity);
  const max = Math.max(...data, threshold ?? -Infinity);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 4 - ((v - min) / range) * (h - 8)]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const thresholdY = threshold != null ? h - 4 - ((threshold - min) / range) * (h - 8) : null;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && (
        <path d={area} fill={color} opacity="0.08"/>
      )}
      {thresholdY != null && (
        <line x1="0" x2={w} y1={thresholdY} y2={thresholdY} stroke={color} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 2"/>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.2" fill={color}/>
    </svg>
  );
}

// ── Generic card ───────────────────────────────────────
function Card({ children, style = {}, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: '#fff',
        border: '1px solid #E4E8EE',
        borderRadius: 14,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        ...style,
      }}>
      {children}
    </div>
  );
}

// ── Section heading ────────────────────────────────────
function SectionHead({ title, action, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{title}</h3>
        {sub && <span style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</span>}
      </div>
      {action}
    </div>
  );
}

Object.assign(window, {
  Icon, STATUS, StatusPill, StatusDot, ConnectionIndicator, Delta, Sparkline, Card, SectionHead,
});
