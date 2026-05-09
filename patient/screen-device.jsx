// DeviceScreen — Hub + Patch info, replace flow trigger
function DeviceScreen({ theme, onReplaceSensor, onReplaceHub }) {
  const battery = 78;
  const sensorLife = 62; // %
  const rct = 142; // ohm·cm² — bio-fouling
  const r = 98; // % — adhesion
  const fwVer = '1.4.2';
  const expectedDays = 4;

  return (
    <div style={{ padding: '0 0 100px' }}>
      <PageHeader theme={theme} title="Device" sub="기기 상태" right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: theme.goodSoft, fontSize: 11, color: theme.good, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: theme.good }} /> 연결됨
        </div>
      } />

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Visual device illustration */}
        <Card theme={theme} padding={20} style={{ background: `linear-gradient(160deg, ${theme.primarySoft}, ${theme.card})`, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, position: 'relative' }}>
            <DeviceIllustration theme={theme} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Monidle Device · MNDL-2</div>
            <div style={{ fontSize: 11, color: theme.textSec, marginTop: 2 }}>본체 + 교체형 센서 패치</div>
          </div>
        </Card>

        {/* HUB section */}
        <SectionHeader title="본체 (Hub)" theme={theme} />
        <Card theme={theme} padding={0}>
          <RowItem theme={theme} icon="battery" iconColor={theme.good} label="배터리" right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BatteryBar percent={battery} theme={theme} />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums' }}>{battery}%</span>
            </div>
          } />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="live" iconColor={theme.primary} label="예상 사용 시간" right={
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>약 18시간</span>
          } />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="firmware" iconColor={theme.textSec} label="펌웨어" right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: theme.textSec, fontVariantNumeric: 'tabular-nums' }}>v{fwVer}</span>
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: theme.primarySoft, color: theme.primary, fontWeight: 600 }}>최신</span>
            </div>
          } />
        </Card>

        {/* SENSOR PATCH section */}
        <SectionHeader title="센서 패치" theme={theme} />
        <Card theme={theme} padding={0}>
          <RowItem theme={theme} icon="shield" iconColor={theme.good} label="센서 수명" right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BatteryBar percent={sensorLife} theme={theme} colored />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums' }}>{sensorLife}%</span>
            </div>
          } />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="info" iconColor={theme.primary} label="바이오파울링 (Rct)"
            sub="센서 표면 오염도"
            right={
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums' }}>{rct} Ω·cm²</div>
                <div style={{ fontSize: 10, color: theme.good, fontWeight: 600 }}>정상</div>
              </div>
            } />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="pair" iconColor={theme.primary} label="부착 정확도 (R)"
            sub="피부 접촉 임피던스"
            right={
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontVariantNumeric: 'tabular-nums' }}>{r}%</div>
                <div style={{ fontSize: 10, color: theme.good, fontWeight: 600 }}>우수</div>
              </div>
            } />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="bell" iconColor={theme.warn} label="예상 교체 시점" right={
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.warn }}>{expectedDays}일 후</span>
          } />
        </Card>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <ActionButton theme={theme} icon="replace" label="센서 교체" desc="단계별 안내" color={theme.primary} onClick={onReplaceSensor} />
          <ActionButton theme={theme} icon="device" label="본체 교체" desc="배터리/충전" color={theme.textSec} onClick={onReplaceHub} />
        </div>

        <Card theme={theme} padding={0}>
          <RowItem theme={theme} icon="firmware" iconColor={theme.primary} label="펌웨어 업데이트 확인"
            right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
          <Divider theme={theme} />
          <RowItem theme={theme} icon="info" iconColor={theme.textSec} label="기기 상세 정보"
            right={<Icon name="chevron-right" size={16} color={theme.textTer} />} clickable />
        </Card>
      </div>
    </div>
  );
}

function DeviceIllustration({ theme }) {
  return (
    <svg width="180" height="120" viewBox="0 0 180 120">
      <defs>
        <linearGradient id="hubGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#E8E8ED" />
        </linearGradient>
        <linearGradient id="patchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.primary} stopOpacity="0.95" />
          <stop offset="100%" stopColor={theme.primary} stopOpacity="0.7" />
        </linearGradient>
        <filter id="devShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
          <feOffset dy="4" /><feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#devShadow)">
        {/* Patch - bottom layer */}
        <ellipse cx="90" cy="78" rx="68" ry="22" fill="url(#patchGrad)" />
        <ellipse cx="90" cy="74" rx="68" ry="22" fill={theme.primary} />
        {/* Hub - top */}
        <ellipse cx="90" cy="50" rx="40" ry="14" fill="url(#hubGrad)" />
        <ellipse cx="90" cy="46" rx="40" ry="14" fill="#FAFAFC" stroke="#E0E0E5" strokeWidth="0.5" />
        {/* LED */}
        <circle cx="90" cy="46" r="4" fill={theme.good} opacity="0.9" />
        <circle cx="90" cy="46" r="2" fill="#fff" opacity="0.6" />
      </g>
      {/* Live indicator */}
      <g transform="translate(140, 30)">
        <circle r="4" fill={theme.danger}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

function BatteryBar({ percent, theme, colored }) {
  const col = colored ? (percent > 50 ? theme.good : percent > 20 ? theme.warn : theme.danger) : theme.text;
  return (
    <div style={{ width: 40, height: 6, borderRadius: 3, background: theme.divider, overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: '100%', background: col, borderRadius: 3, transition: 'width .4s' }} />
    </div>
  );
}

function RowItem({ icon, iconColor, label, sub, right, theme, clickable, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      cursor: (clickable || onClick) ? 'pointer' : 'default',
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: iconColor + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={16} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: theme.textTer, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Divider({ theme }) {
  return <div style={{ height: 0.5, background: theme.divider, marginLeft: 58 }} />;
}

function ActionButton({ icon, label, desc, color, onClick, theme }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, padding: 14, borderRadius: 14,
      background: theme.card, border: `0.5px solid ${theme.border}`,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{label}</div>
        <div style={{ fontSize: 10, color: theme.textTer, marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

Object.assign(window, { DeviceScreen, RowItem, Divider });
