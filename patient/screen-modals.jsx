// Modal screens — Emergency alert, Sensor replacement flow, Onboarding

// ─── EMERGENCY FULLSCREEN ALERT ───
function EmergencyAlert({ theme, onDismiss, gfap, uch, acked, onContact }) {
  const [seconds, setSeconds] = React.useState(5);
  const gfapVal = gfap !== undefined ? gfap.toFixed(1) : '128.4';
  const uchVal = uch !== undefined ? uch.toFixed(0) : '1240';
  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: `linear-gradient(180deg, ${theme.danger} 0%, #B0271F 100%)`,
      display: 'flex', flexDirection: 'column',
      animation: 'monidleSlideUp .4s ease-out'
    }}>
      <div style={{ paddingTop: 60, paddingBottom: 20, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, opacity: 0.85 }}>EMERGENCY ALERT</div>
        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>{new Date().toLocaleTimeString('ko-KR')}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            position: 'absolute', inset: -30, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            animation: 'monidleRing 2s ease-out infinite'
          }} />
          <div style={{
            position: 'absolute', inset: -50, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            animation: 'monidleRing 2s ease-out infinite .6s'
          }} />
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(20px)'
          }}>
            <Icon name="alert" size={48} color="#fff" strokeWidth={2.2} />
          </div>
        </div>

        <div style={{ color: '#fff', fontSize: 30, fontWeight: 800, letterSpacing: -0.8, textAlign: 'center', lineHeight: 1.15 }}>
          위험 수준 감지
        </div>
        <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: 500, textAlign: 'center', marginTop: 10, lineHeight: 1.5, padding: '0 12px' }}>
          GFAP {gfapVal} pg/mL · UCH-L1 {uchVal} pg/mL<br />
          위험 임계값을 초과했어요.
        </div>

        <div style={{
          marginTop: 32, padding: '14px 18px',
          background: 'rgba(0,0,0,0.18)', borderRadius: 14,
          width: '100%', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="doctor" size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {acked ? '담당의가 응답했어요' : '담당의에게 자동 알림 전송 중'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>이수현 교수 · 서울대병원</div>
            </div>
            {acked
              ? <Icon name="check" size={22} color="#fff" />
              : <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{seconds}s</div>}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: acked ? '100%' : `${(5 - seconds) / 5 * 100}%`, height: '100%', background: '#fff', borderRadius: 2, transition: 'width 1s linear' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onContact} style={{
          padding: '16px', borderRadius: 14, border: 'none',
          background: '#fff', color: theme.danger,
          fontSize: 16, fontWeight: 700, letterSpacing: -0.2, cursor: 'pointer'
        }}>{acked ? '담당의 응답 확인됨' : '담당의에게 응급 연락'}

        </button>
        <button onClick={onDismiss} style={{
          padding: '16px', borderRadius: 14,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
          fontSize: 15, fontWeight: 600, cursor: 'pointer'
        }}>
          괜찮아요, 닫기
        </button>
      </div>
    </div>);

}

// ─── SENSOR REPLACEMENT FLOW ───
function SensorReplaceFlow({ theme, onClose }) {
  const [step, setStep] = React.useState(0);
  const steps = [
  { title: '준비', desc: '새 센서 패치를 준비해 주세요.', icon: 'sparkle', state: 'prepare' },
  { title: '본체 분리', desc: '본체를 위로 들어 올려 분리해 주세요.', icon: 'arrow-up', state: 'detach-hub' },
  { title: '센서 분리', desc: '사용한 센서를 피부에서 천천히 떼어내세요.', icon: 'minus', state: 'detach-sensor' },
  { title: '새 센서 부착', desc: '새 패치를 같은 위치에 부착해 주세요.', icon: 'plus', state: 'attach-sensor' },
  { title: '본체 결합', desc: '본체를 패치 위에 딱 맞춰 눌러주세요.', icon: 'arrow-down', state: 'attach-hub' },
  { title: '완료', desc: '센서가 정상적으로 작동합니다.', icon: 'check', state: 'done' }];

  const cur = steps[step];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 90,
      background: theme.bg,
      display: 'flex', flexDirection: 'column',
      animation: 'monidleSlideUp .35s ease-out'
    }}>
      {/* Top bar */}
      <div style={{ paddingTop: 56, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, background: theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="close" size={18} color={theme.text} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.textSec }}>센서 교체 · {step + 1}/{steps.length}</div>
        <div style={{ width: 36 }} />
      </div>

      {/* Progress */}
      <div style={{ padding: '20px 16px 0', display: 'flex', gap: 4 }}>
        {steps.map((_, i) =>
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i <= step ? theme.primary : theme.divider,
          transition: 'background .3s'
        }} />
        )}
      </div>

      {/* Animation area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <ReplaceAnimation state={cur.state} theme={theme} />

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: 1.5 }}>STEP {step + 1}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: theme.text, marginTop: 6, letterSpacing: -0.6 }}>{cur.title}</div>
          <div style={{ fontSize: 14, color: theme.textSec, marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>{cur.desc}</div>
        </div>

        {(cur.state === 'detach-hub' || cur.state === 'detach-sensor' || cur.state === 'attach-sensor' || cur.state === 'attach-hub') &&
        <div style={{ marginTop: 18, padding: '8px 14px', background: theme.card, borderRadius: 999, border: `0.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: theme.warn, animation: 'monidlePulse 1.2s infinite' }} />
            <span style={{ fontSize: 12, color: theme.textSec, fontWeight: 500 }}>동작 감지 중...</span>
          </div>
        }
      </div>

      {/* Bottom button */}
      <div style={{ padding: '0 20px 40px' }}>
        <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()} style={{
          width: '100%', padding: '16px', borderRadius: 14, border: 'none',
          background: theme.primary, color: '#fff',
          fontSize: 16, fontWeight: 700, letterSpacing: -0.2, cursor: 'pointer'
        }}>
          {step < steps.length - 1 ? '다음 단계' : '완료'}
        </button>
      </div>
    </div>);

}

function ReplaceAnimation({ state, theme }) {
  // Visualize hub + patch in different states
  const hubY = { 'prepare': 50, 'detach-hub': 10, 'detach-sensor': 10, 'attach-sensor': 10, 'attach-hub': 10, 'done': 50 };
  const patchOpacity = { 'prepare': 1, 'detach-hub': 1, 'detach-sensor': 0, 'attach-sensor': 1, 'attach-hub': 1, 'done': 1 };
  const patchColor = state === 'attach-sensor' || state === 'attach-hub' || state === 'done' ? theme.primary : '#999';

  return (
    <svg width="240" height="200" viewBox="0 0 240 200">
      <defs>
        <radialGradient id="bgGlow">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.15" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
        </radialGradient>
        <filter id="repShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dy="3" /><feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx="120" cy="160" rx="100" ry="40" fill="url(#bgGlow)" />

      {/* Skin baseline */}
      <line x1="20" y1="160" x2="220" y2="160" stroke={theme.divider} strokeWidth="2" strokeDasharray="4 3" />
      <text x="120" y="180" fill={theme.textTer} fontSize="9" textAnchor="middle">피부</text>

      {/* Patch */}
      <g style={{ opacity: patchOpacity[state], transition: 'all .6s ease' }} filter="url(#repShadow)">
        <ellipse cx="120" cy="148" rx="58" ry="14" fill={patchColor} opacity="0.9" />
        <ellipse cx="120" cy="144" rx="58" ry="14" fill={patchColor} />
        <circle cx="120" cy="144" r="4" fill="#fff" opacity="0.4" />
      </g>

      {/* Hub */}
      <g style={{ transform: `translateY(${hubY[state] - 50}px)`, transition: 'transform .6s ease' }} filter="url(#repShadow)">
        <ellipse cx="120" cy="120" rx="36" ry="12" fill="#E8E8ED" />
        <ellipse cx="120" cy="116" rx="36" ry="12" fill="#FAFAFC" stroke="#D8D8DD" strokeWidth="0.5" />
        <circle cx="120" cy="116" r="4" fill={state === 'done' ? theme.good : theme.danger}>
          {state === 'done' && <animate attributeName="opacity" values="1;0.4;1" dur="1.2s" repeatCount="indefinite" />}
        </circle>
      </g>

      {/* Direction arrows */}
      {state === 'detach-hub' && <DirArrow x={170} y={70} dir="up" color={theme.primary} />}
      {state === 'detach-sensor' && <DirArrow x={170} y={130} dir="left" color={theme.primary} />}
      {state === 'attach-sensor' && <DirArrow x={170} y={130} dir="right" color={theme.primary} />}
      {state === 'attach-hub' && <DirArrow x={170} y={70} dir="down" color={theme.primary} />}

      {state === 'done' &&
      <g transform="translate(170, 70)">
          <circle r="14" fill={theme.good} />
          <path d="M -6 0 L -2 4 L 6 -4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      }
    </svg>);

}

function DirArrow({ x, y, dir, color }) {
  const rot = { up: 0, down: 180, left: -90, right: 90 }[dir];
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <circle r="14" fill={color} opacity="0.15">
        <animate attributeName="r" values="12;18;12" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <path d="M 0 -6 L 0 6 M -4 -2 L 0 -6 L 4 -2" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
      </path>
    </g>);

}

// ─── ONBOARDING ───
function Onboarding({ theme, onComplete }) {
  const [step, setStep] = React.useState(0);
  const slides = [
  { title: 'Monidle에 오신 걸 환영해요', desc: '실시간 뇌 손상 모니터링으로 회복을 함께 합니다.', illus: 'welcome' },
  { title: '센서를 부착해 주세요', desc: '이마 측면, 청결한 피부에 부드럽게 부착하세요.', illus: 'attach' },
  { title: '담당의 ID를 입력해요', desc: '응급 상황 시 자동 알림이 전송됩니다.', illus: 'doctor' },
  { title: '준비 완료!', desc: '15분마다 자동으로 측정해요. 편하게 쉬세요.', illus: 'ready' }];

  const s = slides[step];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: `linear-gradient(180deg, ${theme.primarySoft} 0%, ${theme.bg} 50%)`,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ paddingTop: 56, paddingRight: 20, textAlign: 'right' }}>
        <span onClick={onComplete} style={{ fontSize: 14, color: theme.textSec, fontWeight: 500, cursor: 'pointer' }}>건너뛰기</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <OnboardIllus type={s.illus} theme={theme} />
        <div style={{ fontSize: 28, fontWeight: 700, color: theme.text, marginTop: 28, textAlign: 'center', letterSpacing: -0.6, lineHeight: 1.2 }}>{s.title}</div>
        <div style={{ fontSize: 15, color: theme.textSec, marginTop: 12, textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>{s.desc}</div>

        {step === 2 &&
        <div style={{ marginTop: 24, width: '100%' }}>
            <input placeholder="DR-XXXXX-0000" style={{
            width: '100%', padding: '14px 16px', borderRadius: 12,
            border: `1px solid ${theme.border}`, background: theme.card,
            fontSize: 15, color: theme.text, fontFamily: monidleType.mono, outline: 'none',
            boxSizing: 'border-box'
          }} />
          </div>
        }
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
        {slides.map((_, i) =>
        <div key={i} style={{
          width: i === step ? 22 : 6, height: 6, borderRadius: 3,
          background: i === step ? theme.primary : theme.divider,
          transition: 'all .3s'
        }} />
        )}
      </div>

      <div style={{ padding: '0 20px 40px' }}>
        <button onClick={() => step < slides.length - 1 ? setStep(step + 1) : onComplete()} style={{
          width: '100%', padding: '16px', borderRadius: 14, border: 'none',
          background: theme.primary, color: '#fff',
          fontSize: 16, fontWeight: 700, letterSpacing: -0.2, cursor: 'pointer'
        }}>
          {step < slides.length - 1 ? '다음' : '시작하기'}
        </button>
      </div>
    </div>);

}

function OnboardIllus({ type, theme }) {
  if (type === 'welcome') return <BrainCharacter status="good" size={160} theme={theme} />;
  if (type === 'attach') {
    return (
      <svg width="180" height="160" viewBox="0 0 180 160">
        {/* Head silhouette */}
        <ellipse cx="90" cy="90" rx="55" ry="62" fill="#FFD9C5" stroke={theme.text} strokeWidth="1.5" />
        <path d="M 50 60 Q 60 40 90 38 Q 120 40 130 60" fill="#3A2A1F" />
        {/* Eye */}
        <circle cx="75" cy="92" r="2" fill={theme.text} />
        <circle cx="105" cy="92" r="2" fill={theme.text} />
        {/* Patch indicator */}
        <g>
          <ellipse cx="48" cy="80" rx="12" ry="6" fill={theme.primary} opacity="0.9" />
          <circle cx="48" cy="80" r="20" fill="none" stroke={theme.primary} strokeWidth="1.5" strokeDasharray="3 3">
            <animate attributeName="r" values="18;26;18" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>);

  }
  if (type === 'doctor') {
    return (
      <svg width="180" height="160" viewBox="0 0 180 160">
        <circle cx="90" cy="80" r="40" fill={theme.primarySoft} />
        <g transform="translate(90, 80)"><Icon name="doctor" size={64} color={theme.primary} /></g>
        <circle cx="55" cy="50" r="12" fill={theme.warn} />
        <text x="55" y="54" fontSize="14" fontWeight="700" fill="#fff" textAnchor="middle">!</text>
      </svg>);

  }
  // ready
  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      <circle cx="90" cy="80" r="50" fill={theme.goodSoft} />
      <circle cx="90" cy="80" r="36" fill={theme.good} />
      <path d="M 75 80 L 86 91 L 108 70" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}

Object.assign(window, { EmergencyAlert, SensorReplaceFlow, Onboarding });