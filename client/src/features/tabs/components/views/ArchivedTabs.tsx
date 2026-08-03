import { Archive } from 'lucide-react';

export default function ArchivedTabs() {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <Archive size={20} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          Archived Sessions
        </h2>
        <span style={countStyle}>0 sessions</span>
      </div>
      
      <div style={emptyStyle}>
        <Archive size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>No archived sessions</div>
        <div style={{ color: 'var(--text-muted)' }}>Tabs you close to save memory will appear here.</div>
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
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '16px',
};

const titleStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: 0,
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const countStyle = {
  fontSize: '13px',
  color: 'var(--text-muted)',
};

const emptyStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center' as const,
  fontSize: '14px',
};
