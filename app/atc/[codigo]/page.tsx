'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { findAtcNode } from '@/lib/atc-tree';
import Sidebar from '@/components/layout/Sidebar';

interface Med {
  id: string;
  nombre: string;
  vtm?: string;
  laboratorio?: string;
  formaFarmaceutica?: string;
  concentracion?: string;
  estado?: string;
  atc?: string | string[];
}

export default function AtcPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const node = findAtcNode(codigo);
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!codigo) return;
    setLoading(true);
    fetch(`/api/atc?code=${encodeURIComponent(codigo)}`)
      .then(r => r.json())
      .then(data => {
        setMeds(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [codigo]);

  const levelColors: Record<number, string> = {
    1: '#F59E0B', 2: '#10B981', 3: '#3B82F6', 4: '#8B5CF6', 5: '#EC4899',
  };
  const color = levelColors[node?.level || 5] || '#60A5FA';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ marginLeft: 260, flex: 1, padding: '32px 40px', maxWidth: 1100 }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/medicamentos" style={{ color: 'var(--tx4)', textDecoration: 'none' }}>Base de datos</Link>
          <span>›</span>
          <span>Clasificación ATC</span>
          <span>›</span>
          <span style={{ color: color, fontWeight: 700 }}>{codigo}</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
          <div style={{ padding: '6px 12px', borderRadius: 8, background: color + '18', border: '1.5px solid ' + color + '40', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: color, fontFamily: 'var(--mono)', letterSpacing: 1 }}>
              ATC {['I','II','III','IV','V'][( node?.level || 1) - 1]}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: color, fontFamily: 'var(--mono)', letterSpacing: 2, lineHeight: 1.2 }}>
              {codigo}
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--tx)', margin: 0, lineHeight: 1.2 }}>
              {node?.label || codigo}
            </h1>
            <div style={{ fontSize: 12, color: 'var(--tx4)', marginTop: 4 }}>
              {loading ? 'Buscando...' : `${meds.length} medicamento${meds.length !== 1 ? 's' : ''} clasificados`}
            </div>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--tx4)', fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⟳</div>
            Consultando base de datos...
          </div>
        ) : meds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg2)', borderRadius: 12, color: 'var(--tx4)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sin medicamentos clasificados</div>
            <div style={{ fontSize: 12 }}>No hay registros con código ATC <code style={{ fontFamily: 'var(--mono)' }}>{codigo}</code> en la base de datos.</div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1.5px solid var(--bdr)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg3)' }}>
                  {['Medicamento', 'Principio activo', 'Forma farmacéutica', 'Concentración', 'Laboratorio', 'Estado', 'ATC'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1px solid var(--bdr)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meds.map((med, i) => (
                  <tr key={med.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bdr)', background: i % 2 === 0 ? '#fff' : '#FAFBFF' }}>
                    <td style={{ padding: '9px 14px' }}>
                      <Link href={`/medicamentos/${med.id}`} style={{ fontWeight: 600, color: 'var(--green)', textDecoration: 'none', fontSize: 13 }}>
                        {med.nombre}
                      </Link>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--tx2)' }}>{med.vtm || '—'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{med.formaFarmaceutica || '—'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>{med.concentracion || '—'}</td>
                    <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--tx3)' }}>{med.laboratorio || '—'}</td>
                    <td style={{ padding: '9px 14px' }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                        background: med.estado === 'autorizado' ? '#DCFCE7' : '#FEF9C3',
                        color: med.estado === 'autorizado' ? '#166534' : '#713F12',
                        fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {med.estado || 'pendiente'}
                      </span>
                    </td>
                    <td style={{ padding: '9px 14px', fontSize: 10, fontFamily: 'var(--mono)', color: color, fontWeight: 600 }}>
                      {Array.isArray(med.atc) ? med.atc.join(', ') : med.atc || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
