export default function SuspendedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 12px' }}>
          Account Suspended
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, margin: '0 0 24px' }}>
          Your account has been suspended. If you believe this is a mistake,
          please contact our support team.
        </p>
        <a
          href="mailto:hello@worthapply.com"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: '#1a1a2e',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
