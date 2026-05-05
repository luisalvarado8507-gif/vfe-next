'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Alerta {
  tipo: string;
  severidad: 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
}

interface AlertasProps {
  capitulo: string;
  subcapitulo?: string;
  atc?: string;
}

const TIPO_CONFIG: Record<string, { icon: string; label: string }> = {
  interaccion:      { icon: '⚡', label: 'Interacción' },
  contraindicacion: { icon: '⊘', label: 'Contraindicación' },
  precaucion:       { icon: '⚠', label: 'Precaución' },
  monitoreo:        { icon: '◎', label: 'Monitoreo' },
  embarazo:         { icon: '♀', label: 'Embarazo' },
  pediatrico:       { icon: '◌', label: 'Pediátrico' },
};

const SEV_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  alta:  { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
  media: { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
  baja:  { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
};

export default function AlertasTerapeuticas({ capitulo, subcapitulo, atc }: AlertasProps) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [mecanismo, setMecanismo] = useState('');
  const [indicaciones, setIndicaciones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const cargar = async () => {
    if (loaded) { setExpanded(!expanded); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ capitulo });
      if (subcapitulo) params.set('subcapitulo', subcapitulo);
      if (atc) params.set('atc', atc);
      const res = await fetch(`/api/ai/alertas?${params}`);
      const data = await res.json();
      setAlertas(data.alertas || []);
      setMecanismo(data.mecanismo || '');
      setIndicaciones(data.indicaciones || []);
      setLoaded(true);
      setExpanded(true);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Trigger */}
      <button onClick={cargar} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', background: expanded ? 'var(--red-bg, #FEE2E2)' : 'var(--bg2)',
        border: `1.5px solid ${expanded ? '#FCA5A5' : 'var(--bdr)'}`,
        borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
        color: expanded ? 'var(--red)' : 'var(--tx2)', fontFamily: 'var(--sans)',
        transition: 'all .15s',
      }}>
        <span style={{ fontSize: 14 }}>⚕</span>
        {loading ? 'Generando alertas clínicas...' : expanded ? 'Ocultar alertas clínicas' : 'Ver alertas terapéuticas del grupo (IA)'}
        {alertas.filter(a => a.severidad === 'alta').length > 0 && (
          <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--red)', color: '#fff', marginLeft: 4 }}>
            {alertas.filter(a => a.severidad === 'alta').length} alta
          </span>
        )}
      </button>

      {/* Panel */}
      {expanded && loaded && (
        <div style={{ marginTop: 10, background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>

          {/* Mecanismo */}
          {mecanismo && (
            <div style={{ padding: '12px 16px', background: 'var(--bg3)', borderBottom: '1px solid var(--bdr)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginBottom: 4 }}>MECANISMO DE ACCIÓN</div>
              <div style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 }}>{mecanismo}</div>
            </div>
          )}

          {/* Indicaciones */}
          {indicaciones.length > 0 && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--bdr)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginRight: 4 }}>INDICACIONES</span>
              {indicaciones.map(ind => (
                <span key={ind} style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, background: 'var(--estado-autorizado-bg)', color: 'var(--estado-autorizado)', fontWeight: 500 }}>{ind}</span>
              ))}
            </div>
          )}

          {/* Alertas */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginBottom: 4 }}>ALERTAS CLÍNICAS</div>
            {alertas.map((a, i) => {
              const sc = SEV_CONFIG[a.severidad] || SEV_CONFIG.baja;
              const tc = TIPO_CONFIG[a.tipo] || { icon: '•', label: a.tipo };
              return (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 'var(--r)', borderLeft: `3px solid ${sc.color}` }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{tc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{a.titulo}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 20, background: sc.color + '22', color: sc.color, fontWeight: 600 }}>{tc.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: sc.color, opacity: 0.9 }}>{a.descripcion}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--bdr)', fontSize: 10, color: 'var(--tx4)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
            Generado por Claude AI · Solo orientativo · Verificar con fuentes regulatorias
          </div>
        </div>
      )}
    </div>
  );
}
