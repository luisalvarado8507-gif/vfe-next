'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { CHAPS } from '@/lib/capitulos-tree';

interface Stats {
  total: number;
  principiosActivos: number;
  genericos: number;
  cnmb: number;
  autorizados: number;
  arcsa_pendiente: number;
  porCapitulo: Record<string, number>;
  // Campos ISO IDMP
  conRS: number;
  conCUM: number;
  conATC: number;
  conFF: number;
  conVia: number;
  conConc: number;
  conLab: number;
  conFechaRS: number;
  cnmbVersion?: string;
}

interface IDMPDimension {
  iso: string;
  label: string;
  descripcion: string;
  campos: { nombre: string; pct: number; color: string }[];
  scorePct: number;
}

function Semaforo({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#166534' : pct >= 50 ? '#92400E' : '#991B1B';
  const bg    = pct >= 80 ? '#DCFCE7' : pct >= 50 ? '#FEF3C7' : '#FEE2E2';
  const label = pct >= 80 ? 'Conforme' : pct >= 50 ? 'Parcial' : 'Crítico';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, padding: '2px 8px', borderRadius: 20, background: bg }}>{label} · {pct}%</span>
    </div>
  );
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
          conRS: data.conRS ?? 0,
          conCUM: data.conCUM ?? 0,
          conATC: data.conATC ?? 0,
          conFF: data.conFF ?? 0,
          conVia: data.conVia ?? 0,
          conConc: data.conConc ?? 0,
          conLab: data.conLab ?? 0,
          conFechaRS: data.conFechaRS ?? 0,
          cnmbVersion: data.cnmbVersion,
        });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading, user]);

  const pct = (n: number) => stats ? Math.round((n / stats.total) * 100) : 0;
  const color = (p: number) => p >= 80 ? 'var(--green)' : p >= 50 ? 'var(--amber)' : 'var(--red)';

  // Dimensiones ISO IDMP
  const dimensiones: IDMPDimension[] = stats ? [
    {
      iso: 'ISO 11615',
      label: 'Identificación del producto',
      descripcion: 'Nombre, forma farmacéutica, vía de administración, estado regulatorio',
      campos: [
        { nombre: 'Nombre comercial (AMP)', pct: pct(stats.total), color: 'var(--green)' },
        { nombre: 'Forma farmacéutica', pct: pct(stats.conFF), color: color(pct(stats.conFF)) },
        { nombre: 'Vía de administración', pct: pct(stats.conVia), color: color(pct(stats.conVia)) },
        { nombre: 'Estado regulatorio', pct: pct(stats.autorizados + stats.arcsa_pendiente), color: 'var(--green)' },
      ],
      scorePct: Math.round((pct(stats.total) + pct(stats.conFF) + pct(stats.conVia)) / 3),
    },
    {
      iso: 'ISO 11238',
      label: 'Sustancias farmacéuticas',
      descripcion: 'Principio activo (INN/DCI), concentración, unidades de medida',
      campos: [
        { nombre: 'Principio activo (INN/DCI)', pct: pct(stats.principiosActivos * (stats.total / Math.max(stats.principiosActivos, 1))), color: 'var(--green)' },
        { nombre: 'Concentración', pct: pct(stats.conConc), color: color(pct(stats.conConc)) },
        { nombre: 'Laboratorio', pct: pct(stats.conLab), color: color(pct(stats.conLab)) },
      ],
      scorePct: Math.round((pct(stats.conConc) + pct(stats.conLab)) / 2),
    },
    {
      iso: 'ISO 11239',
      label: 'Formas farmacéuticas y vías',
      descripcion: 'Formas farmacéuticas EDQM, vías de administración normalizadas',
      campos: [
        { nombre: 'Forma farmacéutica EDQM', pct: pct(stats.conFF), color: color(pct(stats.conFF)) },
        { nombre: 'Vía administración EDQM', pct: pct(stats.conVia), color: color(pct(stats.conVia)) },
      ],
      scorePct: Math.round((pct(stats.conFF) + pct(stats.conVia)) / 2),
    },
    {
      iso: 'ISO 11615',
      label: 'Registro regulatorio ARCSA',
      descripcion: 'Registro sanitario, CUM, titular, fechas de vigencia',
      campos: [
        { nombre: 'Registro Sanitario ARCSA', pct: pct(stats.conRS), color: color(pct(stats.conRS)) },
        { nombre: 'CUM (Código Único)', pct: pct(stats.conCUM), color: color(pct(stats.conCUM)) },
        { nombre: 'Fecha autorización RS', pct: pct(stats.conFechaRS), color: color(pct(stats.conFechaRS)) },
      ],
      scorePct: Math.round((pct(stats.conRS) + pct(stats.conCUM) + pct(stats.conFechaRS)) / 3),
    },
    {
      iso: 'ATC-WHO',
      label: 'Clasificación terapéutica',
      descripcion: 'Código ATC-WHO de 7 niveles, CNMB Ecuador',
      campos: [
        { nombre: 'Código ATC-WHO', pct: pct(stats.conATC), color: color(pct(stats.conATC)) },
        { nombre: 'CNMB 9ª Edición', pct: pct(stats.cnmb), color: color(pct(stats.cnmb)) },
      ],
      scorePct: Math.round((pct(stats.conATC) + pct(stats.cnmb)) / 2),
    },
  ] : [];

  const scoreGlobal = dimensiones.length > 0
    ? Math.round(dimensiones.reduce((acc, d) => acc + d.scorePct, 0) / dimensiones.length)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>SIMI · CONFORMIDAD ISO IDMP</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Panel de conformidad ISO IDMP</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                ISO 11615 · 11238 · 11239 · ATC-WHO · CNMB Ecuador
              </p>
            </div>
            {stats && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: scoreGlobal >= 80 ? '#60A5FA' : scoreGlobal >= 50 ? '#FCD34D' : '#FCA5A5', lineHeight: 1 }}>{scoreGlobal}%</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>CONFORMIDAD GLOBAL</div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx4)', gap: 10 }}>
            <div style={{ width: 20, height: 20, border: '2px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Calculando conformidad...
          </div>
        ) : stats && (
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {[
                { label: 'Total registros', value: stats.total, color: 'var(--tx)' },
                { label: 'Autorizados', value: stats.autorizados, color: 'var(--green)' },
                { label: 'Principios activos', value: stats.principiosActivos, color: 'var(--blue)' },
                { label: 'CNMB 9ª Ed.', value: stats.cnmb, color: 'var(--amber)' },
                { label: 'Genéricos', value: stats.genericos, color: 'var(--purple)' },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 9, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 1, marginTop: 4 }}>{k.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Dimensiones ISO IDMP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dimensiones.map(dim => (
                <div key={dim.iso + dim.label} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'var(--bg3)', color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{dim.iso}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{dim.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{dim.descripcion}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <Semaforo pct={dim.scorePct} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {dim.campos.map(campo => (
                      <div key={campo.nombre} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ minWidth: 240, fontSize: 12, color: 'var(--tx2)' }}>{campo.nombre}</div>
                        <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${campo.pct}%`, background: campo.color, borderRadius: 4, transition: 'width .6s ease' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: campo.color, minWidth: 40, textAlign: 'right', fontFamily: 'var(--mono)' }}>{campo.pct}%</span>
                        <span style={{ fontSize: 10, color: 'var(--tx4)', minWidth: 60, textAlign: 'right', fontFamily: 'var(--mono)' }}>{Math.round(stats.total * campo.pct / 100)}/{stats.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Distribución por capítulos */}
            <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '16px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 14 }}>
                Distribución por capítulo terapéutico
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CHAPS.map(cap => {
                  const count = stats.porCapitulo[cap.id] || 0;
                  const maxCount = Math.max(...Object.values(stats.porCapitulo));
                  const barPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <Link key={cap.id} href={`/capitulos/${cap.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '4px 0' }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx4)', minWidth: 24 }}>{cap.n}</span>
                      <div style={{ minWidth: 200, fontSize: 12, color: 'var(--tx2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cap.name}</div>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barPct}%`, background: 'var(--green)', borderRadius: 4, transition: 'width .6s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx3)', minWidth: 36, textAlign: 'right', fontFamily: 'var(--mono)' }}>{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
