'use client';
import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { CHAPS } from '@/lib/capitulos-tree';

const EXPORT_FIELDS = [
  { key: 'vtm',         label: 'Principio activo (DCI/VTM)', default: true },
  { key: 'nombre',      label: 'Nombre comercial (AMP)',      default: true },
  { key: 'conc',        label: 'Concentración',               default: true },
  { key: 'ff',          label: 'Forma farmacéutica',          default: true },
  { key: 'vias',        label: 'Vía de administración',       default: true },
  { key: 'laboratorio', label: 'Laboratorio',                 default: true },
  { key: 'rs',          label: 'Registro sanitario',          default: true },
  { key: 'cum',         label: 'CUM — Código único ARCSA',    default: true },
  { key: 'units',       label: 'Unidades por presentación',   default: true },
  { key: 'envase',      label: 'Tipo de envase',              default: false },
  { key: 'pu',          label: 'Precio unitario (USD)',        default: true },
  { key: 'pp',          label: 'Precio presentación (USD)',   default: true },
  { key: 'generico',    label: 'Genérico (Sí/No)',            default: true },
  { key: 'cnmb',        label: 'CNMB',                        default: true },
  { key: 'atc',         label: 'Código ATC',                  default: true },
  { key: 'atclbl',      label: 'Descripción ATC',             default: false },
  { key: 'vmp',         label: 'VMP',                         default: false },
  { key: 'vmpp',        label: 'VMPP',                        default: false },
  { key: 'amp',         label: 'AMP',                         default: false },
  { key: 'ampp',        label: 'AMPP',                        default: false },
];

const SNOMED_FIELDS = [
  { key: 'snomed_vtm_code',   label: 'SNOMED — Código principio activo' },
  { key: 'snomed_vtm_term',   label: 'SNOMED — Término principio activo' },
  { key: 'snomed_ff_code',    label: 'SNOMED — Código forma farmacéutica' },
  { key: 'snomed_ff_term',    label: 'SNOMED — Término forma farmacéutica' },
  { key: 'snomed_route_code', label: 'SNOMED — Código vía administración' },
  { key: 'snomed_route_term', label: 'SNOMED — Término vía administración' },
];

export default function ImportarExportar() {
  const { getToken, isEditor } = useAuth();

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
  const [capLibro, setCapLibro] = useState('');
  const [exportandoLibro, setExportandoLibro] = useState(false);
  const [importando, setImportando] = useState(false);
  const [drag, setDrag] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [progreso, setProgreso] = useState('');

  const today = () => new Date().toISOString().split('T')[0];
  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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

  const filterMeds = (meds: Record<string, any>[]) => meds.filter(m => {
    if (exportCap && m.chapId !== exportCap) return false;
    if (exportVtm && !((m.vtm || '').toLowerCase().includes(exportVtm.toLowerCase()))) return false;
    return true;
  });

  const exportar = async () => {
    setExportando(true); setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      const all = await fetchAllMeds(token);
      const filtered = filterMeds(all);
      const fields = EXPORT_FIELDS.filter(f => selectedFields[f.key]).map(f => f.key);
      if (exportFormat === 'json') {
        const data = filtered.map(m => Object.fromEntries(fields.map(k => [k, m[k] ?? ''])));
        download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `vfe_medicamentos_${today()}.json`);
      } else if (exportFormat === 'csv') {
        const rows = filtered.map(m => fields.map(k => `"${String(m[k] ?? '').replace(/"/g, '""')}"`).join(','));
        download(new Blob(['\uFEFF' + [fields.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' }), `vfe_medicamentos_${today()}.csv`);
      } else {
        const header = fields.map(k => `<th>${k}</th>`).join('');
        const rowsHtml = filtered.map(m => `<tr>${fields.map(k => `<td>${String(m[k] ?? '')}</td>`).join('')}</tr>`).join('');
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>VFE Export</title>
<style>body{font-family:Arial,sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px}th{background:#1B4332;color:#fff}</style></head>
<body><h2>VFE — El Libro Verde · ${today()}</h2><table><thead><tr>${header}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
        download(new Blob([html], { type: 'text/html;charset=utf-8' }), `vfe_medicamentos_${today()}.html`);
      }
      setMensaje(`✅ Exportados ${filtered.length} registros en ${exportFormat.toUpperCase()}`);
    } catch(e) { setMensaje('❌ Error al exportar: ' + String(e)); }
    finally { setExportando(false); }
  };

  const exportarCapitulo = async () => {
    if (!capLibro) { setMensaje('⚠️ Selecciona un capítulo'); return; }
    setExportandoLibro(true); setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      const all = await fetchAllMeds(token);
      const cap = CHAPS.find(c => c.id === capLibro);
      const meds = all.filter(m => m.chapId === capLibro && m.estado === 'autorizado');
      const filas = meds.map(m => `<tr>
        <td><strong>${m.amp || m.nombre || m.vtm || '—'}</strong></td>
        <td>${m.vtm || '—'}</td><td>${m.conc || '—'}</td><td>${m.ff || '—'}</td>
        <td>${m.vias || m.via || '—'}</td><td>${m.laboratorio || '—'}</td>
        <td>${m.rs || '—'}</td><td>${m.cum || '—'}</td><td>${m.atc || '—'}</td>
        <td>${m.pp ? '$ ' + parseFloat(m.pp).toFixed(2) : '—'}</td></tr>`).join('');
      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>VFE — ${cap?.name}</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:40px;color:#1a3a1a}
h1{color:#1B4332;font-size:22px;border-bottom:3px solid #2D6A4F;padding-bottom:8px}
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:10px}
th{background:#1B4332;color:#fff;padding:6px 8px;text-align:left}
td{border:1px solid #C8E0CC;padding:5px 8px}tr:nth-child(even){background:#EBF5EE}
.footer{margin-top:32px;font-size:10px;color:#888;border-top:1px solid #ccc;padding-top:8px}</style>
</head><body>
<h1>VFE — El Libro Verde de los Medicamentos</h1>
<h2 style="color:#2D6A4F">${cap?.name}</h2>
<p style="color:#666;font-size:11px">${meds.length} medicamentos autorizados · ${today()}</p>
<table><thead><tr><th>Nombre comercial</th><th>Principio activo</th><th>Concentración</th>
<th>Forma farm.</th><th>Vía</th><th>Laboratorio</th><th>RS</th><th>CUM</th><th>ATC</th><th>PVP</th></tr></thead>
<tbody>${filas}</tbody></table>
<div class="footer">VFE · Ecuador · ${new Date().getFullYear()}</div></body></html>`;
      download(new Blob([html], { type: 'text/html;charset=utf-8' }), `vfe_cap${cap?.n}_${(cap?.name || '').replace(/\s+/g, '_')}_${today()}.html`);
      setMensaje(`✅ Capítulo exportado: ${meds.length} medicamentos`);
    } catch(e) { setMensaje('❌ Error: ' + String(e)); }
    finally { setExportandoLibro(false); }
  };

  const importarArchivo = async (file: File) => {
    if (!isEditor) { setMensaje('❌ Necesitas permisos de editor'); return; }
    setImportando(true); setMensaje('');
    try {
      const token = await getToken();
      if (!token) return;
      if (!file.name.toLowerCase().endsWith('.json')) {
        setMensaje('❌ Por ahora solo se admite JSON. Exporta primero desde VFE.');
        return;
      }
      const meds = JSON.parse(await file.text());
      if (!Array.isArray(meds)) throw new Error('El archivo no es un array JSON válido');
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
    } catch(e) { setMensaje('❌ Error: ' + String(e)); }
    finally { setImportando(false); setProgreso(''); }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importarArchivo(file);
    e.target.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) importarArchivo(file);
  }, [isEditor]);

  const totalCampos = Object.values(selectedFields).filter(Boolean).length + Object.values(selectedSnomed).filter(Boolean).length;
  const capNombre = CHAPS.find(c => c.id === exportCap)?.name;

  // ── Estilos ──────────────────────────────────────────────────────────────
  const card: React.CSSProperties = { background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '20px 24px', marginBottom: 16, boxShadow: 'var(--sh)' };
  const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 };
  const cardSub: React.CSSProperties = { fontSize: 12, color: 'var(--tx3)', marginBottom: 16 };
  const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 6, display: 'block' };
  const sel: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--bg2)', color: 'var(--tx)', outline: 'none', fontFamily: 'var(--sans)' };
  const inp: React.CSSProperties = { ...sel, boxSizing: 'border-box' as const };
  const chipBtn = (activo: boolean): React.CSSProperties => ({
    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1.5px solid ${activo ? 'var(--green)' : 'var(--purple-bg, #EDE9FE)'}`,
    background: activo ? 'var(--green)' : 'var(--bg2)',
    color: activo ? '#fff' : 'var(--tx2)', transition: 'all .13s', fontFamily: 'var(--sans)',
  });
  const checkField = (key: string, checked: boolean, isSnomed = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
    border: `1px solid ${checked ? (isSnomed ? '#C4B5FD' : 'var(--green)') : (isSnomed ? '#EDE9FE' : 'var(--bdr)')}`,
    borderRadius: 'var(--r)', cursor: 'pointer',
    background: checked ? (isSnomed ? '#F5F3FF' : 'var(--bg3)') : 'var(--bg2)',
    fontSize: 11, fontWeight: 500, transition: 'all .13s',
    color: isSnomed ? 'var(--purple)' : 'var(--tx2)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  });

  const msgStyle: React.CSSProperties = {
    marginBottom: 16, padding: '10px 16px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600,
    background: mensaje.startsWith('✅') ? 'var(--estado-autorizado-bg)' : mensaje.startsWith('⚠️') ? 'var(--amber-bg)' : 'var(--red-bg)',
    color: mensaje.startsWith('✅') ? 'var(--estado-autorizado)' : mensaje.startsWith('⚠️') ? 'var(--amber)' : 'var(--red)',
    border: `1.5px solid ${mensaje.startsWith('✅') ? '#86EFAC' : mensaje.startsWith('⚠️') ? '#FCD34D' : '#FCA5A5'}`,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header dark ── */}
        <div style={{ background: 'var(--green-dark, #1B4332)', padding: '20px 32px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Link href="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.85)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}>
              ← Dashboard
            </Link>
          </div>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>GESTIÓN DE DATOS</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Importar / Exportar</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Gestiona los datos de la base de medicamentos</p>
        </div>

        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>

          {/* Mensaje */}
          {mensaje && <div style={msgStyle}>{mensaje}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start', marginBottom: 16 }}>

            {/* ── IMPORTAR ── */}
            <div style={card}>
              <div style={cardTitle}>📥 Importar datos</div>
              <div style={cardSub}>Carga medicamentos desde un archivo JSON exportado desde VFE</div>
              {isEditor ? (
                <>
                  <label
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={onDrop}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 10, padding: '32px 20px',
                      border: `2px dashed ${drag ? 'var(--green)' : 'var(--bdr)'}`,
                      borderRadius: 'var(--rl)', cursor: 'pointer',
                      background: drag ? 'var(--bg3)' : 'var(--bg)',
                      transition: 'all .15s', marginBottom: 12,
                    }}>
                    <input type="file" accept=".json,.csv,.xlsx,.xls" onChange={onFileChange} style={{ display: 'none' }} disabled={importando} />
                    <div style={{ fontSize: 32 }}>📂</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                        {importando ? progreso || 'Importando...' : 'Arrastra un archivo o haz clic para seleccionar'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 4 }}>
                        Excel (.xlsx · .xls) · CSV · JSON
                      </div>
                    </div>
                  </label>
                  <p style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 4 }}>Solo archivos JSON exportados desde VFE</p>
                </>
              ) : (
                <div style={{ padding: 16, background: 'var(--red-bg)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--red)' }}>
                  Necesitas permisos de editor para importar
                </div>
              )}
            </div>

            {/* ── EXPORTAR BASE DE DATOS ── */}
            <div style={card}>
              <div style={cardTitle}>📤 Exportar base de datos</div>
              <div style={cardSub}>Descarga medicamentos con los campos que necesitas</div>

              {/* Filtros */}
              <div style={{ background: 'var(--bg)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginBottom: 10 }}>🔍 FILTROS DE EXPORTACIÓN</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={lbl}>Grupo farmacológico (capítulo)</label>
                  <select value={exportCap} onChange={e => setExportCap(e.target.value)} style={sel}>
                    <option value="">— Todos los capítulos —</option>
                    {CHAPS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Principio activo (VTM) — opcional</label>
                  <input value={exportVtm} onChange={e => setExportVtm(e.target.value)} placeholder="Ej. Omeprazol..." style={inp} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 8, fontFamily: 'var(--mono)' }}>
                  {exportCap || exportVtm ? `Filtro: ${capNombre || ''}${exportVtm ? ` · "${exportVtm}"` : ''}` : 'Sin filtro — todos los registros'}
                </div>
              </div>

              {/* Campos */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--tx2)' }}>Campos a exportar:</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSelectedFields(Object.fromEntries(EXPORT_FIELDS.map(f => [f.key, true])))} style={chipBtn(false)}>✓ Todos</button>
                    <button onClick={() => setSelectedFields(Object.fromEntries(EXPORT_FIELDS.map(f => [f.key, false])))} style={chipBtn(false)}>✗ Ninguno</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                  {EXPORT_FIELDS.map(f => (
                    <label key={f.key} style={checkField(f.key, !!selectedFields[f.key])} title={f.label}>
                      <input type="checkbox" checked={!!selectedFields[f.key]} onChange={e => setSelectedFields(p => ({ ...p, [f.key]: e.target.checked }))} style={{ accentColor: 'var(--green)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SNOMED */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>SNOMED CT</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSelectedSnomed(Object.fromEntries(SNOMED_FIELDS.map(f => [f.key, true])))} style={{ ...chipBtn(false), color: 'var(--purple)', borderColor: '#C4B5FD' }}>todos</button>
                    <button onClick={() => setSelectedSnomed(Object.fromEntries(SNOMED_FIELDS.map(f => [f.key, false])))} style={{ ...chipBtn(false), color: 'var(--tx3)' }}>ninguno</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                  {SNOMED_FIELDS.map(f => (
                    <label key={f.key} style={checkField(f.key, !!selectedSnomed[f.key], true)} title={f.label}>
                      <input type="checkbox" checked={!!selectedSnomed[f.key]} onChange={e => setSelectedSnomed(p => ({ ...p, [f.key]: e.target.checked }))} style={{ accentColor: 'var(--purple)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Formato */}
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Formato de descarga</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {(['json', 'csv', 'html'] as const).map(fmt => (
                    <button key={fmt} onClick={() => setExportFormat(fmt)} style={{
                      padding: '10px 8px', borderRadius: 'var(--r)', cursor: 'pointer', fontWeight: 700,
                      border: `1.5px solid ${exportFormat === fmt ? 'var(--green)' : 'var(--bdr)'}`,
                      background: exportFormat === fmt ? 'var(--bg3)' : 'var(--bg2)',
                      color: exportFormat === fmt ? 'var(--green)' : 'var(--tx3)',
                      fontSize: 12, fontFamily: 'var(--sans)', textTransform: 'uppercase',
                    }}>
                      <div style={{ fontSize: 16, marginBottom: 2 }}>{fmt === 'json' ? '{ }' : fmt === 'csv' ? '⊞' : '🖨'}</div>
                      {fmt.toUpperCase()}
                      <div style={{ fontSize: 10, fontWeight: 400, color: 'var(--tx4)', marginTop: 2 }}>
                        {fmt === 'json' ? 'Datos' : fmt === 'csv' ? 'Hoja cálculo' : 'Imprimible'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--mono)', marginBottom: 12 }}>
                {totalCampos} campo{totalCampos !== 1 ? 's' : ''} seleccionado{totalCampos !== 1 ? 's' : ''}
              </div>

              <button onClick={exportar} disabled={exportando || totalCampos === 0} style={{
                width: '100%', padding: '11px 20px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 700,
                cursor: exportando || totalCampos === 0 ? 'not-allowed' : 'pointer',
                border: 'none', background: 'var(--green)', color: '#fff',
                opacity: exportando || totalCampos === 0 ? 0.5 : 1, fontFamily: 'var(--sans)', transition: 'all .15s',
              }}>
                {exportando ? 'Exportando...' : `⬇ Exportar ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>

          {/* ── EXPORTAR CAPÍTULO COMO LIBRO ── */}
          <div style={card}>
            <div style={cardTitle}>📖 Exportar capítulo como libro</div>
            <div style={cardSub}>
              Genera un documento editorial con el contenido del capítulo al estilo del Libro Verde, incluyendo RS y CUM.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>Capítulo a exportar</label>
                <select value={capLibro} onChange={e => setCapLibro(e.target.value)} style={sel}>
                  <option value="">— Selecciona un capítulo —</option>
                  {CHAPS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={exportarCapitulo} disabled={exportandoLibro || !capLibro} style={{
                  width: '100%', padding: '11px 20px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 700,
                  cursor: exportandoLibro || !capLibro ? 'not-allowed' : 'pointer',
                  border: 'none', background: 'var(--green)', color: '#fff',
                  opacity: exportandoLibro || !capLibro ? 0.5 : 1, fontFamily: 'var(--sans)', transition: 'all .15s',
                }}>
                  {exportandoLibro ? 'Generando...' : '⬇ Descargar capítulo'}
                </button>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--tx4)' }}>
              Tip: para generar PDF, abre el HTML en el navegador → Archivo → Imprimir → Guardar como PDF
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
