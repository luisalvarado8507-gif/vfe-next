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
  const [upres, setUpres] = useState(initialData?.upres || '');
  const [vol, setVol] = useState(initialData?.vol || '');
  const [volUnit, setVolUnit] = useState(initialData?.volUnit || 'mL');
  const [iso11238Forma, setIso11238Forma] = useState(initialData?.iso11238Forma || '');
  const [iso11238Estado, setIso11238Estado] = useState(initialData?.iso11238Estado || '');
  // Registro tab fields
  const [rsTitular, setRsTitular] = useState(initialData?.rsTitular || '');
  const [rsTipo, setRsTipo] = useState(initialData?.rsTipo || '');
  const [rsFecha, setRsFecha] = useState(initialData?.rsFecha || '');
  const [rsVence, setRsVence] = useState(initialData?.rsVence || '');
  const [rsPais, setRsPais] = useState(initialData?.rsPais || 'Ecuador');
  const [rsCondicion, setRsCondicion] = useState(initialData?.rsCondicion || '');
  const [rsProc, setRsProc] = useState(initialData?.rsProc || '');
  const [rsFabricante, setRsFabricante] = useState(initialData?.rsFabricante || '');
  const [rsPaisFab, setRsPaisFab] = useState(initialData?.rsPaisFab || '');
  const [rsImportador, setRsImportador] = useState(initialData?.rsImportador || '');
  const [phpidL1, setPhpidL1] = useState(initialData?.phpidL1 || '');
  const [phpidL2, setPhpidL2] = useState(initialData?.phpidL2 || '');
  const [phpidL3, setPhpidL3] = useState(initialData?.phpidL3 || '');
  const [phpid, setPhpid] = useState(initialData?.phpid || '');
  const [gtin, setGtin] = useState(initialData?.gtin || '');
  const [cnmbCodigo, setCnmbCodigo] = useState(initialData?.cnmbCodigo || '');
  const [pmc, setPmc] = useState(initialData?.pmc || '');
  const [rsObs, setRsObs] = useState(initialData?.rsObs || '');
  // Clínica
  const SECCIONES_CLINICAS = ['Generalidades','Rol del medicamento','Embarazo y lactancia','Interacciones','Precauciones','Indicaciones','Contraindicaciones','Efectos adversos','Dosificación','Farmacocinética'];
  const [secActivas, setSecActivas] = useState<string[]>(['Generalidades','Rol del medicamento']);
  const [clin, setClin] = useState<Record<string,string>>({});
  const setClinField = (key: string, val: string) => setClin(prev => ({ ...prev, [key]: val }));
  const toggleSec = (s: string) => setSecActivas(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s]);
  const [interacciones, setInteracciones] = useState<Array<{farmaco:string;gravedad:string;efecto:string}>>([]);
  const addInteraccion = () => setInteracciones(prev => [...prev, { farmaco:'', gravedad:'', efecto:'' }]);
  const [farmPrecios, setFarmPrecios] = useState({ farmaprecios: initialData?.farmaprecios || '', fybeca: initialData?.fybeca || '', medicity: initialData?.medicity || '', cruzazul: initialData?.cruzazul || '', pharmacys: initialData?.pharmacys || '' });
  const calcMediana = (fp: Record<string,string>) => {
    const vals = Object.values(fp).map(Number).filter(v => v > 0);
    if (!vals.length) return '—';
    const sorted = [...vals].sort((a,b)=>a-b);
    const mid = Math.floor(sorted.length/2);
    return (sorted.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2).toFixed(2);
  };
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
        upres, vol, volUnit, iso11238Forma, iso11238Estado,
        ...farmPrecios,
        rsTitular, rsTipo, rsFecha, rsVence, rsPais, rsCondicion, rsProc,
        rsFabricante, rsPaisFab, rsImportador,
        phpidL1, phpidL2, phpidL3, phpid, gtin, cnmbCodigo, pmc, rsObs,
        clinData: clin,
        interacciones: JSON.stringify(interacciones),
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
        {tab === 1 && (() => {
          const med = calcMediana(farmPrecios);
          const pu = med !== '—' && units ? (Number(med)/Number(units)).toFixed(4) : '—';
          const vals = Object.values(farmPrecios).map(Number).filter(v=>v>0);
          const rango = vals.length>=2 ? Math.min(...vals).toFixed(2)+' — '+Math.max(...vals).toFixed(2) : '—';
          return (
          <div>
            <div style={{ ...sec, marginTop: 0 }}>Presentación y precio</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>NOMBRE COMERCIAL</label>
                <input style={inp} placeholder="Ej. Tenormin" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>UNIDADES POR PRESENTACIÓN</label>
                <input style={inp} placeholder="Ej. 28" type="number" value={units} onChange={e => setUnits(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>UNIDAD DE PRESENTACIÓN <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11239</span></label>
                <select style={inp} value={upres} onChange={e => setUpres(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <optgroup label="Sólidos orales"><option>comprimido</option><option>cápsula</option><option>gragea</option><option>polvo oral</option></optgroup>
                  <optgroup label="Parenterales"><option>vial</option><option>ampolla</option><option>jeringa precargada</option><option>bolsa IV</option></optgroup>
                  <optgroup label="Inhalados"><option>inhalador dosis medida</option><option>cápsula para inhalación</option></optgroup>
                  <optgroup label="Tópicos/otros"><option>tubo</option><option>parche</option><option>supositorio</option><option>óvulo vaginal</option><option>sobre</option></optgroup>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>TIPO DE ENVASE</label>
                <select style={inp} value={envase} onChange={e => setEnvase(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {['blíster','frasco','tubo','vial','ampolla','jeringa precargada','pluma inyectora','inhalador','sobre','caja'].map(ev => <option key={ev}>{ev}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>VOLUMEN TOTAL DEL ENVASE <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>OPCIONAL</span></label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input style={{ ...inp, width:110 }} placeholder="Ej. 150" type="number" value={vol} onChange={e => setVol(e.target.value)} />
                  <select style={{ ...inp, width:80 }} value={volUnit} onChange={e => setVolUnit(e.target.value)}>
                    {['mL','L','g','mg','UI'].map(u => <option key={u}>{u}</option>)}
                  </select>
                  <span style={{ fontSize:11, color:'var(--tx3)', lineHeight:1.5 }}>Tamaño del frasco/ampolla/tubo → aparece en VMPP y AMPP.<br/><b>Nota:</b> Para jarabes escribe la concentración como <span style={{ fontFamily:'var(--mono)',color:'var(--gdp)' }}>250 mg/5 mL</span></span>
                </div>
              </div>
            </div>
            <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:'14px 16px', background:'var(--bg3)', marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--tx3)', letterSpacing:1, marginBottom:4 }}>PRECIOS POR FARMACIA (USD)</div>
              <div style={{ fontSize:11, color:'var(--tx4)', marginBottom:12 }}>Precio de la presentación completa · Farmaprecios solo como referencia, no entra en el cálculo</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                {([
                  { key:'farmaprecios', label:'FARMAPRECIOS', color:'#2563eb', note:'(solo referencia)' },
                  { key:'fybeca', label:'FYBECA', color:'#dc2626' },
                  { key:'medicity', label:'MEDICITY', color:'#16a34a' },
                  { key:'cruzazul', label:'CRUZ AZUL', color:'#1d4ed8' },
                  { key:'pharmacys', label:'PHARMACYS', color:'#ea580c' },
                ] as const).map(ph => (
                  <div key={ph.key}>
                    <label style={{ ...lbl, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8,height:8,borderRadius:'50%',background:ph.color,display:'inline-block',flexShrink:0 }}></span>
                      {ph.label} {'note' in ph && <span style={{ fontSize:9,fontWeight:400,color:'var(--tx4)',fontStyle:'italic' }}>{ph.note}</span>}
                    </label>
                    <input style={inp} type="number" placeholder="—"
                      value={farmPrecios[ph.key]}
                      onChange={e => setFarmPrecios(prev => ({ ...prev, [ph.key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                {[{ label:'MEDIANA — PRECIO REFERENCIAL', val:med },{ label:'PRECIO UNITARIO (mediana ÷ unidades)', val:pu },{ label:'RANGO (mín — máx)', val:rango }].map(r => (
                  <div key={r.label}>
                    <label style={lbl}>{r.label}</label>
                    <div style={{ padding:'9px 12px', border:'1.5px dashed var(--bdr2)', borderRadius:8, fontSize:14, fontWeight:700, color:'var(--gdp)', background:'var(--bg2)' }}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...sec }}>Forma química y estado físico <span style={badge('rgba(26,107,8,.15)','var(--gdp)')}>ISO 11238</span></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={lbl}>FORMA QUÍMICA <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11238 — sal, base, éster</span></label>
                <select style={inp} value={iso11238Forma} onChange={e => setIso11238Forma(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {['base','sal','éster','hidrato','anhidro','racemato','enantiómero','profármaco','complejo','otro'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>ESTADO FÍSICO <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11238</span></label>
                <select style={inp} value={iso11238Estado} onChange={e => setIso11238Estado(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  {['sólido','líquido','gas','semisólido','polvo','granulado'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
          );
        })()}

        {/* TAB 2: REGISTRO */}
        {tab === 2 && (
          <div>
            {/* Registro Sanitario ARCSA */}
            <div style={{ ...sec, marginTop: 0 }}>Registro Sanitario Ecuador <span style={badge('rgba(26,107,8,.15)', 'var(--gdp)')}>ARCSA / ISO 11615</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>N° REGISTRO SANITARIO <span style={{ color:'red' }}>*</span></label>
                <input style={inp} placeholder="Ej. ARCSA-01-2024-123456" value={rs} onChange={e => setRs(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>TITULAR DEL RS <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11615</span></label>
                <input style={inp} placeholder="Ej. Pfizer Ecuador S.A." value={rsTitular} onChange={e => setRsTitular(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>TIPO DE RS</label>
                <select style={inp} value={rsTipo} onChange={e => setRsTipo(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <option>Nuevo</option><option>Renovación</option><option>Modificación</option><option>Ampliación</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>FECHA DE AUTORIZACIÓN <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11615</span></label>
                <input style={inp} type="date" value={rsFecha} onChange={e => setRsFecha(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>FECHA DE VENCIMIENTO RS <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11615</span></label>
                <input style={inp} type="date" value={rsVence} onChange={e => setRsVence(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>ESTADO REGULATORIO <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11615</span></label>
                <select style={inp} value={estado} onChange={e => setEstado(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <option value="arcsa_pendiente">Pendiente de revisión</option>
                  <option value="autorizado">Autorizado</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="retirado">Retirado del mercado</option>
                </select>
              </div>
              <div>
                <label style={lbl}>PAÍS DE AUTORIZACIÓN <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11615</span></label>
                <select style={inp} value={rsPais} onChange={e => setRsPais(e.target.value)}>
                  {['Ecuador','Colombia','Perú','Bolivia','Venezuela','Argentina','Chile','Brasil','México','España','Estados Unidos','Otro'].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>N° PROCEDIMIENTO <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11615</span></label>
                <input style={inp} placeholder="Ej. ARCSA-2024-0123" value={rsProc} onChange={e => setRsProc(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>CONDICIÓN DE VENTA</label>
                <select style={inp} value={rsCondicion} onChange={e => setRsCondicion(e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <option>Venta libre (OTC)</option>
                  <option>Bajo receta médica</option>
                  <option>Bajo receta médica retenida</option>
                  <option>Uso hospitalario</option>
                  <option>Uso exclusivo médico</option>
                </select>
              </div>
            </div>

            {/* Fabricante */}
            <div style={{ ...sec }}>Fabricante y cadena de suministro <span style={badge('rgba(26,107,8,.15)', 'var(--gdp)')}>ISO 11615</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>FABRICANTE</label>
                <input style={inp} placeholder="Ej. Pfizer Manufacturing Belgium" value={rsFabricante} onChange={e => setRsFabricante(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>PAÍS DE FABRICACIÓN</label>
                <input style={inp} placeholder="Ej. Bélgica" value={rsPaisFab} onChange={e => setRsPaisFab(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>IMPORTADOR / DISTRIBUIDOR</label>
                <input style={inp} placeholder="Ej. Representaciones Médicas Cia. Ltda." value={rsImportador} onChange={e => setRsImportador(e.target.value)} />
              </div>
            </div>

            {/* PhPID */}
            <div style={{ ...sec }}>Identificador farmacéutico global <span style={badge('rgba(37,99,235,.15)', '#2563eb')}>ISO 11616</span></div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>PhPID NIVEL 1 — Sustancia + Forma farmacéutica <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11616</span></label>
              <input style={inp} placeholder="Ej. amlodipino comprimido recubierto con película" value={phpidL1} onChange={e => setPhpidL1(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
              <div>
                <label style={lbl}>PhPID NIVEL 2 — + Concentración <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11616</span></label>
                <input style={inp} placeholder="Ej. amlodipino comp. recubierto 5 mg" value={phpidL2} onChange={e => setPhpidL2(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>PhPID NIVEL 3 — + Unidades <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11616</span></label>
                <input style={inp} placeholder="Ej. amlodipino comp. recubierto 5 mg caja 30" value={phpidL3} onChange={e => setPhpidL3(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>PhPID CÓDIGO <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>ISO 11616</span></label>
              <input style={{ ...inp, fontFamily:'var(--mono)' }} placeholder="Ej. PhPID-C08CA01-5MG-COMP" value={phpid} onChange={e => setPhpid(e.target.value)} />
            </div>

            {/* Códigos */}
            <div style={{ ...sec }}>Códigos e identificadores de producto</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={lbl}>CÓDIGO GTIN / EAN</label>
                <input style={{ ...inp, fontFamily:'var(--mono)' }} placeholder="Ej. 7861234567890" value={gtin} onChange={e => setGtin(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>CÓDIGO CNMB <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>OPCIONAL</span></label>
                <input style={{ ...inp, fontFamily:'var(--mono)' }} placeholder="Ej. 01.01.001" value={cnmbCodigo} onChange={e => setCnmbCodigo(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>PRECIO MÁXIMO AL CONSUMIDOR <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>USD</span></label>
                <input style={inp} type="number" placeholder="Ej. 12.50" value={pmc} onChange={e => setPmc(e.target.value)} />
              </div>
            </div>

            {/* Observaciones */}
            <div style={{ ...sec }}>Observaciones regulatorias</div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>OBSERVACIONES / RESTRICCIONES ESPECIALES <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>OPCIONAL</span></label>
              <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }}
                placeholder="Ej. Sujeto a farmacovigilancia intensiva. No intercambiable con genéricos sin autorización médica."
                value={rsObs} onChange={e => setRsObs(e.target.value)} />
            </div>
          </div>
        )}

        {/* TAB 3: CLÍNICA */}
        {tab === 3 && (
          <div>
            {/* Selector de secciones */}
            <div style={{ ...sec, marginTop: 0 }}>Secciones clínicas <span style={{ fontSize:10,fontWeight:600,fontFamily:'var(--mono)',background:'rgba(26,107,8,.1)',color:'var(--gdp)',padding:'2px 8px',borderRadius:20 }}>SELECCIONA LAS QUE APLICAN</span></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
              {SECCIONES_CLINICAS.map(s => (
                <button key={s} type="button" onClick={() => toggleSec(s)}
                  style={{ padding:'6px 14px', borderRadius:20, fontSize:12.5, fontWeight:600, cursor:'pointer', border:'none',
                    background: secActivas.includes(s) ? 'var(--green)' : 'var(--bg3)',
                    color: secActivas.includes(s) ? '#fff' : 'var(--tx2)',
                  }}>{s}</button>
              ))}
            </div>

            {/* GENERALIDADES */}
            {secActivas.includes('Generalidades') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--gdp)', marginBottom:10 }}>📋 GENERALIDADES / MECANISMO DE ACCIÓN</div>
                <textarea style={{ ...inp, minHeight:90, resize:'vertical' }}
                  placeholder="Ej. Bloqueador de los canales de calcio tipo dihidropiridina. Inhibe la entrada de calcio en células musculares lisas vasculares y cardíacas, produciendo vasodilatación arteriolar."
                  value={clin['generalidades']||''} onChange={e=>setClinField('generalidades',e.target.value)} />
              </div>
            )}

            {/* ROL DEL MEDICAMENTO */}
            {secActivas.includes('Rol del medicamento') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--gdp)', marginBottom:10 }}>💊 ROL DEL MEDICAMENTO</div>
                <textarea style={{ ...inp, minHeight:90, resize:'vertical' }}
                  placeholder="Ej. Primera línea en hipertensión y angina estable. Especialmente indicado en adultos mayores y pacientes con angina vasospástica."
                  value={clin['rol']||''} onChange={e=>setClinField('rol',e.target.value)} />
              </div>
            )}

            {/* EMBARAZO Y LACTANCIA */}
            {secActivas.includes('Embarazo y lactancia') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--gdp)', marginBottom:10 }}>🤰 EMBARAZO Y LACTANCIA</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={lbl}>CATEGORÍA FDA / EMA</label>
                    <select style={inp} value={clin['embarazo_cat']||''} onChange={e=>setClinField('embarazo_cat',e.target.value)}>
                      <option value="">— Selecciona —</option>
                      {['A','B','C','D','X','N/A — Contraindicado','Usar con precaución'].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>EMBARAZO</label>
                    <textarea style={{ ...inp, minHeight:70, resize:'vertical' }}
                      placeholder="Ej. Contraindicado en el 1er trimestre."
                      value={clin['embarazo']||''} onChange={e=>setClinField('embarazo',e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>LACTANCIA</label>
                  <textarea style={{ ...inp, minHeight:70, resize:'vertical' }}
                    placeholder="Ej. Se excreta en leche materna. Evitar o suspender lactancia."
                    value={clin['lactancia']||''} onChange={e=>setClinField('lactancia',e.target.value)} />
                </div>
              </div>
            )}

            {/* INTERACCIONES */}
            {secActivas.includes('Interacciones') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--gdp)', marginBottom:10 }}>⚡ INTERACCIONES MEDICAMENTOSAS</div>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5, marginBottom:10 }}>
                  <thead>
                    <tr style={{ background:'var(--bg3)' }}>
                      {['Fármaco / Grupo','Gravedad','Mecanismo / Efecto'].map(h=>(
                        <th key={h} style={{ padding:'6px 10px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--tx3)', borderBottom:'1.5px solid var(--bdr)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {interacciones.map((it,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid var(--bdr)' }}>
                        <td style={{ padding:'4px 6px' }}><input style={{ ...inp, padding:'5px 8px' }} placeholder="Ej. Warfarina" value={it.farmaco} onChange={e=>{const n=[...interacciones];n[i]={...n[i],farmaco:e.target.value};setInteracciones(n);}} /></td>
                        <td style={{ padding:'4px 6px' }}>
                          <select style={{ ...inp, padding:'5px 8px' }} value={it.gravedad} onChange={e=>{const n=[...interacciones];n[i]={...n[i],gravedad:e.target.value};setInteracciones(n);}}>
                            <option value="">—</option>
                            <option>Leve</option><option>Moderada</option><option>Grave</option><option>Contraindicada</option>
                          </select>
                        </td>
                        <td style={{ padding:'4px 6px' }}><input style={{ ...inp, padding:'5px 8px' }} placeholder="Ej. Aumenta efecto anticoagulante" value={it.efecto} onChange={e=>{const n=[...interacciones];n[i]={...n[i],efecto:e.target.value};setInteracciones(n);}} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={addInteraccion}
                  style={{ padding:'6px 14px', border:'1.5px solid var(--bdr)', borderRadius:8, fontSize:12.5, fontWeight:600, cursor:'pointer', background:'var(--bg2)', color:'var(--tx)' }}>
                  + Añadir interacción
                </button>
                <div style={{ marginTop:12 }}>
                  <label style={lbl}>INTERACCIONES CON ALIMENTOS / OTROS <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>OPCIONAL</span></label>
                  <textarea style={{ ...inp, minHeight:70, resize:'vertical' }}
                    placeholder="Ej. Evitar jugo de pomelo (inhibe CYP3A4). Separar 2h de antiácidos."
                    value={clin['inter_alimentos']||''} onChange={e=>setClinField('inter_alimentos',e.target.value)} />
                </div>
              </div>
            )}

            {/* PRECAUCIONES */}
            {secActivas.includes('Precauciones') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--amber,#D97706)', marginBottom:10 }}>⚠️ PRECAUCIONES</div>
                <textarea style={{ ...inp, minHeight:90, resize:'vertical' }}
                  placeholder="Ej. Monitorizar presión arterial. Precaución en pacientes con diabetes. No suspender bruscamente."
                  value={clin['precauciones']||''} onChange={e=>setClinField('precauciones',e.target.value)} />
              </div>
            )}

            {/* INDICACIONES */}
            {secActivas.includes('Indicaciones') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--green)', marginBottom:10 }}>✅ INDICACIONES</div>
                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>INDICACIONES APROBADAS (FICHA TÉCNICA)</label>
                  <textarea style={{ ...inp, minHeight:80, resize:'vertical' }}
                    placeholder="Ej. Hipertensión arterial. Angina de pecho estable."
                    value={clin['indicaciones']||''} onChange={e=>setClinField('indicaciones',e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>USO OFF-LABEL DOCUMENTADO <span style={{ fontSize:10,fontWeight:400,color:'var(--tx4)',textTransform:'none',letterSpacing:0 }}>OPCIONAL</span></label>
                  <textarea style={{ ...inp, minHeight:70, resize:'vertical' }}
                    placeholder="Ej. Profilaxis de migraña (evidencia nivel B)"
                    value={clin['off_label']||''} onChange={e=>setClinField('off_label',e.target.value)} />
                </div>
              </div>
            )}

            {/* CONTRAINDICACIONES */}
            {secActivas.includes('Contraindicaciones') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--red,#DC2626)', marginBottom:10 }}>🚫 CONTRAINDICACIONES</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  {[['ABSOLUTAS','ci_abs','Ej. Hipersensibilidad al fármaco. Embarazo.'],['RELATIVAS','ci_rel','Ej. Insuficiencia renal severa. Edad <12 años.'],['ADVERTENCIAS ESPECIALES','ci_adv','Ej. Monitorizar función renal al inicio del tratamiento.']].map(([lbl2,key,ph])=>(
                    <div key={key}>
                      <label style={lbl}>{lbl2}</label>
                      <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder={ph}
                        value={clin[key]||''} onChange={e=>setClinField(key,e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EFECTOS ADVERSOS */}
            {secActivas.includes('Efectos adversos') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--amber,#D97706)', marginBottom:10 }}>⚠️ EFECTOS ADVERSOS</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  {[['MUY FRECUENTES / FRECUENTES','>1/100','ea_frec','Ej. Cefalea, mareo, tos seca.'],['POCO FRECUENTES','1/100–1/1000','ea_poco','Ej. Hipotensión, edema periférico.'],['RAROS / MUY RAROS','<1/1000','ea_raros','Ej. Angioedema, insuficiencia renal aguda.']].map(([lbl2,freq,key,ph])=>(
                    <div key={key}>
                      <label style={{ ...lbl, display:'flex', alignItems:'center', gap:6 }}>{lbl2} <span style={{ fontSize:9,fontWeight:400,color:'var(--tx4)',textTransform:'none' }}>{freq}</span></label>
                      <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} placeholder={ph}
                        value={clin[key]||''} onChange={e=>setClinField(key,e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOSIFICACIÓN */}
            {secActivas.includes('Dosificación') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--gdp)', marginBottom:10 }}>💊 DOSIFICACIÓN</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                  {[['ADULTOS','dos_adultos','Ej. 5–10 mg/día en dosis única oral'],['PEDIÁTRICA','dos_ped','Ej. 0.1 mg/kg/día (máx. 5 mg)'],['INSUFICIENCIA RENAL','dos_renal','Ej. Reducir 50% si ClCr <30 mL/min']].map(([lbl2,key,ph])=>(
                    <div key={key}>
                      <label style={lbl}>{lbl2}</label>
                      <textarea style={{ ...inp, minHeight:75, resize:'vertical' }} placeholder={ph}
                        value={clin[key]||''} onChange={e=>setClinField(key,e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  {[['INSUFICIENCIA HEPÁTICA','dos_hepat','Ej. Usar con precaución, reducir dosis'],['ADULTOS MAYORES','dos_mayor','Ej. Iniciar con mitad de dosis'],['VÍA / FRECUENCIA / DURACIÓN','dos_via','Ej. VO, 1 vez/día, máx. 12 semanas']].map(([lbl2,key,ph])=>(
                    <div key={key}>
                      <label style={lbl}>{lbl2}</label>
                      <textarea style={{ ...inp, minHeight:75, resize:'vertical' }} placeholder={ph}
                        value={clin[key]||''} onChange={e=>setClinField(key,e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FARMACOCINÉTICA */}
            {secActivas.includes('Farmacocinética') && (
              <div style={{ border:'1.5px solid var(--bdr)', borderRadius:8, padding:16, marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--gdp)', marginBottom:10 }}>🔬 FARMACOCINÉTICA</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
                  {[['ABSORCIÓN / BIODISPONIBILIDAD','fk_abs','Ej. Biodisponibilidad oral 60–65%'],['DISTRIBUCIÓN / Vd / UNIÓN A PROTEÍNAS','fk_dist','Ej. Vd 21 L/kg. UP 97%.'],['METABOLISMO / ENZIMAS CYP','fk_met','Ej. Hepático, CYP3A4. Metabolito activo: normlodipino.']].map(([lbl2,key,ph])=>(
                    <div key={key}>
                      <label style={lbl}>{lbl2}</label>
                      <textarea style={{ ...inp, minHeight:75, resize:'vertical' }} placeholder={ph}
                        value={clin[key]||''} onChange={e=>setClinField(key,e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  {[['SEMIVIDA (t½)','fk_t12','Ej. 35–50 h'],['EXCRECIÓN','fk_exc','Ej. Renal 60%, fecal 20–25%.'],['INICIO / PICO / DURACIÓN ACCIÓN','fk_onset','Ej. Inicio 1–2h, pico 6–12h, duración 24h.']].map(([lbl2,key,ph])=>(
                    <div key={key}>
                      <label style={lbl}>{lbl2}</label>
                      <textarea style={{ ...inp, minHeight:75, resize:'vertical' }} placeholder={ph}
                        value={clin[key]||''} onChange={e=>setClinField(key,e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
