import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const col = adminDb.collection('medicamentos');

    // Contar usando aggregation queries (instantáneo)
    const [total, autorizados, arcsa, genericos, cnmb] = await Promise.all([
      col.count().get(),
      col.where('estado', '==', 'autorizado').count().get(),
      col.where('estado', '==', 'arcsa_pendiente').count().get(),
      col.where('data.generico', '==', 'Sí').count().get(),
      col.where('data.cnmb', '==', 'Sí').count().get(),
    ]);

    // Para capítulos — cargar solo los campos necesarios
    const capSnap = await col.select('data.chapId').get();
    const porCapitulo: Record<string, number> = {};
    capSnap.docs.forEach(d => {
      const chapId = d.data().data?.chapId || '';
      if (chapId) porCapitulo[chapId] = (porCapitulo[chapId] || 0) + 1;
    });

    // Principios activos únicos
    const vtmSnap = await col.select('vtm').get();
    const pas = new Set(vtmSnap.docs.map(d => d.data().vtm).filter(Boolean)).size;

    return NextResponse.json({
      total: total.data().count,
      principiosActivos: pas,
      genericos: genericos.data().count,
      cnmb: cnmb.data().count,
      autorizados: autorizados.data().count,
      arcsa_pendiente: arcsa.data().count,
      porCapitulo,
    });
  } catch(e) {
    console.error('Error avances:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
