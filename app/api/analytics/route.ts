import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { analyticsCache } from '@/lib/cache';

async function verificarAuth(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try { return await adminAuth.verifyIdToken(token); } catch { return null; }
}

export async function GET(req: NextRequest) {
  const user = await verificarAuth(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const cacheKey = 'analytics:dashboard';
    const cached = analyticsCache.get(cacheKey);
    if (cached) return NextResponse.json({ ...cached, fromCache: true });

    const snap = await adminDb.collection('medicamentos')
      .where('estado', '!=', 'eliminado').limit(2000).get();

    const meds = snap.docs.map(d => ({
      estado: d.data().estado || '',
      vtm: d.data().data?.vtm || '',
      atc: d.data().data?.atc || '',
      ff: d.data().data?.ff || '',
      laboratorio: d.data().data?.laboratorio || '',
      generico: d.data().data?.generico || '',
      cnmb: d.data().data?.cnmb || '',
      chapId: d.data().data?.chapId || '',
      pp: d.data().data?.pp || '',
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || '',
    }));

    // Distribución por estado
    const porEstado: Record<string, number> = {};
    meds.forEach(m => { porEstado[m.estado] = (porEstado[m.estado] || 0) + 1; });

    // Distribución ATC nivel 1
    const porATC: Record<string, number> = {};
    const ATC_L1: Record<string, string> = {
      A: 'Tracto alimentario', B: 'Sangre', C: 'Cardiovascular',
      D: 'Dermatológicos', G: 'Genitourinario', H: 'Hormonas sistémicas',
      J: 'Antiinfecciosos', L: 'Antineoplásicos', M: 'Musculoesquelético',
      N: 'Sistema nervioso', P: 'Antiparasitarios', R: 'Respiratorio',
      S: 'Órganos sentidos', V: 'Varios',
    };
    meds.forEach(m => {
      if (m.atc) {
        const l1 = m.atc[0].toUpperCase();
        const label = ATC_L1[l1] || l1;
        porATC[label] = (porATC[label] || 0) + 1;
      }
    });

    // Top formas farmacéuticas
    const porFF: Record<string, number> = {};
    meds.forEach(m => {
      if (m.ff) {
        const ff = m.ff.split('(')[0].trim();
        porFF[ff] = (porFF[ff] || 0) + 1;
      }
    });

    // Top laboratorios
    const porLab: Record<string, number> = {};
    meds.forEach(m => {
      if (m.laboratorio) porLab[m.laboratorio] = (porLab[m.laboratorio] || 0) + 1;
    });

    // Top capítulos
    const porCap: Record<string, number> = {};
    meds.forEach(m => { if (m.chapId) porCap[m.chapId] = (porCap[m.chapId] || 0) + 1; });

    // Métricas generales
    const autorizados = meds.filter(m => m.estado === 'autorizado').length;
    const genericos = meds.filter(m => m.generico === 'Sí').length;
    const cnmb = meds.filter(m => m.cnmb === 'Sí').length;
    const conPrecio = meds.filter(m => m.pp && parseFloat(m.pp) > 0).length;
    const precios = meds.filter(m => m.pp && parseFloat(m.pp) > 0).map(m => parseFloat(m.pp));
    const precioPromedio = precios.length > 0 ? (precios.reduce((a,b) => a+b, 0) / precios.length).toFixed(2) : '0';
    const precioMax = precios.length > 0 ? Math.max(...precios).toFixed(2) : '0';
    const precioMin = precios.length > 0 ? Math.min(...precios).toFixed(2) : '0';

    // Tendencia de registro por mes (últimos 12 meses)
    const porMes: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      porMes[key] = 0;
    }
    meds.forEach(m => {
      if (m.createdAt) {
        const key = m.createdAt.substring(0, 7);
        if (porMes[key] !== undefined) porMes[key]++;
      }
    });

    const result = {
      total: meds.length,
      autorizados, genericos, cnmb, conPrecio,
      precioPromedio, precioMax, precioMin,
      porEstado,
      porATC: Object.entries(porATC).sort((a,b) => b[1]-a[1]).slice(0, 10),
      porFF: Object.entries(porFF).sort((a,b) => b[1]-a[1]).slice(0, 8),
      porLab: Object.entries(porLab).sort((a,b) => b[1]-a[1]).slice(0, 10),
      porCap: Object.entries(porCap).sort((a,b) => b[1]-a[1]).slice(0, 18),
      tendencia: Object.entries(porMes),
    };
    analyticsCache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
