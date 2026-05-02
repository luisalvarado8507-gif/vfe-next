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
    const docSnap1 = await adminDb.collection('medicamentos').doc(id).get();
    
    if (docSnap1.exists) {
      return NextResponse.json({
        medicamento: {
          id: docSnap1.id,
          ...docSnap1.data()?.data,
          estado: docSnap1.data()?.estado,
        }
      });
    }

    // Intento 2: buscar por campo data.id
    const snap2 = await adminDb.collection('medicamentos')
      .where('data.id', '==', id)
      .limit(1)
      .get();

    if (!snap2.empty) {
      const d = snap2.docs[0];
      return NextResponse.json({
        medicamento: {
          id: d.id,
          ...d.data()?.data,
          estado: d.data()?.estado,
        }
      });
    }

    // Debug: devolver info de diagnóstico
    const total = await adminDb.collection('medicamentos').limit(3).get();
    const muestra = total.docs.map(d => ({ docId: d.id, dataId: d.data()?.data?.id }));

    return NextResponse.json({ 
      error: 'No encontrado', 
      idBuscado: id,
      muestraFirestore: muestra
    }, { status: 404 });

  } catch(e) {
    console.error('Error GET medicamento:', e);
    return NextResponse.json({ error: 'Error al cargar', detalle: String(e) }, { status: 500 });
  }
}
