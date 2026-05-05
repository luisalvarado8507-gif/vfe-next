import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { detectDuplicates, DuplicateCandidate } from '@/lib/ai/duplicates';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    // Cargar todos los medicamentos no eliminados
    let all: DuplicateCandidate[] = [];
    let cursor = null;
    while (true) {
      let query = adminDb.collection('medicamentos')
        .where('estado', '!=', 'eliminado')
        .limit(500) as any;
      if (cursor) query = query.startAfter(cursor);
      const snap = await query.get();
      snap.docs.forEach((doc: any) => {
        const d = doc.data();
        if (d.data?.vtm) {
          all.push({
            docId: doc.id,
            vtm: d.data.vtm || '',
            nombre: d.data.nombre || d.data.amp || '',
            conc: d.data.conc || '',
            ff: d.data.ff || '',
            laboratorio: d.data.laboratorio || '',
            estado: d.estado || '',
            chapId: d.data.chapId || '',
          });
        }
      });
      if (snap.docs.length < 500) break;
      cursor = snap.docs[snap.docs.length - 1];
    }

    const groups = detectDuplicates(all);
    const stats = {
      totalMedicamentos: all.length,
      gruposDuplicados: groups.length,
      medicamentosAfectados: groups.reduce((acc, g) => acc + g.meds.length, 0),
      altaConfianza: groups.filter(g => g.confidence === 'high').length,
      mediaConfianza: groups.filter(g => g.confidence === 'medium').length,
    };

    return NextResponse.json({ groups, stats });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
