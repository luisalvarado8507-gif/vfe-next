import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// Mapa forma farmacéutica → vía de administración
const FF_VIA: Record<string, string> = {
  // Orales sólidos
  'comprimido': 'oral', 'tableta': 'oral', 'cápsula': 'oral',
  'capsula': 'oral', 'gragea': 'oral', 'comprimido recubierto': 'oral',
  'comprimido masticable': 'oral', 'comprimido efervescente': 'oral',
  'comprimido dispersable': 'oral', 'cápsula dura': 'oral',
  'cápsula blanda': 'oral', 'capsula blanda': 'oral',
  'comprimido de liberación prolongada': 'oral',
  'cápsula de liberación prolongada': 'oral',
  'capsula de liberacion prolongada': 'oral',
  'comprimido sublingual': 'sublingual',
  // Orales líquidos
  'jarabe': 'oral', 'solución oral': 'oral', 'suspensión oral': 'oral',
  'suspension oral': 'oral', 'elixir': 'oral', 'solución': 'oral',
  'suspensión': 'oral', 'gotas orales': 'oral', 'polvo para solución oral': 'oral',
  'granulado': 'oral', 'polvo oral': 'oral',
  // Parenterales
  'solución inyectable': 'parenteral', 'inyectable': 'parenteral',
  'polvo para inyección': 'parenteral', 'polvo liofilizado': 'parenteral',
  'concentrado para infusión': 'parenteral', 'solución para infusión': 'parenteral',
  'solución para inyección': 'parenteral', 'ampolla': 'parenteral',
  'vial': 'parenteral', 'frasco ampolla': 'parenteral',
  // Tópicos
  'crema': 'tópica', 'topica': 'tópica', 'ungüento': 'tópica',
  'gel': 'tópica', 'loción': 'tópica', 'pomada': 'tópica',
  'solución tópica': 'tópica', 'espuma': 'tópica', 'parche': 'transdérmica',
  'parche transdérmico': 'transdérmica', 'parche transdermico': 'transdérmica',
  // Oftálmicos
  'colirio': 'oftálmica', 'gotas oftálmicas': 'oftálmica',
  'gotas oticas': 'ótica', 'gotas óticas': 'ótica',
  // Inhalados
  'aerosol': 'inhalatoria', 'inhalador': 'inhalatoria',
  'polvo para inhalación': 'inhalatoria', 'nebulizador': 'inhalatoria',
  'solución para nebulización': 'inhalatoria',
  // Rectales/vaginales
  'supositorio': 'rectal', 'enema': 'rectal',
  'óvulo': 'vaginal', 'ovulo': 'vaginal', 'crema vaginal': 'vaginal',
  // Nasales
  'spray nasal': 'nasal', 'solución nasal': 'nasal', 'gotas nasales': 'nasal',
};

function getVia(ff: string): string | null {
  if (!ff) return null;
  const ffLower = ff.toLowerCase().trim();
  // Búsqueda exacta primero
  if (FF_VIA[ffLower]) return FF_VIA[ffLower];
  // Búsqueda por substring
  for (const [key, via] of Object.entries(FF_VIA)) {
    if (ffLower.includes(key)) return via;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.admin) return NextResponse.json({ error: 'Solo admin' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }); }

  let actualizados = 0, revisados = 0, lastDoc: any = null;
  while (true) {
    let q: any = adminDb.collection('medicamentos')
      .where('estado', '==', 'arcsa_pendiente').limit(500);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      const d = doc.data()?.data || {};
      if (d.vias || d.via) { revisados++; continue; }
      const via = getVia(d.ff || '');
      revisados++;
      if (via) {
        await doc.ref.update({ 'data.via': via });
        actualizados++;
      }
    }
    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < 500) break;
  }
  return NextResponse.json({ ok: true, actualizados, revisados });
}
