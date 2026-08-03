import { useState, useEffect } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';

export default function CommandCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // the parent should handle opening, this just closes if open
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <Search size={18} color="var(--text-faint)" />
          <input
            autoFocus
            style={inputStyle}
            placeholder="Search tabs, commands, or ask Bastion..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div style={shortcutHintStyle}>
            <Command size={14} /> K
          </div>
        </div>
        
        <div style={bodyStyle}>
          {query ? (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Results</div>
              <div style={itemStyle}>
                <ArrowRight size={16} color="var(--text-muted)" />
                <span style={{ flex: 1 }}>Search internet for "{query}"</span>
              </div>
            </div>
          ) : (
            <>
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Recent Tabs</div>
                <div style={itemStyle}>
                  <div style={itemIconStyle}></div>
                  <span style={{ flex: 1 }}>Bastion Design Guidelines</span>
                  <span style={itemMetaStyle}>design.md</span>
                </div>
                <div style={itemStyle}>
                  <div style={itemIconStyle}></div>
                  <span style={{ flex: 1 }}>GitHub - pull requests</span>
                  <span style={itemMetaStyle}>github.com</span>
                </div>
              </div>
              
              <div style={sectionStyle}>
                <div style={sectionTitleStyle}>Commands</div>
                <div style={itemStyle}>
                  <Command size={16} color="var(--text-muted)" />
                  <span style={{ flex: 1 }}>Create new Workspace</span>
                </div>
                <div style={itemStyle}>
                  <Command size={16} color="var(--text-muted)" />
                  <span style={{ flex: 1 }}>Switch Theme</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(4px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  paddingTop: '12vh',
  animation: 'fadeIn 0.2s ease-out',
};

const modalStyle = {
  backgroundColor: 'var(--panel-bg)',
  width: '100%',
  maxWidth: '640px',
  borderRadius: '12px',
  boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column' as const,
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid var(--border-color)',
  gap: '12px',
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '16px',
  color: 'var(--text-primary)',
};

const shortcutHintStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: 'var(--hover-bg)',
  borderRadius: '4px',
  fontSize: '12px',
  color: 'var(--text-muted)',
};

const bodyStyle = {
  maxHeight: '400px',
  overflowY: 'auto' as const,
  padding: '12px 0',
};

const sectionStyle = {
  marginBottom: '16px',
};

const sectionTitleStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-faint)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  padding: '8px 20px',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 20px',
  gap: '12px',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  transition: 'background-color 0.1s ease',
};

const itemIconStyle = {
  width: '16px',
  height: '16px',
  backgroundColor: 'var(--border-color)',
  borderRadius: '3px',
};

const itemMetaStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
};
