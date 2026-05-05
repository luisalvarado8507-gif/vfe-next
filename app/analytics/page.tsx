'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { CHAPS } from '@/lib/capitulos-tree';

interface AnalyticsData {
  total: number;
  autorizados: number;
  genericos: number;
  cnmb: number;
  conPrecio: number;
  precioPromedio: string;
  precioMax: string;
  precioMin: string;
  porEstado: Record<string, number>;
  porATC: [string, number][];
  porFF: [string, number][];
  porLab: [string, number][];
  porCap: [string, number][];
  tendencia: [string, number][];
}

const ESTADO_COLORS: Record<string, string> = {
  autorizado: '#166534',
  arcsa_pendiente: '#92400E',
  en_evaluacion: '#1E40AF',
  suspendido: '#C2410C',
  revocado: '#991B1B',
  retirado: '#475569',
  borrador: '#6B7280',
};

function BarChart({ data, color = 'var(--green)', maxItems = 10 }: { data: [string, number][]; color?: string; maxItems?: number }) {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map(([,v]) => v), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ minWidth: 160, maxWidth: 160, fontSize: 11, color: 'var(--tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</div>
          <div style={{ flex: 1, height: 20, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4, transition: 'width .6s ease', display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
              {(value / max) > 0.3 && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{value}</span>}
            </div>
          </div>
          {(value / max) <= 0.3 && <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx3)', minWidth: 24 }}>{value}</span>}
        </div>
      ))}
    </div>
  );
}

function TrendChart({ data }: { data: [string, number][] }) {
  const max = Math.max(...data.map(([,v]) => v), 1);
  const h = 80;
  const w = 100 / data.length;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: h + 24, paddingBottom: 20, position: 'relative' }}>
      {data.map(([label, value], i) => {
        const barH = max > 0 ? (value / max) * h : 0;
        return (
          <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ fontSize: 9, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>{value > 0 ? value : ''}</div>
            <div style={{ width: '100%', height: barH, background: value > 0 ? 'var(--green)' : 'var(--bdr)', borderRadius: '3px 3px 0 0', transition: 'height .6s ease', minHeight: value > 0 ? 4 : 0 }} />
            <div style={{ fontSize: 8, color: 'var(--tx4)', fontFamily: 'var(--mono)', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: 2, whiteSpace: 'nowrap' }}>
              {label.substring(5)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/analytics', { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        setData(d);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading, user]);

  const card = (title: string, children: React.ReactNode) => (
    <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '16px 20px', boxShadow: 'var(--sh)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>SIMI · ANALÍTICA AVANZADA</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Dashboard analítico</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            Distribución ATC · Formas farmacéuticas · Laboratorios · Tendencias de registro
          </p>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--tx4)' }}>
            <div style={{ width: 24, height: 24, border: '3px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Calculando analítica...
          </div>
        ) : data ? (
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
              {[
                { label: 'Total', value: data.total, color: 'var(--tx)', sub: 'registros' },
                { label: 'Autorizados', value: data.autorizados, color: '#166534', sub: `${((data.autorizados/data.total)*100).toFixed(0)}%` },
                { label: 'Genéricos', value: data.genericos, color: 'var(--blue)', sub: `${((data.genericos/data.total)*100).toFixed(0)}%` },
                { label: 'CNMB', value: data.cnmb, color: 'var(--amber)', sub: 'esenciales' },
                { label: 'Con precio', value: data.conPrecio, color: '#0F766E', sub: 'registros' },
                { label: 'PVP promedio', value: `$${data.precioPromedio}`, color: 'var(--tx)', sub: 'USD' },
                { label: 'PVP rango', value: `$${data.precioMin}–${data.precioMax}`, color: 'var(--tx3)', sub: 'min–max' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: typeof k.value === 'number' ? 22 : 14, fontWeight: 700, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 2 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Estado regulatorio */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              {card('Estado regulatorio', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(data.porEstado).sort((a,b) => b[1]-a[1]).map(([est, n]) => (
                    <div key={est} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, minWidth: 140, textAlign: 'center', background: ESTADO_COLORS[est] ? ESTADO_COLORS[est] + '20' : 'var(--bg3)', color: ESTADO_COLORS[est] || 'var(--tx3)' }}>{est}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(n / data.total) * 100}%`, background: ESTADO_COLORS[est] || 'var(--tx4)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx3)', minWidth: 40, textAlign: 'right' }}>{n}</span>
                    </div>
                  ))}
                </div>
              ))}
              {card('Tendencia de registro (12 meses)', (
                <TrendChart data={data.tendencia} />
              ))}
            </div>

            {/* ATC y FF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {card('Distribución ATC — Grupos terapéuticos', (
                <BarChart data={data.porATC} color='#1D4ED8' />
              ))}
              {card('Formas farmacéuticas', (
                <BarChart data={data.porFF} color='#7C3AED' />
              ))}
            </div>

            {/* Laboratorios */}
            {card('Top 10 laboratorios por número de registros', (
              <BarChart data={data.porLab} color='var(--green)' maxItems={10} />
            ))}

          </div>
        ) : null}
      </main>
    </div>
  );
}
