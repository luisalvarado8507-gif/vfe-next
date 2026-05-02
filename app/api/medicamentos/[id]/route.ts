import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;

    // Intento 1: buscar por doc ID de Firestore
    let docSnap = await adminDb.collection('medicamentos').doc(id).get();

    // Intento 2: si no existe, buscar por campo data.id interno
    if (!docSnap.exists) {
      const snap = await adminDb.collection('medicamentos')
        .where('data.id', '==', id)
        .limit(1)
        .get();
      if (!snap.empty) docSnap = snap.docs[0] as any;
    }

    if (!docSnap.exists) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    return NextResponse.json({
      medicamento: {
        id: docSnap.id,
        ...docSnap.data()?.data,
        estado: docSnap.data()?.estado,
      }
    });
  } catch(e) {
    console.error('Error GET medicamento:', e);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}
