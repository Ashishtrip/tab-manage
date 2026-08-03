import { useState } from 'react';
import { Search, Sparkles, Folder, ExternalLink } from 'lucide-react';

export default function SemanticDiscovery() {
  const [query, setQuery] = useState('');

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}><Sparkles size={18} color="var(--accent)" /> Semantic Discovery</h2>
        <p style={subtitleStyle}>Search beyond keywords. Describe what you're looking for.</p>
      </div>

      <div style={searchContainerStyle}>
        <Search size={18} color="var(--text-muted)" />
        <input
          style={inputStyle}
          placeholder="e.g., 'Articles about design systems from last week'"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button style={buttonStyle}>Discover</button>
      </div>

      <div style={resultsContainerStyle}>
        {query ? (
          <div style={resultListStyle}>
            <div style={resultItemStyle}>
              <div style={resultIconStyle}><Folder size={14} /></div>
              <div style={{ flex: 1 }}>
                <div style={resultTitleStyle}>Design Tokens Reference</div>
                <div style={resultMetaStyle}>Workspace &gt; Design &gt; Tokens</div>
              </div>
              <ExternalLink size={14} color="var(--text-faint)" />
            </div>
            <div style={resultItemStyle}>
              <div style={resultIconStyle}><Folder size={14} /></div>
              <div style={{ flex: 1 }}>
                <div style={resultTitleStyle}>Stitch Monolith Guide</div>
                <div style={resultMetaStyle}>Workspace &gt; Guidelines</div>
              </div>
              <ExternalLink size={14} color="var(--text-faint)" />
            </div>
          </div>
        ) : (
          <div style={emptyStateStyle}>
            <Sparkles size={32} color="var(--border-color)" style={{ marginBottom: '16px' }} />
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>AI-Powered Search</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Your workspace is fully indexed for semantic retrieval.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100%',
  backgroundColor: 'var(--panel-bg)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  overflow: 'hidden',
};

const headerStyle = {
  padding: '24px',
  borderBottom: '1px solid var(--border-color)',
};

const titleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px',
  fontWeight: 600,
  margin: 0,
  marginBottom: '4px',
};

const subtitleStyle = {
  fontSize: '13px',
  color: 'var(--text-muted)',
  margin: 0,
};

const searchContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  gap: '12px',
  borderBottom: '1px solid var(--border-color)',
  backgroundColor: 'var(--app-bg)',
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  color: 'var(--text-primary)',
};

const buttonStyle = {
  backgroundColor: 'var(--accent)',
  color: 'var(--accent-text)',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
};

const resultsContainerStyle = {
  flex: 1,
  overflowY: 'auto' as const,
  padding: '16px',
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '200px',
  textAlign: 'center' as const,
};

const resultListStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
};

const resultItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  borderRadius: '6px',
  backgroundColor: 'var(--app-bg)',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease',
};

const resultIconStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  backgroundColor: 'var(--hover-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
};

const resultTitleStyle = {
  fontWeight: 500,
  fontSize: '13px',
  color: 'var(--text-primary)',
};

const resultMetaStyle = {
  fontSize: '11px',
  color: 'var(--text-faint)',
  marginTop: '2px',
};
