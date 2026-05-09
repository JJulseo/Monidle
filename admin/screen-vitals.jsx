/* Screen 3: Vitals — detailed analysis chart */

function PatientVitalsScreen({ patient, openMarker }) {
  const [range, setRange] = React.useState('6h'); // 1h | 3h | 6h | 24h | all
  const [open, setOpen] = React.useState({ gfap: openMarker !== 'uchl1', uchl1: openMarker === 'uchl1' });
  const [overlays, setOverlays] = React.useState({
    threshold: true, ma: true, trend: true, breach: true, events: true, band: true,
  });

  return (
    <main className="scroll page-enter" style={{
      flex: 1, overflow: 'auto', background: '#F7F8FA',
      padding: '20px 24px 40px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <Breadcrumb patient={patient} tab="Vitals"/>
          <h2 style={{
            margin: '8px 0 0', fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em',
          }}>바이오마커 상세 분석</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RangeSelector value={range} onChange={setRange}/>
          <div style={{ width: 1, height: 24, background: '#E4E8EE' }}/>
          <button style={{
            height: 34, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#fff', border: '1px solid #E4E8EE', borderRadius: 8,
            fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
          }}>
            <Icon.Calendar size={13} color="#475569"/>
            커스텀 범위
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <BiomarkerSection
          name="GFAP"
          fullName="Glial Fibrillary Acidic Protein"
          unit="pg/mL"
          value={patient.gfap.value}
          delta={patient.gfap.delta}
          baseline={patient.gfap.baseline}
          threshold={patient.gfap.threshold}
          series={window.MonidleData.seriesFor(patient.id, 'gfap')}
          range={range}
          open={open.gfap}
          onToggle={() => setOpen({ ...open, gfap: !open.gfap })}
          overlays={overlays}
          setOverlays={setOverlays}
          accentColor="#DC2626"
        />
        <BiomarkerSection
          name="UCH-L1"
          fullName="Ubiquitin C-terminal Hydrolase L1"
          unit="pg/mL"
          value={patient.uchl1.value}
          delta={patient.uchl1.delta}
          baseline={patient.uchl1.baseline}
          threshold={patient.uchl1.threshold}
          series={window.MonidleData.seriesFor(patient.id, 'uchl1')}
          range={range}
          open={open.uchl1}
          onToggle={() => setOpen({ ...open, uchl1: !open.uchl1 })}
          overlays={overlays}
          setOverlays={setOverlays}
          accentColor="#DC2626"
        />
      </div>
    </main>
  );
}

function RangeSelector({ value, onChange }) {
  const opts = [
    { v: '1h', l: '1H' }, { v: '3h', l: '3H' }, { v: '6h', l: '6H' },
    { v: '24h', l: '24H' }, { v: 'all', l: '전체' },
  ];
  return (
    <div style={{
      display: 'inline-flex', background: '#fff', border: '1px solid #E4E8EE', borderRadius: 8, padding: 3,
    }}>
      {opts.map(o => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          style={{
            height: 28, padding: '0 12px',
            background: value === o.v ? '#0E5FB5' : 'transparent',
            color: value === o.v ? '#fff' : '#475569',
            border: 'none', borderRadius: 6,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--mono)',
          }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function BiomarkerSection({ name, fullName, unit, value, delta, baseline, threshold, series, range, open, onToggle, overlays, setOverlays, accentColor }) {
  const breached = value > threshold;
  const ratio = value / threshold;

  // slice based on range
  const ranges = { '1h': 60, '3h': 180, '6h': 360, '24h': 360, 'all': 360 };
  const sliced = series.slice(-ranges[range]);

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {/* header strip */}
      <button onClick={onToggle} style={{
        width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        background: open ? '#FAFBFC' : '#fff',
        border: 'none', borderBottom: open ? '1px solid #EDEFF3' : '1px solid transparent',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <Icon.Chevron size={14} color="#475569" dir={open ? 'down' : 'right'}/>
        <span className={breached ? 'pulse-dot' : ''} style={{
          width: 10, height: 10, borderRadius: 999,
          background: breached ? accentColor : '#16A34A',
        }}/>
        <div style={{ minWidth: 130 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>{name}</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{fullName}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginLeft: 18 }}>
          <span className="tnum" style={{
            fontSize: 22, fontWeight: 800, color: breached ? accentColor : '#0F172A', letterSpacing: '-0.02em',
          }}>{value.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{unit}</span>
        </div>
        <div style={{ marginLeft: 14 }}>
          <Delta value={delta} color={breached ? accentColor : '#D97706'}/>
          <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 4 }}>(1h)</span>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: '#475569' }}>
          <span>임계값: <span className="tnum" style={{ fontWeight: 700, color: '#0F172A' }}>{threshold}</span> <span style={{ color: '#94A3B8' }}>{unit}</span></span>
          {breached && (
            <span style={{
              padding: '4px 9px', background: '#FEE2E2', color: accentColor,
              borderRadius: 6, fontSize: 11, fontWeight: 700,
            }}>
              <span className="tnum">{ratio.toFixed(2)}×</span> 초과
            </span>
          )}
        </div>
      </button>

      {open && (
        <div style={{ padding: '16px 18px 20px' }}>
          <ChartToolbar overlays={overlays} setOverlays={setOverlays}/>
          <AnalysisChart
            data={sliced} threshold={threshold} baseline={baseline}
            unit={unit} overlays={overlays} accentColor={accentColor} range={range}
          />
          <AnalysisGrid data={sliced} threshold={threshold} unit={unit}/>
        </div>
      )}
    </Card>
  );
}

function ChartToolbar({ overlays, setOverlays }) {
  const toggles = [
    { k: 'threshold', l: '임계값', dash: true, color: '#DC2626' },
    { k: 'ma',        l: '이동평균',           color: '#0E5FB5' },
    { k: 'trend',     l: '추세선',  dash: true, color: '#7C3AED' },
    { k: 'band',      l: '표준편차 밴드', color: '#94A3B8' },
    { k: 'breach',    l: '초과 구간', fill: true, color: '#DC2626' },
    { k: 'events',    l: '이벤트',     color: '#D97706' },
  ];
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14,
    }}>
      {toggles.map(t => {
        const on = overlays[t.k];
        return (
          <button
            key={t.k}
            onClick={() => setOverlays({ ...overlays, [t.k]: !on })}
            style={{
              height: 28, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 7,
              background: on ? '#fff' : '#F1F3F6',
              border: `1px solid ${on ? '#CBD5E1' : 'transparent'}`,
              borderRadius: 6, fontSize: 11, fontWeight: 600,
              color: on ? '#0F172A' : '#94A3B8', cursor: 'pointer',
            }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              {t.fill ? (
                <span style={{ width: 12, height: 8, background: t.color, opacity: 0.25, borderRadius: 2 }}/>
              ) : t.dash ? (
                <svg width="14" height="6"><line x1="0" y1="3" x2="14" y2="3" stroke={t.color} strokeWidth="1.5" strokeDasharray="3 2"/></svg>
              ) : (
                <svg width="14" height="6"><line x1="0" y1="3" x2="14" y2="3" stroke={t.color} strokeWidth="1.5"/></svg>
              )}
            </span>
            {t.l}
          </button>
        );
      })}
    </div>
  );
}

function AnalysisChart({ data, threshold, baseline, unit, overlays, accentColor, range }) {
  const w = 940, h = 280;
  const padL = 48, padR = 16, padT = 14, padB = 28;
  const innerW = w - padL - padR, innerH = h - padT - padB;

  const ma = window.MonidleData.movingAvg(data, 20);
  const trend = window.MonidleData.trendLine(data);
  const band = window.MonidleData.stdBand(data, ma, 1.5);

  const min = Math.min(...data, baseline) * 0.9;
  const max = Math.max(...data, threshold) * 1.08;
  const yToPx = y => padT + innerH - ((y - min) / (max - min)) * innerH;
  const xToPx = i => padL + (i / (data.length - 1)) * innerW;

  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${xToPx(i)},${yToPx(v)}`).join(' ');
  const maPath = ma.map((v, i) => `${i === 0 ? 'M' : 'L'}${xToPx(i)},${yToPx(v)}`).join(' ');
  const trendPath = `M${xToPx(0)},${yToPx(trend[0])} L${xToPx(data.length - 1)},${yToPx(trend[trend.length - 1])}`;

  const bandUpper = band.map((b, i) => `${i === 0 ? 'M' : 'L'}${xToPx(i)},${yToPx(b.upper)}`).join(' ');
  const bandLower = band.slice().reverse().map((b, j) => {
    const i = band.length - 1 - j;
    return `L${xToPx(i)},${yToPx(b.lower)}`;
  }).join(' ');
  const bandPath = `${bandUpper} ${bandLower} Z`;

  // breach segments
  const breachSegments = [];
  let inBreach = false, segStart = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] > threshold && !inBreach) { segStart = i; inBreach = true; }
    if ((data[i] <= threshold || i === data.length - 1) && inBreach) {
      breachSegments.push([segStart, i]); inBreach = false;
    }
  }

  // events (alert markers) — synthetic: at breach starts and an mid-point
  const events = breachSegments.map(([s]) => ({ i: s, label: '임계값 돌파', level: 'danger' }));
  if (data.length > 100) events.push({ i: Math.floor(data.length * 0.55), label: '재상승', level: 'warning' });

  const yTicks = 5;
  const yLines = Array.from({ length: yTicks }, (_, i) => min + (i / (yTicks - 1)) * (max - min));

  const xLabels = (() => {
    const labels = ['-6h', '-5h', '-4h', '-3h', '-2h', '-1h', '지금'];
    if (range === '1h') return ['-60m', '-45m', '-30m', '-15m', '지금'];
    if (range === '3h') return ['-3h', '-2h', '-1h', '지금'];
    if (range === '24h') return ['-24h', '-18h', '-12h', '-6h', '지금'];
    return labels;
  })();

  // hover
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (w / rect.width);
    const idx = Math.round(((x - padL) / innerW) * (data.length - 1));
    if (idx >= 0 && idx < data.length) setHoverIdx(idx);
  };
  const onLeave = () => setHoverIdx(null);

  // animated end point
  const lastIdx = data.length - 1;

  return (
    <div style={{
      background: '#fff', border: '1px solid #EDEFF3', borderRadius: 10, padding: '6px 4px 0', position: 'relative',
    }}>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'block' }}>
        {/* y grid */}
        {yLines.map((y, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={yToPx(y)} y2={yToPx(y)} stroke="#F1F3F6" strokeWidth="1"/>
            <text x={padL - 8} y={yToPx(y) + 3} fontSize="10" fill="#94A3B8" textAnchor="end" fontFamily="var(--mono)">
              {y.toFixed(0)}
            </text>
          </g>
        ))}

        {/* breach background */}
        {overlays.breach && breachSegments.map(([s, e], i) => (
          <rect key={i}
            x={xToPx(s)} y={padT}
            width={xToPx(e) - xToPx(s)}
            height={innerH}
            fill="#FEE2E2" opacity="0.5"/>
        ))}

        {/* baseline horizontal */}
        <line x1={padL} x2={w - padR} y1={yToPx(baseline)} y2={yToPx(baseline)}
          stroke="#94A3B8" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>
        <text x={w - padR - 4} y={yToPx(baseline) - 4} fontSize="9" fill="#94A3B8" textAnchor="end" fontFamily="var(--mono)">
          기준 {baseline}
        </text>

        {/* threshold */}
        {overlays.threshold && (
          <>
            <line x1={padL} x2={w - padR} y1={yToPx(threshold)} y2={yToPx(threshold)}
              stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 3"/>
            <rect x={w - padR - 84} y={yToPx(threshold) - 18} width="80" height="14" rx="3" fill="#DC2626"/>
            <text x={w - padR - 44} y={yToPx(threshold) - 8} fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="var(--mono)" letterSpacing="0.04em">
              임계값 {threshold}
            </text>
          </>
        )}

        {/* std band */}
        {overlays.band && (
          <path d={bandPath} fill="#0E5FB5" opacity="0.08"/>
        )}

        {/* main line area */}
        <path d={`${path} L${xToPx(data.length - 1)},${padT + innerH} L${xToPx(0)},${padT + innerH} Z`}
          fill="#0E5FB5" opacity="0.06"/>
        <path d={path} fill="none" stroke="#0E5FB5" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>

        {/* MA */}
        {overlays.ma && (
          <path d={maPath} fill="none" stroke="#0E5FB5" strokeWidth="2.2" strokeLinejoin="round" strokeOpacity="0.95"/>
        )}

        {/* trend */}
        {overlays.trend && (
          <path d={trendPath} fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="5 3"/>
        )}

        {/* events */}
        {overlays.events && events.map((ev, i) => (
          <g key={i}>
            <line x1={xToPx(ev.i)} x2={xToPx(ev.i)} y1={padT} y2={padT + innerH}
              stroke={ev.level === 'danger' ? '#DC2626' : '#D97706'} strokeWidth="1" strokeDasharray="2 2" opacity="0.45"/>
            <circle cx={xToPx(ev.i)} cy={padT + 8} r="5" fill={ev.level === 'danger' ? '#DC2626' : '#D97706'}/>
            <text x={xToPx(ev.i)} y={padT + 11} fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">!</text>
          </g>
        ))}

        {/* current value indicator */}
        <circle cx={xToPx(lastIdx)} cy={yToPx(data[lastIdx])} r="4" fill={accentColor}/>
        <circle cx={xToPx(lastIdx)} cy={yToPx(data[lastIdx])} r="2" fill="#fff"/>

        {/* hover */}
        {hoverIdx != null && (
          <g>
            <line x1={xToPx(hoverIdx)} x2={xToPx(hoverIdx)} y1={padT} y2={padT + innerH} stroke="#0F172A" strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>
            <circle cx={xToPx(hoverIdx)} cy={yToPx(data[hoverIdx])} r="4" fill="#fff" stroke="#0E5FB5" strokeWidth="2"/>
          </g>
        )}

        {/* x labels */}
        {xLabels.map((l, i) => (
          <text key={i}
            x={padL + (i / (xLabels.length - 1)) * innerW} y={h - 8}
            fontSize="10" fill="#94A3B8" textAnchor="middle" fontFamily="var(--mono)">
            {l}
          </text>
        ))}
      </svg>

      {hoverIdx != null && (
        <div style={{
          position: 'absolute', top: 14, left: 60,
          background: '#0F172A', color: '#fff', padding: '8px 11px',
          borderRadius: 6, fontSize: 11, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          <div className="tnum" style={{ fontWeight: 700, fontSize: 14 }}>
            {data[hoverIdx].toFixed(2)} <span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 500 }}>{unit}</span>
          </div>
          <div style={{ color: '#94A3B8', fontFamily: 'var(--mono)', fontSize: 10, marginTop: 2 }}>
            t = {Math.round((hoverIdx / data.length) * 360)}분 / 6h
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisGrid({ data, threshold, unit }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const ma = window.MonidleData.movingAvg(data, 20);
  const lastMa = ma[ma.length - 1];
  const rate = ((data[data.length - 1] - data[0]) / data.length) * 60; // per hour
  const breachMins = data.filter(v => v > threshold).length;
  const breachPct = (breachMins / data.length) * 100;
  const auc = data.reduce((s, v) => s + Math.max(0, v - threshold), 0);

  const items = [
    { l: '최댓값',   v: max.toFixed(1),  u: unit, c: '#DC2626' },
    { l: '최솟값',   v: min.toFixed(1),  u: unit, c: '#16A34A' },
    { l: '이동평균(현재)', v: lastMa.toFixed(1), u: unit, c: '#0E5FB5' },
    { l: '변화 속도', v: (rate >= 0 ? '+' : '') + rate.toFixed(2), u: `${unit}/h`, c: rate > 0 ? '#DC2626' : '#16A34A' },
    { l: '초과 시간', v: breachMins, u: '분', sub: `${breachPct.toFixed(0)}%`, c: '#DC2626' },
    { l: '초과 AUC',  v: auc.toFixed(0), u: `${unit}·min`, c: '#DC2626' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1,
      marginTop: 14, background: '#EDEFF3', borderRadius: 8, overflow: 'hidden',
      border: '1px solid #EDEFF3',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: '12px 14px', background: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{it.l}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tnum" style={{ fontSize: 17, fontWeight: 800, color: it.c, letterSpacing: '-0.02em' }}>{it.v}</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>{it.u}</span>
            {it.sub && <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 4 }}>· {it.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { PatientVitalsScreen });
