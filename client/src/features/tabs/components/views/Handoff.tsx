import { Smartphone, Laptop, Send } from 'lucide-react';

export default function Handoff() {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Handoff</h2>
        <span style={countStyle}>Send tabs between devices</span>
      </div>

      <div style={contentStyle}>
        <div style={deviceCardStyle}>
          <Smartphone size={32} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <div style={deviceNameStyle}>Ashish's iPhone</div>
          <div style={deviceStatusStyle}>Active now</div>
          <button style={actionButtonStyle}>
            <Send size={14} style={{ marginRight: '6px' }} /> Send Current Tab
          </button>
        </div>

        <div style={deviceCardStyle}>
          <Laptop size={32} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <div style={deviceNameStyle}>MacBook Pro</div>
          <div style={deviceStatusStyle}>Last seen 2h ago</div>
          <button style={actionButtonStyleDisabled} disabled>
            <Send size={14} style={{ marginRight: '6px' }} /> Offline
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: '24px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
};

const headerStyle = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  marginBottom: '24px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '16px',
};

const titleStyle = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const countStyle = {
  fontSize: '13px',
  color: 'var(--text-muted)',
};

const contentStyle = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap' as const,
};

const deviceCardStyle = {
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  minWidth: '240px',
  textAlign: 'center' as const,
};

const deviceNameStyle = {
  fontWeight: 600,
  fontSize: '15px',
  color: 'var(--text-primary)',
  marginBottom: '4px',
};

const deviceStatusStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  marginBottom: '24px',
};

const actionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '8px 16px',
  backgroundColor: 'var(--accent)',
  color: 'var(--accent-text)',
  border: 'none',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
};

const actionButtonStyleDisabled = {
  ...actionButtonStyle,
  backgroundColor: 'var(--hover-bg)',
  color: 'var(--text-muted)',
  cursor: 'not-allowed',
};
