/* App shell — orchestrates screens, manages routing state */

function App() {
  const [view, setView] = React.useState({ screen: 'list' }); // list | home | vitals
  const [selectedId, setSelectedId] = React.useState(null);
  const [openMarker, setOpenMarker] = React.useState('gfap');
  // Force re-render when patient data mutates
  const [, forceTick] = React.useReducer(x => x + 1, 0);
  // Toast notification stack
  const [toasts, setToasts] = React.useState([]);
  // Latest emergency contact info (to surface respond panel)
  const [pendingEmergency, setPendingEmergency] = React.useState(null);

  const embedded = React.useMemo(() => {
    try {
      return window.self !== window.top ||
             new URLSearchParams(window.location.search).get('embed') === '1';
    } catch (e) { return true; }
  }, []);

  const patient = React.useMemo(
    () => window.MonidleData.patients.find(p => p.id === selectedId),
    [selectedId]
  );

  const goList = () => setView({ screen: 'list' });
  const goHome = (id) => { setSelectedId(id); setView({ screen: 'home' }); };
  const goVitals = (marker) => { setOpenMarker(marker || 'gfap'); setView({ screen: 'vitals' }); };

  // Subscribe to data mutations from orchestrator
  React.useEffect(() => {
    return window.MonidleData.subscribe(() => forceTick());
  }, []);

  // ── Toast helper ──
  const pushToast = React.useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { ...toast, id }]);
    if (toast.timeout !== 0) {
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), toast.timeout || 5000);
    }
  }, []);

  // ── Embed bridge: receive patient state, mutate matching admin patient,
  //    show toasts, and bring patient to top of list when status escalates ──
  React.useEffect(() => {
    if (!embedded) return;
    let lastStatus = null;
    let emergencyAnnounced = false;

    const onMsg = (e) => {
      const m = e.data;
      if (!m || m.source !== 'monidle-patient') return;

      if (m.type === 'state' && m.payload) {
        const { gfap, uch, status, modal } = m.payload;
        // Map patient sim status -> admin status
        const adminStatus = status === 'danger' ? 'danger'
                         : status === 'warn'   ? 'warning'
                         : 'good';
        const target = window.MonidleData.patients.find(p => p.id === 'PT-0042');
        if (target) {
          const prevG = target.gfap.value;
          const prevU = target.uchl1.value;
          target.gfap.value  = +gfap.toFixed(2);
          target.uchl1.value = +uch.toFixed(2);
          target.gfap.delta  = +(gfap - prevG).toFixed(2);
          target.uchl1.delta = +(uch - prevU).toFixed(2);
          if (typeof m.payload.auc === 'number') {
            target.auc.value = Math.round(m.payload.auc);
          }
          target.lastUpdate = '방금 전';
          // Append to live series buffer for vitals chart
          if (window.MonidleData.appendMinjae) {
            window.MonidleData.appendMinjae(gfap, uch);
          }

          if (target.status !== adminStatus) {
            target.status = adminStatus;
            window.MonidleData.notify();

            // Status-change toast
            if (adminStatus === 'warning' && lastStatus !== 'warning') {
              pushToast({
                level: 'warning',
                title: '김민재 환자 주의 상태 진입',
                detail: `GFAP ${gfap.toFixed(1)} · UCH-L1 ${uch.toFixed(0)} · 임계값 접근`,
              });
            }
            if (adminStatus === 'danger' && lastStatus !== 'danger') {
              pushToast({
                level: 'danger',
                title: '김민재 환자 위험 상태 진입',
                detail: `GFAP ${gfap.toFixed(1)} · UCH-L1 ${uch.toFixed(0)} · 임계값 초과`,
              });
            }
          }
          lastStatus = adminStatus;
        } else {
          window.MonidleData.notify();
        }

        // When patient app shows emergency modal, alert dispatcher
        if (modal === 'emergency' && !emergencyAnnounced) {
          emergencyAnnounced = true;
          pushToast({
            level: 'danger',
            title: '🚨 김민재 환자 위험 알림',
            detail: 'GFAP / UCH-L1 위험 임계값 초과 — 응급 알림 화면 표시 중',
            timeout: 8000,
          });
        }
        if (modal !== 'emergency') emergencyAnnounced = false;
      }

      if (m.type === 'emergency-sent') {
        const { gfap, uch } = m.payload || {};
        setPendingEmergency({ gfap, uch, time: new Date() });
        pushToast({
          level: 'danger',
          title: '담당의 응급 호출 수신',
          detail: '김민재 환자가 담당의 응급 연락 버튼을 눌렀습니다.',
          timeout: 0, // sticky
          action: { label: '응답하기', onClick: () => respondToEmergency(gfap, uch) },
        });
      }
    };

    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [embedded, pushToast]);

  const respondToEmergency = React.useCallback((gfap, uch) => {
    // Notify patient app
    const iframes = window.parent?.document?.querySelectorAll('iframe');
    // Use parent broadcast via postMessage to top
    try {
      window.parent.postMessage({
        source: 'monidle-admin',
        target: 'patient-bridge',
        type: 'doctor-responded',
        payload: { gfap, uch },
      }, '*');
    } catch (e) {}

    // Clear sticky toasts
    setToasts(t => t.filter(x => x.timeout !== 0));
    setPendingEmergency(null);

    pushToast({
      level: 'good',
      title: '담당의 응답 전송 완료',
      detail: '환자 앱에 응답 확인 알림이 전송되었습니다.',
    });
  }, [pushToast]);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#F7F8FA', overflow: 'hidden', position: 'relative',
    }}>
      <TopNav onLogoClick={goList}/>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative', zIndex: 1 }}>
        {view.screen === 'list' && (
          <PatientListScreen onSelectPatient={goHome}/>
        )}
        {view.screen !== 'list' && patient && (
          <>
            <PatientSidebar
              patient={patient}
              activeTab={view.screen}
              onTab={(t) => setView({ screen: t })}
              onBack={goList}
            />
            {view.screen === 'home' && (
              <PatientHomeScreen patient={patient} onOpenVitals={goVitals}/>
            )}
            {view.screen === 'vitals' && (
              <PatientVitalsScreen patient={patient} openMarker={openMarker}/>
            )}
          </>
        )}
      </div>

      {/* Toasts */}
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {/* status bar */}
      <div style={{
        height: 24, borderTop: '1px solid #E4E8EE', background: '#FAFBFC',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14,
        fontSize: 10, color: '#94A3B8', fontFamily: 'var(--mono)', flexShrink: 0,
      }}>
        <span style={{ color: '#16A34A' }}>● Connected</span>
        <span>HL7 Gateway</span>
        <span>·</span>
        <span>Sync 30s</span>
        <span style={{ flex: 1 }}/>
        <span>v1.0.0-beta</span>
        <span>·</span>
        <span>Monidle Admin Console</span>
      </div>
    </div>
  );
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'absolute', bottom: 36, right: 20, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 14,
      maxWidth: 570, pointerEvents: 'none',
    }}>
      {toasts.map(t => <Toast key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />)}
    </div>
  );
}

function Toast({ level, title, detail, action, onDismiss }) {
  const palette = {
    danger:  { bg: '#FEF2F2', border: '#FECACA', accent: '#DC2626' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', accent: '#D97706' },
    good:    { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB' },
  }[level || 'info'];

  return (
    <div style={{
      pointerEvents: 'auto',
      background: '#fff',
      border: `1px solid ${palette.border}`,
      borderLeft: `5px solid ${palette.accent}`,
      borderRadius: 15,
      padding: '17px 20px',
      boxShadow: '0 12px 32px rgba(15,23,42,0.13), 0 2px 4px rgba(15,23,42,0.07)',
      display: 'flex', flexDirection: 'column', gap: 6,
      animation: 'toastIn .25s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{title}</div>
        <button onClick={onDismiss} style={{
          width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent',
          color: '#94A3B8', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0, marginTop: -1,
        }}>×</button>
      </div>
      {detail && <div style={{ fontSize: 17, color: '#475569', lineHeight: 1.45 }}>{detail}</div>}
      {action && (
        <button onClick={action.onClick} style={{
          marginTop: 6, alignSelf: 'flex-start',
          padding: '8px 16px', borderRadius: 9, border: 'none',
          background: palette.accent, color: '#fff',
          fontSize: 17, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
        }}>{action.label}</button>
      )}
    </div>
  );
}

Object.assign(window, { App });
