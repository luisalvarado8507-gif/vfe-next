import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verificarAuth } from '@/lib/auth-server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;

    // Intento 1: buscar por doc ID de Firestore
    let doc = await adminDb.collection('medicamentos').doc(id).get();
    
    // Intento 2: si no existe, buscar por campo id interno
    if (!doc.exists) {
      const snap = await adminDb.collection('medicamentos')
        .where('data.id', '==', id)
        .limit(1)
        .get();
      if (!snap.empty) doc = snap.docs[0] as any;
    }

    if (!doc.exists) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    return NextResponse.json({
      medicamento: {
        id: doc.id,
        ...doc.data()?.data,
        estado: doc.data()?.estado,
      }
    });
  } catch(e) {
    console.error('Error GET medicamento:', e);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}
