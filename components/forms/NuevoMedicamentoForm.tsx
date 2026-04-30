'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import AtcAutocomplete from '@/components/ui/AtcAutocomplete';
import { getSnomedVTM, getSnomedFF } from '@/lib/snomed-db';
import { CHAPS, getSubcaps } from '@/lib/capitulos-tree';

const VIAS = [
  { value: 'oral', label: 'Oral' },
  { value: 'intravenosa', label: 'Intravenosa (IV)' },
  { value: 'intramuscular', label: 'Intramuscular (IM)' },
  { value: 'subcutánea', label: 'Subcutánea (SC)' },
  { value: 'tópica', label: 'Tópica' },
  { value: 'inhalatoria', label: 'Inhalatoria' },
  { value: 'oftálmica', label: 'Oftálmica' },
  { value: 'ótica', label: 'Ótica' },
  { value: 'nasal', label: 'Nasal' },
  { value: 'rectal', label: 'Rectal' },
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'transdérmica', label: 'Transdérmica' },
  { value: 'sublingual', label: 'Sublingual' },
];

const UCUM_UNITS = ['mg', 'g', 'mcg', 'mg/mL', 'mcg/mL', 'g/100mL', 'mg/5mL', 'UI', 'UI/mL', '%', 'mmol', 'mEq'];

const FF_OPTIONS = [
  { group: 'Sólidos orales', items: [['comprimido','Comprimido (Tablet)'],['comprimido recubierto con película','Comprimido recubierto con película (Film-coated tablet)'],['comprimido de liberación prolongada','Comprimido de liberación prolongada (Prolonged-release tablet)'],['comprimido masticable','Comprimido masticable (Chewable tablet)'],['comprimido dispersable','Comprimido dispersable (Dispersible tablet)'],['comprimido sublingual','Comprimido sublingual (Sublingual tablet)']] },
  { group: 'Cápsulas', items: [['cápsula dura','Cápsula dura (Hard capsule)'],['cápsula blanda','Cápsula blanda (Soft capsule)'],['cápsula gastrorresistente','Cápsula gastrorresistente (Gastro-resistant capsule)'],['cápsula de liberación prolongada','Cápsula de liberación prolongada (Prolonged-release capsule)']] },
  { group: 'Líquidos orales', items: [['solución oral','Solución oral (Oral solution)'],['suspensión oral','Suspensión oral (Oral suspension)'],['jarabe','Jarabe (Syrup)'],['gotas orales, solución','Gotas orales, solución (Oral drops, solution)'],['granulado para solución oral','Granulado para solución oral'],['polvo para suspensión oral','Polvo para suspensión oral']] },
  { group: 'Parenterales', items: [['solución inyectable','Solución inyectable (Solution for injection)'],['polvo para solución inyectable','Polvo para solución inyectable'],['suspensión inyectable','Suspensión inyectable'],['solución para perfusión','Solución para perfusión IV (Solution for infusion)']] },
  { group: 'Inhalados', items: [['solución para inhalación en envase a presión','Inhalador presurizado — solución (Pressurised inhalation)'],['polvo para inhalación','Polvo para inhalación (Powder for inhalation)'],['solución para nebulización','Solución para nebulización (Nebuliser solution)']] },
  { group: 'Tópicos', items: [['crema','Crema (Cream)'],['pomada','Pomada (Ointment)'],['gel','Gel'],['loción','Loción (Lotion)'],['parche transdérmico','Parche transdérmico (Transdermal patch)']] },
  { group: 'Oftálmicos / Óticos / Nasales', items: [['colirio en solución','Colirio, solución (Eye drops, solution)'],['colirio en suspensión','Colirio, suspensión (Eye drops, suspension)'],['gotas óticas, solución','Gotas óticas, solución (Ear drops, solution)'],['spray nasal, solución','Spray nasal, solución (Nasal spray, solution)']] },
  { group: 'Rectales / Vaginales', items: [['supositorio','Supositorio (Suppository)'],['óvulo vaginal','Óvulo vaginal (Pessary)'],['crema vaginal','Crema vaginal']] },
];

const TABS = ['🧬 Identificación', '💊 Presentación', '📋 Registro', '🩺 Clínica'];

const inp: React.CSSProperties = { border: '1.5px solid var(--bdr)', borderRadius: 8, padding: '9px 12px', background: 'var(--bg2)', fontFamily: 'var(--sans)', fontSize: 13, outline: 'none', width: '100%', color: 'var(--tx)' };
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--tx3)', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
const sec: React.CSSProperties = { fontWeight: 700, fontSize: 11, color: 'var(--gdp)', margin: '20px 0 12px', padding: '8px 12px', background: 'var(--gg, #f0fced)', borderLeft: '3px solid var(--green)', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '.3px' };
const badge = (bg: string, color = '#fff'): React.CSSProperties => ({ fontSize: 10, fontFamily: 'var(--mono)', background: bg, color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 });

export default function NuevoMedicamentoForm({ initialData, editId }: { initialData?: Record<string, string>; editId?: string }) {
  const { getToken, isEditor } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState(0);

  const [tipoPA, setTipoPA] = useState<'mono' | 'combo'>('mono');
  const [comboPAs, setComboPAs] = useState([
    { vtm: '', conc: '', unit: 'mg' },
    { vtm: '', conc: '', unit: 'mg' },
  ]);
  const [vtm, setVtm] = useState(initialData?.vtm || '');
  const [conc, setConc] = useState(initialData?.conc || '');
  const [concUnit, setConcUnit] = useState(initialData?.concUnit || 'mg');
  const [lab, setLab] = useState(initialData?.laboratorio || '');
  const [ff, setFf] = useState(initialData?.ff || '');
  const [vias, setVias] = useState<string[]>(initialData?.vias ? initialData.vias.split(', ').filter(Boolean) : []);
  const [generico, setGenerico] = useState(initialData?.generico || '');
  const [cnmb, setCnmb] = useState(initialData?.cnmb || '');
  const [chapId, setChapId] = useState(initialData?.chapId || '');
  const [subId, setSubId] = useState(initialData?.subId || '');
  const [atc, setAtc] = useState(initialData?.atc || '');
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [units, setUnits] = useState(initialData?.units || '');
  const [envase, setEnvase] = useState(initialData?.envase || '');
  const [rs, setRs] = useState(initialData?.rs || '');
  const [estado, setEstado] = useState(initialData?.estado || 'arcsa_pendiente');
  const [snomedVTM, setSnomedVTM] = useState<{code:string;term:string}|null>(null);
  const [snomedFF, setSnomedFF] = useState<{code:string;term:string}|null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { 
    const v = tipoPA === 'mono' ? vtm : comboPAs[0]?.vtm || '';
    setSnomedVTM(v ? getSnomedVTM(v) : null); 
  }, [vtm, tipoPA, comboPAs]);
  useEffect(() => { setSnomedFF(ff ? getSnomedFF(ff) : null); }, [ff]);

  const ffShort = ff.split('(')[0].trim();
  const vtmLabel = tipoPA === 'mono' ? vtm : comboPAs.filter(p=>p.vtm).map(p=>p.vtm).join(' + ');
  const concLabel = tipoPA === 'mono'
    ? (conc ? `${conc} ${concUnit}` : '')
    : comboPAs.filter(p=>p.vtm).map(p=>p.conc ? `${p.conc} ${p.unit}` : '').join(' + ');
  const vmpLabel = vtmLabel && ff && concLabel ? `${vtmLabel} ${concLabel} ${ffShort}` : '';
  const ampLabel = vmpLabel && lab ? (nombre ? `${nombre} ${concLabel} ${ffShort} (${lab})` : `${vmpLabel} (${lab})`) : '';
  const vtmForSnomed = tipoPA === 'mono' ? vtm : comboPAs[0]?.vtm || '';
  const vmppLabel = vmpLabel && units ? `${vmpLabel}, ${envase || ''} ${units}`.trim() : '';
  const amppLabel = ampLabel && units ? `${ampLabel}, ${envase || ''} ${units}`.trim() : '';

  const toggleVia = (v: string) => setVias(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const handleGuardar = async (marcarRevisado = false) => {
    if (!vtm || !lab || !ff || !concLabel) { setError('Completa los campos obligatorios'); return; }
    if (!isEditor) { setError('No tienes permisos de editor'); return; }
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const data = {
        vtm, laboratorio: lab, ff, conc: concLabel, generico, cnmb, chapId, subId, atc,
        nombre, units, envase, rs, estado: marcarRevisado ? 'autorizado' : estado,
        vias: vias.join(', '), vmp: vmpLabel, amp: ampLabel, vmpp: vmppLabel, ampp: amppLabel,
        snomed_vtm_code: snomedVTM?.code || '', snomed_ff_code: snomedFF?.code || '',
        ...(editId ? { id: editId } : {}),
      };
      const res = await fetch('/api/medicamentos', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.ok || result.id) router.push(editId ? `/medicamentos/${editId}` : '/medicamentos');
      else setError(result.error || 'Error al guardar');
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ fontFamily: 'var(--sans)', color: 'var(--tx)' }}>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--bdr)', marginBottom: 0 }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: '10px 18px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: '1.5px solid transparent', borderBottom: 'none', borderRadius: '8px 8px 0 0',
            background: tab === i ? '#fff' : 'transparent',
            color: tab === i ? 'var(--gdp)' : 'var(--tx3)',
            boxShadow: tab === i ? '0 -2px 0 0 var(--green)' : 'none',
            borderColor: tab === i ? 'var(--bdr)' : 'transparent',
            borderBottomColor: tab === i ? '#fff' : 'transparent',
            position: 'relative', bottom: -2,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ border: '1.5px solid var(--bdr)', borderRadius: '0 8px 8px 8px', padding: '24px', background: '#fff' }}>

        {/* TAB 0: IDENTIFICACIÓN */}
        {tab === 0 && (
          <div>
            {/* Sección datos obligatorios */}
            <div style={{ ...sec, marginTop: 0 }}>
              Datos obligatorios <span style={badge('rgba(26,107,8,.15)', 'var(--gdp)')}>REQUERIDOS</span>
            </div>

            {/* Tipo PA */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>TIPO DE PRINCIPIO ACTIVO <span style={{ color: 'red' }}>*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['mono', 'combo'] as const).map(t => (
                  <label key={t} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                    borderRadius: 20, border: `1.5px solid ${tipoPA === t ? 'var(--green)' : 'var(--bdr)'}`,
                    background: tipoPA === t ? 'var(--green)' : 'var(--bg2)',
                    color: tipoPA === t ? '#fff' : 'var(--tx2)', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  }}>
                    <input type="radio" name="tipo-pa" value={t} checked={tipoPA === t} onChange={() => setTipoPA(t)} style={{ display: 'none' }} />
                    {t === 'mono' ? 'Monocomponente' : 'Combinación'}
                  </label>
                ))}
              </div>
            </div>


            {/* COMBO: selector cantidad + campos */}
            {tipoPA === 'combo' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={lbl}>PRINCIPIOS ACTIVOS DE LA COMBINACIÓN <span style={{ color: 'red' }}>*</span></label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[2,3,4].map(n => (
                      <button key={n} type="button"
                        onClick={() => setComboPAs(Array.from({ length: n }, (_, i) => comboPAs[i] || { vtm: '', conc: '', unit: 'mg' }))}
                        style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          border: '1.5px solid var(--bdr)',
                          background: comboPAs.length === n ? 'var(--blue, #2563EB)' : 'var(--bg2)',
                          color: comboPAs.length === n ? '#fff' : 'var(--tx)',
                        }}>
                        {n} principios activos
                      </button>
                    ))}
                  </div>
                </div>
                {comboPAs.map((pa, i) => (
                  <div key={i} style={{ border: '1.5px solid var(--bdr)', borderRadius: 8, padding: '14px', marginBottom: 8, background: 'var(--bg3)' }}>
                    <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--green)', padding: '2px 10px', borderRadius: 20, marginBottom: 10 }}>PA {i+1}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={lbl}>PRINCIPIO ACTIVO {i+1} <span style={{ color: 'red' }}>*</span></label>
                        <input style={inp} placeholder={'Ej. ' + (i===0?'Enalapril':'Hidroclorotiazida')}
                          value={pa.vtm}
                          onChange={e => { const n=[...comboPAs]; n[i]={...n[i],vtm:e.target.value.toLowerCase()}; setComboPAs(n); }} />
                      </div>
                      <div>
                        <label style={lbl}>CONCENTRACIÓN {i+1} <span style={{ color: 'red' }}>*</span></label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input style={{ ...inp, flex: 1 }} placeholder={'Ej. ' + (i===0?'10 mg':'12.5 mg')}
                            value={pa.conc}
                            onChange={e => { const n=[...comboPAs]; n[i]={...n[i],conc:e.target.value}; setComboPAs(n); }} />
                          <select style={{ ...inp, width: 90 }} value={pa.unit}
                            onChange={e => { const n=[...comboPAs]; n[i]={...n[i],unit:e.target.value}; setComboPAs(n); }}>
                            {UCUM_UNITS.map(u => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    {i < comboPAs.length - 1 && (
                      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 20, color: 'var(--green)', fontWeight: 700 }}>+</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* MONO: principio activo + concentración */}
            {tipoPA === 'mono' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>PRINCIPIO ACTIVO / DCI <span style={{ color: 'red' }}>*</span></label>
                <input style={inp} placeholder="Ej. paracetamol, atenolol..." value={vtm} onChange={e => setVtm(e.target.value.toLowerCase())} />
                {snomedVTM && <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ ...badge('#ede9fe', '#7c3aed'), fontFamily: 'var(--mono)' }}>VTM {snomedVTM.code}</span>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>— {snomedVTM.term}</span>
                </div>}
                <p style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 3 }}>Escribe en minúscula (INN/DCI). El sistema completará ATC y SNOMED automáticamente.</p>
              </div>
              <div>
                <label style={lbl}>CONCENTRACIÓN / DOSIS <span style={{ color: 'red' }}>*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} placeholder="Ej. 10" value={conc} onChange={e => setConc(e.target.value)} />
                  <select style={{ ...inp, width: 110 }} value={concUnit} onChange={e => setConcUnit(e.target.value)}>
                    {UCUM_UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <p style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 3 }}>ISO 11240 · UCUM — usa punto decimal (Ej: 2.5 no 2,5)</p>
              </div>
            </div>

            )}

            {/* Laboratorio + FF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>LABORATORIO / FABRICANTE <span style={{ color: 'red' }}>*</span></label>
                <input style={inp} placeholder="Ej. AstraZeneca" value={lab} onChange={e => setLab(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>FORMA FARMACÉUTICA <span style={{ color: 'red' }}>*</span></label>
                <select style={inp} value={ff} onChange={e => setFf(e.target.value)}>
                  <option value="">— Selecciona forma farmacéutica (EDQM) —</option>
                  {FF_OPTIONS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                    </optgroup>
                  ))}
                </select>
                {snomedFF && <div style={{ marginTop: 5 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', background: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: 5, border: '1px solid #c4b5fd', fontWeight: 600 }}>
                    SNOMED CT {snomedFF.code} — {snomedFF.term}
                  </span>
                </div>}
              </div>
            </div>

            {/* Vías */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>VÍA DE ADMINISTRACIÓN <span style={{ color: 'red' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: '10px 12px', background: 'var(--bg)', border: '1.5px solid var(--bdr)', borderRadius: 8 }}>
                {VIAS.map(v => (
                  <label key={v.value} style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500,
                    cursor: 'pointer', padding: '5px 8px', borderRadius: 6,
                    border: `1.5px solid ${vias.includes(v.value) ? 'var(--green)' : 'var(--bdr)'}`,
                    background: vias.includes(v.value) ? 'var(--gg, #f0fced)' : 'var(--bg2)',
                    color: vias.includes(v.value) ? 'var(--gdp)' : 'var(--tx)',
                  }}>
                    <input type="checkbox" checked={vias.includes(v.value)} onChange={() => toggleVia(v.value)} style={{ accentColor: 'var(--green)', width: 13, height: 13 }} />
                    {v.label}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 4 }}>Puedes seleccionar una o más vías</p>
            </div>

            {/* Genérico + CNMB */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>GENÉRICO <span style={{ color: 'red' }}>*</span></label>
                <select style={inp} value={generico} onChange={e => setGenerico(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <option value="Sí">Sí — Medicamento genérico</option>
                  <option value="No">No — Medicamento de marca</option>
                </select>
              </div>
              <div>
                <label style={lbl}>CNMB <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--tx4)' }}>Cuadro Nacional de Medicamentos Básicos</span></label>
                <select style={inp} value={cnmb} onChange={e => setCnmb(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <option value="Sí">Sí — Pertenece al CNMB</option>
                  <option value="No">No — No pertenece al CNMB</option>
                </select>
              </div>
            </div>

            {/* Tabla SPMS */}
            <div style={{ ...sec }}>Clasificación estructural automática <span style={badge('var(--green)')}>AUTO-GENERADO</span></div>
            <div style={{ border: '1.5px dashed var(--bdr2)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '10px 14px', fontSize: 11, color: 'var(--tx3)', background: 'var(--bg3)', borderBottom: '1px solid var(--bdr)' }}>
                Generado automáticamente al ingresar principio activo, concentración, forma farmacéutica y laboratorio
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: 'var(--gdp)' }}>
                    <th style={{ padding: '7px 12px', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', color: '#fff', width: 130 }}>NIVEL</th>
                    <th style={{ padding: '7px 12px', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '1.5px', color: '#fff' }}>EJEMPLO GENERADO</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { nivel: 'VTM', desc: 'Entidad Terapéutica Virtual', valor: vtmLabel, color: 'var(--gdp)' },
                    { nivel: 'VMP', desc: 'Producto Medicinal Virtual', valor: vmpLabel, color: 'var(--gd, #2DB010)' },
                    { nivel: 'AMP', desc: 'Producto Medicinal Real (marca)', valor: ampLabel, hint: 'Requiere nombre comercial y laboratorio', color: 'var(--blue)' },
                    { nivel: 'VMPP', desc: 'Paquete Medicinal Virtual', valor: vmppLabel, hint: 'Requiere unidades y tipo de envase', color: 'var(--gd, #2DB010)' },
                    { nivel: 'AMPP', desc: 'Paquete Medicinal Real', valor: amppLabel, hint: 'Requiere nombre comercial, unidades y envase', color: 'var(--blue)' },
                  ].map((row, i) => (
                    <tr key={row.nivel} style={{ background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)', borderBottom: '1px solid var(--bdr)' }}>
                      <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                        <span style={{ display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: '#fff', background: row.color, padding: '2px 8px', borderRadius: 4 }}>{row.nivel}</span>
                        <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 3, lineHeight: 1.3 }}>{row.desc}</div>
                      </td>
                      <td style={{ padding: '8px 12px', verticalAlign: 'top' }}>
                        {row.valor ? <span style={{ fontWeight: 600, color: 'var(--tx)' }}>{row.valor}</span> : <span style={{ fontStyle: 'italic', color: 'var(--tx4)', fontSize: 11 }}>{row.hint || '—'}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ATC */}
            <div style={{ ...sec }}>Código ATC <span style={badge('rgba(26,107,8,.15)', 'var(--gdp)')}>OPCIONAL</span></div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>CÓDIGO(S) ATC <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--tx4)', textTransform: 'none' }}>ATC-WHO 2025</span></label>
              <AtcAutocomplete value={atc} onChange={(code) => setAtc(code)} placeholder="Ej. C07AB03 o escribe el nombre del PA..." />
              {atc && <p style={{ fontSize: 11, marginTop: 4, fontFamily: 'var(--mono)', color: '#7c3aed' }}>✓ {atc}</p>}
            </div>

            {/* Capítulo */}
            <div style={{ ...sec }}>Clasificación — Capítulo y subcapítulos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>CAPÍTULO <span style={{ color: 'red' }}>*</span></label>
                <select style={inp} value={chapId} onChange={e => { setChapId(e.target.value); setSubId(''); }}>
                  <option value="">— Selecciona un capítulo —</option>
                  {CHAPS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
                </select>
              </div>
              {chapId && getSubcaps(chapId).length > 0 && (
                <div>
                  <label style={lbl}>SUBCAPÍTULO</label>
                  <select style={inp} value={subId} onChange={e => setSubId(e.target.value)}>
                    <option value="">— Selecciona subcapítulo —</option>
                    {getSubcaps(chapId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: PRESENTACIÓN */}
        {tab === 1 && (
          <div>
            <div style={{ ...sec, marginTop: 0 }}>Presentación y precio</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>NOMBRE COMERCIAL (AMP)</label>
                <input style={inp} placeholder="Ej. Tenormin 50 mg comprimidos" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>UNIDADES</label>
                <input style={inp} placeholder="30" type="number" value={units} onChange={e => setUnits(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>TIPO DE ENVASE</label>
                <select style={inp} value={envase} onChange={e => setEnvase(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {['blíster', 'frasco', 'tubo', 'vial', 'ampolla', 'jeringa precargada', 'inhalador', 'sobre', 'caja'].map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRO */}
        {tab === 2 && (
          <div>
            <div style={{ ...sec, marginTop: 0 }}>Registro Sanitario Ecuador <span style={badge('rgba(26,107,8,.15)', 'var(--gdp)')}>ARCSA / ISO 11615</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>N° REGISTRO SANITARIO</label>
                <input style={inp} placeholder="Ej. ARCSA-01-2024-123456" value={rs} onChange={e => setRs(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>ESTADO REGULATORIO</label>
                <select style={inp} value={estado} onChange={e => setEstado(e.target.value)}>
                  <option value="arcsa_pendiente">Pendiente de revisión</option>
                  <option value="autorizado">Autorizado</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="retirado">Retirado del mercado</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLÍNICA */}
        {tab === 3 && (
          <div>
            <div style={{ ...sec, marginTop: 0 }}>Información Clínica</div>
            <p style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 16 }}>Las secciones clínicas estarán disponibles próximamente.</p>
          </div>
        )}

      </div>

      {error && <p style={{ color: 'red', fontSize: 13, marginTop: 12 }}>{error}</p>}

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={() => handleGuardar(false)} disabled={saving}
          style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--green)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Guardando...' : editId ? 'Guardar cambios' : '+ Guardar medicamento'}
        </button>
        {editId && (
          <button onClick={() => handleGuardar(true)} disabled={saving}
            style={{ padding: '10px 24px', borderRadius: 8, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            ✓ Guardar y marcar como REVISADO
          </button>
        )}
        <button onClick={() => router.push(editId ? `/medicamentos/${editId}` : '/medicamentos')}
          style={{ padding: '10px 24px', borderRadius: 8, border: '1.5px solid var(--bdr)', background: 'var(--bg2)', color: 'var(--tx)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
