import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

export const metadata = {
  title: 'Gobernanza — SIMI Ecuador',
  description: 'Política de calidad, procesos editoriales y gobernanza del dato farmacéutico de SIMI.',
};

export default function GobernanzaPage() {
  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#fff', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '20px 24px', marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--bdr)' }}>{title}</h2>
      {children}
    </div>
  );

  const item = (label: string, value: string, color = 'var(--tx)') => (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', minWidth: 200, fontFamily: 'var(--mono)', letterSpacing: 0.5, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 13, color, flex: 1 }}>{value}</span>
    </div>
  );

  const badge = (text: string, color: string, bg: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: bg, color, marginRight: 6, marginBottom: 4 }}>{text}</span>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '24px 36px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>SIMI · TRANSPARENCIA Y CALIDAD</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Política de gobernanza del dato</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', maxWidth: 600 }}>
            Estándares de calidad, procesos editoriales y compromisos de mantenimiento del repositorio farmacéutico nacional SIMI · Ecuador.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {badge('ISO IDMP 11615', '#fff', 'rgba(255,255,255,.15)')}
            {badge('HL7 FHIR R4', '#fff', 'rgba(255,255,255,.15)')}
            {badge('EMA SPOR', '#fff', 'rgba(255,255,255,.15)')}
            {badge('SNOMED CT', '#fff', 'rgba(255,255,255,.15)')}
            {badge('ATC-WHO 2025', '#fff', 'rgba(255,255,255,.15)')}
          </div>
        </div>

        <div style={{ padding: '28px 36px', maxWidth: 900 }}>

          {section('1. Identificación del sistema', (
            <>
              {item('Nombre del sistema', 'SIMI — Sistema Integral de Medicamentos Interoperables')}
              {item('Jurisdicción', 'República del Ecuador')}
              {item('Organismo de referencia', 'ARCSA — Agencia Nacional de Regulación, Control y Vigilancia Sanitaria')}
              {item('Versión actual', '1.0.0')}
              {item('Fecha de publicación', new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' }))}
              {item('Estándares aplicados', 'ISO IDMP 11615/11238/11239/11240/11616 · HL7 FHIR R4 · EMA SPOR · SNOMED CT · ATC-WHO · EDQM')}
            </>
          ))}

          {section('2. Política de calidad del dato', (
            <>
              <p style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 14, lineHeight: 1.8 }}>
                SIMI adopta los principios de calidad del dato farmacéutico establecidos por la EMA en el marco SPOR y los estándares ISO IDMP. Todo registro debe cumplir los criterios FAIR: Findable, Accessible, Interoperable, Reusable.
              </p>
              {[
                ['Completitud mínima requerida', 'VTM (INN/DCI) · Forma farmacéutica · Concentración · Laboratorio · Registro sanitario ARCSA · Código ATC'],
                ['Nomenclatura de principios activos', 'Denominación Común Internacional (DCI) en minúsculas, idioma español, conforme a lista OMS'],
                ['Codificación ATC', 'Clasificación WHO-ATC vigente (actualización anual en enero). Mínimo nivel 5 (7 caracteres)'],
                ['Formas farmacéuticas', 'Terminología EDQM Standard Terms. Idioma español con término EDQM entre paréntesis'],
                ['Vías de administración', 'Terminología EDQM. Códigos SNOMED CT obligatorios cuando disponibles'],
                ['Estado regulatorio', 'Según ciclo de vida ARCSA: borrador → evaluación → autorizado → variación → suspendido → revocado'],
              ].map(([l, v]) => item(l, v))}
            </>
          ))}

          {section('3. Proceso editorial y revisión por pares', (
            <>
              <div style={{ display: 'flex', gap: 0, marginBottom: 20, overflowX: 'auto' }}>
                {[
                  { step: '1', title: 'Captura', desc: 'Editor ingresa datos desde expediente ARCSA o ficha técnica del laboratorio', color: '#DBEAFE', border: '#93C5FD', tx: '#1E40AF' },
                  { step: '2', title: 'Validación auto.', desc: 'Sistema valida: ATC formato, DCI minúsculas, concentración numérica, RS válido', color: '#EDE9FE', border: '#C4B5FD', tx: '#5B21B6' },
                  { step: '3', title: 'Revisión', desc: 'Segundo editor revisa completitud y coherencia farmacológica', color: '#D1FAE5', border: '#6EE7B7', tx: '#065F46' },
                  { step: '4', title: 'Autorización', desc: 'Administrador autoriza y publica. Se genera audit trail automático', color: '#DCFCE7', border: '#86EFAC', tx: '#166534' },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, background: s.color, border: `1.5px solid ${s.border}`, borderRadius: 8, padding: '12px 14px', marginRight: i < 3 ? 8 : 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.tx, marginBottom: 4 }}>{s.step}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: s.tx, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 11, color: s.tx, opacity: 0.8, lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
              {item('Trazabilidad', 'Cada modificación registra: usuario, timestamp, estado anterior, estado nuevo. Irreversible.')}
              {item('Conflictos de interés', 'Editores no pueden autorizar registros de laboratorios con los que tengan relación comercial')}
            </>
          ))}

          {section('4. SLA — Compromisos de nivel de servicio', (
            <>
              {[
                ['Disponibilidad del sistema', '99.5% mensual (Vercel SLA)'],
                ['Actualización de registros ARCSA', 'Máximo 30 días desde publicación oficial ARCSA'],
                ['Corrección de errores críticos', 'Máximo 72 horas desde notificación'],
                ['Corrección de errores menores', 'Máximo 14 días desde notificación'],
                ['Actualización terminología ATC-WHO', 'Enero de cada año (publicación WHO)'],
                ['Actualización SNOMED CT', 'Semestral (enero y julio — ciclo IHTSDO)'],
                ['Respuesta a solicitudes de corrección', 'Máximo 5 días hábiles'],
                ['Retención de historial de versiones', 'Indefinida — todos los cambios son auditables'],
              ].map(([l, v]) => item(l, v))}
            </>
          ))}

          {section('5. Interoperabilidad y acceso a datos', (
            <>
              {item('API REST pública', '/api/medicamentos — autenticación Firebase JWT requerida')}
              {item('API FHIR R4', '/api/fhir/r4 — recursos Medication, Substance, Organization')}
              {item('CapabilityStatement', '/api/fhir/r4/metadata — descripción completa de capacidades')}
              {item('Documentación OpenAPI', '/docs — Swagger UI interactivo')}
              {item('Modelo SPOR', '/api/spor — entidades S/P/O/R con IDs estables ISO IDMP')}
              {item('Formato de intercambio', 'JSON · FHIR Bundle · CSV · HTML')}
              {item('CORS', 'Habilitado en endpoints FHIR para integraciones externas')}
              {item('Licencia de datos', 'Uso institucional Ecuador — no comercial sin autorización')}
            </>
          ))}

          {section('6. Contacto y notificación de errores', (
            <>
              {item('Canal de reporte', 'Audit log del sistema — toda discrepancia debe documentarse')}
              {item('Responsable técnico', 'Administrador SIMI — acceso vía /admin/usuarios')}
              {item('Referencia normativa', 'ARCSA — arcsa.gob.ec · MSP Ecuador — salud.gob.ec')}
              {item('Estándar de referencia internacional', 'EMA SPOR — spor.ema.europa.eu · HL7 FHIR — hl7.org/fhir')}
            </>
          ))}

          <div style={{ fontSize: 11, color: 'var(--tx4)', textAlign: 'center', fontFamily: 'var(--mono)', marginTop: 8 }}>
            SIMI · Sistema Integral de Medicamentos Interoperables · Ecuador · v1.0 · {new Date().getFullYear()}
          </div>
        </div>
      </main>
    </div>
  );
}
