import type { TabTreeNode, TreeEntry } from '../TabTree';
import { Archive } from 'lucide-react';

interface ActiveTabsProps {
  entries: TreeEntry[];
  onSelectTab?: (tab: TabTreeNode) => void;
}

export default function ActiveTabs({ entries, onSelectTab }: ActiveTabsProps) {
  // Filter for tabs, excluding folders for this view
  const tabs = entries.filter((e): e is TabTreeNode => e.type === "tab");

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Active Tabs</h2>
        <span style={countStyle}>{tabs.length} tabs open</span>
      </div>
      
      <div style={listStyle}>
        {tabs.length > 0 ? (
          tabs.map((tab, i) => (
            <div 
              key={tab.id || i} 
              style={tabItemStyle}
              onClick={() => onSelectTab?.(tab)}
            >
              <div style={iconPlaceholderStyle}></div>
              <div style={tabInfoStyle}>
                <div style={tabTitleStyle}>{tab.title || tab.url}</div>
                <div style={tabUrlStyle}>{tab.url}</div>
              </div>
              <button 
                style={archiveButtonStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  // socket.emit('tab:updated', { id: tab.id, changeInfo: { isArchived: true } })
                  console.log('Archive tab', tab.id);
                }}
                title="Archive Tab"
              >
                <Archive size={16} />
              </button>
            </div>
          ))
        ) : (
          <div style={emptyStyle}>
            <div style={emptyIconStyle}></div>
            <div>No active tabs in this window.</div>
          </div>
        )}
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

const listStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
};

const tabItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: 'var(--panel-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  gap: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const iconPlaceholderStyle = {
  width: '16px',
  height: '16px',
  borderRadius: '4px',
  backgroundColor: 'var(--border-color)',
  flexShrink: 0,
};

const tabInfoStyle = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '2px',
};

const tabTitleStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const tabUrlStyle = {
  fontSize: '12px',
  color: 'var(--text-faint)',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const emptyStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '64px 0',
  color: 'var(--text-muted)',
  fontSize: '14px',
  gap: '16px',
};

const emptyIconStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: 'var(--hover-bg)',
};

const archiveButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s, color 0.2s',
};
