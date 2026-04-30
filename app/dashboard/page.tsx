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
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, principiosActivos: 0, genericos: 0, cnmb: 0 });
  const [recientes, setRecientes] = useState<RecentMed[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const { getToken, user, loading: authLoading } = useAuth();
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
          fetch('/api/medicamentos?limit=20', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const statsData = await statsRes.json();
        const recentData = await recentRes.json();
        setStats({
          total: statsData.total ?? 0,
          principiosActivos: statsData.principiosActivos ?? 0,
          genericos: statsData.genericos ?? 0,
          cnmb: statsData.cnmb ?? 0,
        });
        setRecientes((recentData.medicamentos || []).map((m: Record<string, string>) => ({
          docId: m.docId || m.id,
          nombre: m.nombre || m.vtm || '',
          vtm: m.vtm || '',
          conc: m.conc || '',
          laboratorio: m.laboratorio || '',
          estado: m.estado || 'pendiente',
        })));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading, user]);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) router.push(`/medicamentos?q=${encodeURIComponent(busqueda)}`);
  };

  const estadoBadge = (estado: string) => {
    if (estado === 'autorizado') return { bg: '#166534', label: 'Revisado' };
    if (estado === 'arcsa_pendiente') return { bg: '#D97706', label: 'En revisión' };
    if (estado === 'suspendido') return { bg: '#DC2626', label: 'Suspendido' };
    return { bg: '#6B7280', label: 'Pendiente' };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg, #F5FAF3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>

        {/* TOPBAR */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderBottom: '1.5px solid var(--bdr)',
          background: 'var(--bg2)', flexShrink: 0,
        }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', background: 'var(--bg3)',
            border: '1.5px solid var(--bdr)', borderRadius: '8px',
            fontSize: '13px', fontWeight: 600, color: 'var(--tx2)',
            textDecoration: 'none',
          }}>
            🏠 Inicio
          </Link>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--tx)', marginLeft: '4px' }}>Dashboard</span>
          <div style={{ flex: 1 }} />
          <Link href="/medicamentos/nuevo" style={{
            background: 'var(--green)', color: '#fff',
            padding: '7px 16px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 700, textDecoration: 'none',
          }}>
            + Nuevo
          </Link>
        </div>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>

          {/* HEADER */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '22px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3)', letterSpacing: '2px', marginBottom: '4px' }}>
                VADEMECUM FARMACOTERAPÉUTICO
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--tx)', letterSpacing: '-0.5px', lineHeight: 1 }}>
                El Libro Verde de los Medicamentos <span style={{ color: 'var(--green)' }}>®</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--tx4)', fontFamily: "'DM Mono', monospace", textAlign: 'right', lineHeight: 1.7 }}>
              Ecuador<br />{fecha}
            </div>
          </div>

          {/* BUSCADOR */}
          <form onSubmit={handleBuscar} style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex', borderRadius: '12px', overflow: 'hidden',
              border: '1.5px solid var(--bdr)', background: 'var(--bg2)',
              boxShadow: '0 4px 20px rgba(15,32,8,.10)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRight: '2px solid var(--bdr)' }}>
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="var(--tx3)" strokeWidth="1.8"/>
                  <path d="M11.5 11.5L15 15" stroke="var(--tx3)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar medicamento, principio activo, laboratorio, código ATC…"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--tx)', padding: '13px 14px', background: 'transparent', fontFamily: 'inherit' }}
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              <button type="submit" style={{
                padding: '0 22px', background: 'var(--green)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit',
              }}>Buscar</button>
            </div>
          </form>

          {/* STATS + ACCIONES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'MEDICAMENTOS', sub: 'registros totales', value: stats.total, border: 'var(--green)' },
              { label: 'PRINCIPIOS ACTIVOS', sub: 'DCI distintos', value: stats.principiosActivos, border: 'var(--blue, #2563EB)' },
              { label: 'GENÉRICOS', sub: 'medicamentos genéricos', value: stats.genericos, border: 'var(--purple, #7C3AED)' },
              { label: 'CNMB', sub: 'medicamentos esenciales', value: stats.cnmb, border: 'var(--amber, #D97706)' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg2)', border: '1.5px solid var(--bdr)',
                borderLeft: `4px solid ${s.border}`,
                borderRadius: '12px', padding: '18px 20px',
              }}>
                <div style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3)', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tx)', lineHeight: 1 }}>
                  {loading ? '—' : s.value.toLocaleString('es-EC')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>{s.sub}</div>
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/medicamentos/nuevo" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', background: 'var(--green)', color: '#fff',
                borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>＋ Nuevo medicamento</Link>
              <Link href="/medicamentos" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', border: '1.5px solid var(--bdr)',
                color: 'var(--tx)', background: 'var(--bg2)', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
              }}>📋 Base de datos</Link>
              <Link href="/io" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', border: '1.5px solid var(--bdr)',
                color: 'var(--tx)', background: 'var(--bg2)', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
              }}>⬇ Importar / Exportar</Link>
            </div>
          </div>

          {/* REGISTROS RECIENTES */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3)', letterSpacing: '1px' }}>REGISTROS RECIENTES</div>
              <div style={{ flex: 1, height: '1px', background: 'var(--bdr)' }} />
              <Link href="/medicamentos" style={{
                fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                border: '1.5px solid var(--bdr)', color: 'var(--tx2)',
                background: 'var(--bg2)', borderRadius: '8px', textDecoration: 'none',
              }}>Ver todos →</Link>
            </div>

            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--bdr)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {['NOMBRE COMERCIAL', 'PRINCIPIO ACTIVO', 'LABORATORIO', 'ESTADO'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: 'var(--tx3)', letterSpacing: '0.5px', fontFamily: "'DM Mono', monospace" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--tx4)' }}>Cargando...</td></tr>
                  ) : recientes.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--tx4)' }}>No hay medicamentos</td></tr>
                  ) : recientes.map((m, i) => {
                    const badge = estadoBadge(m.estado);
                    return (
                      <tr key={m.docId}
                        onClick={() => router.push(`/medicamentos/${m.docId}`)}
                        style={{ background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)', borderTop: '1px solid var(--bdr)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--gg, rgba(61,219,24,.10))'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)'}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--tx)' }}>
                          {m.nombre || m.vtm}
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--tx)' }}>
                          {m.vtm} <small style={{ color: 'var(--tx3)' }}>{m.conc}</small>
                        </td>
                        <td style={{ padding: '10px 16px', color: 'var(--tx3)', fontSize: '12px' }}>{m.laboratorio}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            fontSize: '12px', fontWeight: 700, padding: '3px 10px',
                            borderRadius: '20px', background: badge.bg, color: '#fff',
                          }}>
                            • {badge.label}
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
