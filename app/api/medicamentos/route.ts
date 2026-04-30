import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Medicamento } from '@/types/medicamento';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

async function verificarEditor(req: NextRequest) {
  const decoded = await verificarAuth(req);
  if (!decoded || !decoded.editor) return null;
  return decoded;
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');
    const capitulo = searchParams.get('capitulo');

    let query = adminDb.collection('medicamentos').orderBy('vtm').limit(limit);

    if (cursor) {
      const cursorDoc = await adminDb.collection('medicamentos').doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    const snap = await query.get();
    let medicamentos = snap.docs
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
        hasPrices: sed -n '35,55p' ~/vfe-next/app/api/medicamentos/route.ts(doc.data().data?.farmPrices && Object.values(doc.data().data.farmPrices).some((v: any) => v > 0)),
        amp: doc.data().data?.amp || doc.data().amp || '',
        vmp: doc.data().data?.vmp || doc.data().vmp || '',
        generico: doc.data().data?.generico || '',
        nombre: doc.data().data?.nombre || '',
      }));

    // Filtrar por capítulo si se especifica
    if (capitulo) {
      medicamentos = medicamentos.filter(m => m.chapId === capitulo);
    }

    const lastDoc = snap.docs[snap.docs.length - 1];

    return NextResponse.json({
      medicamentos,
      nextCursor: snap.docs.length === limit ? lastDoc?.id : null,
      total: medicamentos.length,
    });
  } catch(e) {
    console.error('Error GET:', e);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const data: Medicamento = await req.json();
    const id = crypto.randomUUID();

    await adminDb.collection('medicamentos').doc(id).set({
      data, vtm: data.vtm, laboratorio: data.laboratorio,
      estado: 'pendiente',
      createdAt: new Date(), createdBy: user.email,
      updatedAt: new Date(), updatedBy: user.email,
    });

    await adminDb.collection('auditLog').add({
      accion: 'CREATE', medId: id, vtm: data.vtm,
      usuario: user.email, timestamp: new Date(), datosNuevos: data,
    });

    return NextResponse.json({ id, ok: true });
  } catch {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id, ...data }: Medicamento = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const prevDoc = await adminDb.collection('medicamentos').doc(id).get();

    await adminDb.collection('medicamentos').doc(id).update({
      data, vtm: data.vtm, laboratorio: data.laboratorio,
      updatedAt: new Date(), updatedBy: user.email,
    });

    await adminDb.collection('auditLog').add({
      accion: 'UPDATE', medId: id, vtm: data.vtm,
      usuario: user.email, timestamp: new Date(),
      datosPrevios: prevDoc.data()?.data, datosNuevos: data,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id, motivo } = await req.json();
    const prevDoc = await adminDb.collection('medicamentos').doc(id).get();

    await adminDb.collection('medicamentos').doc(id).update({
      estado: 'eliminado', deletedAt: new Date(), deletedBy: user.email,
    });

    await adminDb.collection('auditLog').add({
      accion: 'DELETE', medId: id, vtm: prevDoc.data()?.vtm || '',
      usuario: user.email, timestamp: new Date(),
      datosPrevios: prevDoc.data()?.data, motivo: motivo || 'Sin motivo',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
