import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1829 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            ✉️
          </div>
          <span style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>GhostMail</span>
          <span
            style={{
              background: 'rgba(34,211,238,0.15)',
              border: '1px solid rgba(34,211,238,0.3)',
              color: '#22d3ee',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            FREE FOREVER
          </span>
        </div>
        <div style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
          <span style={{ color: 'white' }}>Your Own</span>
          <br />
          <span style={{ color: '#22d3ee' }}>Email Address</span>
        </div>
        <div style={{ fontSize: '24px', color: '#94a3b8', marginBottom: '40px' }}>
          Receive OTPs • Sign up anywhere • Keep inbox spam-free
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['⚡ Instant Delivery', '🛡️ Privacy First', '☁️ Cloudflare Powered', '🆓 No Credit Card'].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '15px',
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontSize: '20px',
            color: '#22d3ee',
            fontWeight: 600,
          }}
        >
          ghostmail.store
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
