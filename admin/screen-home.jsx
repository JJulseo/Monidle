/* Screen 2: Patient Home */

function PatientHomeScreen({ patient, onOpenVitals }) {
  const { minjunAlerts, minjaeAlerts } = window.MonidleData;
  const isMinjun = patient.id === 'PT-0142';
  const isMinjae = patient.id === 'PT-0042';
  const alerts = isMinjun ? minjunAlerts
               : isMinjae ? (minjaeAlerts || [])
               : [
    { time: '14:20', level: 'info', text: '바이탈 측정 완료', detail: '정기 30분 측정' },
    { time: '12:00', level: 'good', text: '일일 리포트 생성', detail: '오전 측정 완료' },
  ];

  return (
    <main className="scroll page-enter" style={{
      flex: 1, overflow: 'auto', background: '#F7F8FA',
      padding: '20px 24px 40px',
    }}>
      <Breadcrumb patient={patient} tab="Home"/>

      <div style={{
        display: 'grid', gridTemplateColumns: '380px 1fr', gap: 18, marginTop: 16,
        alignItems: 'start',
      }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SummaryCard patient={patient}/>
          <AlertsCard alerts={alerts}/>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BiomarkerGrid patient={patient} onOpenVitals={onOpenVitals}/>
          <MedicalRecordCard patient={patient}/>
        </div>
      </div>
    </main>
  );
}

function Breadcrumb({ patient, tab }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94A3B8' }}>
      <span>환자 목록</span>
      <Icon.Chevron size={11} color="#CBD5E1"/>
      <span>{patient.name}</span>
      <Icon.Chevron size={11} color="#CBD5E1"/>
      <span style={{ color: '#0F172A', fontWeight: 600 }}>{tab}</span>
      <span style={{ flex: 1 }}/>
      <span style={{ fontSize: 11, color: '#94A3B8' }}>마지막 업데이트: {patient.lastUpdate}</span>
      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, background: '#16A34A', display: 'inline-block' }}/>
    </div>
  );
}

function SummaryCard({ patient }) {
  const s = window.STATUS[patient.status];
  const isDanger = patient.status === 'danger';
  return (
    <Card style={{
      padding: 0, overflow: 'hidden',
      borderColor: isDanger ? '#FCA5A5' : '#E4E8EE',
    }}>
      <div style={{
        padding: '14px 18px',
        background: isDanger ? '#FEF2F2' : s.bg2,
        borderBottom: `1px solid ${isDanger ? '#FECACA' : '#EDEFF3'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={isDanger ? 'pulse-danger' : ''} style={{
            width: 10, height: 10, borderRadius: 999, background: s.dot, display: 'inline-block',
          }}/>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em' }}>종합 상태</span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, color: s.fg, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>{s.label_en}</span>
      </div>

      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{
          fontSize: 28, fontWeight: 800, color: s.fg, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 14,
        }}>{patient.status === 'danger' ? 'DANGEROUS' : patient.status === 'warning' ? 'WARNING' : 'STABLE'}</div>

        <p style={{
          margin: 0, fontSize: 13, lineHeight: 1.65, color: '#0F172A',
          padding: '12px 14px', background: '#F7F8FA', borderRadius: 8,
          borderLeft: `3px solid ${s.dot}`,
          textWrap: 'pretty',
        }}>
          "{patient.summary || (
            patient.status === 'danger'
              ? '바이오마커 수치가 위험 임계값을 초과했습니다. 즉시 임상적 평가가 필요합니다.'
              : patient.status === 'warning'
              ? 'GFAP / UCH-L1 수치가 상승 추세이며 임계값에 근접하고 있습니다. 지속 관찰이 필요합니다.'
              : '현재 바이오마커 수치가 정상 범위 내에 있으며 안정적인 상태입니다.'
          )}"
        </p>

        {patient.detected && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14,
            paddingTop: 14, borderTop: '1px dashed #E4E8EE',
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4, whiteSpace: 'nowrap' }}>
                최초 이상 감지
              </div>
              <div className="tnum" style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                {patient.detected}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4, whiteSpace: 'nowrap' }}>
                지속 시간
              </div>
              <div className="tnum" style={{ fontSize: 16, fontWeight: 700, color: '#DC2626' }}>
                {patient.duration}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function AlertsCard({ alerts }) {
  const colors = {
    danger: '#DC2626', warning: '#D97706', good: '#16A34A', info: '#94A3B8',
  };
  const labels = {
    danger: '🔴', warning: '🟡', good: '🟢', info: '⚪',
  };
  return (
    <Card style={{ padding: '14px 18px 8px' }}>
      <SectionHead title="최근 알림" action={
        <button style={{
          background: 'transparent', border: 'none', fontSize: 11, fontWeight: 600, color: '#0E5FB5', cursor: 'pointer',
        }}>전체 보기 →</button>
      }/>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 0',
            borderTop: i === 0 ? 'none' : '1px solid #F1F3F6',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: 999, background: colors[a.level], flexShrink: 0,
            }}/>
            <span className="tnum" style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', fontFamily: 'var(--mono)', minWidth: 38 }}>
              {a.time}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{a.text}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BiomarkerGrid({ patient, onOpenVitals }) {
  return (
    <div>
      <SectionHead title="바이오마커 현황" sub="클릭하여 상세 차트 보기"/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <BiomarkerCard
          label="GFAP"
          unit="pg/mL"
          value={patient.gfap.value}
          delta={patient.gfap.delta}
          baseline={patient.gfap.threshold}
          baselineLabel="기준"
          breached={patient.gfap.value > patient.gfap.threshold}
          breachLabel={`${(patient.gfap.value / patient.gfap.threshold).toFixed(2)}× 초과`}
          spark={window.MonidleData.seriesFor(patient.id, 'gfap').filter((_, i) => i % 8 === 0)}
          onClick={() => onOpenVitals('gfap')}
        />
        <BiomarkerCard
          label="UCH-L1"
          unit="pg/mL"
          value={patient.uchl1.value}
          delta={patient.uchl1.delta}
          baseline={patient.uchl1.threshold}
          baselineLabel="기준"
          breached={patient.uchl1.value > patient.uchl1.threshold}
          breachLabel={`${(patient.uchl1.value / patient.uchl1.threshold).toFixed(2)}× 초과`}
          spark={window.MonidleData.seriesFor(patient.id, 'uchl1').filter((_, i) => i % 8 === 0)}
          onClick={() => onOpenVitals('uchl1')}
        />
        <BiomarkerCard
          label="AUC"
          unit=""
          value={patient.auc.value}
          subtitle="누적 손상 지수"
          baseline={patient.auc.danger}
          baselineLabel="위험"
          progress={(patient.auc.value / patient.auc.danger) * 100}
          breached={patient.auc.value > patient.auc.danger}
          onClick={() => onOpenVitals('auc')}
        />
      </div>
    </div>
  );
}

function BiomarkerCard({ label, unit, value, delta, subtitle, baseline, baselineLabel, breached, breachLabel, spark, progress, onClick }) {
  const color = breached ? '#DC2626' : '#0E5FB5';
  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px 16px 14px', background: '#fff',
        border: `1px solid ${breached ? '#FCA5A5' : '#E4E8EE'}`,
        borderRadius: 14,
        boxShadow: breached ? '0 0 0 3px rgba(220,38,38,0.06)' : '0 1px 2px rgba(15,23,42,0.04)',
        cursor: 'pointer', transition: 'all 150ms', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = breached ? '0 0 0 3px rgba(220,38,38,0.10), 0 4px 12px rgba(220,38,38,0.08)' : '0 4px 12px rgba(15,23,42,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = breached ? '0 0 0 3px rgba(220,38,38,0.06)' : '0 1px 2px rgba(15,23,42,0.04)'; }}
    >
      {breached && (
        <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          BREACH
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, whiteSpace: 'nowrap' }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: color, flexShrink: 0 }} className={breached ? 'pulse-dot' : ''}/>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, whiteSpace: 'nowrap' }}>
        <span className="tnum" style={{
          fontSize: 28, fontWeight: 800, color: breached ? '#DC2626' : '#0F172A', letterSpacing: '-0.025em',
        }}>{typeof value === 'number' && value > 1000 ? value.toLocaleString() : value.toFixed(1)}</span>
        {unit && <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{unit}</span>}
      </div>
      {delta != null && (
        <div style={{ marginBottom: 12 }}>
          <Delta value={delta} color={breached ? '#DC2626' : (delta > 5 ? '#D97706' : '#94A3B8')}/>
          <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>vs 1h 전</span>
        </div>
      )}
      {subtitle && <div style={{ fontSize: 11, color: '#64748B', marginBottom: 12 }}>{subtitle}</div>}

      {spark && (
        <div style={{ marginBottom: 10, width: '100%', overflow: 'hidden' }}>
          <Sparkline data={spark} w={260} h={48} color={color} threshold={baseline}/>
        </div>
      )}
      {progress != null && (
        <div style={{ marginBottom: 10, marginTop: 4 }}>
          <div style={{ height: 8, background: '#F1F3F6', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, progress)}%`, height: '100%', background: color, borderRadius: 999,
            }}/>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', gap: 6 }}>
        <span>{baselineLabel}: <span className="tnum" style={{ fontWeight: 600, color: '#475569' }}>{typeof baseline === 'number' && baseline > 1000 ? baseline.toLocaleString() : baseline}{unit ? ` ${unit}` : ''}</span></span>
        {breached && breachLabel && <span style={{ color: '#DC2626', fontWeight: 600 }}>{breachLabel}</span>}
      </div>
    </div>
  );
}

function MedicalRecordCard({ patient }) {
  return (
    <Card style={{ padding: '14px 18px 18px' }}>
      <SectionHead title="의무기록 요약" action={
        <button style={{ background: 'transparent', border: 'none', fontSize: 11, fontWeight: 600, color: '#0E5FB5', cursor: 'pointer' }}>전체보기 →</button>
      }/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="진단명" value={patient.diagnosis || '특이 진단 없음'}/>
        <Field label="주요 증상" value={(patient.symptoms || ['특이 증상 없음']).join(', ')}/>
        <Field label="병동/베드" value={patient.room || '—'}/>
        <Field label="입원일" value="2026.04.28 (8일째)"/>
      </div>
      {patient.prescription && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #E4E8EE' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
            현재 처방
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {patient.prescription.map((p, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '4px 9px', background: '#F1F3F6',
                borderRadius: 6, color: '#334155', fontFamily: 'var(--mono)', fontWeight: 500,
              }}>{p}</span>
            ))}
          </div>
        </div>
      )}
      {patient.memo && (
        <div style={{
          marginTop: 14, padding: '12px 14px', background: '#F7F8FA', borderRadius: 8,
          borderLeft: '3px solid #0E5FB5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0E5FB5' }}>{patient.memo.author}</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>· {patient.memo.time}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', whiteSpace: 'nowrap',
            }}>최근 메모</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: '#0F172A', textWrap: 'pretty' }}>
            "{patient.memo.text}"
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', lineHeight: 1.45 }}>{value}</div>
    </div>
  );
}

Object.assign(window, { PatientHomeScreen });
