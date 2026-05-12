'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

interface RecentMed {
  docId: string;
  nombre: string;
  vtm: string;
  conc: string;
  laboratorio: string;
  estado: string;
}

interface Stats {
  total: number;
  principiosActivos: number;
  genericos: number;
  cnmb: number;
  eml: number;
  arcsa_pendiente: number;
}

// Helper: principios activos para combos
function getVtmLabel(m: any): string {
  if (m.esCombo && m.comboData?.pas?.length) return m.comboData.pas.join(' + ');
  return m.vtm || '';
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, principiosActivos: 0, genericos: 0, cnmb: 0, eml: 0, arcsa_pendiente: 0 });
  const [recientes, setRecientes] = useState<RecentMed[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoB, setTipoB] = useState<'todo' | 'pa' | 'comercial' | 'atc' | 'lab'>('todo');
  const [loading, setLoading] = useState(true);
  const { getToken, user, role, isAdmin, loading: authLoading } = useAuth();

  const marcarEML = async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch('/api/admin/marcar-eml', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    if (d.ok) alert(`✅ EML-OMS actualizado: ${d.marcados} medicamentos marcados de ${d.total} revisados`);
    else alert('❌ Error: ' + (d.error || 'desconocido'));
  };

  const router = useRouter();

  const fecha = new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (authLoading || !user) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const [statsRes, recentRes] = await Promise.all([
          fetch('/api/avances', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/busqueda?estado=autorizado&limit=20', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const statsData = await statsRes.json();
        const recentData = await recentRes.json();
        setStats({
          total: statsData.autorizados ?? 0,
          principiosActivos: statsData.principiosActivos ?? 0,
          genericos: statsData.genericos ?? 0,
          cnmb: statsData.cnmb ?? 0,
          eml: statsData.eml ?? 0,
          arcsa_pendiente: statsData.arcsa_pendiente ?? 0,
        });
        setRecientes((recentData.medicamentos || []).slice(0, 20).map((m: any) => ({
          docId: m.docId || m.id,
          nombre: m.nombre || m.vtm || '',
          vtm: m.vtm || '',
          conc: m.conc || '',
          laboratorio: m.laboratorio || '',
          estado: m.estado || 'pendiente',
          esCombo: m.esCombo || false,
          comboData: m.comboData || null,
        })));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading, user]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) router.push(`/medicamentos?q=${encodeURIComponent(busqueda)}&tipo=${tipoB}`);
  };

  const estadoBadge = (estado: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      autorizado:      { bg: 'var(--estado-autorizado-bg)',  color: 'var(--estado-autorizado)',  label: 'Autorizado' },
      arcsa_pendiente: { bg: 'var(--estado-pendiente-bg)',   color: 'var(--estado-pendiente)',   label: 'ARCSA pendiente' },
      suspendido:      { bg: 'var(--estado-suspendido-bg)',  color: 'var(--estado-suspendido)',  label: 'Suspendido' },
      retirado:        { bg: 'var(--estado-retirado-bg)',    color: 'var(--estado-retirado)',    label: 'Retirado' },
    };
    return map[estado] || { bg: 'var(--bg3)', color: 'var(--tx3)', label: estado };
  };

  const statCards = [
    { label: 'Medicamentos', sub: 'registros autorizados', value: stats.total, accent: 'var(--green)' },
    { label: 'Principios activos', sub: 'DCI distintos', value: stats.principiosActivos, accent: 'var(--blue)' },
    { label: 'Genéricos', sub: 'medicamentos genéricos', value: stats.genericos, accent: 'var(--purple)' },
    { label: 'CNMB', sub: 'medicamentos esenciales', value: stats.cnmb, accent: 'var(--amber)' },
  ];

  const tipoOpts: { key: typeof tipoB; label: string }[] = [
    { key: 'todo',      label: 'Todo' },
    { key: 'pa',        label: 'Principio activo' },
    { key: 'comercial', label: 'Nombre comercial' },
    { key: 'atc',       label: 'Código ATC' },
    { key: 'lab',       label: 'Laboratorio' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '272px', display: 'flex', flexDirection: 'column' }}>

        {/* ── HERO BUSCADOR ── */}
        <div style={{
          background: 'var(--green-dark, #0F2D5E)',
          padding: '24px 36px 20px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Decoración fondo — hexágono sutil */}
          <div style={{ position: 'absolute', right: -80, top: -80, width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(255,255,255,.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: -20, top: 20, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(96,165,250,.06)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.35)', letterSpacing: '2px', marginBottom: 5, textTransform: 'uppercase' }}>
                Repositorio farmacéutico nacional · Ecuador
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2, margin: 0 }}>
                Base de datos de medicamentos autorizados
              </h1>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)' }}>
                  ✓ Autorizados visibles
                </span>
                {stats.arcsa_pendiente > 0 && (
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.3)' }}>
                    + {stats.arcsa_pendiente.toLocaleString('es-EC')} en depuración
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontFamily: 'var(--mono)' }}>{fecha}</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.65)', fontFamily: 'var(--mono)', letterSpacing: 0.5 }}>
                  {role === 'admin' ? 'ADMIN' : role === 'editor' ? 'EDITOR' : 'VISUALIZADOR'}
                </span>
              </div>
            </div>
          </div>

          {/* Buscador */}
          <form onSubmit={handleBuscar}>
            <div style={{
              display: 'flex',
              background: '#fff',
              borderRadius: 'var(--rl)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,.2)',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '1.5px solid var(--bdr)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar medicamento, principio activo, laboratorio, código ATC…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: '14px', padding: '14px 12px',
                  background: 'transparent', color: 'var(--tx)',
                  fontFamily: 'var(--sans)',
                }}
              />
              <button type="submit" style={{
                background: 'var(--primary, #1D4ED8)', color: '#fff',
                border: 'none', padding: '0 24px',
                fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--sans)',
                transition: 'background .15s',
                letterSpacing: '0.01em',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-dark, #0F2D5E)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary, #1D4ED8)')}>
                Buscar →
              </button>
            </div>

            {/* Tipo de búsqueda */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {tipoOpts.map(opt => (
                <button key={opt.key} type="button" onClick={() => setTipoB(opt.key)} style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                  cursor: 'pointer', border: 'none', transition: 'all .13s',
                  background: tipoB === opt.key ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)',
                  color: tipoB === opt.key ? '#fff' : 'rgba(255,255,255,.6)',
                  outline: tipoB === opt.key ? '1px solid rgba(255,255,255,.3)' : 'none',
                }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        <main style={{ flex: 1, padding: '28px 40px', overflowY: 'auto' }}>

          {/* ── STATS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '14px', marginBottom: '28px', alignItems: 'stretch' }}>
            {statCards.map(s => (
              <div key={s.label} style={{
                background: 'var(--bg2)', border: '1.5px solid var(--bdr)',
                borderTop: `3px solid ${s.accent}`,
                borderRadius: 'var(--rl)', padding: '16px 18px',
                boxShadow: 'var(--sh)',
              }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--tx3)', letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '30px', fontWeight: 700, color: 'var(--tx)', lineHeight: 1 }}>
                  {loading ? '—' : s.value.toLocaleString('es-EC')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tx4)', marginTop: '5px' }}>{s.sub}</div>
              </div>
            ))}

            {/* CNMB como KPI card */}
            <Link href="/medicamentos?cnmb=true&estado=autorizado" style={{ background: 'var(--amber-bg)', border: '1.5px solid #FCD34D', borderRadius: 'var(--rl)', padding: '16px 20px', boxShadow: 'var(--sh)', textDecoration: 'none', display: 'block', transition: 'box-shadow var(--t)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shm)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh)'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>CNMB 9ª Ed.</div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', opacity: 0.7 }} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--amber)', lineHeight: 1, letterSpacing: '-1.5px', marginBottom: 6 }}>{stats.cnmb.toLocaleString('es-EC')}</div>
              <div style={{ fontSize: 11, color: '#B45309' }}>medicamentos esenciales</div>
            </Link>

            {/* EML-OMS como KPI card */}
            <Link href="/medicamentos?eml=true&estado=autorizado" style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 'var(--rl)', padding: '16px 20px', boxShadow: 'var(--sh)', textDecoration: 'none', display: 'block', transition: 'box-shadow var(--t)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-lg)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#15803d', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>EML · OMS 2023</div>
                <span style={{ fontSize: 14 }}>🌍</span>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#15803d', lineHeight: 1, letterSpacing: '-1.5px', marginBottom: 6 }}>{stats.eml.toLocaleString('es-EC')}</div>
              <div style={{ fontSize: 11, color: '#166534' }}>medicamentos esenciales OMS</div>
            </Link>

          {/* Acciones rápidas */}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
              <Link href="/medicamentos/nuevo" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', background: 'var(--primary, #1D4ED8)',
                color: '#fff', borderRadius: 'var(--r)',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                transition: 'background .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-dark, #0F2D5E)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary, #1D4ED8)')}>
                <span style={{ fontSize: '14px' }}>＋</span> Nuevo medicamento
              </Link>
              <Link href="/medicamentos" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', background: 'var(--bg2)',
                color: 'var(--tx2)', border: '1.5px solid var(--bdr)',
                borderRadius: 'var(--r)', fontSize: '13px', fontWeight: 500,
                textDecoration: 'none', transition: 'all .15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx2)'; }}>
                <span>⊞</span> Base de datos
              </Link>
              <Link href="/io" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', background: 'var(--bg2)',
                color: 'var(--tx2)', border: '1.5px solid var(--bdr)',
                borderRadius: 'var(--r)', fontSize: '13px', fontWeight: 500,
                textDecoration: 'none', transition: 'all .15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx2)'; }}>
                <span>⬇</span> Importar / Exportar
              </Link>
              {isAdmin && (
                <button
                  onClick={async () => {
                    const token = await getToken();
                    if (!token) return;
                    const res = await fetch('/api/admin/inn-multilang', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                    const d = await res.json();
                    alert(`✅ INN multilingüe: ${d.actualizados} medicamentos actualizados de ${d.total}`);
                  }}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:'var(--r)', border:'1.5px solid #DDD6FE', background:'#F5F3FF', color:'#7C3AED', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all var(--t)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#7C3AED'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#DDD6FE'; }}>
                  <span>🌐</span> Actualizar INN multilingüe
                </button>
                <button
                  onClick={marcarEML}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:'var(--r)', border:'1.5px solid #86efac', background:'#f0fdf4', color:'#15803d', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all var(--t)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#15803d'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#86efac'; }}>
                  <span>🌍</span> Actualizar EML-OMS
                </button>
              )}
            </div>
          </div>

          {/* ── REGISTROS RECIENTES ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--mono)', color: 'var(--tx3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Registros recientes
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--bdr)' }} />
              <Link href="/medicamentos" style={{
                fontSize: '12px', fontWeight: 600,
                padding: '4px 12px', border: '1.5px solid var(--bdr)',
                color: 'var(--tx2)', background: 'var(--bg2)',
                borderRadius: 'var(--r)', textDecoration: 'none',
                transition: 'all .15s',
              }}>
                Ver todos →
              </Link>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
              <table className="med-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {['Nombre comercial', 'Principio activo (DCI)', 'Concentración · FF', 'Laboratorio', 'Estado'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '10px', fontWeight: 700, color: 'var(--tx3)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'var(--mono)', background: 'var(--bg3)', borderBottom: '1.5px solid var(--bdr)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--tx4)' }}>Cargando...</td></tr>
                  ) : recientes.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--tx4)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>💊</div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>No hay medicamentos autorizados aún</div>
                      <div style={{ fontSize: '12px' }}>Revisa y autoriza medicamentos para que aparezcan aquí</div>
                    </td></tr>
                  ) : recientes.map((m, i) => {
                    const badge = estadoBadge(m.estado);
                    return (
                      <tr key={m.docId}
                        onClick={() => router.push(`/medicamentos/${m.docId}`)}
                        style={{ cursor: 'pointer', transition: 'background .1s', background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)'}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--tx)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderTop: '1px solid var(--bdr)' }}>
                          {m.nombre || m.vtm}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--tx2)', borderTop: '1px solid var(--bdr)' }}>
                          {getVtmLabel(m) || <span style={{color:"var(--tx4)",fontStyle:"italic"}}>—</span>}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--tx3)', fontFamily: 'var(--mono)', fontSize: '12px', borderTop: '1px solid var(--bdr)' }}>
                          {m.conc || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--tx3)', fontSize: '12px', borderTop: '1px solid var(--bdr)' }}>
                          {m.laboratorio}
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--bdr)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: badge.bg, color: badge.color, whiteSpace: 'nowrap' }}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
