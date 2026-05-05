import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const rl = checkRateLimit(`busqueda:${user.uid}`, RATE_LIMITS.busqueda);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit: máximo 30 búsquedas por minuto.' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase().trim() || '';
    const tipo = searchParams.get('tipo') || 'todo';
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
        atc: doc.data().data?.atc || '',
        rs: doc.data().data?.rs || '',
        cum: doc.data().data?.cum || '',
        generico: doc.data().data?.generico || '',
        cnmb: doc.data().data?.cnmb || '',
      }))
      .filter(m => {
        if (estadoFilter && m.estado !== estadoFilter) return false;
        const matchCap = capitulo ? m.chapId === capitulo : true;
        const matchQ = q ? (
          (tipo === 'todo' || tipo === 'vtm' ? m.vtm.toLowerCase().includes(q) : false) ||
          (tipo === 'todo' ? m.laboratorio.toLowerCase().includes(q) : false) ||
          (tipo === 'todo' ? m.ff.toLowerCase().includes(q) : false) ||
          (tipo === 'todo' || tipo === 'nombre' ? m.nombre.toLowerCase().includes(q) : false) ||
          (tipo === 'todo' || tipo === 'atc' ? (m.atc || '').toLowerCase().includes(q) : false) ||
          (tipo === 'todo' || tipo === 'rs' ? (m.rs || '').toLowerCase().includes(q) : false) ||
          (tipo === 'todo' || tipo === 'rs' ? (m.cum || '').toLowerCase().includes(q) : false)
        ) : true;
        return matchCap && matchQ;
      });
    return NextResponse.json({ medicamentos, total: medicamentos.length });
  } catch(e) {
    console.error('Error búsqueda:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
