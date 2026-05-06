const fs = require('fs');
const os = require('os');
const path = require('path');

const admin = require('firebase-admin');
const sa = JSON.parse(fs.readFileSync(path.join(os.homedir(), 'vfe-next', 'serviceAccount.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const FF_MAP = {
  'comprimido': 'Comprimido', 'comprimidos': 'Comprimido',
  'tableta': 'Comprimido', 'tabletas': 'Comprimido',
  'tablet': 'Comprimido', 'tablets': 'Comprimido',
  'comprimido recubierto': 'Comprimido recubierto',
  'comprimidos recubiertos': 'Comprimido recubierto',
  'tableta recubierta': 'Comprimido recubierto',
  'tabletas recubiertas': 'Comprimido recubierto',
  'comprimido recubierto con pelicula': 'Comprimido recubierto con película',
  'comprimido recubierto con película': 'Comprimido recubierto con película',
  'comprimido con cubierta pelicular': 'Comprimido recubierto con película',
  'tableta recubierta con pelicula': 'Comprimido recubierto con película',
  'comprimido de liberacion prolongada': 'Comprimido de liberación prolongada',
  'comprimido de liberación prolongada': 'Comprimido de liberación prolongada',
  'comprimido masticable': 'Comprimido masticable',
  'comprimido sublingual': 'Comprimido sublingual',
  'comprimido dispersable': 'Comprimido dispersable',
  'tableta dispersable': 'Comprimido dispersable',
  'comprimido efervescente': 'Comprimido efervescente',
  'capsula': 'Cápsula', 'cápsula': 'Cápsula',
  'capsulas': 'Cápsula', 'cápsulas': 'Cápsula',
  'capsula dura': 'Cápsula dura', 'cápsula dura': 'Cápsula dura',
  'capsula blanda': 'Cápsula blanda', 'cápsula blanda': 'Cápsula blanda',
  'jarabe': 'Jarabe',
  'solucion oral': 'Solución oral', 'solución oral': 'Solución oral',
  'suspension oral': 'Suspensión oral', 'suspensión oral': 'Suspensión oral',
  'suspension': 'Suspensión oral',
  'gotas': 'Gotas orales', 'gotas orales': 'Gotas orales',
  'solucion inyectable': 'Solución inyectable',
  'solución inyectable': 'Solución inyectable',
  'suspension inyectable': 'Suspensión inyectable',
  'polvo para solucion inyectable': 'Polvo para solución inyectable',
  'polvo liofilizado': 'Polvo liofilizado para solución inyectable',
  'solucion para infusion': 'Solución para infusión',
  'solución para infusión': 'Solución para infusión',
  'crema': 'Crema', 'ungüento': 'Ungüento', 'unguento': 'Ungüento',
  'gel': 'Gel', 'locion': 'Loción', 'loción': 'Loción',
  'parche': 'Parche transdérmico',
  'parche transdermico': 'Parche transdérmico',
  'parche transdérmico': 'Parche transdérmico',
  'sistema/ parche terapeutico transdermico': 'Parche transdérmico',
  'sistema/parche terapeutico transdermico': 'Parche transdérmico',
  'colirio': 'Colirio',
  'supositorio': 'Supositorio', 'supositorios': 'Supositorio',
  'ovulo': 'Óvulo', 'óvulo': 'Óvulo',
  'polvo para suspension oral': 'Polvo para suspensión oral',
  'granulado': 'Granulado', 'granulos': 'Granulado',
  'aerosol': 'Aerosol',
  'solucion oftalmica': 'Solución oftálmica',
  'solución oftálmica': 'Solución oftálmica',
  'suspension oral': 'Suspensión oral',
};

const VIAS_MAP = {
  'oral': 'oral', 'topica': 'tópica', 'tópica': 'tópica',
  'intravenosa': 'intravenosa', 'intramuscular': 'intramuscular',
  'subcutanea': 'subcutánea', 'subcutánea': 'subcutánea',
  'inhalatoria': 'inhalatoria', 'sublingual': 'sublingual',
  'rectal': 'rectal', 'vaginal': 'vaginal',
  'oftalmica': 'oftálmica', 'oftálmica': 'oftálmica', 'ocular': 'oftálmica',
  'otica': 'ótica', 'ótica': 'ótica',
  'nasal': 'nasal', 'transdermica': 'transdérmica', 'transdérmica': 'transdérmica',
  'parenteral': 'parenteral', 'intratecal': 'intratecal',
  'intravascular(intraarterial/intravenoso)': 'intravenosa',
  'intravascular': 'intravenosa',
};

function fixEncoding(s) {
  return s.replace(/\xed/g, 'í').replace(/\xe9/g, 'é').replace(/\xf3/g, 'ó')
          .replace(/\xe1/g, 'á').replace(/\xfa/g, 'ú').replace(/\xf1/g, 'ñ')
          .replace(/\xfc/g, 'ü').replace(/\xc9/g, 'É').replace(/\xd3/g, 'Ó');
}

function normalizarFF(ff) {
  if (!ff) return '';
  let v = ff.trim();
  v = fixEncoding(v);
  v = v.replace(/\[[\d\s]+\]/g, '').replace(/\(film.coated tablet\)/gi, '')
       .replace(/\(tablet\)/gi, '').replace(/\s+/g, ' ').trim().replace(/\.$/, '').trim();
  const key = v.toLowerCase().trim();
  return FF_MAP[key] || (v.charAt(0).toUpperCase() + v.slice(1).toLowerCase());
}

function normalizarVia(via) {
  if (!via) return '';
  if (Array.isArray(via)) via = via[0] || '';
  let v = String(via).trim();
  v = fixEncoding(v);
  v = v.replace(/\[['"\s]*([a-záéíóúñ]+)['"\s]*\]/gi, '$1')
       .replace(/^\[\s*'([^']+)'\s*\]$/, '$1')
       .replace(/\?/g, '').trim();
  const key = v.toLowerCase().trim();
  return VIAS_MAP[key] || v.toLowerCase().trim();
}

function normalizarLab(lab) {
  if (!lab) return '';
  let v = String(lab).trim().replace(/,$/, '').replace(/\s+/g, ' ').trim();
  v = fixEncoding(v);
  return v.split(' ').map(w =>
    w.length > 3 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toUpperCase()
  ).join(' ');
}

async function main() {
  console.log('Analizando campos FF, Vías y Laboratorios...');
  const snap = await db.collection('medicamentos').get();
  const toUpdate = [];
  let statsFF = 0, statsVia = 0, statsLab = 0;

  snap.docs.forEach(doc => {
    const d = doc.data();
    const data = d.data || {};
    const updates = {};

    const ffOrig = data.ff || '';
    const ffNew = normalizarFF(ffOrig);
    if (ffNew && ffNew !== ffOrig && ffNew.length > 1) { updates['data.ff'] = ffNew; statsFF++; }

    const viaOrig = data.vias || data.via || '';
    const viaNew = normalizarVia(viaOrig);
    if (viaNew && viaNew !== viaOrig && viaNew.length > 1) { updates['data.vias'] = viaNew; statsVia++; }

    const labOrig = data.laboratorio || '';
    const labNew = normalizarLab(labOrig);
    if (labNew && labNew !== labOrig && labNew.length > 2) {
      updates['data.laboratorio'] = labNew;
      updates['laboratorio'] = labNew;
      statsLab++;
    }

    if (Object.keys(updates).length > 0) toUpdate.push({ id: doc.id, updates });
  });

  console.log(`FF a normalizar: ${statsFF}`);
  console.log(`Vías a normalizar: ${statsVia}`);
  console.log(`Labs a normalizar: ${statsLab}`);
  console.log(`Total docs a actualizar: ${toUpdate.length}`);

  if (process.argv.includes('--apply')) {
    console.log('\nAplicando...');
    let n = 0;
    for (let i = 0; i < toUpdate.length; i += 400) {
      const batch = db.batch();
      toUpdate.slice(i, i + 400).forEach(({ id, updates }) => {
        batch.update(db.collection('medicamentos').doc(id), {
          ...updates, updatedAt: new Date(), updatedBy: 'normalize_fields',
        });
        n++;
      });
      await batch.commit();
      process.stdout.write(`\rActualizados: ${n}/${toUpdate.length}`);
    }
    console.log('\n✓ Completado');
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
