import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'WorthApply — AI job application copilot for better-fit applications';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at top right, rgba(198, 138, 113, 0.2), transparent 28%), linear-gradient(135deg, #fcf8f3 0%, #f5eee8 48%, #efe3d9 100%)',
          color: '#171411',
          padding: '56px 64px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
            color: '#8d5b46',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #1f2937 0%, #c68a71 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            W
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>WorthApply</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#7a6e64' }}>
              AI job application copilot
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 940 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: 'fit-content',
              borderRadius: 999,
              padding: '10px 18px',
              background: 'rgba(198, 138, 113, 0.14)',
              color: '#8d5b46',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            Analyze fit, tailor faster, and track every application
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 64,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -2.2,
            }}
          >
            Better job applications with less wasted effort.
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              lineHeight: 1.4,
              color: '#5f554e',
              maxWidth: 980,
            }}
          >
            Turn job descriptions into tailored resumes, targeted cover letters, and organized applications in one premium workflow.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {['Job-fit analysis', 'Resume tailoring', 'Cover letters', 'Application tracking'].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(84, 72, 64, 0.1)',
                padding: '12px 20px',
                fontSize: 22,
                color: '#4f463e',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
