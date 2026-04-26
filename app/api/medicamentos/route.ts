import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Medicamento } from '@/types/medicamento';

// Verificar token y claim editor
async function verificarEditor(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.editor) return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET — listar medicamentos con paginación
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');
    const capitulo = searchParams.get('capitulo');

    let query = adminDb.collection('medicamentos')
      .where('estado', '!=', 'eliminado')
      .orderBy('estado')
      .orderBy('vtm')
      .limit(limit);

    if (capitulo) {
      query = adminDb.collection('medicamentos')
        .where('estado', '!=', 'eliminado')
        .where('data.chapId', '==', capitulo)
        .orderBy('estado')
        .orderBy('vtm')
        .limit(limit);
    }

    if (cursor) {
      const cursorDoc = await adminDb.collection('medicamentos').doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    const snap = await query.get();
    const medicamentos = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data().data,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));

    const lastDoc = snap.docs[snap.docs.length - 1];

    return NextResponse.json({
      medicamentos,
      nextCursor: snap.docs.length === limit ? lastDoc?.id : null,
      total: snap.docs.length,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Error al cargar medicamentos' }, { status: 500 });
  }
}

// POST — crear medicamento
export async function POST(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const data: Medicamento = await req.json();
    const id = crypto.randomUUID();

    await adminDb.collection('medicamentos').doc(id).set({
      data,
      vtm: data.vtm,
      laboratorio: data.laboratorio,
      estado: 'pendiente',
      createdAt: new Date(),
      createdBy: user.email,
      updatedAt: new Date(),
      updatedBy: user.email,
    });

    await adminDb.collection('auditLog').add({
      accion: 'CREATE',
      medId: id,
      vtm: data.vtm,
      usuario: user.email,
      timestamp: new Date(),
      datosNuevos: data,
    });

    return NextResponse.json({ id, ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}

// PUT — actualizar medicamento
export async function PUT(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id, ...data }: Medicamento = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const prevDoc = await adminDb.collection('medicamentos').doc(id).get();
    const datosPrevios = prevDoc.data()?.data;

    await adminDb.collection('medicamentos').doc(id).update({
      data,
      vtm: data.vtm,
      laboratorio: data.laboratorio,
      updatedAt: new Date(),
      updatedBy: user.email,
    });

    await adminDb.collection('auditLog').add({
      accion: 'UPDATE',
      medId: id,
      vtm: data.vtm,
      usuario: user.email,
      timestamp: new Date(),
      datosPrevios,
      datosNuevos: data,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// DELETE — borrado lógico
export async function DELETE(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id, motivo } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const prevDoc = await adminDb.collection('medicamentos').doc(id).get();

    await adminDb.collection('medicamentos').doc(id).update({
      estado: 'eliminado',
      deletedAt: new Date(),
      deletedBy: user.email,
    });

    await adminDb.collection('auditLog').add({
      accion: 'DELETE',
      medId: id,
      vtm: prevDoc.data()?.vtm || '',
      usuario: user.email,
      timestamp: new Date(),
      datosPrevios: prevDoc.data()?.data,
      motivo: motivo || 'Sin motivo especificado',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
