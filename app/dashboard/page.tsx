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
          fetch('/api/medicamentos?limit=10', { headers: { Authorization: `Bearer ${token}` } }),
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
    if (estado === 'autorizado') return { bg: '#166534', color: '#fff', label: 'Revisado' };
    if (estado === 'arcsa_pendiente') return { bg: '#D97706', color: '#fff', label: 'En revisión' };
    if (estado === 'suspendido') return { bg: '#DC2626', color: '#fff', label: 'Suspendido' };
    return { bg: '#6B7280', color: '#fff', label: 'Pendiente' };
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg, #F5FAF3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-8">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <div style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3, #7BAD6E)', letterSpacing: '2px', marginBottom: '4px' }}>
              VADEMECUM FARMACOTERAPÉUTICO
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--tx, #0F2008)', letterSpacing: '-0.5px', lineHeight: 1 }}>
              El Libro Verde de los Medicamentos <span style={{ color: 'var(--green, #3DDB18)' }}>®</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--tx4, #B0CFA8)', fontFamily: "'DM Mono', monospace", textAlign: 'right', lineHeight: 1.7 }}>
            Ecuador<br />{fecha}
          </div>
        </div>

        {/* BUSCADOR */}
        <form onSubmit={handleBuscar} className="mb-6">
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--bdr, #D0ECC6)', background: 'var(--bg2, #fff)', boxShadow: '0 4px 20px rgba(15,32,8,.10)' }}>
            <div className="flex items-center px-4" style={{ borderRight: '2px solid var(--bdr, #D0ECC6)' }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="var(--tx3, #7BAD6E)" strokeWidth="1.8"/>
                <path d="M11.5 11.5L15 15" stroke="var(--tx3, #7BAD6E)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar medicamento, principio activo, laboratorio, código ATC…"
              className="flex-1 outline-none text-sm px-4 py-3.5"
              style={{ background: 'transparent', color: 'var(--tx, #0F2008)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button type="submit" className="px-6 py-3.5 text-sm font-bold"
              style={{ background: 'var(--green, #3DDB18)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Buscar
            </button>
          </div>
        </form>

        {/* STATS + ACCIONES */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
          {[
            { id: 'med', label: 'MEDICAMENTOS', sub: 'registros totales', value: stats.total, border: 'var(--green)' },
            { id: 'pa', label: 'PRINCIPIOS ACTIVOS', sub: 'DCI distintos', value: stats.principiosActivos, border: 'var(--blue, #2563EB)' },
            { id: 'gen', label: 'GENÉRICOS', sub: 'medicamentos genéricos', value: stats.genericos, border: 'var(--purple, #7C3AED)' },
            { id: 'cnmb', label: 'CNMB', sub: 'medicamentos esenciales', value: stats.cnmb, border: 'var(--amber, #D97706)' },
          ].map(s => (
            <div key={s.id} className="rounded-xl p-5" style={{ background: 'var(--bg2, #fff)', border: `1.5px solid var(--bdr, #D0ECC6)`, borderLeft: `4px solid ${s.border}` }}>
              <div style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3)', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--tx)', lineHeight: 1 }}>
                {loading ? '—' : s.value.toLocaleString('es-EC')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--tx3)', marginTop: '4px' }}>{s.sub}</div>
            </div>
          ))}

          {/* Acciones rápidas */}
          <div className="flex flex-col gap-2">
            <Link href="/medicamentos/nuevo"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ background: 'var(--green)', whiteSpace: 'nowrap' }}>
              ＋ Nuevo medicamento
            </Link>
            <Link href="/medicamentos"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ border: '1.5px solid var(--bdr)', color: 'var(--tx)', background: 'var(--bg2)', whiteSpace: 'nowrap' }}>
              📋 Base de datos
            </Link>
            <Link href="/io"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{ border: '1.5px solid var(--bdr)', color: 'var(--tx)', background: 'var(--bg2)', whiteSpace: 'nowrap' }}>
              ⬇ Importar / Exportar
            </Link>
          </div>
        </div>

        {/* REGISTROS RECIENTES */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3)', letterSpacing: '1px' }}>REGISTROS RECIENTES</div>
            <div className="flex-1 h-px" style={{ background: 'var(--bdr)' }}></div>
            <Link href="/medicamentos" className="text-xs font-semibold px-3 py-1 rounded-lg"
              style={{ border: '1.5px solid var(--bdr)', color: 'var(--tx2)', background: 'var(--bg2)' }}>
              Ver todos →
            </Link>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: '1.5px solid var(--bdr)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg3, #EDF7E8)' }}>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx3)' }}>NOMBRE COMERCIAL</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx3)' }}>PRINCIPIO ACTIVO</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx3)' }}>LABORATORIO</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tx3)' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--tx4)' }}>Cargando...</td></tr>
                ) : recientes.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--tx4)' }}>No hay medicamentos</td></tr>
                ) : recientes.map((m, i) => {
                  const badge = estadoBadge(m.estado);
                  return (
                    <tr key={m.docId}
                      className="cursor-pointer transition-colors"
                      style={{ background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)', borderBottom: '1px solid var(--bdr)' }}
                      onClick={() => router.push(`/medicamentos/${m.docId}`)}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--tx)' }}>
                        {m.nombre || m.vtm}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--tx)' }}>
                        {m.vtm} <small style={{ color: 'var(--tx3)' }}>{m.conc}</small>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--tx3)' }}>{m.laboratorio}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: badge.bg, color: badge.color }}>
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
  );
}
