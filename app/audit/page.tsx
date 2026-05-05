'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

interface AuditEntry {
  id: string;
  accion: string;
  medId: string;
  vtm: string;
  usuario: string;
  timestamp: string;
  motivo?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  cambioEstado?: boolean;
}

const ACCION_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  CREATE:        { bg: 'var(--estado-autorizado-bg)',  color: 'var(--estado-autorizado)',  label: '+ Creado' },
  UPDATE:        { bg: 'var(--blue-bg)',               color: 'var(--blue)',               label: '✎ Actualizado' },
  DELETE:        { bg: 'var(--estado-retirado-bg)',    color: 'var(--estado-retirado)',    label: '✕ Eliminado' },
  UPDATE_CHAPS:  { bg: 'var(--purple-bg)',             color: 'var(--purple)',             label: '⊞ Capítulos' },
};

function formatDate(ts: string) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return d.toLocaleString('es-EC', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ts; }
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAccion, setFiltroAccion] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const { getToken, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/audit', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setEntries(data.entries || []);
      } catch { console.error('Error cargando audit log'); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading]);

  const filtradas = entries.filter(e => {
    if (filtroAccion !== 'todas' && e.accion !== filtroAccion) return false;
    if (busqueda && !((e.vtm || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (e.usuario || '').toLowerCase().includes(busqueda.toLowerCase()))) return false;
    return true;
  });

  const chipBtn = (activo: boolean): React.CSSProperties => ({
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: `1.5px solid ${activo ? 'var(--green)' : 'var(--bdr)'}`,
    background: activo ? 'var(--green)' : 'var(--bg2)',
    color: activo ? '#fff' : 'var(--tx2)', transition: 'all .13s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* Header dark */}
        <div style={{ background: 'var(--green-dark, #1B4332)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>TRAZABILIDAD</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Audit Log — Registro de cambios</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            Historial completo de operaciones · {entries.length} registros
          </p>
        </div>

        {/* Filtros */}
        <div style={{ background: 'var(--bg2)', borderBottom: '1.5px solid var(--bdr)', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)' }}>ACCIÓN</span>
            {[['todas', 'Todas'], ['CREATE', 'Creados'], ['UPDATE', 'Actualizados'], ['DELETE', 'Eliminados']].map(([val, lbl]) => (
              <button key={val} onClick={() => setFiltroAccion(val)} style={chipBtn(filtroAccion === val)}>{lbl}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por medicamento o usuario..."
              style={{ padding: '6px 12px', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', fontSize: 12, outline: 'none', width: 260, fontFamily: 'var(--sans)', color: 'var(--tx)', background: 'var(--bg)' }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{ flex: 1, padding: '20px 32px' }}>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  {['Fecha y hora', 'Acción', 'Medicamento (VTM)', 'Usuario', 'Cambio estado', 'Detalle'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--bdr)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--tx4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, border: '2px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      Cargando registros...
                    </div>
                  </td></tr>
                ) : filtradas.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--tx4)' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>◉</div>
                    <div style={{ fontWeight: 600 }}>No hay registros de auditoría</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Los cambios aparecerán aquí automáticamente</div>
                  </td></tr>
                ) : filtradas.map((e, i) => {
                  const s = ACCION_STYLES[e.accion] || { bg: 'var(--bg3)', color: 'var(--tx3)', label: e.accion };
                  return (
                    <tr key={e.id}
                      style={{ borderTop: '1px solid var(--bdr)', background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)', transition: 'background .1s' }}
                      onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)'}>
                      <td style={{ padding: '10px 16px', color: 'var(--tx3)', fontSize: 12, fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>
                        {formatDate(e.timestamp)}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--tx)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.vtm || '—'}
                        {e.medId && (
                          <Link href={`/medicamentos/${e.medId}`} style={{ marginLeft: 8, fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>
                            Ver →
                          </Link>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--tx3)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.usuario || '—'}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {e.cambioEstado ? (
                          <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <span style={{ padding: '1px 6px', borderRadius: 20, background: 'var(--bg3)', color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{e.estadoAnterior}</span>
                            <span style={{ color: 'var(--tx4)' }}>→</span>
                            <span style={{ padding: '1px 6px', borderRadius: 20, background: 'var(--estado-autorizado-bg)', color: 'var(--estado-autorizado)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{e.estadoNuevo}</span>
                          </div>
                        ) : <span style={{ color: 'var(--tx4)', fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--tx4)', fontSize: 12 }}>
                        {e.motivo || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            {filtradas.length > 0 && (
              <div style={{ padding: '10px 16px', borderTop: '1.5px solid var(--bdr)', background: 'var(--bg3)', fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)', textAlign: 'right' }}>
                {filtradas.length} de {entries.length} registros
                {filtroAccion !== 'todas' || busqueda ? ' (filtrado)' : ''}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
