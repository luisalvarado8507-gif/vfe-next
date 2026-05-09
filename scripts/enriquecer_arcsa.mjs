/**
 * SIMI — Enriquecimiento masivo desde Excel ARCSA
 * 
 * Uso:
 *   node enriquecer_arcsa.mjs <ruta-al-excel.xls> [--dry-run] [--solo-vacios]
 * 
 * Opciones:
 *   --dry-run      Solo muestra qué se actualizaría, sin escribir en Firebase
 *   --solo-vacios  Solo rellena campos que están vacíos (no sobreescribe) [default: true]
 *   --forzar       Sobreescribe también campos que ya tienen valor
 * 
 * Requiere: node 18+, firebase-admin ya configurado en el proyecto
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const excelPath = args.find(a => !a.startsWith('--'));
const DRY_RUN = args.includes('--dry-run');
const FORZAR = args.includes('--forzar');
const SOLO_VACIOS = !FORZAR; // por defecto solo rellena vacíos

if (!excelPath) {
  console.error('❌ Uso: node enriquecer_arcsa.mjs <ruta-al-excel.xls> [--dry-run] [--forzar]');
  process.exit(1);
}

console.log('━'.repeat(60));
console.log('SIMI — Enriquecimiento masivo desde ARCSA');
console.log('━'.repeat(60));
console.log(`📂 Archivo: ${excelPath}`);
console.log(`🔧 Modo: ${DRY_RUN ? 'DRY RUN (sin escritura)' : 'ESCRITURA REAL'}`);
console.log(`📝 Campos: ${SOLO_VACIOS ? 'Solo vacíos (no sobreescribe)' : 'Todos (sobreescribe existentes)'}`);
console.log('');

// ── Parsear Excel HTML de ARCSA ───────────────────────────────────────────────
function parsearArcsaHtml(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  
  // Parser especial para ARCSA: todas las filas están sin </tr> intermedios
  // Estrategia: extraer todos los <th> y <td> y agrupar cada N_COLS celdas
  const rows = [];
  const headers = [];

  function cleanCell(s) {
    return s.replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ').replace(/[\uFFFD]/g, '')
            .replace(/\s+/g, ' ').trim();
  }

  // Extraer todos los <th>
  let pos = 0;
  while (pos < content.length) {
    const s = content.indexOf('<th>', pos);
    if (s < 0) break;
    const e = content.indexOf('</th>', s + 4);
    if (e < 0) break;
    headers.push(cleanCell(content.slice(s + 4, e)));
    pos = e + 5;
  }

  const N_COLS = headers.length; // 42 columnas

  // Extraer TODOS los <td> en orden
  const allCells = [];
  pos = 0;
  while (pos < content.length) {
    const s = content.indexOf('<td>', pos);
    if (s < 0) break;
    const e = content.indexOf('</td>', s + 4);
    if (e < 0) break;
    allCells.push(cleanCell(content.slice(s + 4, e)));
    pos = e + 5;
  }

  // Agrupar cada N_COLS celdas en una fila
  for (let i = 0; i + N_COLS <= allCells.length; i += N_COLS) {
    const row = {};
    headers.forEach((h, j) => { row[h] = allCells[i + j] || ''; });
    rows.push(row);
  }
  
  return { headers, rows };
}

// ── Normalización para match ──────────────────────────────────────────────────
function norm(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\[.*?\]/g, '') // quitar códigos tipo [UY] [09390]
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Mapeo columnas ARCSA → campos SIMI ────────────────────────────────────────
function mapearFila(row) {
  const limpiar = (s) => (s || '').replace(/\[.*?\]/g, '').replace(/\uFFFD/g, '').trim();
  
  return {
    // Identificadores (clave para el match)
    rs:           limpiar(row.Numero_registro_sanitario),
    cum:          limpiar(row.Cum_codigo_unico_medicamentos),
    // Para el match por nombre
    _nombreExcel: limpiar(row.Nombre_producto),
    _marcaExcel:  limpiar(row.Marca_producto),
    // Campos a enriquecer
    rsTitular:    limpiar(row.Titular_producto),
    rsFecha:      (row.Fecha_emision_registro_sanitario || '').substring(0, 10),
    rsVence:      (row.Fecha_vigencia_registro_sanitario || '').substring(0, 10),
    rsCondicion:  limpiar(row.Forma_venta),
    rsFabricante: limpiar(row.Nombre_fabricante),
    rsPaisFab:    limpiar(row.Pais_fabricante),
    rsImportador: limpiar(row.Nombre_razon_social_solicitante),
    rsTipo:       limpiar(row.Tipo_inscripcion),
  };
}

// ── Firebase Admin ────────────────────────────────────────────────────────────
async function inicializarFirebase() {
  // Cargar .env.local del proyecto vfe-next
  const envPath = path.join(process.env.HOME, 'vfe-next/.env.local');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const eqIdx = line.indexOf('=');
      if (eqIdx < 0) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      // Quitar comillas envolventes si las hay
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Restaurar saltos de línea en private key
      val = val.replace(/\\n/g, '\n');
      if (key) process.env[key] = val;
    }
    console.log('🔑 Credenciales cargadas desde .env.local');
  } catch {
    console.error('❌ No se encontró ~/.env.local');
    process.exit(1);
  }

  let admin;
  try {
    admin = require('firebase-admin');
  } catch {
    console.error('❌ firebase-admin no instalado. Ejecuta: npm install firebase-admin');
    process.exit(1);
  }

  if (admin.apps.length) return admin.firestore();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  return admin.firestore();
}

// ── Cargar todos los medicamentos de Firebase ─────────────────────────────────
async function cargarMedicamentos(db) {
  process.stdout.write('📦 Cargando medicamentos de Firebase');
  const todos = [];
  let lastDoc = null;
  let page = 0;
  
  while (true) {
    let query = db.collection('medicamentos').limit(500);
    if (lastDoc) query = query.startAfter(lastDoc);
    
    const snap = await query.get();
    if (snap.empty) break;
    
    snap.docs.forEach(doc => {
      const d = doc.data();
      const data = d.data || {};
      todos.push({
        docId: doc.id,
        rs:          data.rs || '',
        cum:         data.cum || '',
        nombre:      data.nombre || d.amp || '',
        vtm:         data.vtm || d.vtm || '',
        laboratorio: data.laboratorio || d.laboratorio || '',
        rsTitular:   data.rsTitular || '',
        rsFecha:     data.rsFecha || '',
        rsVence:     data.rsVence || '',
        rsCondicion: data.rsCondicion || '',
        rsFabricante:data.rsFabricante || '',
        rsPaisFab:   data.rsPaisFab || '',
        rsImportador:data.rsImportador || '',
        rsTipo:      data.rsTipo || '',
        // Guardar data completa para el update
        _dataCompleta: data,
        _estadoDoc:    d.estado || 'arcsa_pendiente',
        _version:      d.version || 1,
      });
    });
    
    lastDoc = snap.docs[snap.docs.length - 1];
    page++;
    process.stdout.write('.');
    if (snap.docs.length < 500) break;
  }
  
  console.log(` ${todos.length} medicamentos cargados.`);
  return todos;
}

// ── Match ARCSA → SIMI ────────────────────────────────────────────────────────
function encontrarMatch(filaArcsa, medicamentos) {
  // 1. Match exacto por RS (más confiable)
  if (filaArcsa.rs) {
    const m = medicamentos.find(med => 
      med.rs && norm(med.rs) === norm(filaArcsa.rs)
    );
    if (m) return { med: m, score: 100, metodo: 'RS exacto' };
  }
  
  // 2. Match exacto por CUM
  if (filaArcsa.cum) {
    const m = medicamentos.find(med => 
      med.cum && norm(med.cum) === norm(filaArcsa.cum)
    );
    if (m) return { med: m, score: 98, metodo: 'CUM exacto' };
  }
  
  // 3. Match por nombre de producto
  if (filaArcsa._nombreExcel) {
    const normNombre = norm(filaArcsa._nombreExcel);
    const candidatos = medicamentos.filter(med => {
      const mNombre = norm(med.nombre || med.vtm || '');
      return mNombre.length > 3 && (
        mNombre.includes(normNombre) || normNombre.includes(mNombre) ||
        // Match por marca
        (filaArcsa._marcaExcel && norm(med.nombre).includes(norm(filaArcsa._marcaExcel)))
      );
    });
    
    if (candidatos.length === 1) {
      return { med: candidatos[0], score: 85, metodo: 'Nombre único' };
    }
    if (candidatos.length > 1 && candidatos.length <= 5) {
      // Desambiguar por fabricante
      const porFab = candidatos.find(m => 
        norm(m.laboratorio).includes(norm(filaArcsa.rsFabricante || '')) ||
        norm(filaArcsa.rsFabricante || '').includes(norm(m.laboratorio))
      );
      if (porFab) return { med: porFab, score: 80, metodo: 'Nombre + fabricante' };
      return { med: candidatos[0], score: 60, metodo: `Nombre ambiguo (${candidatos.length} candidatos)` };
    }
  }
  
  return null;
}

// ── Calcular qué campos se actualizan ─────────────────────────────────────────
const CAMPOS = ['rs','cum','rsTitular','rsFecha','rsVence','rsCondicion','rsFabricante','rsPaisFab','rsImportador','rsTipo'];

function calcularCambios(filaArcsa, med) {
  const vacios = [];
  const conflictos = [];
  const sinValorNuevo = [];
  
  for (const campo of CAMPOS) {
    const nuevo = filaArcsa[campo];
    const actual = med[campo];
    
    if (!nuevo) { sinValorNuevo.push(campo); continue; }
    if (!actual || actual === '') { vacios.push(campo); continue; }
    if (norm(actual) !== norm(nuevo)) { conflictos.push(campo); continue; }
    // igual → no hay nada que hacer
  }
  
  return { vacios, conflictos, sinValorNuevo };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Parsear Excel
  console.log('📊 Parseando Excel ARCSA...');
  const { rows } = parsearArcsaHtml(excelPath);
  console.log(`   ${rows.length} registros encontrados en el Excel.\n`);
  
  // 2. Inicializar Firebase
  const db = await inicializarFirebase();
  
  // 3. Cargar medicamentos SIMI
  const medicamentos = await cargarMedicamentos(db);
  console.log('');
  
  // 4. Procesar matches
  console.log('🔍 Procesando matches...\n');
  
  const stats = {
    totalExcel: rows.length,
    conMatch: 0,
    sinMatch: 0,
    actualizados: 0,
    sinCambios: 0,
    errores: 0,
    camposRellenados: 0,
  };
  
  const sinMatch = [];
  const conConflicto = [];
  const actualizados = [];
  
  for (let i = 0; i < rows.length; i++) {
    const filaArcsa = mapearFila(rows[i]);
    
    // Progreso cada 500 filas
    if (i % 500 === 0) {
      process.stdout.write(`\r   Procesando ${i + 1}/${rows.length}...`);
    }
    
    const resultado = encontrarMatch(filaArcsa, medicamentos);
    
    if (!resultado) {
      stats.sinMatch++;
      sinMatch.push({ rs: filaArcsa.rs, nombre: filaArcsa._nombreExcel });
      continue;
    }
    
    stats.conMatch++;
    const { med, score, metodo } = resultado;
    const { vacios, conflictos } = calcularCambios(filaArcsa, med);
    
    // Determinar qué campos aplicar
    const camposAplicar = SOLO_VACIOS ? vacios : [...vacios, ...conflictos];
    
    if (camposAplicar.length === 0) {
      stats.sinCambios++;
      continue;
    }
    
    if (conflictos.length > 0 && !FORZAR) {
      conConflicto.push({
        nombre: med.nombre || med.vtm,
        rs: med.rs,
        conflictos: conflictos.map(c => `${c}: "${med[c]}" → "${filaArcsa[c]}"`),
      });
    }
    
    // Aplicar actualización
    if (!DRY_RUN) {
      try {
        const dataActualizada = { ...med._dataCompleta };
        for (const campo of camposAplicar) {
          dataActualizada[campo] = filaArcsa[campo];
        }
        
        await db.collection('medicamentos').doc(med.docId).update({
          data: dataActualizada,
          updatedAt: new Date(),
          updatedBy: 'enriquecimiento-arcsa-script',
          version: (med._version || 1) + 1,
        });
        
        stats.actualizados++;
        stats.camposRellenados += camposAplicar.length;
        actualizados.push({ nombre: med.nombre || med.vtm, campos: camposAplicar, score, metodo });
      } catch (e) {
        stats.errores++;
        console.error(`\n❌ Error actualizando ${med.docId}: ${e.message}`);
      }
    } else {
      // Dry run — solo contar
      stats.actualizados++;
      stats.camposRellenados += camposAplicar.length;
      actualizados.push({ nombre: med.nombre || med.vtm, campos: camposAplicar, score, metodo });
    }
  }
  
  console.log('\r' + ' '.repeat(50));
  
  // ── Reporte final ──────────────────────────────────────────────────────────
  console.log('═'.repeat(60));
  console.log('RESUMEN');
  console.log('═'.repeat(60));
  console.log(`📊 Registros en Excel ARCSA:    ${stats.totalExcel.toLocaleString()}`);
  console.log(`✅ Con match en SIMI:            ${stats.conMatch.toLocaleString()}`);
  console.log(`❌ Sin match:                    ${stats.sinMatch.toLocaleString()}`);
  console.log(`🔄 ${DRY_RUN ? 'Se actualizarían' : 'Actualizados'}:         ${stats.actualizados.toLocaleString()}`);
  console.log(`📝 Campos ${DRY_RUN ? 'a rellenar' : 'rellenados'}:          ${stats.camposRellenados.toLocaleString()}`);
  console.log(`⏭  Sin cambios (ya tenían datos): ${stats.sinCambios.toLocaleString()}`);
  if (stats.errores > 0) console.log(`⚠️  Errores:                     ${stats.errores}`);
  console.log('');
  
  if (conConflicto.length > 0 && !FORZAR) {
    console.log(`⚠️  ${conConflicto.length} medicamentos con conflictos (campos que ya tienen valor diferente):`);
    conConflicto.slice(0, 10).forEach(c => {
      console.log(`   • ${c.nombre} (RS: ${c.rs})`);
      c.conflictos.forEach(f => console.log(`     - ${f}`));
    });
    if (conConflicto.length > 10) console.log(`   ... y ${conConflicto.length - 10} más`);
    console.log(`\n   Para sobreescribir estos campos: añade --forzar\n`);
  }
  
  if (sinMatch.length > 0) {
    console.log(`⚠️  Primeros 10 sin match:`);
    sinMatch.slice(0, 10).forEach(m => console.log(`   • ${m.nombre} (RS: ${m.rs})`));
    if (sinMatch.length > 10) console.log(`   ... y ${sinMatch.length - 10} más`);
    console.log('');
  }
  
  if (DRY_RUN) {
    console.log('ℹ️  Este fue un DRY RUN — ningún dato fue modificado.');
    console.log('   Para aplicar los cambios reales, ejecuta sin --dry-run:');
    console.log(`   node enriquecer_arcsa.mjs "${excelPath}"`);
  } else {
    console.log(`✅ Enriquecimiento completado. ${stats.actualizados} medicamentos actualizados en Firebase.`);
  }
  
  console.log('═'.repeat(60));
}

main().catch(e => {
  console.error('❌ Error fatal:', e);
  process.exit(1);
});
