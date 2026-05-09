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
      <main className="scroll page-enter" style={{ flex: 1, overflow: 'auto', padding: '20px 28px 40px' }}>
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

function PatientRow({ patient, onClick, index }) {
  const s = window.STATUS[patient.status];
  const gfapBreached = patient.gfap.value > patient.gfap.threshold;
  const uchl1Breached = patient.uchl1.value > patient.uchl1.threshold;
  const aucPct = Math.min(100, (patient.auc.value / patient.auc.danger) * 100);
  const isDanger = patient.status === 'danger';

  // simple deterministic spark from baseline → current
  const spark = (baseline, current, breached, seed) => {
    const arr = [];
    let v = baseline;
    const target = current;
    for (let i = 0; i < 24; i++) {
      const t = i / 23;
      v = baseline + (target - baseline) * Math.pow(t, 1.4)
        + Math.sin(seed + i) * (current * 0.025);
      arr.push(v);
    }
    return arr;
  };

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
          position: 'relative',
        }} className={isDanger ? 'pulse-danger' : ''}>
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
          <Sparkline
            data={spark(patient.gfap.baseline, patient.gfap.value, gfapBreached, index * 3)}
            threshold={patient.gfap.threshold}
            color={gfapBreached ? '#DC2626' : (patient.gfap.delta > 5 ? '#D97706' : '#0E5FB5')}
          />
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
          <Sparkline
            data={spark(patient.uchl1.baseline, patient.uchl1.value, uchl1Breached, index * 5 + 1)}
            threshold={patient.uchl1.threshold}
            color={uchl1Breached ? '#DC2626' : (patient.uchl1.delta > 4 ? '#D97706' : '#0E5FB5')}
          />
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
