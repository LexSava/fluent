import type { Components } from 'streamdown'

export const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 20, marginBottom: 12 }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 17, marginBottom: 10 }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: 8 }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className)
    if (isBlock) {
      return (
        <code
          style={{
            display: 'block',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            overflowX: 'auto',
            fontFamily: 'monospace',
            fontSize: 13,
            color: 'var(--accent-light)',
          }}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 3,
          padding: '2px 6px',
          fontFamily: 'monospace',
          fontSize: 13,
          color: 'var(--accent-light)',
        }}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        overflowX: 'auto',
        marginBottom: 8,
      }}
    >
      {children}
    </pre>
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
  ),
  ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 20, marginBottom: 8 }}>{children}</ol>,
  li: ({ children }) => (
    <li style={{ marginBottom: 4, lineHeight: 1.5, color: 'var(--text-primary)' }}>{children}</li>
  ),
}
