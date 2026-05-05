import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#F0F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#0F2D5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="2.5" fill="#60A5FA"/>
              <line x1="12" y1="2" x2="12" y2="22" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
              <line x1="4" y1="12" x2="20" y2="12" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2D5E', letterSpacing: '-0.5px' }}>SIMI</div>
        </div>

        {/* Error code */}
        <div style={{ fontSize: 96, fontWeight: 800, color: '#BFDBFE', lineHeight: 1, marginBottom: 8, fontFamily: 'monospace' }}>404</div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
          Recurso no encontrado
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 32 }}>
          La página o recurso farmacéutico que buscas no existe o ha sido movido. Verifica la URL o regresa al repositorio.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ padding: '11px 24px', background: '#1D4ED8', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'background .15s' }}>
            ← Ir al Dashboard
          </Link>
          <Link href="/medicamentos" style={{ padding: '11px 24px', background: '#fff', color: '#1D4ED8', border: '1.5px solid #BFDBFE', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Base de datos
          </Link>
        </div>

        <div style={{ marginTop: 48, fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', letterSpacing: 1 }}>
          SIMI · Ecuador · ISO IDMP · FHIR R4
        </div>
      </div>
    </div>
  );
}
