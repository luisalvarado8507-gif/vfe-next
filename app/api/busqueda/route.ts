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

    if (!q && !capitulo) return NextResponse.json({ medicamentos: [], total: 0 });

    let results: FirebaseFirestore.QueryDocumentSnapshot[] = [];

    if (q) {
      // Búsqueda por prefijo en vtm
      const snapVtm = await adminDb.collection('medicamentos')
        .where('vtm', '>=', q)
        .where('vtm', '<=', q + '\uf8ff')
        .limit(100)
        .get();
      results = [...snapVtm.docs];

      // Búsqueda por prefijo en laboratorio
      const snapLab = await adminDb.collection('medicamentos')
        .where('laboratorio', '>=', q)
        .where('laboratorio', '<=', q + '\uf8ff')
        .limit(50)
        .get();
      
      // Combinar sin duplicados
      const ids = new Set(results.map(d => d.id));
      snapLab.docs.forEach(d => { if (!ids.has(d.id)) results.push(d); });
    } else {
      // Solo filtro por capítulo
      const snap = await adminDb.collection('medicamentos')
        .where('data.chapId', '==', capitulo)
        .limit(200)
        .get();
      results = snap.docs;
    }

    const medicamentos = results
      .filter(doc => doc.data().estado !== 'eliminado')
      .map(doc => ({
        docId: doc.id,
        id: doc.data().data?.id || doc.id,
        vtm: doc.data().data?.vtm || doc.data().vtm || '',
        laboratorio: doc.data().data?.laboratorio || doc.data().laboratorio || '',
        ff: doc.data().data?.ff || '',
        conc: doc.data().data?.conc || '',
        estado: doc.data().estado || 'pendiente',
        chapId: doc.data().data?.chapId || '',
        nombre: doc.data().data?.nombre || doc.data().amp || '',
      }))
      .filter(m => {
        if (capitulo && q) return m.chapId === capitulo;
        return true;
      });

    return NextResponse.json({ medicamentos, total: medicamentos.length });
  } catch(e) {
    console.error('Error búsqueda:', e);
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }
}
