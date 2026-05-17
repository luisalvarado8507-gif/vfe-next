import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { normalizarDCI } from '@/lib/dci-normalize';

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
    const [total, genericos, cnmb, eml, arcsa] = await Promise.all([
      col.where('estado', '==', 'autorizado').count().get(),
      col.where('estado', '==', 'autorizado').where('data.generico', '==', 'Sí').count().get(),
      col.where('estado', '==', 'autorizado').where('data.cnmb', '==', 'Sí').count().get(),
      col.where('estado', '==', 'autorizado').where('data.eml', '==', true).count().get(),
      col.where('estado', '==', 'arcsa_pendiente').count().get(),
    ]);
    const vtmSnap = await col.where('estado', '==', 'autorizado').select('vtm', 'data.esCombo', 'data.comboData', 'data.vtm').get();
    const pasSet = new Set<string>();
    vtmSnap.docs.forEach(d => {
      const raw = d.data();
      const data = raw.data || {};
      if (data.esCombo === true && Array.isArray(data.comboData?.pas)) {
        data.comboData.pas.forEach((pa: string) => {
          const norm = normalizarDCI((pa || '').toString());
          if (norm) pasSet.add(norm);
        });
      } else {
        const v = normalizarDCI((data.vtm || raw.vtm || '').toString());
        if (v) pasSet.add(v);
      }
    });
    const pas = pasSet.size;
    const capSnap = await col.where('estado', '==', 'autorizado').select('data.chapId').get();
    const porCapitulo: Record<string, number> = {};
    capSnap.docs.forEach(d => {
      const chapId = d.data().data?.chapId || '';
      if (chapId) porCapitulo[chapId] = (porCapitulo[chapId] || 0) + 1;
    });
    // Campos completitud ISO IDMP
    const medsSnap = await col.where('estado', '==', 'autorizado').select('data').limit(2000).get();
    const meds = medsSnap.docs.map(d => d.data());
    const conRS      = meds.filter(m => m.data?.rs).length;
    const conCUM     = meds.filter(m => m.data?.cum).length;
    const conATC     = meds.filter(m => m.data?.atc).length;
    const conFF      = meds.filter(m => m.data?.ff).length;
    const conVia     = meds.filter(m => m.data?.vias || m.data?.via).length;
    const conConc    = meds.filter(m => m.data?.conc).length;
    const conLab     = meds.filter(m => m.data?.laboratorio).length;
    const conFechaRS = meds.filter(m => m.data?.rsFecha).length;
    // Nuevos campos ISO IDMP agregados
    const conSNOMED  = meds.filter(m => m.data?.snomed_vtm_code).length;
    const conVtmEn   = meds.filter(m => m.data?.vtmEn).length;
    const conGTIN    = meds.filter(m => m.data?.gtin).length;
    const conEML     = meds.filter(m => m.data?.eml).length;
    const conCNMB    = meds.filter(m => m.data?.cnmb === 'Sí').length;
    return NextResponse.json({
      total: total.data().count,
      principiosActivos: pas,
      genericos: genericos.data().count,
      cnmb: cnmb.data().count,
      eml: eml.data().count,
      autorizados: total.data().count,
      arcsa_pendiente: arcsa.data().count,
      porCapitulo,
      conRS, conCUM, conATC, conFF, conVia, conConc, conLab, conFechaRS,
      conSNOMED, conVtmEn, conGTIN, conEML, conCNMB,
      cnmbVersion: '9ª Edición',
      cnmbUrl: 'https://www.salud.gob.ec/cuadro-nacional-de-medicamentos-basicos/',
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
