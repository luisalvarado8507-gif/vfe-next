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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const doc = await adminDb.collection('medicamentos').doc(id).get();
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
