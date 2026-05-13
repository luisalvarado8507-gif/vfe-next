import { adminDb } from '@/lib/firebase-admin';
import Link from 'next/link';

export default async function MedicamentosSSR() {
  let meds: any[] = [];
  try {
    const snap = await adminDb.collection('medicamentos')
      .where('estado', '==', 'autorizado')
      .limit(20)
      .get();
    meds = snap.docs.map(d => ({ id: d.id, ...d.data().data }));
  } catch { meds = []; }

  if (!meds.length) return null;

  return (
    <noscript>
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ color: '#0B1F4B', marginBottom: 16 }}>
          Medicamentos autorizados — SIMI Ecuador
        </h2>
        <p style={{ color: '#64748B', marginBottom: 16, fontSize: 14 }}>
          Repositorio Farmacéutico Nacional · {meds.length} medicamentos mostrados · ARCSA Ecuador
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0B1F4B', color: '#fff' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Nombre comercial</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Principio activo (INN)</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Concentración</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>Laboratorio</th>
              <th style={{ padding: '8px 12px', textAlign: 'left' }}>ATC</th>
            </tr>
          </thead>
          <tbody>
            {meds.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? '#F9FAFB' : '#FFFFFF' }}>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #E5E7EB' }}>
                  <Link href={`/medicamentos/${m.id}`} style={{ color: '#1D4ED8', textDecoration: 'none', fontWeight: 600 }}>
                    {m.amp || m.nombre || m.vtm || '—'}
                  </Link>
                </td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #E5E7EB' }}>{m.vtm || '—'}</td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #E5E7EB', fontFamily: 'monospace' }}>{m.conc || '—'}</td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #E5E7EB' }}>{m.laboratorio || '—'}</td>
                <td style={{ padding: '7px 12px', borderBottom: '1px solid #E5E7EB', fontFamily: 'monospace', color: '#0891B2' }}>{m.atc || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 12, fontSize: 12, color: '#94A3B8' }}>
          ISO IDMP · FHIR R4 · WHO-ATC · SNOMED CT · vfe-next.vercel.app
        </p>
      </div>
    </noscript>
  );
}
