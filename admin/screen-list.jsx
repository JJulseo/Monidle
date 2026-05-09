/* Screen 1: Patient list */

function PatientListScreen({ onSelectPatient }) {
  const { patients } = window.MonidleData;
  const [, forceTick] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.MonidleData.subscribe(() => forceTick()), []);
  const [filters, setFilters] = React.useState({ danger: true, warning: true, good: true });
  const [sortBy, setSortBy] = React.useState('risk'); // risk | recent | name
  const [activeView, setActiveView] = React.useState('all');

  const counts = {
    danger: patients.filter(p => p.status === 'danger').length,
    warning: patients.filter(p => p.status === 'warning').length,
    good: patients.filter(p => p.status === 'good').length,
  };

  const filtered = patients.filter(p => filters[p.status]);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'risk') {
      const order = { danger: 0, warning: 1, good: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return b.gfap.value - a.gfap.value;
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
    return 0;
  });

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, background: '#F7F8FA' }}>
      {/* Left filter sidebar */}
      <aside style={{
        width: 240, background: '#FFFFFF', borderRight: '1px solid #E4E8EE',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 18px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 10 }}>VIEW</div>
          <SidebarButton
            active={activeView === 'all'}
            onClick={() => setActiveView('all')}
            label="전체 환자"
            count={patients.length}
          />
          <SidebarButton active={activeView === 'mine'} onClick={() => setActiveView('mine')} label="담당 환자" count={4}/>
          <SidebarButton active={activeView === 'recent'} onClick={() => setActiveView('recent')} label="최근 본 환자" count={6}/>
        </div>

        <div style={{ height: 1, background: '#EDEFF3', margin: '4px 18px' }}/>

        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 10 }}>위험도 필터</div>
          {['danger', 'warning', 'good'].map(s => (
            <FilterCheckbox
              key={s}
              status={s}
              count={counts[s]}
              checked={filters[s]}
              onChange={() => setFilters({ ...filters, [s]: !filters[s] })}
            />
          ))}
        </div>

        <div style={{ height: 1, background: '#EDEFF3', margin: '4px 18px' }}/>

        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 10 }}>정렬 기준</div>
          {[
            { v: 'risk', l: '위험도순' },
            { v: 'recent', l: '최근 알람순' },
            { v: 'name', l: '이름순' },
          ].map(o => (
            <SortRadio key={o.v} active={sortBy === o.v} onClick={() => setSortBy(o.v)} label={o.l}/>
          ))}
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{
          padding: '14px 18px', borderTop: '1px solid #EDEFF3',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.04em' }}>SENSOR FLEET</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="tnum" style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>13</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>/ {patients.length} 활성</span>
          </div>
        </div>
      </aside>

      {/* Main: patient table */}
      <main
        className="scroll page-enter"
        style={{
          flex: 1, overflow: 'auto', padding: '20px 28px 40px',
          ...(counts.danger > 0 ? { animation: 'table-danger-blink 1.4s ease-in-out infinite' } : {}),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>환자 모니터링</h1>
            <div style={{ marginTop: 4, fontSize: 13, color: '#475569' }}>
              실시간 바이오마커 추적 · <span className="tnum">{filtered.length}</span>명 표시 중
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ToolbarChip><Icon.Filter size={13} color="#475569"/>필터</ToolbarChip>
            <ToolbarChip><Icon.Calendar size={13} color="#475569"/>오늘</ToolbarChip>
            <ToolbarChip primary><Icon.Sort size={11} color="#fff"/>리포트</ToolbarChip>
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <StatCard label="위험" value={counts.danger} color="#DC2626" total={patients.length}/>
          <StatCard label="주의" value={counts.warning} color="#D97706" total={patients.length}/>
          <StatCard label="정상" value={counts.good} color="#16A34A" total={patients.length}/>
          <StatCard label="센서 오프라인" value={patients.filter(p => !p.connected).length} color="#94A3B8" total={patients.length}/>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '88px 1.5fr 1.6fr 1.6fr 1fr 100px 76px',
          gap: 8,
          padding: '10px 18px', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em',
        }}>
          <div>상태</div>
          <div>환자</div>
          <div>GFAP <span style={{ color: '#CBD5E1', fontWeight: 500 }}>pg/mL</span></div>
          <div>UCH-L1 <span style={{ color: '#CBD5E1', fontWeight: 500 }}>pg/mL</span></div>
          <div>AUC <span style={{ color: '#CBD5E1', fontWeight: 500 }}>(누적)</span></div>
          <div>센서</div>
          <div style={{ textAlign: 'right' }}>업데이트</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sorted.map((p, idx) => (
            <PatientRow key={p.id} patient={p} onClick={() => onSelectPatient(p.id)} index={idx}/>
          ))}
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', height: 32, padding: '0 10px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', whiteSpace: 'nowrap',
        background: active ? '#E8F1FB' : 'transparent',
        border: 'none', borderRadius: 8, marginBottom: 2,
        fontSize: 13, fontWeight: active ? 600 : 500,
        color: active ? '#0E5FB5' : '#475569',
        transition: 'all 120ms',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F1F3F6'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{label}</span>
      <span className="tnum" style={{ fontSize: 11, color: active ? '#0E5FB5' : '#94A3B8', fontWeight: 600 }}>{count}</span>
    </button>
  );
}

function FilterCheckbox({ status, count, checked, onChange }) {
  const s = window.STATUS[status];
  return (
    <button
      onClick={onChange}
      style={{
        width: '100%', height: 30, padding: '0 6px 0 8px', display: 'flex', alignItems: 'center', gap: 9,
        background: 'transparent', border: 'none', borderRadius: 6, marginBottom: 2,
        fontSize: 13, color: '#0F172A', cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: 14, height: 14, borderRadius: 3,
        border: `1.5px solid ${checked ? s.dot : '#CBD5E1'}`,
        background: checked ? s.dot : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {checked && <Icon.Check size={9} color="#fff"/>}
      </span>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: s.dot }}/>
      <span style={{ fontWeight: 500 }}>{s.label}</span>
      <span style={{ marginLeft: 'auto' }} className="tnum" >
        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{count}</span>
      </span>
    </button>
  );
}

function SortRadio({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', height: 30, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 9,
        background: 'transparent', border: 'none', borderRadius: 6, marginBottom: 2,
        fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#0E5FB5' : '#475569',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: 14, height: 14, borderRadius: 999,
        border: `1.5px solid ${active ? '#0E5FB5' : '#CBD5E1'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {active && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#0E5FB5' }}/>}
      </span>
      {label}
    </button>
  );
}

function ToolbarChip({ children, primary }) {
  return (
    <button style={{
      height: 34, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6,
      background: primary ? '#0E5FB5' : '#fff',
      color: primary ? '#fff' : '#0F172A',
      border: primary ? '1px solid #0E5FB5' : '1px solid #E4E8EE',
      borderRadius: 8, whiteSpace: 'nowrap',
      fontSize: 12, fontWeight: 600,
    }}>{children}</button>
  );
}

function StatCard({ label, value, color, total }) {
  return (
    <div style={{
      padding: '14px 16px', background: '#fff', border: '1px solid #E4E8EE',
      borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: color }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#475569', fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color }}/>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="tnum" style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{value}</span>
        <span className="tnum" style={{ fontSize: 12, color: '#94A3B8' }}>/ {total}</span>
      </div>
    </div>
  );
}

// ── Danger row helpers ─────────────────────────────────────────────────────
function DangerChart({ data, threshold, color }) {
  if (!data || data.length < 2) return null;
  const VW = 400, VH = 96;
  const pt = 18, pb = 6, pl = 4, pr = 8;
  const cw = VW - pl - pr, ch = VH - pt - pb;

  const maxVal = Math.max(...data);
  const minVal = Math.min(...data, threshold * 0.8);
  const range = Math.max(maxVal - minVal, 1);

  const tx = i => pl + (i / (data.length - 1)) * cw;
  const ty = v => pt + (1 - (v - minVal) / range) * ch;

  const pts = data.map((v, i) => [tx(i), ty(v)]);
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  const areaPath = `${linePath}L${pts[pts.length-1][0]},${VH-pb}L${pts[0][0]},${VH-pb}Z`;

  const threshY = ty(threshold);
  const maxIdx = data.indexOf(maxVal);
  const maxPt = pts[maxIdx];
  const lastPt = pts[pts.length - 1];

  // Linear regression
  const n = data.length;
  const mX = (n - 1) / 2;
  const mY = data.reduce((s, v) => s + v, 0) / n;
  const num = data.reduce((s, v, i) => s + (i - mX) * (v - mY), 0);
  const den = data.reduce((s, _, i) => s + (i - mX) ** 2, 0);
  const slope = den ? num / den : 0;
  const trendY0 = ty(mY - slope * mX);
  const trendYn = ty(mY + slope * (n - 1 - mX));

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* Area fill */}
      <path d={areaPath} fill={color} opacity="0.09"/>
      {/* Threshold zone tint */}
      <rect x={pl} y={pt} width={cw} height={Math.max(0, threshY - pt)} fill={color} opacity="0.05"/>
      {/* Threshold line */}
      <line x1={pl} y1={threshY} x2={VW-pr} y2={threshY}
        stroke={color} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4,3"/>
      <text x={VW-pr-2} y={threshY - 3} textAnchor="end"
        fill={color} fontSize="10" opacity="0.75" fontWeight="600">임계</text>
      {/* Trend line */}
      <line x1={pl} y1={trendY0} x2={VW-pr} y2={trendYn}
        stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.7"/>
      {/* Main data line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round"/>
      {/* Max value dot (orange) — only if not the last point */}
      {maxIdx !== data.length - 1 && (
        <>
          <circle cx={maxPt[0]} cy={maxPt[1]} r="4" fill="#F97316" stroke="#fff" strokeWidth="1.5"/>
          <text x={maxPt[0]} y={maxPt[1] - 7} textAnchor="middle"
            fill="#F97316" fontSize="13" fontWeight="700">
            {maxVal.toFixed(0)}
          </text>
        </>
      )}
      {/* Current (last) point — pulsing glow ring + solid dot */}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="6" fill="none" stroke={color} strokeWidth="1.5" opacity="0.35">
        <animate attributeName="r" values="6;14;6" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4.5" fill={color} stroke="#fff" strokeWidth="2">
        <animate attributeName="r" values="4.5;5.5;4.5" dur="1.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

function DangerStatChip({ label, value, unit, color }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '5px 8px' }}>
      <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.03em', marginBottom: 2 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 12, fontWeight: 700, color, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 2 }}>
        {value}
        {unit && <span style={{ fontSize: 9, fontWeight: 400, color: '#94A3B8' }}>{unit}</span>}
      </div>
    </div>
  );
}

function PatientRow({ patient, onClick, index }) {
  const s = window.STATUS[patient.status];
  const gfapBreached = patient.gfap.value > patient.gfap.threshold;
  const uchl1Breached = patient.uchl1.value > patient.uchl1.threshold;
  const aucPct = Math.min(100, (patient.auc.value / patient.auc.danger) * 100);
  const isDanger = patient.status === 'danger';

  const synth = (baseline, current, seed) => {
    const arr = [];
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      arr.push(baseline + (current - baseline) * Math.pow(t, 1.4)
        + Math.sin(seed + i) * (current * 0.025));
    }
    return arr;
  };

  const getSeries = (marker, seed) => {
    if (window.MonidleData.seriesFor) {
      const raw = window.MonidleData.seriesFor(patient.id, marker);
      if (raw && raw.length) return isDanger ? raw.slice(-72) : raw.slice(-24);
    }
    const bio = patient[marker === 'gfap' ? 'gfap' : 'uchl1'];
    return synth(bio.baseline, bio.value, seed);
  };

  const gfapData  = getSeries('gfap',  index * 3);
  const uchl1Data = getSeries('uchl1', index * 5 + 1);

  // ── Danger row: expanded card with larger charts and extra detail ──
  if (isDanger) {
    return (
      <div
        onClick={onClick}
        className="row-hover"
        style={{
          borderTop: '1px solid #FECACA',
          borderLeft: '3px solid #DC2626',
          background: '#fff',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Top section — aligned to table header columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '88px 1.5fr 1.6fr 1.6fr 1fr 100px 76px',
          alignItems: 'center',
          gap: 8,
          padding: '14px 18px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <StatusPill status="danger" size="sm"/>
            <div className="blink" style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', letterSpacing: '0.03em' }}>
              ⚠ 즉시 조치
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: s.bg2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.fg, fontSize: 13, fontWeight: 700, flexShrink: 0,
            }} className="pulse-danger">
              {patient.name[0]}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', letterSpacing: '-0.01em' }}>{patient.name}</span>
                <span className="tnum" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94A3B8' }}>{patient.id}</span>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2, whiteSpace: 'nowrap' }}>
                {patient.sex}/{patient.age} · {patient.room || '신경외과'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ width: 78, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="tnum" style={{ fontSize: 15, fontWeight: 700, color: '#DC2626' }}>{patient.gfap.value.toFixed(1)}</span>
                <Delta value={patient.gfap.delta} color="#DC2626"/>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1, whiteSpace: 'nowrap' }}>
                기준 {patient.gfap.threshold} · {(patient.gfap.value / patient.gfap.threshold).toFixed(2)}×
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Sparkline data={gfapData.slice(-24)} threshold={patient.gfap.threshold} color="#DC2626"/>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ width: 78, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="tnum" style={{ fontSize: 15, fontWeight: 700, color: '#DC2626' }}>{patient.uchl1.value.toFixed(1)}</span>
                <Delta value={patient.uchl1.delta} color="#DC2626"/>
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1, whiteSpace: 'nowrap' }}>
                기준 {patient.uchl1.threshold} · {(patient.uchl1.value / patient.uchl1.threshold).toFixed(2)}×
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Sparkline data={uchl1Data.slice(-24)} threshold={patient.uchl1.threshold} color="#DC2626"/>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span className="tnum" style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>{patient.auc.value.toLocaleString()}</span>
              <span style={{ fontSize: 10, color: '#94A3B8' }}>/ 1,200</span>
            </div>
            <div style={{ width: 92, height: 5, background: '#FECACA', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${aucPct}%`, height: '100%', background: '#DC2626', borderRadius: 999 }}/>
            </div>
          </div>

          <ConnectionIndicator connected={patient.connected}/>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{patient.lastUpdate}</span>
            <Icon.Chevron size={12} color="#DC2626"/>
          </div>
        </div>

        {/* Expanded detail section */}
        <div style={{
          borderTop: '1px solid rgba(220,38,38,0.22)',
          padding: '10px 18px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          background: 'rgba(254,242,242,0.45)',
        }}>
          {/* GFAP trend panel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>GFAP 추세</span>
              <span style={{ display: 'flex', gap: 8, fontSize: 9, color: '#94A3B8' }}>
                <span><span style={{ color: '#F97316' }}>●</span> 최댓값</span>
                <span style={{ color: '#94A3B8' }}>-- 추세선</span>
              </span>
            </div>
            <DangerChart data={gfapData} threshold={patient.gfap.threshold} color="#DC2626"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 7 }}>
              <DangerStatChip label="현재값" value={patient.gfap.value.toFixed(1)} unit=" pg/mL" color="#DC2626"/>
              <DangerStatChip label="기준 초과" value={`${(patient.gfap.value / patient.gfap.threshold).toFixed(2)}×`} color="#DC2626"/>
              <DangerStatChip label="변화율" value={`${patient.gfap.delta > 0 ? '+' : ''}${patient.gfap.delta.toFixed(1)}`} unit=" /틱" color={patient.gfap.delta > 0 ? '#DC2626' : '#16A34A'}/>
              <DangerStatChip label="구간 최댓값" value={Math.max(...gfapData).toFixed(0)} unit=" pg/mL" color="#F97316"/>
            </div>
          </div>

          {/* UCH-L1 trend panel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>UCH-L1 추세</span>
              <span style={{ display: 'flex', gap: 8, fontSize: 9, color: '#94A3B8' }}>
                <span><span style={{ color: '#F97316' }}>●</span> 최댓값</span>
                <span style={{ color: '#94A3B8' }}>-- 추세선</span>
              </span>
            </div>
            <DangerChart data={uchl1Data} threshold={patient.uchl1.threshold} color="#B45309"/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 7 }}>
              <DangerStatChip label="현재값" value={patient.uchl1.value.toFixed(1)} unit=" pg/mL" color="#B45309"/>
              <DangerStatChip label="기준 초과" value={`${(patient.uchl1.value / patient.uchl1.threshold).toFixed(2)}×`} color="#B45309"/>
              <DangerStatChip label="변화율" value={`${patient.uchl1.delta > 0 ? '+' : ''}${patient.uchl1.delta.toFixed(1)}`} unit=" /틱" color={patient.uchl1.delta > 0 ? '#B45309' : '#16A34A'}/>
              <DangerStatChip label="구간 최댓값" value={Math.max(...uchl1Data).toFixed(0)} unit=" pg/mL" color="#F97316"/>
            </div>
          </div>

          {/* AUC + patient details panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ background: 'rgba(220,38,38,0.08)', borderRadius: 8, padding: '7px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>누적 노출 (AUC)</span>
                <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{patient.auc.value.toLocaleString()} pg·h</span>
              </div>
              <div style={{ height: 6, background: '#FECACA', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${aucPct}%`, height: '100%', background: '#DC2626', borderRadius: 999 }}/>
              </div>
              <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, marginTop: 3 }}>
                위험치의 {aucPct.toFixed(0)}% (기준 1,200 pg·h)
              </div>
            </div>
            {patient.memo && (
              <div style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: 8, padding: '7px 10px', flex: 1, minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>담당의 메모</div>
                  {patient.memo.author && (
                    <div style={{ fontSize: 9, color: '#94A3B8' }}>{patient.memo.author} · {patient.memo.time}</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                  {typeof patient.memo === 'string' ? patient.memo : patient.memo.text}
                </div>
              </div>
            )}
            {patient.prescription && patient.prescription.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #FECACA', borderRadius: 8, padding: '7px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', marginBottom: 4 }}>처방 현황</div>
                {patient.prescription.slice(0, 3).map((rx, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ width: 4, height: 4, borderRadius: 999, background: '#DC2626', display: 'inline-block', flexShrink: 0 }}/>
                    {rx}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Normal (warning / good) row ──────────────────────────────────
  return (
    <div
      onClick={onClick}
      className="row-hover"
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 1.5fr 1.6fr 1.6fr 1fr 100px 76px',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        background: '#fff',
        borderTop: '1px solid #EDEFF3',
        borderLeft: `3px solid ${s.dot}`,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div>
        <StatusPill status={patient.status} size="sm"/>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: s.bg2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: s.fg, fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>
          {patient.name[0]}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{patient.name}</span>
            <span className="tnum" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#94A3B8' }}>{patient.id}</span>
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2, whiteSpace: 'nowrap' }}>
            {patient.sex}/{patient.age} · {patient.room || '신경외과'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ width: 78, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tnum" style={{
              fontSize: 15, fontWeight: 700,
              color: gfapBreached ? '#DC2626' : '#0F172A',
            }}>{patient.gfap.value.toFixed(1)}</span>
            <Delta value={patient.gfap.delta} color={gfapBreached ? '#DC2626' : (patient.gfap.delta > 5 ? '#D97706' : '#94A3B8')}/>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1, whiteSpace: 'nowrap' }}>
            기준 {patient.gfap.threshold} · {(patient.gfap.value / patient.gfap.threshold).toFixed(2)}×
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Sparkline data={gfapData} threshold={patient.gfap.threshold} color={gfapBreached ? '#DC2626' : (patient.gfap.delta > 5 ? '#D97706' : '#0E5FB5')}/>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ width: 78, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="tnum" style={{
              fontSize: 15, fontWeight: 700,
              color: uchl1Breached ? '#DC2626' : '#0F172A',
            }}>{patient.uchl1.value.toFixed(1)}</span>
            <Delta value={patient.uchl1.delta} color={uchl1Breached ? '#DC2626' : (patient.uchl1.delta > 4 ? '#D97706' : '#94A3B8')}/>
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1, whiteSpace: 'nowrap' }}>
            기준 {patient.uchl1.threshold} · {(patient.uchl1.value / patient.uchl1.threshold).toFixed(2)}×
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Sparkline data={uchl1Data} threshold={patient.uchl1.threshold} color={uchl1Breached ? '#DC2626' : (patient.uchl1.delta > 4 ? '#D97706' : '#0E5FB5')}/>
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
          <span className="tnum" style={{
            fontSize: 14, fontWeight: 700,
            color: patient.auc.value >= 1200 ? '#DC2626' : (patient.auc.value >= 200 ? '#D97706' : '#0F172A'),
          }}>{patient.auc.value.toLocaleString()}</span>
          <span style={{ fontSize: 10, color: '#94A3B8' }}>/ 1,200</span>
        </div>
        <div style={{
          width: 92, height: 5, background: '#F1F3F6', borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            width: `${aucPct}%`, height: '100%',
            background: aucPct > 50 ? '#DC2626' : (aucPct > 20 ? '#D97706' : '#16A34A'),
            borderRadius: 999,
          }}/>
        </div>
      </div>

      <ConnectionIndicator connected={patient.connected}/>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>{patient.lastUpdate}</span>
        <Icon.Chevron size={12} color="#CBD5E1"/>
      </div>
    </div>
  );
}

Object.assign(window, { PatientListScreen });
