import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

async function verificarAdmin(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.admin) return null;
    return decoded;
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAdmin(req);
  if (!user) return NextResponse.json({ error: 'No autorizado — se requiere rol admin' }, { status: 401 });

  try {
    const listResult = await adminAuth.listUsers(100);
    const users = await Promise.all(listResult.users.map(async (u) => {
      const claims = u.customClaims || {};
      const role = claims.admin ? 'admin' : claims.editor ? 'editor' : 'viewer';
      return {
        uid: u.uid,
        email: u.email || '',
        displayName: u.displayName || '',
        role,
        lastSignIn: u.metadata.lastSignInTime,
        createdAt: u.metadata.creationTime,
      };
    }));
    return NextResponse.json({ users, total: users.length });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const adminUser = await verificarAdmin(req);
  if (!adminUser) return NextResponse.json({ error: 'No autorizado — se requiere rol admin' }, { status: 401 });

  try {
    const { uid, role } = await req.json();
    if (!uid || !role) return NextResponse.json({ error: 'uid y role son requeridos' }, { status: 400 });
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido. Usa: viewer, editor, admin' }, { status: 400 });
    }

    // Set custom claims based on role
    const claims: Record<string, boolean> = {};
    if (role === 'editor') claims.editor = true;
    if (role === 'admin') { claims.editor = true; claims.admin = true; }
    await adminAuth.setCustomUserClaims(uid, claims);

    // Log in audit
    await adminDb.collection('auditLog').add({
      accion: 'CAMBIO_ROL',
      usuario: adminUser.email,
      targetUid: uid,
      nuevoRol: role,
      timestamp: new Date(),
    });

    return NextResponse.json({ ok: true, uid, role });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
