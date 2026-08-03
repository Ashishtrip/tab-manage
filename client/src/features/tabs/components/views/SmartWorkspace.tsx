import { LayoutGrid, Clock, ArrowRight } from 'lucide-react';

export default function SmartWorkspace() {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <LayoutGrid size={20} color="var(--accent)" style={{ marginRight: '8px' }} />
          Smart Workspace
        </h2>
        <span style={countStyle}>Welcome back, Ashish</span>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <Clock size={16} color="var(--text-muted)" />
            <span style={cardTitleStyle}>Recent Activity</span>
          </div>
          <div style={recentListStyle}>
            <div style={recentItemStyle}>
              <div style={recentIconStyle}></div>
              <div style={recentTextGroupStyle}>
                <div style={recentTitleStyle}>GitHub - Pull Requests</div>
                <div style={recentTimeStyle}>2 mins ago</div>
              </div>
            </div>
            <div style={recentItemStyle}>
              <div style={recentIconStyle}></div>
              <div style={recentTextGroupStyle}>
                <div style={recentTitleStyle}>Stitch Design Tokens</div>
                <div style={recentTimeStyle}>15 mins ago</div>
              </div>
            </div>
          </div>
          <button style={viewAllButtonStyle}>
            View all history <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <LayoutGrid size={16} color="var(--text-muted)" />
            <span style={cardTitleStyle}>Workspace Stats</span>
          </div>
          <div style={statsGridStyle}>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>12</div>
              <div style={statLabelStyle}>Active Tabs</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>3</div>
              <div style={statLabelStyle}>Windows</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>142</div>
              <div style={statLabelStyle}>Archived</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>5</div>
              <div style={statLabelStyle}>Clusters</div>
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '24px',
};

const cardStyle = {
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderBottom: '1px solid var(--hover-bg)',
  paddingBottom: '12px',
};

const cardTitleStyle = {
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--text-primary)',
};

const recentListStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
};

const recentItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const recentIconStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  backgroundColor: 'var(--hover-bg)',
};

const recentTextGroupStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
};

const recentTitleStyle = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--text-primary)',
};

const recentTimeStyle = {
  fontSize: '11px',
  color: 'var(--text-faint)',
};

const viewAllButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--accent)',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  marginTop: 'auto',
  backgroundColor: 'var(--hover-bg)',
  borderRadius: '6px',
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const statBoxStyle = {
  backgroundColor: 'var(--hover-bg)',
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 600,
  color: 'var(--text-primary)',
};

const statLabelStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
};
