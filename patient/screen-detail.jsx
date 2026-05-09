// DetailScreen — Comprehensive report with biomarker tabs, real-time, clinical refs
function DetailScreen({ theme, graphStyle, sim }) {
  const [biomarker, setBiomarker] = React.useState('GFAP');
  const [view, setView] = React.useState('full'); // 'full' | 'recent' | 'trend' | 'avg'

  const isGFAP = biomarker === 'GFAP';
  const series = isGFAP ? sim.gfap : sim.uch;
  const color = isGFAP ? theme.gfap : theme.uchl1;
  const ref = isGFAP ? CLINICAL.GFAP : CLINICAL.UCHL1;
  const baseline = ref.baseline;
  const critical = ref.critical;
  const unit = ref.unit;

  const now = series[series.length - 1];
  const last4 = series.slice(-4);
  const rate = ((last4[3] - last4[0]) / 1).toFixed(1); // per hour
  const recent1h = series.slice(-4);
  const max1h = Math.max(...recent1h);
  const min1h = Math.min(...recent1h);
  const aucCum = generateAUCSeries(series, baseline);
  const auc = aucCum[aucCum.length - 1];
  const trend = linearTrend(series);
  const ma = movingAvg(series, 8);

  let chartValues = series;
  let xLabels = ['00', '06', '12', '18', '지금'];
  let extraLine = null;
  let extraColor = null;

  if (view === 'recent') {
    chartValues = recent1h;
    xLabels = ['-1h', '-45m', '-30m', '-15m', '지금'];
  } else if (view === 'trend') {
    extraLine = trend;
    extraColor = theme.warn;
  } else if (view === 'avg') {
    extraLine = ma;
    extraColor = theme.good;
  }

  const fmt = (v) => v >= 100 ? v.toFixed(0) : v.toFixed(1);

  const stats = [
    { id: 'full', label: '현재 농도', value: fmt(now), unit, sub: '실시간' },
    { id: 'recent', label: '변화 속도', value: (Number(rate) >= 0 ? '+' : '') + rate, unit: unit + '/h', sub: '지난 1시간' },
    { id: 'full', label: 'AUC (24h)', value: fmt(auc), unit: 'pg·h', sub: '누적 노출' },
    { id: 'recent', label: '1h 최대', value: fmt(max1h), unit, sub: '최근 1시간' },
    { id: 'recent', label: '1h 최소', value: fmt(min1h), unit, sub: '최근 1시간' },
    { id: 'trend', label: '추세선', value: ((trend[trend.length - 1] - trend[0]) / 24).toFixed(1), unit: unit + '/h', sub: '24h 회귀' },
    { id: 'avg', label: '이동평균', value: fmt(ma[ma.length - 1]), unit, sub: '2h window' },
  ];

  const status = statusOf(now, isGFAP ? 'GFAP' : 'UCHL1');

  return (
    <div style={{ padding: '0 0 100px' }}>
      <PageHeader theme={theme} title="Trends" sub="상세 보고서" right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: theme.card, border: `0.5px solid ${theme.border}`, fontSize: 11, color: theme.textSec, fontWeight: 600 }}>
          <Icon name="live" size={11} color={theme.danger} /> 24h
        </div>
      } />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Biomarker segmented control */}
        <div style={{ display: 'flex', padding: 3, background: theme.card, borderRadius: 12, border: `0.5px solid ${theme.border}` }}>
          {['GFAP', 'UCH-L1'].map(b => (
            <div key={b} onClick={() => setBiomarker(b)} style={{
              flex: 1, padding: '8px 0', textAlign: 'center', borderRadius: 9,
              background: biomarker === b ? (b === 'GFAP' ? theme.gfap : theme.uchl1) : 'transparent',
              color: biomarker === b ? '#fff' : theme.text,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
            }}>
              {b}
            </div>
          ))}
        </div>

        {/* Big chart */}
        <Card theme={theme} padding={16}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.textSec, letterSpacing: 0.3 }}>
                {view === 'full' && '24시간 추이 (실시간)'}
                {view === 'recent' && '최근 1시간 (확대)'}
                {view === 'trend' && '추세선 (선형 회귀)'}
                {view === 'avg' && '이동평균 (2h window)'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: theme.text, letterSpacing: -0.7, fontVariantNumeric: 'tabular-nums' }}>{fmt(now)}</span>
                <span style={{ fontSize: 13, color: theme.textSec }}>{unit}</span>
              </div>
            </div>
            <StatusPill status={status} theme={theme} size="lg" />
          </div>
          <ChartWithOverlay
            values={chartValues}
            overlay={extraLine ? (view === 'recent' ? null : extraLine) : null}
            overlayColor={extraColor}
            color={color}
            baseline={view === 'recent' ? undefined : baseline}
            critical={view === 'recent' ? undefined : critical}
            theme={theme}
            xLabels={xLabels}
            graphStyle={graphStyle}
          />

          {/* Reference legend */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, padding: '8px 10px', background: theme.bg, borderRadius: 8, fontSize: 10 }}>
            <LegendItem color={theme.good} label={`정상 ≤ ${baseline}`} dash />
            <LegendItem color={theme.danger} label={`위험 ≥ ${critical}`} dash />
            <LegendItem color={color} label="실측" />
          </div>
        </Card>

        {/* Stat cards */}
        <SectionHeader title="지표" theme={theme} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {stats.map((s, i) => (
            <Card key={i} theme={theme} padding={14}
              onClick={() => setView(s.id)}
              style={{
                border: view === s.id ? `1.5px solid ${color}` : `0.5px solid ${theme.border}`,
                background: view === s.id ? color + '08' : theme.card,
              }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: theme.textSec, letterSpacing: 0.2 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: theme.text, letterSpacing: -0.4, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                <span style={{ fontSize: 10, color: theme.textSec }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 10, color: theme.textTer, marginTop: 2 }}>{s.sub}</div>
            </Card>
          ))}
        </div>

        {/* Clinical context */}
        <Card theme={theme} padding={14} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: theme.primarySoft, border: 'none' }}>
          <Icon name="info" size={18} color={theme.primary} />
          <div style={{ fontSize: 12, lineHeight: 1.5, color: theme.text }}>
            <strong>{biomarker}</strong>은(는) {isGFAP ? '성상교세포(astrocyte) 손상' : '신경세포(neuron) 손상'}을 나타내는 혈장 바이오마커예요.
            정상 상한 <strong>{baseline} {unit}</strong>, 위험 임계 <strong>{critical} {unit}</strong>입니다.
            <span style={{ display: 'block', fontSize: 10.5, color: theme.textSec, marginTop: 4 }}>
              참고: Banyan BTI / Abbott i-STAT TBI plasma assay
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LegendItem({ color, label, dash }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="14" height="6">
        {dash ? (
          <line x1="0" y1="3" x2="14" y2="3" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
        ) : (
          <line x1="0" y1="3" x2="14" y2="3" stroke={color} strokeWidth="2" />
        )}
      </svg>
      <span style={{ color: '#666', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function ChartWithOverlay({ values, overlay, overlayColor, color, baseline, critical, theme, xLabels, graphStyle }) {
  const w = 310, h = 200, padX = 40, padY = 16;
  const refs = [baseline, critical].filter(v => v !== undefined);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const min = Math.min(dataMin, ...refs) * 0.9;
  const max = Math.max(dataMax, ...refs) * 1.1;

  const points = mapPoints(values, w, h, padX, padY, min, max);
  const overlayPts = overlay ? mapPoints(overlay, w, h, padX, padY, min, max) : null;
  const path = graphStyle === 'spline' ? splinePath(points, 0.5) : `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const area = path + ` L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;
  const overlayPath = overlayPts ? splinePath(overlayPts, 0.5) : null;

  const yOf = v => padY + (1 - (v - min) / (max - min)) * (h - padY * 2);
  const baseY = baseline !== undefined ? yOf(baseline) : null;
  const critY = critical !== undefined ? yOf(critical) : null;

  return (
    <svg width={w} height={h + 16} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`dgrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Zone shading */}
      {baseY !== null && (
        <rect x={padX} y={baseY} width={w - padX - 4} height={h - padY - baseY}
              fill={theme.good} opacity="0.05" />
      )}
      {baseY !== null && critY !== null && (
        <rect x={padX} y={critY} width={w - padX - 4} height={baseY - critY}
              fill={theme.warn} opacity="0.06" />
      )}
      {critY !== null && (
        <rect x={padX} y={padY} width={w - padX - 4} height={critY - padY}
              fill={theme.danger} opacity="0.07" />
      )}

      {/* Y axis: top, baseline, critical, bottom */}
      {[max, ...(refs), min].map((t, i) => {
        const y = yOf(t);
        return (
          <text key={i} x={padX - 6} y={y + 3} fill={theme.textTer} fontSize="9.5"
                textAnchor="end" fontFamily={monidleType.mono}>
            {t >= 100 ? t.toFixed(0) : t.toFixed(1)}
          </text>
        );
      })}

      {/* Baseline line */}
      {baseY !== null && (
        <g>
          <line x1={padX} y1={baseY} x2={w - 4} y2={baseY}
                stroke={theme.good} strokeDasharray="3 3" strokeWidth="1.2" opacity="0.8" />
          <text x={padX + 4} y={baseY - 4} fill={theme.good} fontSize="9.5"
                fontWeight="700" letterSpacing="0.2">정상 {baseline}</text>
        </g>
      )}

      {/* Critical line */}
      {critY !== null && (
        <g>
          <line x1={padX} y1={critY} x2={w - 4} y2={critY}
                stroke={theme.danger} strokeDasharray="4 3" strokeWidth="1.4" opacity="0.9" />
          <text x={padX + 4} y={critY - 4} fill={theme.danger} fontSize="9.5"
                fontWeight="700" letterSpacing="0.2">위험 {critical}</text>
        </g>
      )}

      {/* Area + line */}
      {graphStyle !== 'minimal' && <path d={area} fill={`url(#dgrad-${color.replace('#', '')})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {overlayPath && <path d={overlayPath} fill="none" stroke={overlayColor} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />}

      {/* Live dot with pulse */}
      <g>
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill={color} opacity="0.35">
          <animate attributeName="r" values="5;12;5" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="6" fill={color} opacity="0.18" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3.4" fill={color} stroke="#fff" strokeWidth="1.6" />
      </g>

      {/* X labels */}
      {xLabels.map((l, i) => (
        <text key={i} x={padX + (i / (xLabels.length - 1)) * (w - padX - 4)} y={h + 12}
              fill={theme.textTer} fontSize="9.5" textAnchor="middle" fontFamily={monidleType.mono}>{l}</text>
      ))}
    </svg>
  );
}

Object.assign(window, { DetailScreen });
