'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

interface DuplicateGroup {
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  meds: { docId: string; vtm: string; nombre: string; conc: string; ff: string; laboratorio: string; estado: string }[];
}

interface Stats {
  totalMedicamentos: number;
  gruposDuplicados: number;
  medicamentosAfectados: number;
  altaConfianza: number;
  mediaConfianza: number;
}

const CONF_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  high:   { bg: '#FEE2E2', color: '#991B1B', label: 'Alta confianza' },
  medium: { bg: '#FEF3C7', color: '#92400E', label: 'Media confianza' },
  low:    { bg: '#F1F5F9', color: '#475569', label: 'Baja confianza' },
};

export default function DuplicadosPage() {
  const { isAdmin, isEditor, getToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState<'all' | 'high' | 'medium'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (authLoading) return;
    if (!isEditor && !isAdmin) { router.push('/dashboard'); return; }
  }, [authLoading, isEditor, isAdmin]);

  const analizar = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/ai/duplicates', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setGroups(data.groups || []);
      setStats(data.stats);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtrados = groups.filter(g => filtro === 'all' || g.confidence === filtro);

  const toggleExpand = (i: number) => {
    setExpanded(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>IA · CALIDAD DE DATOS</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Detección de duplicados</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            Análisis automático de registros duplicados o equivalentes en la base de datos
          </p>
        </div>

        <div style={{ padding: '24px 32px' }}>

          {/* Botón analizar */}
          {!stats && (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>Análisis de duplicados</div>
              <div style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
                Compara todos los medicamentos usando similitud de texto y lógica farmacológica para detectar registros equivalentes.
              </div>
              <button onClick={analizar} disabled={loading} style={{ padding: '12px 28px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'var(--sans)' }}>
                {loading ? 'Analizando...' : '⟳ Analizar base de datos'}
              </button>
            </div>
          )}

          {/* Stats */}
          {stats && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total registros', value: stats.totalMedicamentos, color: 'var(--tx)' },
                  { label: 'Grupos duplicados', value: stats.gruposDuplicados, color: 'var(--red)' },
                  { label: 'Registros afectados', value: stats.medicamentosAfectados, color: 'var(--amber)' },
                  { label: 'Alta confianza', value: stats.altaConfianza, color: '#991B1B' },
                  { label: 'Media confianza', value: stats.mediaConfianza, color: '#92400E' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 4, fontFamily: 'var(--mono)', letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Filtros */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>FILTRAR</span>
                {[['all', 'Todos'], ['high', 'Alta confianza'], ['medium', 'Media confianza']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setFiltro(val as any)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1.5px solid ${filtro === val ? 'var(--green)' : 'var(--bdr)'}`, background: filtro === val ? 'var(--green)' : 'var(--bg2)', color: filtro === val ? '#fff' : 'var(--tx2)', transition: 'all .13s', fontFamily: 'var(--sans)' }}>{lbl}</button>
                ))}
                <button onClick={analizar} style={{ marginLeft: 'auto', padding: '5px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--bdr)', background: 'var(--bg2)', color: 'var(--tx2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                  ⟳ Re-analizar
                </button>
              </div>

              {/* Lista de grupos */}
              {filtrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', color: 'var(--tx4)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
                  <div style={{ fontWeight: 600 }}>No se encontraron duplicados en este filtro</div>
                </div>
              ) : filtrados.map((group, gi) => {
                const cs = CONF_STYLES[group.confidence];
                const isOpen = expanded.has(gi);
                return (
                  <div key={gi} style={{ background: 'var(--bg2)', border: `1.5px solid ${group.confidence === 'high' ? '#FCA5A5' : 'var(--bdr)'}`, borderRadius: 'var(--rl)', marginBottom: 10, overflow: 'hidden' }}>
                    <div onClick={() => toggleExpand(gi)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: group.confidence === 'high' ? '#FFF5F5' : 'var(--bg2)' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cs.bg, color: cs.color, whiteSpace: 'nowrap' }}>
                        {cs.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>
                        {group.meds[0].vtm}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{group.meds.length} registros</span>
                      <span style={{ fontSize: 11, color: 'var(--tx4)' }}>{group.reason}</span>
                      <span style={{ fontSize: 12, color: 'var(--tx4)', transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                    </div>
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--bdr)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: 'var(--bg3)' }}>
                              {['Nombre comercial', 'Concentración', 'Forma farm.', 'Laboratorio', 'Estado', ''].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 0.8, borderBottom: '1px solid var(--bdr)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.meds.map((m, mi) => (
                              <tr key={m.docId} style={{ borderTop: mi === 0 ? 'none' : '1px solid var(--bdr)' }}>
                                <td style={{ padding: '9px 14px', fontWeight: 600, color: 'var(--tx)' }}>{m.nombre || m.vtm}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--tx3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{m.conc}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--tx3)' }}>{m.ff}</td>
                                <td style={{ padding: '9px 14px', color: 'var(--tx3)' }}>{m.laboratorio}</td>
                                <td style={{ padding: '9px 14px' }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: m.estado === 'autorizado' ? 'var(--estado-autorizado-bg)' : 'var(--bg3)', color: m.estado === 'autorizado' ? 'var(--estado-autorizado)' : 'var(--tx3)' }}>{m.estado}</span>
                                </td>
                                <td style={{ padding: '9px 14px' }}>
                                  <Link href={`/medicamentos/${m.docId}`} style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Ver →</Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
