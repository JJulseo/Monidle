// Main app shell — phone frame, screen routing, transitions, real-time sim

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "simSpeed": 1500,
  "autoAlert": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Locked: medical palette, spline graph, compact density
  const theme = monidleThemes.medical;
  const graphStyle = 'spline';
  const density = 'compact';

  // When embedded inside the combined view, hide local demo/tweaks and accept
  // commands from the parent window.
  const embedded = React.useMemo(() => {
    try {
      return window.self !== window.top ||
             new URLSearchParams(window.location.search).get('embed') === '1';
    } catch (e) { return true; }
  }, []);

  const [activeTab, setActiveTab] = React.useState('home');
  const [modal, setModal] = React.useState(null);
  const [transition, setTransition] = React.useState(null);
  const [currentStatus, setCurrentStatus] = React.useState('good');

  // Real-time simulator — drives all screens
  const handleTransition = React.useCallback(({ from, to, gfap, uch }) => {
    setCurrentStatus(to);
    // Auto-trigger emergency when escalating from caution → danger
    if (tweaks.autoAlert && from === 'warn' && to === 'danger') {
      setModal({ type: 'emergency', gfap, uch });
    }
  }, [tweaks.autoAlert]);

  const sim = useRealtimeSim({
    tickMs: tweaks.simSpeed,
    history: 96,
    onTransition: handleTransition,
  });

  // ── Embed bridge: send latest readings + status to parent; receive commands ──
  React.useEffect(() => {
    if (!embedded) return;
    // Compute current AUC (cumulative exposure of GFAP above threshold)
    let aucCum = 0;
    for (const v of sim.gfap) {
      if (v > 30) aucCum += (v - 30) * 0.25;
    }
    const last = {
      gfap: sim.gfap[sim.gfap.length - 1],
      uch: sim.uch[sim.uch.length - 1],
      auc: aucCum,
      status: currentStatus,
      modal: modal?.type ?? null,
    };
    try {
      window.parent.postMessage({
        source: 'monidle-patient',
        type: 'state',
        payload: last,
      }, '*');
    } catch (e) {}
  }, [embedded, sim.gfap, sim.uch, currentStatus, modal]);

  React.useEffect(() => {
    if (!embedded) return;
    const onMsg = (e) => {
      const m = e.data;
      if (!m || m.target !== 'monidle-patient') return;
      if (m.type === 'show-emergency') {
        setModal({ type: 'emergency', gfap: m.gfap, uch: m.uch });
      } else if (m.type === 'doctor-responded') {
        // surface acknowledgement on patient screen
        setModal({ type: 'emergency', gfap: m.gfap, uch: m.uch, acked: true });
      } else if (m.type === 'dismiss') {
        setModal(null);
      }
    };
    window.addEventListener('message', onMsg);
    try {
      window.parent.postMessage({ source: 'monidle-patient', type: 'ready' }, '*');
    } catch (e) {}
    return () => window.removeEventListener('message', onMsg);
  }, [embedded]);

  const handleTab = (id) => {
    if (id === activeTab) return;
    const tabs = ['home', 'detail', 'device', 'profile'];
    const dir = tabs.indexOf(id) > tabs.indexOf(activeTab) ? 'forward' : 'back';
    setTransition(dir);
    setTimeout(() => {
      setActiveTab(id);
      setTimeout(() => setTransition(null), 50);
    }, 150);
  };

  const screenProps = { theme, graphStyle, density, sim, currentStatus };
  const screens = {
    home: <HomeScreen {...screenProps}
                       onOpenDetail={() => handleTab('detail')}
                       onOpenAlert={() => setModal({ type: 'emergency' })} />,
    detail: <DetailScreen {...screenProps} />,
    device: <DeviceScreen theme={theme}
                          onReplaceSensor={() => setModal({ type: 'replace' })}
                          onReplaceHub={() => setModal({ type: 'replace' })} />,
    profile: <ProfileScreen theme={theme} />,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
      <IOSDevice>
        <div style={{
          position: 'absolute', inset: 0,
          background: theme.bg,
          overflow: 'hidden',
        }}>
          <div style={{ paddingTop: 50 }}>
            <div key={activeTab} style={{
              opacity: transition ? 0 : 1,
              transform: transition === 'forward' ? 'translateX(20px)' : transition === 'back' ? 'translateX(-20px)' : 'translateX(0)',
              transition: 'opacity .15s ease, transform .15s ease',
              height: 'calc(100vh - 50px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
            }} className="monidle-scroll">
              {screens[activeTab]}
            </div>
          </div>

          <TabBar active={activeTab} onChange={handleTab} theme={theme} />

          {modal?.type === 'emergency' && (
            <EmergencyAlert theme={theme}
              gfap={modal.gfap ?? sim.gfap[sim.gfap.length - 1]}
              uch={modal.uch ?? sim.uch[sim.uch.length - 1]}
              acked={modal.acked}
              onContact={() => {
                if (embedded) {
                  try {
                    window.parent.postMessage({
                      source: 'monidle-patient',
                      type: 'emergency-sent',
                      payload: {
                        gfap: modal.gfap ?? sim.gfap[sim.gfap.length - 1],
                        uch: modal.uch ?? sim.uch[sim.uch.length - 1],
                      },
                    }, '*');
                  } catch (e) {}
                }
              }}
              onDismiss={() => setModal(null)} />
          )}
          {modal?.type === 'replace' && <SensorReplaceFlow theme={theme} onClose={() => setModal(null)} />}
          {modal?.type === 'onboarding' && <Onboarding theme={theme} onComplete={() => setModal(null)} />}
        </div>
      </IOSDevice>

      {/* Demo trigger buttons — hidden in embed mode */}
      {!embedded && (
      <div style={{ position: 'fixed', left: 20, top: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
        <DemoBtn onClick={() => setModal({ type: 'emergency' })} label="응급 알림" />
        <DemoBtn onClick={() => setModal({ type: 'replace' })} label="센서 교체" />
        <DemoBtn onClick={() => setModal({ type: 'onboarding' })} label="온보딩" />
        <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 10, lineHeight: 1.4 }}>
          <div style={{ fontWeight: 700, fontSize: 10, opacity: 0.7, letterSpacing: 0.5 }}>SIM STATUS</div>
          <div style={{ marginTop: 3, color: { good: '#30B57A', warn: '#FF9F0A', danger: '#FF3B30' }[currentStatus] }}>
            {{ good: '● Normal', warn: '● Caution', danger: '● Danger' }[currentStatus]}
          </div>
        </div>
      </div>
      )}

      {!embedded && (
      <TweaksPanel title="Tweaks">
        <TweakSection label="실시간 시뮬레이션">
          <TweakSlider
            label="틱 간격"
            value={tweaks.simSpeed}
            min={500} max={4000} step={100} unit="ms"
            onChange={v => setTweak('simSpeed', v)}
          />
          <TweakToggle
            label="자동 응급 알림"
            value={tweaks.autoAlert}
            onChange={v => setTweak('autoAlert', v)}
          />
        </TweakSection>
      </TweaksPanel>
      )}
    </div>
  );
}

function DemoBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.06)', color: '#fff',
      fontSize: 11, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)',
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>{label}</button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
