// HomeScreen — Brain character, status, 3 metrics, real-time chart with clinical reference lines

function HomeScreen({ theme, density, graphStyle, sim, currentStatus, onOpenDetail, onOpenAlert }) {
  const [selectedMetric, setSelectedMetric] = React.useState('GFAP');

  // Use last 24 ticks (~6 hours of simulated data) for the home mini chart
  const N = 24;
  const gfap = sim.gfap.slice(-N);
  const uch = sim.uch.slice(-N);
  const aucAll = React.useMemo(() => generateAUCSeries(sim.gfap, CLINICAL.GFAP.baseline), [sim.gfap]);
  const auc = aucAll.slice(-N);

  const gfapNow = gfap[gfap.length - 1];
  const uchNow = uch[uch.length - 1];
  const aucNow = aucAll[aucAll.length - 1];

  const overallStatus = currentStatus;
  const gfapStatus = statusOf(gfapNow, 'GFAP');
  const uchStatus = statusOf(uchNow, 'UCHL1');
  const aucStatus = statusOf(aucNow, 'AUC');

  const statusMeta = {
    good: { ko: '안정', msg: '뇌 회복이 순조롭게 진행되고 있어요.', color: theme.good, soft: theme.goodSoft },
    warn: { ko: '주의', msg: 'UCH-L1이 일시적으로 상승했어요. 휴식을 권장해요.', color: theme.warn, soft: theme.warnSoft },
    danger: { ko: '위험', msg: '담당의에게 즉시 연락이 필요해요.', color: theme.danger, soft: theme.dangerSoft },
  }[overallStatus];

  const metrics = {
    GFAP: {
      values: gfap, color: theme.gfap,
      baseline: CLINICAL.GFAP.baseline, critical: CLINICAL.GFAP.critical,
      unit: CLINICAL.GFAP.unit, status: gfapStatus,
      now: gfapNow.toFixed(1),
    },
    'UCH-L1': {
      values: uch, color: theme.uchl1,
      baseline: CLINICAL.UCHL1.baseline, critical: CLINICAL.UCHL1.critical,
      unit: CLINICAL.UCHL1.unit, status: uchStatus,
      now: uchNow.toFixed(0),
    },
    AUC: {
      values: auc, color: theme.auc,
      baseline: CLINICAL.AUC.baseline, critical: CLINICAL.AUC.critical,
      unit: CLINICAL.AUC.unit, status: aucStatus,
      now: aucNow.toFixed(0),
    },
  };
  const m = metrics[selectedMetric];

  return (
    <div style={{ padding: '0 0 100px' }}>
      <PageHeader theme={theme} title="Monidle" sub="안녕하세요, 민재님" brand={true} right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LiveDot color={theme.danger} />
          <div onClick={onOpenAlert} style={{ width: 36, height: 36, borderRadius: 999, background: theme.card, border: `0.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Icon name="bell" size={18} color={theme.text} />
            {overallStatus !== 'good' && (
              <span style={{ position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: 999, background: statusMeta.color, border: `1.5px solid ${theme.card}` }} />
            )}
          </div>
        </div>
      } />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hero status card */}
        <div onClick={onOpenDetail} style={{
          padding: 20, borderRadius: 22,
          background: `linear-gradient(135deg, ${statusMeta.soft} 0%, ${theme.card} 100%)`,
          border: `0.5px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 18,
          cursor: 'pointer',
          transition: 'background .6s ease',
        }}>
          <div style={{ position: 'relative', flexShrink: 0, width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Soft fade-out aura rings */}
            <div style={{
              position: 'absolute', width: 130, height: 130, borderRadius: '50%',
              background: `radial-gradient(circle, ${statusMeta.color}26 0%, ${statusMeta.color}12 45%, transparent 75%)`,
              animation: 'monidleAuraPulse 3.2s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: 110, height: 110, borderRadius: '50%',
              background: `radial-gradient(circle, ${statusMeta.color}1f 0%, transparent 70%)`,
              animation: 'monidleAuraPulse 3.2s ease-in-out infinite .8s',
            }} />
            <div style={{ position: 'relative' }}>
              <BrainCharacter status={overallStatus} size={100} theme={theme} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <StatusPill status={overallStatus} theme={theme} size="lg" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, lineHeight: 1.3, letterSpacing: -0.2 }}>
              {statusMeta.msg}
            </div>
            <div style={{ fontSize: 11, color: theme.textTer, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="chevron-right" size={11} color={theme.textTer} />
              자세한 보고서 보기
            </div>
          </div>
        </div>

        {/* 3 Metric cards */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(metrics).map(([key, val]) => (
            <MetricCard
              key={key}
              label={key}
              value={val.now}
              unit={val.unit}
              color={val.color}
              status={val.status}
              active={selectedMetric === key}
              onClick={() => setSelectedMetric(key)}
              theme={theme}
            />
          ))}
        </div>

        {/* Chart card */}
        <Card theme={theme} padding={16}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.textSec, letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                실시간 · 지난 6시간
                <span style={{ width: 5, height: 5, borderRadius: 999, background: theme.danger, animation: 'monidlePulse 1.5s ease-in-out infinite' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: theme.text, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{m.now}</span>
                <span style={{ fontSize: 12, color: theme.textSec, fontWeight: 500 }}>{m.unit}</span>
                <span style={{ fontSize: 11, color: m.color, fontWeight: 600, marginLeft: 4, padding: '2px 6px', borderRadius: 6, background: m.color + '15' }}>
                  {selectedMetric}
                </span>
              </div>
            </div>
            <div onClick={onOpenDetail} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 12, color: theme.primary, fontWeight: 600, cursor: 'pointer' }}>
              상세 <Icon name="chevron-right" size={14} color={theme.primary} />
            </div>
          </div>
          <MiniChart
            values={m.values}
            width={310} height={150}
            color={m.color}
            baseline={m.baseline}
            critical={m.critical}
            theme={theme}
            xLabels={['-6h', '-4h', '-2h', '지금']}
            style={graphStyle}
            animated={false}
            pulse={true}
          />
        </Card>

        {/* Quick info row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Card theme={theme} padding={12} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="live" size={16} color={theme.primary} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: theme.textSec, fontWeight: 500 }}>측정 주기</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>15분</div>
            </div>
          </Card>
          <Card theme={theme} padding={12} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: theme.goodSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="shield" size={16} color={theme.good} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: theme.textSec, fontWeight: 500 }}>모니터링</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>14일째</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
