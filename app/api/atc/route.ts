import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code requerido' }, { status: 400 });

  try {
    const [snap1, snap2] = await Promise.all([
      adminDb.collection('medicamentos')
        .where('atc', '>=', code)
        .where('atc', '<=', code + '\uf8ff')
        .get(),
      adminDb.collection('medicamentos')
        .where('data.atc', '>=', code)
        .where('data.atc', '<=', code + '\uf8ff')
        .get(),
    ]);

    const seen = new Set<string>();
    const allDocs = [...snap1.docs, ...snap2.docs].filter(d => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    const results = allDocs.map(d => {
      const raw = d.data();
      const data = raw.data || raw;
      return {
        id: d.id,
        nombre: data.nombre || data.denominacion || d.id,
        vtm: data.vtm || null,
        laboratorio: data.laboratorio || null,
        formaFarmaceutica: data.formaFarmaceutica || data.ff || null,
        concentracion: data.concentracion || data.conc || null,
        estado: raw.estado || data.estado || null,
        atc: data.atc || null,
      };
    });

    results.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return NextResponse.json({ code, count: results.length, results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
