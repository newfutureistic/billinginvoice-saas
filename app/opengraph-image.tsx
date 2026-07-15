import { ImageResponse } from 'next/og'

// Default social share image (1200×630) inherited by every route via the file convention.
export const alt = 'Bill Maker — Professional invoices, generated in seconds'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#0b1120',
          backgroundImage: 'radial-gradient(circle at 20% 15%, #1e293b 0%, #0b1120 55%)',
          padding: '80px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 38, fontWeight: 700, color: '#a5b4fc' }}>
          Bill Maker
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 70, fontWeight: 800, lineHeight: 1.08, maxWidth: 920 }}>
          Professional invoices, generated in seconds
        </div>
        <div style={{ display: 'flex', marginTop: 32, fontSize: 30, color: '#94a3b8' }}>
          Free invoice generator · GST / VAT ready · PDF in seconds
        </div>
      </div>
    ),
    { ...size },
  )
}
