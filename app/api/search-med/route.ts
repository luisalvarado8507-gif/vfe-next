import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) return NextResponse.json([]);

  try {
    const qLo = q.toLowerCase();
    const qUp = qLo.charAt(0).toUpperCase() + qLo.slice(1);

    const [s1, s2] = await Promise.all([
      adminDb.collection('medicamentos').orderBy('amp').startAt(qUp).endAt(qUp + '\uf8ff').limit(8).get(),
      adminDb.collection('medicamentos').orderBy('amp').startAt(qLo).endAt(qLo + '\uf8ff').limit(8).get(),
    ]);

    const seen = new Set<string>();
    const docs = [...s1.docs, ...s2.docs].filter(d => {
      if (seen.has(d.id)) return false;
      seen.add(d.id); return true;
    });

    let results = docs.map(d => {
      const raw = d.data(); const data = raw.data || raw;
      return { id: d.id, nombre: data.nombre || raw.amp || '', vtm: data.vtm || '', rs: data.rs || '', conc: data.conc || '', ff: data.ff || '', via: data.via || '', laboratorio: data.laboratorio || '', estado: raw.estado || data.estado || '' };
    }).filter(m => m.nombre);

    if (results.length === 0) {
      const snap = await adminDb.collection('medicamentos').limit(400).get();
      results = snap.docs.map(d => {
        const raw = d.data(); const data = raw.data || raw;
        return { id: d.id, nombre: data.nombre || raw.amp || '', vtm: data.vtm || '', rs: data.rs || '', conc: data.conc || '', ff: data.ff || '', via: data.via || '', laboratorio: data.laboratorio || '', estado: raw.estado || data.estado || '' };
      }).filter(m => (m.nombre).toLowerCase().includes(qLo)).slice(0, 10);
    }

    return NextResponse.json(results.slice(0, 10));
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
