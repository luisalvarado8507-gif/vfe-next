import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

import { normalizarDCI } from '@/lib/dci-normalize';

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
        esCombo: doc.data().data?.esCombo || false,
        comboData: doc.data().data?.comboData || null,
      }));
      return NextResponse.json({ medicamentos, total: medicamentos.length });
    }

    if (!q && !capitulo) return NextResponse.json({ medicamentos: [], total: 0 });

    // Cargar TODOS los medicamentos en páginas de 500 para cubrir los 16.515
    const mapDoc = (doc: any) => ({
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
      esCombo: doc.data().data?.esCombo || false,
      comboData: doc.data().data?.comboData || null,
    });
    const todos: any[] = [];
    if (estadoFilter) {
      // Caso optimizado: solo docs del estado pedido (autorizado ~135, etc.)
      const snap = await adminDb.collection('medicamentos')
        .where('estado', '==', estadoFilter)
        .get();
      snap.docs.forEach((doc: any) => { if (doc.data().estado !== 'eliminado') todos.push(mapDoc(doc)); });
    } else {
      // Caso general: paginar toda la colección
      let lastDoc: any = null;
      while (true) {
        let qq: any = adminDb.collection('medicamentos').orderBy('vtm').limit(500);
        if (lastDoc) qq = qq.startAfter(lastDoc);
        const snap = await qq.get();
        if (snap.empty) break;
        snap.docs.forEach((doc: any) => { if (doc.data().estado !== 'eliminado') todos.push(mapDoc(doc)); });
        lastDoc = snap.docs[snap.docs.length - 1];
        if (snap.docs.length < 500) break;
      }
    }
    const medicamentos = todos.filter(m => {
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
