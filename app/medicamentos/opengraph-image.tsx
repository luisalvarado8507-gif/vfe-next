import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SIMI — Base de datos de medicamentos Ecuador';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#0B1F4B', padding: 80, justifyContent: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#FFFFFF', marginBottom: 20 }}>SIMI</div>
        <div style={{ fontSize: 32, color: '#93C5FD', marginBottom: 40 }}>Repositorio Farmacéutico Nacional</div>
        <div style={{ fontSize: 24, color: '#64748B' }}>16.515 medicamentos autorizados · ARCSA Ecuador</div>
        <div style={{ fontSize: 20, color: '#64748B', marginTop: 16 }}>ISO IDMP · FHIR R4 · WHO-ATC · SNOMED CT</div>
      </div>
    ),
    { ...size }
  );
}
