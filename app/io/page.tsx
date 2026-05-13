'use client';
import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';
import { CHAPS } from '@/lib/capitulos-tree';

const EXPORT_PRESETS = [
  {
    id: 'regulatorio',
    label: 'Regulatorio ARCSA',
    desc: 'RS, CUM, titular, fechas, estado — para reporte oficial',
    icon: '⊟',
    fields: ['vtm','nombre','rs','cum','rsTitular','rsFecha','rsVence','rsCondicion','estado','laboratorio'],
    color: '#5B21B6',
    bg: '#F5F3FF',
  },
  {
    id: 'clinico',
    label: 'Clínico / Prescripción',
    desc: 'DCI, concentración, FF, vía, CNMB — para uso clínico',
    icon: '⚕',
    fields: ['vtm','nombre','conc','ff','vias','generico','cnmb','atc','atclbl'],
    color: '#1D4ED8',
    bg: '#EFF6FF',
  },
  {
    id: 'farmacia',
    label: 'Farmacia / Dispensación',
    desc: 'Nombre, presentación, precio, laboratorio, genérico',
    icon: '⊞',
    fields: ['vtm','nombre','conc','ff','laboratorio','generico','units','presentacion','cnmb'],
    color: '#065F46',
    bg: '#ECFDF5',
  },
  {
    id: 'interoperabilidad',
    label: 'Interoperabilidad ISO IDMP',
    desc: 'Todos los campos + ATC + SNOMED + SPOR para intercambio',
    icon: '⊕',
    fields: ['vtm','nombre','conc','ff','vias','laboratorio','rs','cum','atc','atclbl','snomed_vtm_code','generico','cnmb','rsTitular','rsFecha','rsVence','estado'],
    color: '#92400E',
    bg: '#FEF3C7',
  },
];

const ALL_FIELDS = [
  { key: 'vtm',          label: 'Principio activo (DCI/INN)',  group: 'Sustancia' },
  { key: 'nombre',       label: 'Nombre comercial',             group: 'Producto' },
  { key: 'amp',          label: 'AMP (nombre marca)',           group: 'Producto' },
  { key: 'conc',         label: 'Concentración',                group: 'Producto' },
  { key: 'ff',           label: 'Forma farmacéutica (EDQM)',    group: 'Producto' },
  { key: 'vias',         label: 'Vía de administración',        group: 'Producto' },
  { key: 'presentacion', label: 'Presentación comercial',       group: 'Producto' },
  { key: 'units',        label: 'Unidades por presentación',    group: 'Producto' },
  { key: 'rs',           label: 'Registro sanitario ARCSA',     group: 'Regulatorio' },
  { key: 'cum',          label: 'CUM — Código único ARCSA',     group: 'Regulatorio' },
  { key: 'estado',       label: 'Estado regulatorio',           group: 'Regulatorio' },
  { key: 'rsTitular',    label: 'Titular del registro',         group: 'Regulatorio' },
  { key: 'rsFecha',      label: 'Fecha de autorización',        group: 'Regulatorio' },
  { key: 'rsVence',      label: 'Fecha de vencimiento',         group: 'Regulatorio' },
  { key: 'rsCondicion',  label: 'Condición de venta',           group: 'Regulatorio' },
  { key: 'rsPaisFab',    label: 'País de fabricación',          group: 'Regulatorio' },
  { key: 'laboratorio',  label: 'Laboratorio / Fabricante',     group: 'Organización' },
  { key: 'atc',          label: 'Código ATC-WHO',               group: 'Clasificación' },
  { key: 'atclbl',       label: 'Descripción ATC',              group: 'Clasificación' },
  { key: 'generico',     label: 'Genérico (Sí/No)',             group: 'Clasificación' },
  { key: 'cnmb',         label: 'CNMB — Lista esencial',        group: 'Clasificación' },
  { key: 'snomed_vtm_code', label: 'SNOMED CT — Código PA',    group: 'Interoperabilidad' },
  { key: 'snomed_ff_code',  label: 'SNOMED CT — Código FF',    group: 'Interoperabilidad' },
  { key: 'pu',           label: 'Precio unitario (USD)',         group: 'Precios' },
  { key: 'pp',           label: 'Precio presentación (USD)',     group: 'Precios' },
];

const GROUPS = [...new Set(ALL_FIELDS.map(f => f.group))];

export default function ImportarExportar() {
  const { getToken, isEditor } = useAuth();
  const [tab, setTab] = useState<'exportar' | 'importar' | 'fhir'>('exportar');
  const [preset, setPreset] = useState('clinico');
  const [customFields, setCustomFields] = useState<Record<string, boolean>>(
    Object.fromEntries(ALL_FIELDS.map(f => [f.key, ['vtm','nombre','conc','ff','vias','laboratorio','rs','cum','atc','generico','cnmb'].includes(f.key)]))
  );
  const [exportCap, setExportCap] = useState('');
  const [formato, setFormato] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);

  const getActiveFields = () => {
    if (preset === 'custom') return Object.entries(customFields).filter(([,v]) => v).map(([k]) => k);
    return EXPORT_PRESETS.find(p => p.id === preset)?.fields || [];
  };

  const handleExport = useCallback(async () => {
    setLoading(true);
    setProgress('Conectando con Firestore...');
    try {
      const token = await getToken();
      const fields = getActiveFields();
      let url = `/api/medicamentos?limit=500&fields=${fields.join(',')}`;
      if (exportCap) url += `&capitulo=${exportCap}`;

      setProgress('Descargando medicamentos...');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const meds = data.medicamentos || [];
      setProgress(`${meds.length} medicamentos obtenidos. Generando ${formato.toUpperCase()}...`);

      if (formato === 'csv') {
        const header = fields.join(',');
        const rows = meds.map((m: any) =>
          fields.map(f => {
            const v = m[f] || '';
            return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
          }).join(',')
        );
        const csv = '\uFEFF' + [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `SIMI_medicamentos_${preset}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else if (formato === 'json') {
        const json = JSON.stringify({ 
          meta: { fuente: 'SIMI Ecuador', fecha: new Date().toISOString(), total: meds.length, campos: fields, preset },
          medicamentos: meds 
        }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `SIMI_medicamentos_${preset}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
      setProgress(`✓ ${meds.length} medicamentos exportados correctamente`);
    } catch(e) {
      setProgress('Error al exportar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [getToken, preset, exportCap, formato, customFields]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').slice(0, 4);
      setImportPreview(lines.map(l => l.split(',').slice(0, 6)));
    };
    reader.readAsText(file);
  };

  const activePreset = EXPORT_PRESETS.find(p => p.id === preset);
  const activeFields = getActiveFields();

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '10px 20px', fontSize: 13, fontWeight: tab === t ? 700 : 500,
    color: tab === t ? 'var(--primary, #1D4ED8)' : 'var(--tx3)',
    background: tab === t ? 'var(--blue-bg)' : 'transparent',
    border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`,
    cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all .15s', marginBottom: '-1.5px',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>SIMI · GESTIÓN DE DATOS</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Importar / Exportar</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            Exporta en CSV o JSON · Importa desde Excel o CSV · Intercambia en FHIR R4 Bundle
          </p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1.5px solid var(--bdr)', background: 'var(--bg2)', padding: '0 32px', display: 'flex', gap: 4 }}>
          {[['exportar','⬇ Exportar'],['importar','⬆ Importar'],['fhir','⊕ FHIR R4']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t as any)} style={tabStyle(t)}>{l}</button>
          ))}
        </div>

        <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── EXPORTAR ── */}
          {tab === 'exportar' && (
            <>
              {/* Presets */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', marginBottom: 10, textTransform: 'uppercase' }}>
                  Perfil de exportación
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {EXPORT_PRESETS.map(p => (
                    <button key={p.id} onClick={() => setPreset(p.id)} style={{
                      padding: '12px 14px', borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${preset === p.id ? p.color : 'var(--bdr)'}`,
                      background: preset === p.id ? p.bg : 'var(--bg2)',
                      transition: 'all .15s', fontFamily: 'var(--sans)',
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 6 }}>{p.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: preset === p.id ? p.color : 'var(--tx)', marginBottom: 3 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--tx4-label, #64748B)', lineHeight: 1.4 }}>{p.desc}</div>
                      <div style={{ marginTop: 8, fontSize: 10, color: preset === p.id ? p.color : 'var(--tx4)', fontFamily: 'var(--mono)' }}>
                        {p.fields.length} campos
                      </div>
                    </button>
                  ))}
                  <button onClick={() => setPreset('custom')} style={{
                    padding: '12px 14px', borderRadius: 'var(--r)', textAlign: 'left', cursor: 'pointer',
                    border: `2px solid ${preset === 'custom' ? 'var(--primary)' : 'var(--bdr)'}`,
                    background: preset === 'custom' ? 'var(--blue-bg)' : 'var(--bg2)',
                    transition: 'all .15s', fontFamily: 'var(--sans)',
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>⊙</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: preset === 'custom' ? 'var(--primary)' : 'var(--tx)', marginBottom: 3 }}>Personalizado</div>
                    <div style={{ fontSize: 11, color: 'var(--tx4-label, #64748B)', lineHeight: 1.4 }}>Selecciona los campos que necesitas</div>
                  </button>
                </div>
              </div>

              {/* Selector de campos personalizado */}
              {preset === 'custom' && (
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', marginBottom: 12, textTransform: 'uppercase' }}>
                    Campos a exportar
                  </div>
                  {GROUPS.map(group => (
                    <div key={group} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx4-label, #64748B)', letterSpacing: 0.5, fontFamily: 'var(--mono)', marginBottom: 6, textTransform: 'uppercase' }}>{group}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {ALL_FIELDS.filter(f => f.group === group).map(f => (
                          <button key={f.key} onClick={() => setCustomFields(prev => ({ ...prev, [f.key]: !prev[f.key] }))} style={{
                            padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            border: `1.5px solid ${customFields[f.key] ? 'var(--primary)' : 'var(--bdr)'}`,
                            background: customFields[f.key] ? 'var(--blue-bg)' : 'var(--bg)',
                            color: customFields[f.key] ? 'var(--primary)' : 'var(--tx3)',
                            transition: 'all .13s', fontFamily: 'var(--sans)',
                          }}>{f.label}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Opciones de exportación */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {/* Filtro por capítulo */}
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Filtrar por capítulo
                  </label>
                  <select value={exportCap} onChange={e => setExportCap(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', fontSize: 13, background: 'var(--bg2)', color: 'var(--tx)', outline: 'none', fontFamily: 'var(--sans)' }}>
                    <option value="">Todos los capítulos</option>
                    {CHAPS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
                  </select>
                </div>

                {/* Formato */}
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Formato de salida
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['csv','json'] as const).map(f => (
                      <button key={f} onClick={() => setFormato(f)} style={{
                        flex: 1, padding: '8px', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        border: `1.5px solid ${formato === f ? 'var(--primary)' : 'var(--bdr)'}`,
                        background: formato === f ? 'var(--blue-bg)' : 'var(--bg)',
                        color: formato === f ? 'var(--primary)' : 'var(--tx3)',
                        fontFamily: 'var(--mono)', transition: 'all .13s',
                      }}>{f.toUpperCase()}</button>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '14px 16px' }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Resumen
                  </label>
                  <div style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.8 }}>
                    <div>{activeFields.length} campos seleccionados</div>
                    <div>Formato: <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--mono)' }}>{formato.toUpperCase()}</span></div>
                    <div>{exportCap ? `Capítulo: ${CHAPS.find(c=>c.id===exportCap)?.name}` : 'Todos los capítulos'}</div>
                  </div>
                </div>
              </div>

              {/* Botón exportar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={handleExport} disabled={loading} style={{
                  padding: '12px 32px', borderRadius: 'var(--r)', fontSize: 14, fontWeight: 700,
                  background: loading ? 'var(--bdr)' : 'var(--primary, #1D4ED8)', color: '#fff',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)',
                  transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {loading ? (
                    <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    Exportando...</>
                  ) : `⬇ Exportar ${formato.toUpperCase()}`}
                </button>
                {progress && (
                  <span style={{ fontSize: 13, color: progress.startsWith('✓') ? 'var(--estado-autorizado)' : progress.startsWith('Error') ? 'var(--red)' : 'var(--tx3)' }}>
                    {progress}
                  </span>
                )}
              </div>
            </>
          )}

          {/* ── IMPORTAR ── */}
          {tab === 'importar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Instrucciones */}
              <div style={{ background: 'var(--blue-bg)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>Requisitos del archivo CSV</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    ['Formato', 'CSV con cabeceras en primera fila'],
                    ['Separador', 'Coma (,) o punto y coma (;)'],
                    ['Codificación', 'UTF-8 con BOM'],
                    ['Columna RS', 'Requerida — Registro Sanitario ARCSA'],
                    ['Columna vtm', 'Requerida — Principio activo (DCI)'],
                    ['Tamaño máximo', '10 MB / 20.000 registros'],
                  ].map(([k,v]) => (
                    <div key={k} style={{ fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: 'var(--tx2)' }}>{k}: </span>
                      <span style={{ color: 'var(--tx3)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div style={{ border: '2px dashed var(--bdr2)', borderRadius: 'var(--rl)', padding: '40px 20px', textAlign: 'center', background: 'var(--bg2)', cursor: 'pointer' }}
                onClick={() => document.getElementById('import-file')?.click()}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>
                  {importFile ? importFile.name : 'Arrastra tu archivo CSV aquí'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx4-label, #64748B)' }}>
                  {importFile ? `${(importFile.size/1024).toFixed(1)} KB` : 'o haz clic para seleccionar'}
                </div>
                <input id="import-file" type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={handleImportFile} />
              </div>

              {/* Preview */}
              {importPreview.length > 0 && (
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg3)', fontSize: 11, fontWeight: 700, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 1 }}>
                    VISTA PREVIA (primeras filas)
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--bdr)' : 'none', background: i === 0 ? 'var(--bg3)' : 'var(--bg2)' }}>
                            {row.map((cell: string, j: number) => (
                              <td key={j} style={{ padding: '6px 12px', fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--tx2)' : 'var(--tx3)', whiteSpace: 'nowrap' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importFile && isEditor && (
                <button style={{ padding: '12px 32px', borderRadius: 'var(--r)', fontSize: 14, fontWeight: 700, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', width: 'fit-content' }}>
                  ⬆ Procesar e importar {importFile.name}
                </button>
              )}
            </div>
          )}

          {/* ── FHIR R4 ── */}
          {tab === 'fhir' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', padding: '20px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>Intercambio FHIR R4</div>
                <div style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 16, lineHeight: 1.6 }}>
                  SIMI expone una API FHIR R4 completa para intercambio con sistemas HIS, EHR y plataformas regulatorias.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {[
                    { label: 'CapabilityStatement', desc: 'Declaración de capacidades FHIR del servidor', url: '/api/fhir/r4/metadata', badge: 'PÚBLICO' },
                    { label: 'Medication Bundle', desc: 'Lista de medicamentos como FHIR Bundle', url: '/api/fhir/r4/Medication', badge: 'AUTH' },
                    { label: 'Substance', desc: 'Principios activos como recursos FHIR', url: '/api/fhir/r4/Substance', badge: 'AUTH' },
                    { label: 'Organization', desc: 'Laboratorios como recursos FHIR', url: '/api/fhir/r4/Organization', badge: 'AUTH' },
                  ].map(e => (
                    <a key={e.url} href={e.url} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '14px 16px', borderRadius: 'var(--r)', border: '1.5px solid var(--bdr)', background: 'var(--bg)', textDecoration: 'none', transition: 'all .15s' }}
                      onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--mono)' }}>{e.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: e.badge === 'PÚBLICO' ? 'var(--estado-autorizado-bg)' : 'var(--blue-bg)', color: e.badge === 'PÚBLICO' ? 'var(--estado-autorizado)' : 'var(--primary)', fontFamily: 'var(--mono)' }}>{e.badge}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{e.desc}</div>
                      <div style={{ fontSize: 10, color: 'var(--tx4)', fontFamily: 'var(--mono)', marginTop: 4 }}>{e.url} ↗</div>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--amber-bg)', border: '1.5px solid #FCD34D', borderRadius: 'var(--r)', padding: '12px 16px', fontSize: 12, color: 'var(--amber)' }}>
                <strong>Autenticación:</strong> Endpoints marcados AUTH requieren Bearer Token Firebase JWT en el header Authorization.
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
