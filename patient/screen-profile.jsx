// ProfileScreen — Patient info, doctor link, settings
function ProfileScreen({ theme }) {
  return (
    <div style={{ padding: '0 0 100px' }}>
      <PageHeader theme={theme} title="Profile" sub="개인 정보 및 설정" />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Profile card */}
        <Card theme={theme} padding={18} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 999,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.uchl1})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 22, fontWeight: 700,
          }}>김</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, letterSpacing: -0.4 }}>김지민</div>
            <div style={{ fontSize: 12, color: theme.textSec, marginTop: 2 }}>환자 ID · MNDL-2024-0892</div>
            <div style={{ fontSize: 11, color: theme.good, marginTop: 4, fontWeight: 600 }}>● 모니터링 14일째</div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="edit" size={14} color={theme.text} />
          </div>
        </Card>

        {/* Doctor card — emergency contact */}
        <SectionHeader title="담당의" theme={theme} />
        <Card theme={theme} padding={16} style={{ background: theme.primarySoft, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: theme.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="doctor" size={22} color={theme.primary} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>이수현 교수</div>
              <div style={{ fontSize: 12, color: theme.textSec, marginTop: 1 }}>서울대병원 신경외과</div>
              <div style={{ fontSize: 11, color: theme.textTer, marginTop: 2, fontFamily: monidleType.mono }}>DR-SNUH-3491</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="phone" size={16} color="#fff" />
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', background: theme.card, borderRadius: 10, fontSize: 11, color: theme.textSec, lineHeight: 1.5 }}>
            <Icon name="alert" size={12} color={theme.warn} /> 응급 상황 발생 시 담당의에게 자동으로 알림이 전송됩니다.
          </div>
        </Card>

        {/* Sections */}
        <SectionHeader title="개인 정보" theme={theme} />
        <Card theme={theme} padding={0}>
          <RowItem theme={theme} icon="profile" iconColor={theme.primary} label="개인정보 수정" right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="bell" iconColor={theme.warn} label="알림 기록" sub="최근 12건" right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="family" iconColor={theme.good} label="가족과 데이터 공유" sub="3명 연결됨" right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
        </Card>

        <SectionHeader title="앱 설정" theme={theme} />
        <Card theme={theme} padding={0}>
          <RowItem theme={theme} icon="settings" iconColor={theme.textSec} label="알림 설정" right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="lock" iconColor={theme.textSec} label="개인정보 보호" right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="share" iconColor={theme.textSec} label="데이터 내보내기" sub="CSV / PDF" right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="info" iconColor={theme.textSec} label="앱 정보" right={<span style={{ fontSize: 12, color: theme.textTer }}>v2.1.0</span>} clickable />
        </Card>

        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: theme.textTer }}>
          Monidle · 실시간 뇌 손상 모니터링
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProfileScreen });
