'use client';
import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

const CAPITULOS = [
  { id: 'c01', n: '01', name: 'Sistema Cardiovascular' },
  { id: 'c02', n: '02', name: 'Sangre y Coagulación' },
  { id: 'c03', n: '03', name: 'Sistema Gastrointestinal' },
  { id: 'c04', n: '04', name: 'Sistema Respiratorio' },
  { id: 'c05', n: '05', name: 'Dolor y Fiebre' },
  { id: 'c06', n: '06', name: 'Patología Osteoarticular' },
  { id: 'c07', n: '07', name: 'Sistema Hormonal' },
  { id: 'c08', n: '08', name: 'Ginecología y Obstetricia' },
  { id: 'c09', n: '09', name: 'Sistema Urogenital' },
  { id: 'c10', n: '10', name: 'Sistema Nervioso' },
  { id: 'c11', n: '11', name: 'Infecciones' },
  { id: 'c12', n: '12', name: 'Inmunidad' },
  { id: 'c13', n: '13', name: 'Dermatología' },
  { id: 'c14', n: '14', name: 'Oftalmología' },
  { id: 'c15', n: '15', name: 'Otorrinolaringología' },
  { id: 'c16', n: '16', name: 'Anestésicos' },
  { id: 'c17', n: '17', name: 'Antídotos y Quelantes' },
  { id: 'c18', n: '18', name: 'Medicamentos Diversos' },
];

const EXPORT_FIELDS = [
  { key: 'vtm',        label: 'Principio activo (DCI/VTM)', default: true },
  { key: 'nombre',     label: 'Nombre comercial (AMP)',      default: true },
  { key: 'conc',       label: 'Concentración',               default: true },
  { key: 'ff',         label: 'Forma farmacéutica',          default: true },
  { key: 'via',        label: 'Vía de administración',       default: true },
  { key: 'laboratorio',label: 'Laboratorio',                 default: true },
  { key: 'rs',         label: 'Registro sanitario',          default: true },
  { key: 'units',      label: 'Unidades por presentación',   default: true },
  { key: 'envase',     label: 'Tipo de envase',              default: false },
  { key: 'pu',         label: 'Precio unitario (USD)',        default: true },
  { key: 'pp',         label: 'Precio presentación (USD)',   default: true },
  { key: 'generico',   label: 'Genérico (Sí/No)',            default: true },
  { key: 'cnmb',       label: 'CNMB',                        default: true },
  { key: 'atc',        label: 'Código ATC',                  default: true },
  { key: 'atclbl',     label: 'Descripción ATC',             default: false },
  { key: 'vmp',        label: 'VMP',                         default: false },
  { key: 'vmpp',       label: 'VMPP',                        default: false },
  { key: 'amp',        label: 'AMP',                         default: false },
  { key: 'ampp',       label: 'AMPP',                        default: false },
];

const SNOMED_FIELDS = [
  { key: 'snomed_vtm_code',   label: 'SNOMED — Código principio activo' },
  { key: 'snomed_vtm_term',   label: 'SNOMED — Término principio activo' },
  { key: 'snomed_ff_code',    label: 'SNOMED — Código forma farmacéutica' },
  { key: 'snomed_ff_term',    label: 'SNOMED — Término forma farmacéutica' },
  { key: 'snomed_route_code', label: 'SNOMED — Código vía de administración' },
  { key: 'snomed_route_term', label: 'SNOMED — Término vía de administración' },
];

const G = {
  wrap: { minHeight: '100vh', background: '#f4f9f4', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif" } as React.CSSProperties,
  main: { flex: 1, marginLeft: 280, padding: '24px 32px' } as React.CSSProperties,
  topbar: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 } as React.CSSProperties,
  card: { background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 14, padding: '20px 24px', marginBottom: 16 } as React.CSSProperties,
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#2d6a2d', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  cardSub: { fontSize: 12, color: '#888', marginBottom: 16 } as React.CSSProperties,
  btn: { padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'opacity .15s' } as React.CSSProperties,
  btnGreen: { background: '#3DDB18', color: '#fff' } as React.CSSProperties,
  btnOutline: { background: '#fff', color: '#2d6a2d', border: '1.5px solid #3DDB18' } as React.CSSProperties,
  label: { fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1, fontFamily: 'monospace', textTransform: 'uppercase' as const, marginBottom: 6, display: 'block' },
  select: { width: '100%', padding: '9px 12px', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a3a1a', outline: 'none' } as React.CSSProperties,
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 13, background: '#fff', color: '#1a3a1a', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
};

export default function ImportarExportar() {
  const { getToken, isEditor } = useAuth();

  // ── Export state ──────────────────────────────────────────────────────────
  const [exportCap, setExportCap] = useState('');
  const [exportVtm, setExportVtm] = useState('');
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    Object.fromEntries(EXPORT_FIELDS.map(f => [f.key, f.default]))
  );
  const [selectedSnomed, setSelectedSnomed] = useState<Record<string, boolean>>(
    Object.fromEntries(SNOMED_FIELDS.map(f => [f.key, false]))
  );
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'html'>('json');
  const [exportando, setExportando] = useState(false);

  // ── Chapter export state ──────────────────────────────────────────────────
  const [capLibro, setCapLibro] = useState('');
  const [formatoLibro, setFormatoLibro] = useState('html');
  const [exportandoLibro, setExportandoLibro] = useState(false);

  // ── Import state ──────────────────────────────────────────────────────────
  const [importando, setImportando] = useState(false);
  const [drag, setDrag] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [progreso, setProgreso] = useState('');

  // ── Helpers ───────────────────────────────────────────────────────────────
  const allFields = [...Object.keys(selectedFields).filter(k => selectedFields[k]),
                     ...Object.keys(selectedSnomed).filter(k => selectedSnomed[k])];

  const fetchAllMeds = async (token: string) => {
    let all: Record<string, any>[] = [];
    let cursor: string | null = null;
    while (true) {
      const params = new URLSearchParams({ limit: '500' });
      if (cursor) params.set('cursor', cursor);
      const res = await fetch(`/api/medicamentos?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      all = all.concat(data.medicamentos || []);
      cursor = data.nextCursor;
      if (!cursor) break;
    }
    return all;
  };

  const filterMeds = (meds: Record<string, any>[]) => {
    return meds.filter(m => {
      if (exportCap && m.chapId !== exportCap) return false;
      if (exportVtm && !((m.vtm || '').toLowerCase().includes(exportVtm.toLowerCase()))) return false;
      return true;
    });
  };

  // ── Export handlers ───────────────────────────────────────────────────────
  const exportar = async () => {
    setExportando(true);
    setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      const all = await fetchAllMeds(token);
      const filtered = filterMeds(all);
      const fields = EXPORT_FIELDS.filter(f => selectedFields[f.key]).map(f => f.key);

      if (exportFormat === 'json') {
        const data = filtered.map(m => Object.fromEntries(fields.map(k => [k, m[k] ?? ''])));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        download(blob, `vfe_medicamentos_${today()}.json`);
        setMensaje(`✅ Exportados ${filtered.length} registros en JSON`);
      } else if (exportFormat === 'csv') {
        const rows = filtered.map(m => fields.map(k => `"${String(m[k] ?? '').replace(/"/g, '""')}"`).join(','));
        const csv = [fields.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        download(blob, `vfe_medicamentos_${today()}.csv`);
        setMensaje(`✅ Exportados ${filtered.length} registros en CSV`);
      } else {
        // HTML table
        const header = fields.map(k => `<th>${k}</th>`).join('');
        const rowsHtml = filtered.map(m =>
          `<tr>${fields.map(k => `<td>${String(m[k] ?? '')}</td>`).join('')}</tr>`
        ).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VFE Export</title>
<style>body{font-family:Arial,sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ccc;padding:4px 8px}th{background:#2d6a2d;color:#fff}</style></head>
<body><h2>VFE — Libro Verde de los Medicamentos</h2><p>${filtered.length} registros · ${today()}</p>
<table><thead><tr>${header}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        download(blob, `vfe_medicamentos_${today()}.html`);
        setMensaje(`✅ Exportados ${filtered.length} registros en HTML`);
      }
    } catch(e) {
      setMensaje('❌ Error al exportar: ' + String(e));
    } finally {
      setExportando(false);
    }
  };

  const exportarCapitulo = async () => {
    if (!capLibro) { setMensaje('⚠️ Selecciona un capítulo'); return; }
    setExportandoLibro(true);
    setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      const all = await fetchAllMeds(token);
      const cap = CAPITULOS.find(c => c.id === capLibro);
      const meds = all.filter(m => m.chapId === capLibro && m.estado === 'autorizado');
      const html = generarLibroHTML(cap?.name || capLibro, meds);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      download(blob, `vfe_cap${cap?.n || ''}_${cap?.name.replace(/\s+/g, '_') || capLibro}_${today()}.html`);
      setMensaje(`✅ Capítulo exportado: ${meds.length} medicamentos`);
    } catch(e) {
      setMensaje('❌ Error: ' + String(e));
    } finally {
      setExportandoLibro(false);
    }
  };

  // ── Import handler ────────────────────────────────────────────────────────
  const importarArchivo = async (file: File) => {
    if (!isEditor) { setMensaje('❌ Necesitas permisos de editor'); return; }
    setImportando(true);
    setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      const name = file.name.toLowerCase();
      let meds: Record<string, any>[] = [];

      if (name.endsWith('.json')) {
        const text = await file.text();
        meds = JSON.parse(text);
        if (!Array.isArray(meds)) throw new Error('El archivo no es un array JSON válido');
      } else {
        setMensaje('❌ Por ahora solo se admite JSON. Exporta primero desde VFE.');
        setImportando(false);
        return;
      }

      let ok = 0;
      for (let i = 0; i < meds.length; i++) {
        setProgreso(`Importando ${i + 1} de ${meds.length}...`);
        const res = await fetch('/api/medicamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(meds[i]),
        });
        if (res.ok) ok++;
      }
      setMensaje(`✅ Importados ${ok} de ${meds.length} medicamentos`);
    } catch(e) {
      setMensaje('❌ Error: ' + String(e));
    } finally {
      setImportando(false);
      setProgreso('');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importarArchivo(file);
    e.target.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) importarArchivo(file);
  }, [isEditor]);

  // ── Utils ─────────────────────────────────────────────────────────────────
  const today = () => new Date().toISOString().split('T')[0];
  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const totalCampos = Object.values(selectedFields).filter(Boolean).length +
                      Object.values(selectedSnomed).filter(Boolean).length;

  const capNombre = CAPITULOS.find(c => c.id === exportCap)?.name;

  return (
    <div style={G.wrap}>
      <Sidebar />
      <main style={G.main}>

        {/* Topbar */}
        <div style={G.topbar}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:'#fff', border:'1.5px solid #D0ECC6', borderRadius:8, fontSize:12, fontWeight:600, color:'#3a5c30', textDecoration:'none' }}>
            🏠 Inicio
          </Link>
          <span style={{ fontSize:14, fontWeight:700, color:'#1a3a1a' }}>Importar / Exportar</span>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div style={{ marginBottom:16, padding:'10px 16px', borderRadius:8, fontSize:13, fontWeight:600,
            background: mensaje.startsWith('✅') ? '#f0fdf4' : mensaje.startsWith('⚠️') ? '#fffbeb' : '#fef2f2',
            color: mensaje.startsWith('✅') ? '#166534' : mensaje.startsWith('⚠️') ? '#854d0e' : '#991b1b',
            border: `1.5px solid ${mensaje.startsWith('✅') ? '#86efac' : mensaje.startsWith('⚠️') ? '#fcd34d' : '#fca5a5'}`
          }}>
            {mensaje}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>

          {/* ── IMPORTAR ── */}
          <div style={G.card}>
            <div style={G.cardTitle}>📥 Importar datos</div>
            <div style={G.cardSub}>Carga medicamentos desde JSON exportado desde VFE</div>

            {isEditor ? (
              <>
                <label
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={onDrop}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    gap:10, padding:'32px 20px', border:`2px dashed ${drag ? '#3DDB18' : '#D0ECC6'}`,
                    borderRadius:12, cursor:'pointer', background: drag ? '#f0fdf4' : '#fafff9',
                    transition:'all .15s', marginBottom:12
                  }}>
                  <input type="file" accept=".json,.csv,.xlsx,.xls" onChange={onFileChange} style={{ display:'none' }} disabled={importando} />
                  <span style={{ fontSize:32 }}>📂</span>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1a3a1a' }}>
                      {importando ? progreso || 'Importando...' : 'Arrastra un archivo o haz clic para seleccionar'}
                    </div>
                    <div style={{ fontSize:11, color:'#7aaa6a', marginTop:4 }}>
                      Excel (.xlsx · .xls) · CSV · JSON
                    </div>
                  </div>
                </label>
                <p style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Solo archivos JSON exportados desde VFE</p>
              </>
            ) : (
              <div style={{ padding:'16px', background:'#fef2f2', borderRadius:8, fontSize:13, color:'#991b1b' }}>
                Necesitas permisos de editor para importar
              </div>
            )}
          </div>

          {/* ── EXPORTAR BASE DE DATOS ── */}
          <div style={G.card}>
            <div style={G.cardTitle}>📤 Exportar base de datos</div>
            <div style={G.cardSub}>Descarga medicamentos con los campos que necesitas</div>

            {/* Filtros */}
            <div style={{ background:'#f8fdf8', border:'1.5px solid #D0ECC6', borderRadius:10, padding:'14px 16px', marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#7aaa6a', letterSpacing:1, fontFamily:'monospace', marginBottom:10 }}>
                🔍 FILTROS DE EXPORTACIÓN
              </div>
              <div style={{ marginBottom:10 }}>
                <label style={G.label}>Grupo farmacológico (capítulo)</label>
                <select value={exportCap} onChange={e => setExportCap(e.target.value)} style={G.select}>
                  <option value="">— Todos los capítulos —</option>
                  {CAPITULOS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={G.label}>Principio activo (VTM) — opcional</label>
                <input value={exportVtm} onChange={e => setExportVtm(e.target.value)}
                  placeholder="Ej. Omeprazol, Lansoprazol..." style={G.input} />
              </div>
              <div style={{ fontSize:11, color:'#7aaa6a', marginTop:8, fontFamily:'monospace' }}>
                {exportCap || exportVtm
                  ? `Filtro activo — ${capNombre || ''}${exportVtm ? ` · "${exportVtm}"` : ''}`
                  : 'Sin filtro — se exportarán todos los registros'}
              </div>
            </div>

            {/* Campos */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:'#555' }}>Selecciona los campos que quieres incluir:</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setSelectedFields(Object.fromEntries(EXPORT_FIELDS.map(f => [f.key, true])))}
                    style={{ fontSize:11, padding:'2px 8px', border:'1.5px solid #D0ECC6', borderRadius:6, cursor:'pointer', background:'#fff', color:'#2d6a2d', fontWeight:700 }}>
                    ✓ Todos
                  </button>
                  <button onClick={() => setSelectedFields(Object.fromEntries(EXPORT_FIELDS.map(f => [f.key, false])))}
                    style={{ fontSize:11, padding:'2px 8px', border:'1.5px solid #D0ECC6', borderRadius:6, cursor:'pointer', background:'#fff', color:'#666', fontWeight:700 }}>
                    ✗ Ninguno
                  </button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {EXPORT_FIELDS.map(f => (
                  <label key={f.key} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 10px', border:`1.5px solid ${selectedFields[f.key] ? '#3DDB18' : '#D0ECC6'}`, borderRadius:8, cursor:'pointer', background: selectedFields[f.key] ? '#f0fdf4' : '#fff', fontSize:12, fontWeight:500 }}>
                    <input type="checkbox" checked={!!selectedFields[f.key]}
                      onChange={e => setSelectedFields(p => ({ ...p, [f.key]: e.target.checked }))}
                      style={{ accentColor:'#3DDB18' }} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {/* SNOMED fields */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#7c3aed', fontFamily:'monospace', letterSpacing:1 }}>SNOMED CT</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setSelectedSnomed(Object.fromEntries(SNOMED_FIELDS.map(f => [f.key, true])))}
                    style={{ fontSize:11, padding:'2px 8px', border:'1.5px solid #ede9fe', borderRadius:6, cursor:'pointer', background:'#fff', color:'#7c3aed', fontWeight:700 }}>
                    todos
                  </button>
                  <button onClick={() => setSelectedSnomed(Object.fromEntries(SNOMED_FIELDS.map(f => [f.key, false])))}
                    style={{ fontSize:11, padding:'2px 8px', border:'1.5px solid #ede9fe', borderRadius:6, cursor:'pointer', background:'#fff', color:'#999', fontWeight:700 }}>
                    ninguno
                  </button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {SNOMED_FIELDS.map(f => (
                  <label key={f.key} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 10px', border:`1.5px solid ${selectedSnomed[f.key] ? '#c4b5fd' : '#ede9fe'}`, borderRadius:8, cursor:'pointer', background: selectedSnomed[f.key] ? '#f5f3ff' : '#fff', fontSize:12, fontWeight:500, color:'#5b21b6' }}>
                    <input type="checkbox" checked={!!selectedSnomed[f.key]}
                      onChange={e => setSelectedSnomed(p => ({ ...p, [f.key]: e.target.checked }))}
                      style={{ accentColor:'#7c3aed' }} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Formato */}
            <div style={{ marginBottom:14 }}>
              <label style={G.label}>Formato de descarga:</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {(['json', 'csv', 'html'] as const).map(fmt => (
                  <button key={fmt} onClick={() => setExportFormat(fmt)} style={{
                    padding:'12px 8px', borderRadius:10, cursor:'pointer', fontWeight:700,
                    border: `1.5px solid ${exportFormat === fmt ? '#3DDB18' : '#D0ECC6'}`,
                    background: exportFormat === fmt ? '#f0fdf4' : '#fff',
                    color: exportFormat === fmt ? '#166534' : '#555',
                    fontSize:13, textTransform:'uppercase'
                  }}>
                    <div style={{ fontSize:18, marginBottom:2 }}>{fmt === 'json' ? '{ }' : fmt === 'csv' ? '⊞' : '🖨'}</div>
                    {fmt.toUpperCase()}
                    <div style={{ fontSize:10, fontWeight:400, color:'#888', marginTop:2 }}>
                      {fmt === 'json' ? 'Datos estructurados' : fmt === 'csv' ? 'Hoja de cálculo' : 'Tabla imprimible'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize:11, color:'#7aaa6a', fontFamily:'monospace', marginBottom:12 }}>
              {totalCampos} campo{totalCampos !== 1 ? 's' : ''} seleccionado{totalCampos !== 1 ? 's' : ''}
            </div>

            <button onClick={exportar} disabled={exportando || totalCampos === 0}
              style={{ ...G.btn, ...G.btnGreen, width:'100%', opacity: exportando || totalCampos === 0 ? 0.5 : 1 }}>
              {exportando ? 'Exportando...' : `⬇ Exportar ${exportFormat.toUpperCase()}`}
            </button>
          </div>
        </div>

        {/* ── EXPORTAR CAPÍTULO COMO LIBRO ── */}
        <div style={G.card}>
          <div style={G.cardTitle}>📖 Exportar capítulo como libro</div>
          <div style={G.cardSub}>
            Genera un documento editorial con el contenido del capítulo, sus subcapítulos y los medicamentos, al estilo del Libro Verde.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={G.label}>Capítulo a exportar</label>
              <select value={capLibro} onChange={e => setCapLibro(e.target.value)} style={G.select}>
                <option value="">— Selecciona un capítulo —</option>
                {CAPITULOS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={G.label}>Formato</label>
              <select value={formatoLibro} onChange={e => setFormatoLibro(e.target.value)} style={G.select}>
                <option value="html">HTML editable (abrir en Word/LibreOffice)</option>
                <option value="html-print">HTML imprimible (abrir en navegador)</option>
              </select>
            </div>
          </div>
          <button onClick={exportarCapitulo} disabled={exportandoLibro || !capLibro}
            style={{ ...G.btn, ...G.btnGreen, opacity: exportandoLibro || !capLibro ? 0.5 : 1 }}>
            {exportandoLibro ? 'Generando...' : '⬇ Descargar capítulo'}
          </button>
          <p style={{ fontSize:11, color:'#aaa', marginTop:8 }}>
            Tip: para generar PDF, abre el HTML descargado en el navegador y usa Archivo → Imprimir → Guardar como PDF
          </p>
        </div>

      </main>
    </div>
  );
}

// ── Generador HTML de capítulo ────────────────────────────────────────────
function generarLibroHTML(capName: string, meds: Record<string, any>[]) {
  const filas = meds.map(m => `
    <tr>
      <td><strong>${m.amp || m.nombre || m.vtm || '—'}</strong></td>
      <td>${m.vtm || '—'}</td>
      <td>${m.conc || '—'}</td>
      <td>${m.ff || '—'}</td>
      <td>${Array.isArray(m.vias) ? m.vias.join(', ') : m.via || '—'}</td>
      <td>${m.laboratorio || '—'}</td>
      <td>${m.rs || '—'}</td>
      <td>${m.atc || '—'}</td>
      <td>${m.pp ? '$ ' + parseFloat(m.pp).toFixed(2) : '—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>VFE — ${capName}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 40px; color: #1a3a1a; }
  h1 { color: #2d6a2d; font-size: 22px; border-bottom: 3px solid #3DDB18; padding-bottom: 8px; }
  h2 { color: #2d6a2d; font-size: 14px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 10px; }
  th { background: #2d6a2d; color: #fff; padding: 6px 8px; text-align: left; }
  td { border: 1px solid #D0ECC6; padding: 5px 8px; vertical-align: top; }
  tr:nth-child(even) { background: #f0fdf4; }
  .footer { margin-top: 32px; font-size: 10px; color: #888; border-top: 1px solid #ccc; padding-top: 8px; }
</style>
</head>
<body>
<h1>VFE — El Libro Verde de los Medicamentos</h1>
<h2>${capName}</h2>
<p style="color:#666;font-size:11px">${meds.length} medicamentos autorizados · Exportado: ${new Date().toLocaleDateString('es-EC')}</p>
<table>
  <thead>
    <tr>
      <th>Nombre comercial</th>
      <th>Principio activo (DCI)</th>
      <th>Concentración</th>
      <th>Forma farmacéutica</th>
      <th>Vía</th>
      <th>Laboratorio</th>
      <th>Registro sanitario</th>
      <th>ATC</th>
      <th>Precio (PVP)</th>
    </tr>
  </thead>
  <tbody>${filas}</tbody>
</table>
<div class="footer">VFE — El Libro Verde de los Medicamentos · Ecuador · ${new Date().getFullYear()}</div>
</body>
</html>`;
}
