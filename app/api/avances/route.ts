import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) // Campos de completitud ISO IDMP
    const conRS   = meds.filter(m => m.data?.rs).length;
    const conCUM  = meds.filter(m => m.data?.cum).length;
    const conATC  = meds.filter(m => m.data?.atc).length;
    const conFF   = meds.filter(m => m.data?.ff).length;
    const conVia  = meds.filter(m => m.data?.vias || m.data?.via).length;
    const conConc = meds.filter(m => m.data?.conc).length;
    const conLab  = meds.filter(m => m.data?.laboratorio).length;
    const conFechaRS = meds.filter(m => m.data?.rsFecha).length;

    return NextResponse.json({
      conRS, conCUM, conATC, conFF, conVia, conConc, conLab, conFechaRS,
      cnmbVersion: '9ª Edición',
      cnmbUrl: 'https://www.salud.gob.ec/cuadro-nacional-de-medicamentos-basicos/', error: 'No autorizado' }, { status: 401 });

  try {
    const col = adminDb.collection('medicamentos');

    const [total, genericos, cnmb] = await Promise.all([
      col.where('estado', '==', 'autorizado').count().get(),
      col.where('estado', '==', 'autorizado').where('data.generico', '==', 'Sí').count().get(),
      col.where('estado', '==', 'autorizado').where('data.cnmb', '==', 'Sí').count().get(),
    ]);

    const vtmSnap = await col.where('estado', '==', 'autorizado').select('vtm').get();
    const pas = new Set(vtmSnap.docs.map(d => d.data().vtm).filter(Boolean)).size;

    const capSnap = await col.where('estado', '==', 'autorizado').select('data.chapId').get();
    const porCapitulo: Record<string, number> = {};
    capSnap.docs.forEach(d => {
      const chapId = d.data().data?.chapId || '';
      if (chapId) porCapitulo[chapId] = (porCapitulo[chapId] || 0) + 1;
    });

    const arcsa = await col.where('estado', '==', 'arcsa_pendiente').count().get();

    return NextResponse.json({
      total: total.data().count,
      principiosActivos: pas,
      genericos: genericos.data().count,
      cnmb: cnmb.data().count,
      autorizados: total.data().count,
      arcsa_pendiente: arcsa.data().count,
      porCapitulo,
    });
  } catch(e) {
    console.error('Error avances:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
