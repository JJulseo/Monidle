// Reusable atoms — Card, StatusPill, MetricCard, MiniChart, etc.

function Card({ children, style, onClick, theme, padding = 16 }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.card,
        borderRadius: 16,
        padding,
        border: `0.5px solid ${theme.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.02)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform .15s ease, box-shadow .15s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatusPill({ status, theme, size = 'sm' }) {
  const map = {
    good: { label: 'Good', color: theme.good, bg: theme.goodSoft, label_ko: '정상' },
    warn: { label: 'Warning', color: theme.warn, bg: theme.warnSoft, label_ko: '주의' },
    danger: { label: 'Critical', color: theme.danger, bg: theme.dangerSoft, label_ko: '위험' },
  }[status];
  const py = size === 'lg' ? '6px 12px' : '3px 8px';
  const fs = size === 'lg' ? 13 : 11;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: py, borderRadius: 999,
      background: map.bg, color: map.color,
      fontSize: fs, fontWeight: 600, letterSpacing: -0.1,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: map.color }} />
      {map.label_ko}
    </span>
  );
}

function LiveDot({ color = '#FF3B30' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color, letterSpacing: 0.3 }}>
      <span style={{
        width: 7, height: 7, borderRadius: 999, background: color,
        animation: 'monidlePulse 1.5s ease-in-out infinite',
      }} />
      LIVE
    </span>
  );
}

function MetricCard({ label, value, unit, status, color, active, onClick, theme, sub }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: '12px 12px 14px',
        borderRadius: 14,
        background: active ? color + '15' : theme.card,
        border: `1.5px solid ${active ? color : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all .2s ease',
        position: 'relative',
        boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.textSec, letterSpacing: 0.2 }}>{label}</span>
        {status && <StatusDot status={status} theme={theme} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{value}</span>
        <span style={{ fontSize: 10, fontWeight: 500, color: theme.textSec }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 10, color: theme.textTer, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusDot({ status, theme }) {
  const c = { good: theme.good, warn: theme.warn, danger: theme.danger }[status];
  return <span style={{ width: 6, height: 6, borderRadius: 999, background: c, display: 'inline-block' }} />;
}

// Mini spline chart with clinical reference lines (baseline + critical)
function MiniChart({
  values, width = 320, height = 120,
  color = '#007AFF', fill = true, theme,
  baseline, critical,           // clinical reference values (pg/mL)
  baselineLabel = '정상',
  criticalLabel = '위험',
  yLabels = true, xLabels, animated = true,
  style = 'spline',
  highlight,
  pulse = false,                // animate the latest dot (for live data)
}) {
  const padX = yLabels ? 32 : 4;
  const padY = 14;

  const refs = [baseline, critical].filter(v => v !== undefined);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const min = Math.min(dataMin, ...refs) * 0.92;
  const max = Math.max(dataMax, ...refs) * 1.08;

  const points = mapPoints(values, width, height, padX, padY, min, max);
  const path = style === 'spline' ? splinePath(points, 0.5)
    : `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const areaPath = path + ` L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  const yOf = v => padY + (1 - (v - min) / (max - min)) * (height - padY * 2);
  const baseY = baseline !== undefined ? yOf(baseline) : null;
  const critY = critical !== undefined ? yOf(critical) : null;
  const lastP = points[points.length - 1];
  const hp = highlight != null ? points[highlight] : null;

  // Y labels: include baseline/critical in tick set
  const tickVals = [max, ...(refs.length ? refs : [(min + max) / 2]), min]
    .sort((a, b) => b - a);

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Zone fills: safe (below baseline), caution (baseline–critical), danger (above critical) */}
      {baseY !== null && (
        <rect x={padX} y={baseY} width={width - padX - 4} height={height - padY - baseY}
              fill={theme.good} opacity="0.05" />
      )}
      {baseY !== null && critY !== null && (
        <rect x={padX} y={critY} width={width - padX - 4} height={baseY - critY}
              fill={theme.warn} opacity="0.06" />
      )}
      {critY !== null && (
        <rect x={padX} y={padY} width={width - padX - 4} height={critY - padY}
              fill={theme.danger} opacity="0.07" />
      )}

      {/* Y axis labels (no grid lines — refs handle that) */}
      {yLabels && [max, min].map((t, i) => {
        const y = i === 0 ? padY + 3 : height - padY - 1;
        return (
          <text key={i} x={padX - 6} y={y} fill={theme.textTer} fontSize="9"
                textAnchor="end" fontFamily={monidleType.mono}>
            {t.toFixed(t < 10 ? 1 : 0)}
          </text>
        );
      })}

      {/* Baseline (정상) */}
      {baseY !== null && (
        <g>
          <line x1={padX} y1={baseY} x2={width - 4} y2={baseY}
                stroke={theme.good} strokeDasharray="3 3" strokeWidth="1" opacity="0.75" />
          <text x={padX + 2} y={baseY - 3} fill={theme.good} fontSize="8.5"
                fontWeight="700" letterSpacing="0.2">
            {baselineLabel} {baseline}
          </text>
        </g>
      )}

      {/* Critical (위험) */}
      {critY !== null && (
        <g>
          <line x1={padX} y1={critY} x2={width - 4} y2={critY}
                stroke={theme.danger} strokeDasharray="4 3" strokeWidth="1.2" opacity="0.85" />
          <text x={padX + 2} y={critY - 3} fill={theme.danger} fontSize="8.5"
                fontWeight="700" letterSpacing="0.2">
            {criticalLabel} {critical}
          </text>
        </g>
      )}

      {/* Area + line */}
      {fill && style !== 'minimal' && <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={animated ? { strokeDasharray: 1000, strokeDashoffset: 0, animation: 'monidleDraw 1.2s ease-out' } : {}} />

      {/* Last point dot */}
      {style !== 'minimal' && lastP && (
        <g>
          {pulse && (
            <circle cx={lastP.x} cy={lastP.y} r="5" fill={color} opacity="0.35">
              <animate attributeName="r" values="5;11;5" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0;0.35" dur="1.6s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={lastP.x} cy={lastP.y} r="6" fill={color} opacity="0.18" />
          <circle cx={lastP.x} cy={lastP.y} r="3.2" fill={color} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}

      {/* Highlight */}
      {hp && (
        <g>
          <line x1={hp.x} y1={padY} x2={hp.x} y2={height - padY} stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          <circle cx={hp.x} cy={hp.y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
        </g>
      )}

      {/* X labels */}
      {xLabels && xLabels.map((l, i) => (
        <text key={i} x={padX + (i / (xLabels.length - 1)) * (width - padX - 4)} y={height - 1}
              fill={theme.textTer} fontSize="9" textAnchor="middle" fontFamily={monidleType.mono}>
          {l}
        </text>
      ))}
    </svg>
  );
}

// Tab bar
function TabBar({ active, onChange, theme }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'detail', icon: 'trends', label: 'Trends' },
    { id: 'device', icon: 'device', label: 'Device' },
    { id: 'profile', icon: 'profile', label: 'Profile' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingTop: 8, paddingBottom: 22,
      background: theme.card,
      borderTop: `0.5px solid ${theme.divider}`,
      display: 'flex', justifyContent: 'space-around',
      backdropFilter: 'blur(20px)',
      zIndex: 5,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <div key={t.id} onClick={() => onChange(t.id)}
               style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1 }}>
            <Icon name={t.icon} size={24} color={isActive ? theme.primary : theme.textTer} strokeWidth={isActive ? 2.2 : 1.7} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, color: isActive ? theme.primary : theme.textTer, letterSpacing: 0.1 }}>
              {t.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Section heading
function SectionHeader({ title, action, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: theme.textSec, letterSpacing: -0.1, textTransform: 'uppercase', fontSize: 11 }}>{title}</span>
      {action}
    </div>
  );
}

// Page header inside the phone
function PageHeader({ title, theme, right, sub, brand }) {
  return (
    <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        {brand ? (
          <img src="../fonts/monidle-lockup-horizontal%202.png" alt="Monidle" style={{ height: 30, display: 'block' }} />
        ) : (
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.text, letterSpacing: -0.7, lineHeight: 1.1 }}>{title}</div>
        )}
        {sub && <div style={{ fontSize: 12, color: theme.textSec, marginTop: 4 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, {
  Card, StatusPill, LiveDot, MetricCard, StatusDot,
  MiniChart, TabBar, SectionHeader, PageHeader,
});
