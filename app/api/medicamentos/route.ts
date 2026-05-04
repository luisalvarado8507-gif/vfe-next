import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Medicamento } from '@/types/medicamento';
import type { Query } from 'firebase-admin/firestore';

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

function mapDoc(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  const d = doc.data();
  const data = d.data || {};
  return {
    docId: doc.id,
    id: data.id || doc.id,
    vtm: data.vtm || d.vtm || '',
    nombre: data.nombre || d.amp || '',
    conc: data.conc || '',
    ff: data.ff || '',
    via: data.via || '',
    vias: Array.isArray(data.vias) ? data.vias.join(', ') : (data.via || ''),
    laboratorio: data.laboratorio || d.laboratorio || '',
    rs: data.rs || '',
    cum: data.cum || '',
    units: data.units || '',
    envase: data.envase || '',
    pu: data.pu || '',
    pp: data.pp || '',
    generico: data.generico || '',
    cnmb: data.cnmb || '',
    atc: data.atc || '',
    atclbl: data.atclbl || '',
    chapId: data.chapId || '',
    subId: data.subId || '',
    estado: d.estado || 'pendiente',
    vmp: data.vmp || d.vmp || '',
    vmpp: data.vmpp || '',
    amp: data.amp || d.amp || '',
    ampp: data.ampp || '',
    rango: data.rango || '',
    hasPrices: !!(data.farmPrices && Object.values(data.farmPrices as Record<string, number>).some((v) => v > 0)),
    farmPrices: data.farmPrices || {},
    rsTitular: data.rsTitular || '',
    rsTipo: data.rsTipo || '',
    rsFecha: data.rsFecha || '',
    rsVence: data.rsVence || '',
    rsCondicion: data.rsCondicion || '',
    rsFabricante: data.rsFabricante || '',
    rsPaisFab: data.rsPaisFab || '',
    rsImportador: data.rsImportador || '',
    pmc: data.pmc || '',
    gtin: data.gtin || '',
    phpid: data.phpid || '',
    phpidL1: data.phpidL1 || '',
    phpidL2: data.phpidL2 || '',
    phpidL3: data.phpidL3 || '',
    esCombo: data.esCombo || false,
    comboData: data.comboData || null,
    clinData: data.clinData || {},
    prospectoUrl: data.prospectoUrl || '',
    packagingUrl: data.packagingUrl || '',
  };
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');
    const capitulo = searchParams.get('capitulo');
    const estadoFilter = searchParams.get('estado');

    const col = adminDb.collection('medicamentos');
    let query: Query = estadoFilter
      ? col.where('estado', '==', estadoFilter).orderBy('vtm').limit(limit)
      : col.orderBy('vtm').limit(limit);

    if (cursor) {
      const cursorDoc = await adminDb.collection('medicamentos').doc(cursor).get();
      if (cursorDoc.exists) query = query.startAfter(cursorDoc);
    }

    const snap = await query.get();
    let medicamentos = snap.docs
      .filter((doc) => doc.data().estado !== 'eliminado')
      .map((doc) => mapDoc(doc));

    if (capitulo) {
      medicamentos = medicamentos.filter((m) => m.chapId === capitulo);
    }

    const lastDoc = snap.docs[snap.docs.length - 1];

    return NextResponse.json({
      medicamentos,
      nextCursor: snap.docs.length === limit ? lastDoc?.id : null,
      total: medicamentos.length,
    });
  } catch (e) {
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
      estado: data.estado || 'arcsa_pendiente',
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
