'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { CHAPS } from '@/lib/capitulos-tree';

interface Med {
  docId: string;
  id: string;
  vtm: string;
  amp: string;
  nombre: string;
  conc: string;
  ff: string;
  laboratorio: string;
  estado: string;
  chapId: string;
  subId?: string;
}

export default function CapituloPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const cap = CHAPS.find(c => c.id === id);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        let all: Med[] = [];
        let cursor: string | null = null;
        while (true) {
          const params = new URLSearchParams({ limit: '500', estado: 'autorizado', capitulo: id as string });
          if (cursor) params.set('cursor', cursor);
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`/api/medicamentos?${params}`, { headers });
          const data = await res.json();
          all = all.concat(data.medicamentos || []);
          cursor = data.nextCursor;
          if (!cursor) break;
        }
        setMeds(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (!cap) return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#aaa' }}>Capítulo no encontrado</p>
      </main>
    </div>
  );

  const subMeds = activeSub ? meds.filter(m => m.subId === activeSub) : meds;
  const activaSubObj = cap.subs.find(s => s.id === activeSub);

  const estadoColor = (e: string) => {
    if (e === 'autorizado') return '#3DDB18';
    if (e === 'suspendido') return '#D97706';
    if (e === 'retirado') return '#DC2626';
    return '#9CA3AF';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />

      {/* ── Columna subcapítulos ── */}
      <div style={{
        width: 240, marginLeft: 280, background: '#fff',
        borderRight: '1.5px solid #D0ECC6', height: '100vh',
        position: 'fixed', left: 0, top: 0, marginTop: 0,
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        paddingTop: 0,
      }}>
        {/* Header capítulo */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1.5px solid #D0ECC6', background: '#f8fdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7aaa6a', fontFamily: 'monospace', letterSpacing: 1 }}>
            Cap. {cap.n}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1a3a1a', marginTop: 2, lineHeight: 1.3 }}>
            {cap.name}
          </div>
        </div>

        {/* Subcapítulos */}
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', padding: '4px 16px 6px' }}>
            SUBCAPÍTULOS
          </div>
          {cap.subs.map(sub => (
            <div key={sub.id}
              onClick={() => setActiveSub(activeSub === sub.id ? null : sub.id)}
              style={{
                padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: activeSub === sub.id ? '#2d6a2d' : '#3a5c30',
                background: activeSub === sub.id ? '#f0fdf4' : 'transparent',
                borderLeft: `3px solid ${activeSub === sub.id ? '#3DDB18' : 'transparent'}`,
                transition: 'all .12s',
              }}
              onMouseEnter={e => { if (activeSub !== sub.id) (e.currentTarget as HTMLElement).style.background = '#f8fdf8'; }}
              onMouseLeave={e => { if (activeSub !== sub.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#7aaa6a', marginRight: 6 }}>
                {cap.n}.{cap.subs.indexOf(sub) + 1}
              </span>
              {sub.name}
            </div>
          ))}
        </div>

        {/* Contador */}
        <div style={{ padding: '8px 16px', borderTop: '1.5px solid #D0ECC6', marginTop: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', fontFamily: 'monospace', letterSpacing: 1 }}>
            {loading ? '...' : meds.length} MEDICAMENTOS
          </div>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, marginLeft: 520, padding: '20px 28px', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#3a5c30', textDecoration: 'none' }}>
            🏠 Inicio
          </Link>
          <span style={{ color: '#aaa', fontSize: 13 }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a3a1a' }}>{cap.name}</span>
          <Link href="/medicamentos/nuevo" style={{ marginLeft: 'auto', padding: '6px 14px', background: '#3DDB18', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            + Nuevo
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7aaa6a', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 4 }}>
            CAPÍTULO {cap.n}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a3a1a', margin: 0, lineHeight: 1.2 }}>
            {cap.name}
          </h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
            {cap.subs.length} subcapítulos · {loading ? '...' : meds.length} medicamentos
          </p>
        </div>

        {/* Si no hay subcapítulo activo — mostrar lista de subcapítulos */}
        {!activeSub && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', marginBottom: 12 }}>
              SELECCIONA UN SUBCAPÍTULO PARA VER SU CONTENIDO CLÍNICO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {cap.subs.map((sub, i) => {
                const subCount = meds.filter(m => m.subId === sub.id).length;
                return (
                  <div key={sub.id}
                    onClick={() => setActiveSub(sub.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 10, cursor: 'pointer', transition: 'all .12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3DDB18'; (e.currentTarget as HTMLElement).style.background = '#f0fdf4'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0ECC6'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                  >
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#7aaa6a', minWidth: 28 }}>
                      {cap.n}.{i + 1}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a1a', flex: 1 }}>{sub.name}</span>
                    {subCount > 0 && (
                      <span style={{ fontSize: 11, color: '#7aaa6a', fontFamily: 'monospace' }}>
                        {subCount} med.
                      </span>
                    )}
                    <span style={{ color: '#aaa', fontSize: 12 }}>›</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Si hay subcapítulo activo — mostrar medicamentos */}
        {activeSub && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setActiveSub(null)}
                style={{ padding: '5px 12px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#3a5c30', cursor: 'pointer' }}>
                ← Subcapítulos
              </button>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2d6a2d', margin: 0 }}>
                {activaSubObj?.name}
              </h2>
              <span style={{ fontSize: 12, color: '#aaa', marginLeft: 4 }}>
                {subMeds.length} medicamento{subMeds.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Cargando...</div>
            ) : subMeds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa', background: '#fff', borderRadius: 12, border: '1.5px solid #D0ECC6' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💊</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Sin medicamentos en este subcapítulo</div>
                <Link href="/medicamentos/nuevo" style={{ display: 'inline-block', marginTop: 12, padding: '7px 16px', background: '#3DDB18', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  + Agregar medicamento
                </Link>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f0fdf4' }}>
                      {['NOMBRE COMERCIAL', 'PRINCIPIO ACTIVO', 'CONCENTRACIÓN', 'FORMA FARM.', 'LABORATORIO', 'ESTADO', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 0.5, fontFamily: 'monospace', borderBottom: '1.5px solid #D0ECC6' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subMeds.map((m, i) => (
                      <tr key={m.docId}
                        onClick={() => router.push(`/medicamentos/${m.docId}`)}
                        style={{ background: i % 2 === 0 ? '#fff' : '#f8fdf8', borderTop: '1px solid #D0ECC6', cursor: 'pointer', transition: 'background .1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#f8fdf8'}
                      >
                        <td style={{ padding: '9px 14px', fontWeight: 600, color: '#1a3a1a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.amp || m.nombre || m.vtm}
                        </td>
                        <td style={{ padding: '9px 14px', color: '#3a5c30' }}>{m.vtm}</td>
                        <td style={{ padding: '9px 14px', color: '#555', fontFamily: 'monospace', fontSize: 12 }}>{m.conc}</td>
                        <td style={{ padding: '9px 14px', color: '#555', fontSize: 12 }}>{m.ff}</td>
                        <td style={{ padding: '9px 14px', color: '#888', fontSize: 12 }}>{m.laboratorio}</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: estadoColor(m.estado), display: 'inline-block' }} />
                            {m.estado}
                          </span>
                        </td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: 12, color: '#7aaa6a', fontWeight: 600 }}>Ver →</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Si no hay subcapítulo activo — mostrar todos los medicamentos del capítulo */}
        {!activeSub && !loading && meds.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', margin: '20px 0 12px' }}>
              TODOS LOS MEDICAMENTOS DEL CAPÍTULO
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f0fdf4' }}>
                    {['NOMBRE COMERCIAL', 'PRINCIPIO ACTIVO', 'CONCENTRACIÓN', 'LABORATORIO', 'ESTADO', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 0.5, fontFamily: 'monospace', borderBottom: '1.5px solid #D0ECC6' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meds.map((m, i) => (
                    <tr key={m.docId}
                      onClick={() => router.push(`/medicamentos/${m.docId}`)}
                      style={{ background: i % 2 === 0 ? '#fff' : '#f8fdf8', borderTop: '1px solid #D0ECC6', cursor: 'pointer', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#f8fdf8'}
                    >
                      <td style={{ padding: '9px 14px', fontWeight: 600, color: '#1a3a1a', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.amp || m.nombre || m.vtm}
                      </td>
                      <td style={{ padding: '9px 14px', color: '#3a5c30' }}>{m.vtm}</td>
                      <td style={{ padding: '9px 14px', color: '#555', fontFamily: 'monospace', fontSize: 12 }}>{m.conc}</td>
                      <td style={{ padding: '9px 14px', color: '#888', fontSize: 12 }}>{m.laboratorio}</td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: estadoColor(m.estado), display: 'inline-block' }} />
                          {m.estado}
                        </span>
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <span style={{ fontSize: 12, color: '#7aaa6a', fontWeight: 600 }}>Ver →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
