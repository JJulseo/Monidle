/* Patient sidebar — used in Home & Vitals screens */

const PATIENT_TABS = [
  { id: 'home', label: 'Home', icon: 'Home', enabled: true },
  { id: 'vitals', label: 'Vitals', icon: 'Pulse', enabled: true },
  { id: 'device', label: 'Device', icon: 'Device', enabled: false },
  { id: 'chat', label: 'Chat', icon: 'Chat', enabled: false },
  { id: 'visits', label: 'Visits', icon: 'Visit', enabled: false },
  { id: 'treatment', label: 'Treatment', icon: 'Pill', enabled: false },
];

function PatientSidebar({ patient, activeTab, onTab, onBack }) {
  const s = window.STATUS[patient.status];
  return (
    <aside style={{
      width: 240, background: '#FFFFFF', borderRight: '1px solid #E4E8EE',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <button onClick={onBack} style={{
        height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8,
        background: 'transparent', border: 'none', borderBottom: '1px solid #EDEFF3',
        fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        <Icon.Back size={13} color="#475569"/> 환자 목록으로
      </button>

      <div style={{ padding: '18px 16px', borderBottom: '1px solid #EDEFF3' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 10 }}>
          PATIENT
        </div>
        <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: s.bg2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: s.fg, fontSize: 17, fontWeight: 700, flexShrink: 0,
          }}>{patient.name[0]}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{patient.name}</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{patient.name_en}</div>
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
          fontSize: 11, color: '#475569', marginBottom: 10,
        }}>
          <Meta label="ID" value={patient.id} mono/>
          <Meta label="성/나이" value={`${patient.sex}/${patient.age}`}/>
          {patient.room && <Meta label="병동" value={patient.room} span={2}/>}
        </div>
        <StatusPill status={patient.status} en/>
      </div>

      <nav style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {PATIENT_TABS.map(t => {
          const Ic = window.Icon[t.icon];
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              disabled={!t.enabled}
              onClick={() => t.enabled && onTab(t.id)}
              style={{
                height: 36, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 10,
                background: active ? '#E8F1FB' : 'transparent',
                border: 'none', borderRadius: 8, whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: !t.enabled ? '#CBD5E1' : (active ? '#0E5FB5' : '#475569'),
                cursor: t.enabled ? 'pointer' : 'not-allowed', textAlign: 'left',
              }}
              onMouseEnter={e => { if (t.enabled && !active) e.currentTarget.style.background = '#F1F3F6'; }}
              onMouseLeave={e => { if (t.enabled && !active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Ic size={15} color={!t.enabled ? '#CBD5E1' : (active ? '#0E5FB5' : '#475569')}/>
              {t.label}
              {!t.enabled && <span style={{
                marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#CBD5E1',
                background: '#F1F3F6', padding: '2px 5px', borderRadius: 3, letterSpacing: '0.04em',
              }}>SOON</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #EDEFF3' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', marginBottom: 6 }}>
          DEVICE STATUS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ConnectionIndicator connected={patient.connected}/>
          <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'var(--mono)' }}>v2.4.1</span>
        </div>
      </div>
    </aside>
  );
}

function Meta({ label, value, mono, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'auto' }}>
      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', fontFamily: mono ? 'var(--mono)' : 'inherit' }}>{value}</div>
    </div>
  );
}

Object.assign(window, { PatientSidebar });
