import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarEditor(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.editor) return null;
    return decoded;
  } catch { return null; }
}

export async function GET() {
  try {
    const snap = await adminDb.collection('vfe_config').doc('chaps').get();
    if (snap.exists) {
      const data = snap.data();
      const chaps = typeof data?.value === 'string' ? JSON.parse(data.value) : data?.value;
      return NextResponse.json({ chaps });
    }
    return NextResponse.json({ chaps: null }); // fallback to static
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await verificarEditor(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { chaps } = await req.json();
    await adminDb.collection('vfe_config').doc('chaps').set({
      value: JSON.stringify(chaps),
      updatedAt: new Date(),
      updatedBy: user.email,
    });
    await adminDb.collection('auditLog').add({
      accion: 'UPDATE_CHAPS',
      usuario: user.email,
      timestamp: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
