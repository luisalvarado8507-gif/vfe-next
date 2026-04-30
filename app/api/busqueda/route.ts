import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase().trim() || '';
    const capitulo = searchParams.get('capitulo');
    const estadoFilter = searchParams.get('estado');

    if (estadoFilter && !q && !capitulo) {
      const snap = await adminDb.collection('medicamentos')
        .where('estado', '==', estadoFilter)
        .orderBy('vtm')
        .limit(100)
        .get();
      const medicamentos = snap.docs.map(doc => ({
        docId: doc.id,
        id: doc.data().data?.id || doc.id,
        vtm: doc.data().data?.vtm || doc.data().vtm || '',
        laboratorio: doc.data().data?.laboratorio || doc.data().laboratorio || '',
        ff: doc.data().data?.ff || '',
        conc: doc.data().data?.conc || '',
        estado: doc.data().estado || '',
        chapId: doc.data().data?.chapId || '',
        nombre: doc.data().data?.nombre || doc.data().amp || '',
      }));
      return NextResponse.json({ medicamentos, total: medicamentos.length });
    }

    if (!q && !capitulo) return NextResponse.json({ medicamentos: [], total: 0 });

    const snap = await adminDb.collection('medicamentos').orderBy('vtm').limit(1000).get();
    const medicamentos = snap.docs
      .filter(doc => doc.data().estado !== 'eliminado')
      .map(doc => ({
        docId: doc.id,
        id: doc.data().data?.id || doc.id,
        vtm: doc.data().data?.vtm || doc.data().vtm || '',
        laboratorio: doc.data().data?.laboratorio || doc.data().laboratorio || '',
        ff: doc.data().data?.ff || '',
        conc: doc.data().data?.conc || '',
        estado: doc.data().estado || '',
        chapId: doc.data().data?.chapId || '',
        nombre: doc.data().data?.nombre || doc.data().amp || '',
      }))
      .filter(m => {
        if (estadoFilter && m.estado !== estadoFilter) return false;
        const matchCap = capitulo ? m.chapId === capitulo : true;
        const matchQ = q ? (
          m.vtm.toLowerCase().includes(q) ||
          m.laboratorio.toLowerCase().includes(q) ||
          m.ff.toLowerCase().includes(q) ||
          m.nombre.toLowerCase().includes(q)
        ) : true;
        return matchCap && matchQ;
      });
    return NextResponse.json({ medicamentos, total: medicamentos.length });
  } catch(e) {
    console.error('Error búsqueda:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
