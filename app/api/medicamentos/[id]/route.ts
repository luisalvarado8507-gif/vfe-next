import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Intento 1: buscar por doc ID de Firestore
    let docSnap = await adminDb.collection('medicamentos').doc(id).get();

    // Intento 2: buscar por campo data.id interno
    if (!docSnap.exists) {
      const snap = await adminDb.collection('medicamentos')
        .where('data.id', '==', id)
        .limit(1)
        .get();
      if (!snap.empty) docSnap = snap.docs[0] as any;
    }

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'No encontrado', idBuscado: id }, { status: 404 });
    }

    return NextResponse.json({
      medicamento: {
        id: docSnap.id,
        ...docSnap.data()?.data,
        estado: docSnap.data()?.estado,
      }
    });
  } catch(e) {
    console.error('Error GET medicamento:', e);
    return NextResponse.json({ error: 'Error al cargar', detalle: String(e) }, { status: 500 });
  }
}
