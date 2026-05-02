'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { CHAPS } from '@/lib/capitulos-tree';

interface Stats {
  total: number;
  principiosActivos: number;
  genericos: number;
  cnmb: number;
  autorizados: number;
  arcsa_pendiente: number;
  porCapitulo: Record<string, number>;
}

export default function Avances() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch('/api/avances', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          principiosActivos: data.principiosActivos ?? 0,
          genericos: data.genericos ?? 0,
          cnmb: data.cnmb ?? 0,
          autorizados: data.autorizados ?? 0,
          arcsa_pendiente: data.arcsa_pendiente ?? 0,
          porCapitulo: data.porCapitulo ?? {},
        });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading, user]);

  if (loading || !stats) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, border: '3px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: 'var(--tx3)', fontSize: 13 }}>Calculando estadísticas...</span>
      </main>
    </div>
  );

  const totalRegistros = stats.total || 1;
  const maxCap = Math.max(...Object.values(stats.porCapitulo), 1);
  const pctAutorizados = Math.min(100, (stats.autorizados / totalRegistros) * 100);
  const pctPendientes = Math.min(100, (stats.arcsa_pendiente / totalRegistros) * 100);

  const statCards = [
    { label: 'Total registros',    value: stats.total,             accent: 'var(--tx)',    sub: 'en base de datos' },
    { label: 'Principios activos', value: stats.principiosActivos,  accent: 'var(--blue)',  sub: 'DCI distintos' },
    { label: 'Genéricos',          value: stats.genericos,          accent: 'var(--purple)', sub: 'medicamentos genéricos' },
    { label: 'CNMB',               value: stats.cnmb,               accent: 'var(--amber)', sub: 'medicamentos esenciales' },
    { label: 'Autorizados',        value: stats.autorizados,        accent: 'var(--green)', sub: 'revisados y publicados' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272 }}>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #1B4332)', padding: '24px 36px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>PANEL DE AVANCES</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Estado de la base de datos</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>
            {stats.autorizados} de {stats.total} medicamentos revisados y autorizados
          </p>
        </div>

        <div style={{ padding: '28px 36px' }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
            {statCards.map(s => (
              <div key={s.label} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderTop: `3px solid ${s.accent}`, borderRadius: 'var(--rl)', padding: '16px 16px', boxShadow: 'var(--sh)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.accent, lineHeight: 1 }}>
                  {s.value.toLocaleString('es-EC')}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx2)', marginTop: 6 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Estado de revisión */}
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '20px 24px', marginBottom: 20, boxShadow: 'var(--sh)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 16 }}>
              Estado de revisión
            </div>

            {/* Barra progreso global */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Progreso total</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
                  {pctAutorizados.toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 12, background: 'var(--bg3)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pctAutorizados}%`, background: 'var(--green)', borderRadius: 6, transition: 'width .6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{stats.autorizados} autorizados</span>
                <span style={{ fontSize: 11, color: 'var(--tx4)' }}>{stats.total} total</span>
              </div>
            </div>

            {/* Filas de estado */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Autorizados',          count: stats.autorizados,     pct: pctAutorizados, color: 'var(--green)',  bg: 'var(--estado-autorizado-bg)',  tx: 'var(--estado-autorizado)' },
                { label: 'ARCSA — No revisado',  count: stats.arcsa_pendiente, pct: pctPendientes,  color: 'var(--amber)',  bg: 'var(--estado-pendiente-bg)',   tx: 'var(--estado-pendiente)' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: 180 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.tx }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, s.pct)}%`, background: s.color, borderRadius: 4, transition: 'width .6s ease' }} />
                  </div>
                  <div style={{ minWidth: 100, textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.tx }}>{s.count.toLocaleString('es-EC')}</span>
                    <span style={{ fontSize: 11, color: 'var(--tx4)', marginLeft: 4 }}>({s.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Por capítulo */}
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '20px 24px', boxShadow: 'var(--sh)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 16 }}>
              Medicamentos autorizados por capítulo terapéutico
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CHAPS.map(cap => {
                const count = stats.porCapitulo[cap.id] ?? 0;
                const pct = maxCap > 0 ? (count / maxCap) * 100 : 0;
                return (
                  <div key={cap.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx4)', minWidth: 22, textAlign: 'right' }}>
                      {cap.n}
                    </span>
                    <Link href={`/capitulos/${cap.id}`} style={{ fontSize: 12, color: 'var(--tx2)', textDecoration: 'none', minWidth: 220, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--tx2)')}>
                      {cap.name}
                    </Link>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: count > 0 ? 'var(--green)' : 'transparent', borderRadius: 3, transition: 'width .6s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: count > 0 ? 700 : 400, color: count > 0 ? 'var(--tx)' : 'var(--tx4)', minWidth: 28, textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
