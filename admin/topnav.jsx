/* App chrome — TopNav + LeftSidebar shells */

function TopNav({ onLogoClick }) {
  return (
    <header style={{
      height: 56, background: '#FFFFFF', borderBottom: '1px solid #E4E8EE',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, flexShrink: 0,
    }}>
      <div onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="monidle-brand" style={{
            fontFamily: "'Brice SemiExpanded', -apple-system, system-ui, sans-serif",
            fontSize: 22, fontWeight: 400, color: '#FF4D3F', letterSpacing: '-0.01em', lineHeight: 1,
          }}>Monidle</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#FF4D3F', background: '#FFE8E5',
            padding: '3px 7px', borderRadius: 4, letterSpacing: '0.08em',
          }}>ADMIN</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 420, height: 36, background: '#F1F3F6', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 9, padding: '0 12px',
          border: '1px solid transparent', transition: 'all 120ms',
        }}>
          <Icon.Search size={14} color="#94A3B8"/>
          <input
            type="text"
            placeholder="환자명 / ID / 진단명 검색"
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: '#0F172A', fontFamily: 'inherit',
            }}/>
          <span style={{
            fontSize: 11, color: '#94A3B8', background: '#fff', padding: '2px 6px',
            borderRadius: 4, border: '1px solid #E4E8EE', fontFamily: 'var(--mono)',
          }}>⌘K</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Icon.Bell size={17} color="#475569"/>
          <span style={{
            position: 'absolute', top: -4, right: -6, minWidth: 16, height: 16,
            background: '#DC2626', color: '#fff', borderRadius: 999,
            fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '1.5px solid #fff',
          }}>3</span>
        </div>
        <div style={{ width: 1, height: 22, background: '#E4E8EE' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999, background: '#0E5FB5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>박</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>Dr. 박수연</span>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>신경외과</span>
          </div>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { TopNav });
