import { BrainCircuit, ExternalLink } from 'lucide-react';

export default function AIClusters() {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <BrainCircuit size={20} color="var(--accent)" style={{ marginRight: '8px' }} />
          AI Clusters
        </h2>
        <span style={countStyle}>Auto-organized by topic</span>
      </div>
      
      <div style={gridStyle}>
        <div style={clusterCardStyle}>
          <div style={clusterHeaderStyle}>
            <div style={clusterTitleStyle}>Design Systems</div>
            <div style={badgeStyle}>3 tabs</div>
          </div>
          <div style={clusterItemsStyle}>
            <div style={itemStyle}>
              <span>Monolith UI Guidelines</span>
              <ExternalLink size={12} color="var(--text-faint)" />
            </div>
            <div style={itemStyle}>
              <span>Tailwind Config Setup</span>
              <ExternalLink size={12} color="var(--text-faint)" />
            </div>
          </div>
        </div>

        <div style={clusterCardStyle}>
          <div style={clusterHeaderStyle}>
            <div style={clusterTitleStyle}>Pull Requests</div>
            <div style={badgeStyle}>2 tabs</div>
          </div>
          <div style={clusterItemsStyle}>
            <div style={itemStyle}>
              <span>Feature: Dark Mode Toggle</span>
              <ExternalLink size={12} color="var(--text-faint)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: '24px',
  height: '100%',
  overflowY: 'auto' as const,
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

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '16px',
};

const clusterCardStyle = {
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
};

const clusterHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const clusterTitleStyle = {
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--text-primary)',
};

const badgeStyle = {
  backgroundColor: 'var(--badge-bg)',
  color: 'var(--text-primary)',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 500,
};

const clusterItemsStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: 'var(--text-muted)',
  padding: '8px',
  backgroundColor: 'var(--hover-bg)',
  borderRadius: '6px',
  cursor: 'pointer',
};
