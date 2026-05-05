import Link from 'next/link';

export const metadata = {
  title: 'SIMI — Sistema Integral de Medicamentos Interoperables · Ecuador',
  description: 'Repositorio farmacéutico nacional de Ecuador con interoperabilidad FHIR R4, ISO IDMP, EMA SPOR, ATC-WHO y SNOMED CT.',
};

export default function Home() {
  const feature = (icon: string, title: string, desc: string, badge?: string) => (
    <div style={{ background: '#fff', border: '1.5px solid #BFDBFE', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{title}</div>
          {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: '#DBEAFE', color: '#1D4ED8', fontFamily: 'monospace' }}>{badge}</span>}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );

  const stat = (value: string, label: string, sub: string) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#60A5FA', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", background: '#F0F4FF' }}>

      {/* Navbar */}
      <nav style={{ background: '#0F2D5E', padding: '14px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 0 rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="none" stroke="#60A5FA" strokeWidth="1.5"/>
              <circle cx="12" cy="12" r="2.5" fill="#60A5FA"/>
              <line x1="12" y1="2" x2="12" y2="22" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
              <line x1="4" y1="12" x2="20" y2="12" stroke="#60A5FA" strokeWidth="1" opacity="0.5"/>
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>SIMI</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '1.5px', fontFamily: 'monospace', marginLeft: 4 }}>ECUADOR</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/gobernanza" style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontWeight: 500 }}>Gobernanza</Link>
          <Link href="/docs" style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontWeight: 500 }}>API Docs</Link>
          <Link href="/login" style={{ padding: '7px 18px', background: '#1D4ED8', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'background .15s' }}>
            Acceder →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: '#0F2D5E', padding: '80px 48px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -100, top: -100, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -50, top: -50, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -80, bottom: -80, width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(255,255,255,.03)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'rgba(96,165,250,.15)', border: '1px solid rgba(96,165,250,.3)', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#60A5FA', letterSpacing: '1px', fontFamily: 'monospace' }}>ISO IDMP · HL7 FHIR R4 · EMA SPOR · SNOMED CT</span>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20 }}>
            Sistema Integral de<br />
            <span style={{ color: '#60A5FA' }}>Medicamentos Interoperables</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', lineHeight: 1.8, marginBottom: 36, maxWidth: 580, margin: '0 auto 36px' }}>
            Repositorio farmacéutico nacional de Ecuador con nomenclatura SPMS, interoperabilidad FHIR R4 y codificación ATC-WHO 2025. Conforme a estándares EMA, FDA e ISO.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '14px 32px', background: '#1D4ED8', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'background .15s' }}>
              Acceder al sistema →
            </Link>
            <Link href="/docs" style={{ padding: '14px 28px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              API Docs
            </Link>
            <Link href="/gobernanza" style={{ padding: '14px 28px', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Gobernanza
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 700, margin: '56px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {stat('FHIR', 'R4', 'HL7 estándar')}
          {stat('ISO', 'IDMP', '5 estándares')}
          {stat('ATC', 'WHO 2025', 'Clasificación')}
          {stat('18', 'Capítulos', 'terapéuticos')}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: 10 }}>CAPACIDADES DEL SISTEMA</div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
            Infraestructura farmacéutica de clase mundial
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {feature('⊕', 'API FHIR R4', 'Recursos Medication, Substance, Organization y CapabilityStatement. Compatible con HIS/EHR modernos.', 'HL7 FHIR R4')}
          {feature('◎', 'EMA SPOR', 'Modelo S/P/O/R con IDs estables. Separación Sustancia/Producto/Organización/Referencial conforme ISO IDMP.', 'ISO 11615')}
          {feature('⊟', 'Ciclo regulatorio', '8 estados regulatorios con máquina de estados: solicitud → evaluación → autorización → variación → revocación.', 'ARCSA')}
          {feature('🔍', 'Búsqueda semántica', 'Motor de búsqueda con IA Claude que entiende indicaciones clínicas, mecanismos de acción y grupos terapéuticos.', 'Claude AI')}
          {feature('⚕', 'Alertas terapéuticas', 'Alertas clínicas por grupo farmacológico: interacciones, contraindicaciones, precauciones en poblaciones especiales.', 'IA')}
          {feature('◈', 'Analítica avanzada', 'Dashboard con distribución ATC, formas farmacéuticas, laboratorios, tendencias de registro y métricas de completitud.', 'Analytics')}
          {feature('⊡', 'Gobernanza ISO', 'Política de calidad del dato, SLA de actualización, proceso editorial con revisión por pares y audit trail completo.', 'ISO IDMP')}
          {feature('⟳', 'Versionado histórico', 'Cada modificación genera una versión inmutable. Historial completo de cambios regulatorios con trazabilidad de autoría.', 'Audit')}
          {feature('✦', 'SNOMED + RxNorm', 'Validación en tiempo real contra SNOMED International y RxNorm FDA. Mapeo a EMA SPOR IDs y G-SRS UNII.', 'Semántica')}
        </div>
      </div>

      {/* Estándares */}
      <div style={{ background: '#0F2D5E', padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: 20 }}>ESTÁNDARES IMPLEMENTADOS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 800, margin: '0 auto 32px' }}>
          {['ISO IDMP 11615', 'ISO IDMP 11238', 'ISO IDMP 11239', 'ISO IDMP 11240', 'ISO IDMP 11616', 'HL7 FHIR R4', 'EMA SPOR', 'ATC-WHO 2025', 'SNOMED CT', 'EDQM', 'RxNorm FDA', 'G-SRS UNII', 'OpenAPI 3.0', 'WCAG 2.1 AA'].map(std => (
            <span key={std} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)' }}>
              {std}
            </span>
          ))}
        </div>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', background: '#1D4ED8', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          Acceder al sistema →
        </Link>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0A1F42', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontFamily: 'monospace' }}>
          SIMI · Sistema Integral de Medicamentos Interoperables · Ecuador · {new Date().getFullYear()}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Gobernanza', '/gobernanza'], ['API Docs', '/docs'], ['Acceder', '/login']].map(([l, h]) => (
            <Link key={h} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s' }}>{l}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
