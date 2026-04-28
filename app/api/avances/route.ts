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
    let allDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

    while (true) {
      let query = adminDb.collection('medicamentos').limit(500);
      if (lastDoc) query = query.startAfter(lastDoc);
      const snap = await query.get();
      allDocs = allDocs.concat(snap.docs);
      if (snap.docs.length < 500) break;
      lastDoc = snap.docs[snap.docs.length - 1];
    }

    const activos = allDocs.filter(d => d.data().estado !== 'eliminado');

    const pas = new Set(activos.map(d => d.data().data?.vtm || d.data().vtm).filter(Boolean)).size;
    const genericos = activos.filter(d => d.data().data?.generico === 'Sí').length;
    const cnmb = activos.filter(d => d.data().data?.cnmb === 'Sí').length;
    const autorizados = activos.filter(d => d.data().estado === 'autorizado').length;
    const arcsa_pendiente = activos.filter(d => d.data().estado === 'arcsa_pendiente').length;

    const porCapitulo: Record<string, number> = {};
    activos.forEach(d => {
      const chapId = d.data().data?.chapId || '';
      if (chapId) porCapitulo[chapId] = (porCapitulo[chapId] || 0) + 1;
    });

    return NextResponse.json({
      total: activos.length,
      principiosActivos: pas,
      genericos,
      cnmb,
      autorizados,
      arcsa_pendiente,
      porCapitulo,
    });
  } catch(e) {
    console.error('Error avances:', e);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
