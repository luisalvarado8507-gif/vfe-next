'use client';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>

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

        <div style={{ fontSize: 64, marginBottom: 12 }}>⚠</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
          Error del sistema
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 8 }}>
          Se produjo un error inesperado en el sistema farmacéutico. El incidente ha sido registrado automáticamente.
        </p>
        {error?.message && (
          <div style={{ marginBottom: 24, padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 12, color: '#991B1B', fontFamily: 'monospace', textAlign: 'left', wordBreak: 'break-all' }}>
            {error.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          <button onClick={reset} style={{ padding: '11px 24px', background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            ⟳ Reintentar
          </button>
          <Link href="/dashboard" style={{ padding: '11px 24px', background: '#fff', color: '#475569', border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ← Dashboard
          </Link>
        </div>

        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', letterSpacing: 1 }}>
          SIMI · Ecuador · Error registrado en audit log
        </div>
      </div>
    </div>
  );
}
