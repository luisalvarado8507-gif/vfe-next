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
  { group: 'Sólidos orales', items: [
    ['comprimido', 'Comprimido (Tablet)'],
    ['comprimido recubierto con película', 'Comprimido recubierto con película (Film-coated tablet)'],
    ['comprimido de liberación prolongada', 'Comprimido de liberación prolongada'],
    ['comprimido masticable', 'Comprimido masticable (Chewable tablet)'],
    ['comprimido dispersable', 'Comprimido dispersable'],
    ['comprimido sublingual', 'Comprimido sublingual'],
  ]},
  { group: 'Cápsulas', items: [
    ['cápsula dura', 'Cápsula dura (Hard capsule)'],
    ['cápsula blanda', 'Cápsula blanda (Soft capsule)'],
    ['cápsula gastrorresistente', 'Cápsula gastrorresistente'],
    ['cápsula de liberación prolongada', 'Cápsula de liberación prolongada'],
  ]},
  { group: 'Líquidos orales', items: [
    ['solución oral', 'Solución oral (Oral solution)'],
    ['suspensión oral', 'Suspensión oral'],
    ['jarabe', 'Jarabe (Syrup)'],
    ['gotas orales, solución', 'Gotas orales, solución'],
    ['granulado para solución oral', 'Granulado para solución oral'],
    ['polvo para suspensión oral', 'Polvo para suspensión oral'],
  ]},
  { group: 'Parenterales', items: [
    ['solución inyectable', 'Solución inyectable (Solution for injection)'],
    ['polvo para solución inyectable', 'Polvo para solución inyectable'],
    ['suspensión inyectable', 'Suspensión inyectable'],
    ['solución para perfusión', 'Solución para perfusión IV'],
    ['concentrado para solución para perfusión', 'Concentrado para solución para perfusión'],
  ]},
  { group: 'Inhalados', items: [
    ['solución para inhalación en envase a presión', 'Inhalador presurizado — solución'],
    ['suspensión para inhalación en envase a presión', 'Inhalador presurizado — suspensión'],
    ['polvo para inhalación', 'Polvo para inhalación (DPI)'],
    ['solución para nebulización', 'Solución para nebulización'],
  ]},
  { group: 'Tópicos', items: [
    ['crema', 'Crema (Cream)'],
    ['pomada', 'Pomada (Ointment)'],
    ['gel', 'Gel'],
    ['loción', 'Loción (Lotion)'],
    ['parche transdérmico', 'Parche transdérmico'],
  ]},
  { group: 'Oftálmicos / Óticos / Nasales', items: [
    ['colirio en solución', 'Colirio, solución (Eye drops)'],
    ['colirio en suspensión', 'Colirio, suspensión'],
    ['gotas óticas, solución', 'Gotas óticas, solución'],
    ['spray nasal, solución', 'Spray nasal, solución'],
  ]},
  { group: 'Rectales / Vaginales', items: [
    ['supositorio', 'Supositorio (Suppository)'],
    ['óvulo vaginal', 'Óvulo vaginal (Pessary)'],
    ['crema vaginal', 'Crema vaginal'],
  ]},
];

interface ComboPA {
  vtm: string;
  conc: string;
  concUnit: string;
}

export default function NuevoMedicamentoForm() {
  const { getToken, isEditor } = useAuth();
  const router = useRouter();

  // Tipo principio activo
  const [tipoPA, setTipoPA] = useState<'mono' | 'combo'>('mono');
  const [comboPAs, setComboPAs] = useState<ComboPA[]>([
    { vtm: '', conc: '', concUnit: 'mg' },
    { vtm: '', conc: '', concUnit: 'mg' },
  ]);

  // Campos principales
  const [vtm, setVtm] = useState('');
  const [conc, setConc] = useState('');
  const [concUnit, setConcUnit] = useState('mg');
  const [lab, setLab] = useState('');
  const [ff, setFf] = useState('');
  const [vias, setVias] = useState<string[]>([]);
  const [generico, setGenerico] = useState('');
  const [cnmb, setCnmb] = useState('');
  const [chapId, setChapId] = useState('');
  const [subId, setSubId] = useState('');
  const [atc, setAtc] = useState('');
  const [cumCodigo, setCumCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [units, setUnits] = useState('');
  const [envase, setEnvase] = useState('');
  const [rs, setRs] = useState('');
  const [estado, setEstado] = useState('pendiente');

  // SNOMED
  const [snomedVTM, setSnomedVTM] = useState<{code: string; term: string} | null>(null);
  const [snomedFF, setSnomedFF] = useState<{code: string; term: string} | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vtm) setSnomedVTM(getSnomedVTM(vtm));
    else setSnomedVTM(null);
  }, [vtm]);

  useEffect(() => {
    if (ff) setSnomedFF(getSnomedFF(ff));
    else setSnomedFF(null);
  }, [ff]);

  // Generar nombres SPMS
  const getVTMLabel = () => {
    if (tipoPA === 'mono') return vtm;
    return comboPAs.filter(p => p.vtm).map(p => p.vtm).join(' + ');
  };

  const getConcLabel = () => {
    if (tipoPA === 'mono') return conc ? `${conc} ${concUnit}` : '';
    return comboPAs.filter(p => p.vtm).map(p => p.conc ? `${p.conc} ${p.concUnit}` : '').join(' + ');
  };

  const ffShort = ff.split('(')[0].trim();
  const vtmLabel = getVTMLabel();
  const concLabel = getConcLabel();
  const vmpLabel = vtmLabel && ff && concLabel ? `${vtmLabel} ${concLabel} ${ffShort}` : '';
  const ampLabel = vmpLabel && lab ? (nombre ? `${nombre} ${concLabel} ${ffShort} (${lab})` : `${vmpLabel} (${lab})`) : '';
  const vmppLabel = vmpLabel && units && envase ? `${vmpLabel}, ${envase} ${units}` : vmpLabel && units ? `${vmpLabel} ${units} unidades` : '';
  const amppLabel = ampLabel && units && envase ? `${ampLabel}, ${envase} ${units}` : '';

  const toggleVia = (via: string) => {
    setVias(prev => prev.includes(via) ? prev.filter(v => v !== via) : [...prev, via]);
  };

  const handleGuardar = async () => {
    if (!vtmLabel || !lab || !ff || !concLabel) {
      setError('Completa los campos obligatorios: principio activo, laboratorio, forma farmacéutica y concentración');
      return;
    }
    if (!isEditor) { setError('No tienes permisos de editor'); return; }
    setSaving(true);
    setError('');
    try {
      const token = await getToken();
      const data = {
        vtm: vtmLabel,
        laboratorio: lab,
        ff, conc: concLabel, generico, cnmb, chapId, subId, atc, cumCodigo,
        nombre, units, envase, rs, estado,
        vias: vias.join(', '),
        vmp: vmpLabel, amp: ampLabel, vmpp: vmppLabel, ampp: amppLabel,
        snomed_vtm_code: snomedVTM?.code || '',
        snomed_ff_code: snomedFF?.code || '',
        esCombo: tipoPA === 'combo',
        comboData: tipoPA === 'combo' ? { pas: comboPAs } : null,
      };
      const res = await fetch('/api/medicamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.ok) router.push('/medicamentos');
      else setError(result.error || 'Error al guardar');
    } catch { setError('Error de conexión'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ fontFamily: 'var(--sans, sans-serif)', color: 'var(--tx, #0F2008)' }}>

      {/* TIPO PA */}
      <div className="mb-5">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tx3, #7BAD6E)' }}>
          TIPO DE PRINCIPIO ACTIVO <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {(['mono', 'combo'] as const).map(t => (
            <label key={t}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer text-sm font-semibold transition-all"
              style={{
                background: tipoPA === t ? 'var(--green, #3DDB18)' : 'transparent',
                color: tipoPA === t ? '#fff' : 'var(--tx2, #3A5C30)',
                border: `1.5px solid ${tipoPA === t ? 'var(--green, #3DDB18)' : 'var(--bdr, #D0ECC6)'}`,
              }}>
              <input type="radio" name="tipo-pa" value={t} checked={tipoPA === t}
                onChange={() => setTipoPA(t)} className="hidden" />
              {t === 'mono' ? 'Monocomponente' : 'Combinación'}
            </label>
          ))}
        </div>
        {tipoPA === 'combo' && (
          <p className="text-xs mt-1" style={{ color: 'var(--tx3)' }}>
            Selecciona &quot;Combinación&quot; para medicamentos con 2 o más principios activos (ej. Enalapril + Hidroclorotiazida)
          </p>
        )}
      </div>

      {/* MONOCOMPONENTE */}
      {tipoPA === 'mono' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
              PRINCIPIO ACTIVO / DCI <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
              placeholder="Ej. paracetamol, atenolol..."
              value={vtm}
              onChange={e => setVtm(e.target.value.toLowerCase())}
            />
            {snomedVTM && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: '#ede9fe', color: '#7c3aed' }}>VTM {snomedVTM.code}</span>
                <span className="text-xs" style={{ color: 'var(--tx3)' }}>— {snomedVTM.term}</span>
              </div>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'var(--tx4)' }}>Escribe en minúscula (INN/DCI). El sistema completará ATC y SNOMED automáticamente.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
              CONCENTRACIÓN / DOSIS <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
                placeholder="Ej. 10"
                value={conc}
                onChange={e => setConc(e.target.value)}
              />
              <select
                className="rounded-lg px-2 py-2.5 text-sm outline-none"
                style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)', width: '110px' }}
                value={concUnit}
                onChange={e => setConcUnit(e.target.value)}>
                {UCUM_UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--tx4)' }}>ISO 11240 · UCUM — usa punto decimal (Ej: 2.5 no 2,5)</p>
          </div>
        </div>
      )}

      {/* COMBINACIÓN */}
      {tipoPA === 'combo' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--tx3)' }}>
              PRINCIPIOS ACTIVOS <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1">
              {[2, 3, 4].map(n => (
                <button key={n} type="button"
                  onClick={() => {
                    const newPAs = Array.from({ length: n }, (_, i) => comboPAs[i] || { vtm: '', conc: '', concUnit: 'mg' });
                    setComboPAs(newPAs);
                  }}
                  className="px-2 py-0.5 text-xs rounded"
                  style={{
                    border: '1px solid var(--bdr)',
                    background: comboPAs.length === n ? 'var(--green)' : 'var(--bg2)',
                    color: comboPAs.length === n ? '#fff' : 'var(--tx)',
                  }}>
                  {n} PA
                </button>
              ))}
            </div>
          </div>
          {comboPAs.map((pa, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs mb-0.5 block" style={{ color: 'var(--tx3)' }}>PA {i + 1}</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
                  placeholder={`Principio activo ${i + 1}`}
                  value={pa.vtm}
                  onChange={e => {
                    const newPAs = [...comboPAs];
                    newPAs[i] = { ...newPAs[i], vtm: e.target.value.toLowerCase() };
                    setComboPAs(newPAs);
                  }}
                />
              </div>
              <div className="flex gap-1">
                <input
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
                  placeholder="Dosis"
                  value={pa.conc}
                  onChange={e => {
                    const newPAs = [...comboPAs];
                    newPAs[i] = { ...newPAs[i], conc: e.target.value };
                    setComboPAs(newPAs);
                  }}
                />
                <select
                  className="rounded-lg px-2 py-2 text-sm outline-none"
                  style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)', width: '90px' }}
                  value={pa.concUnit}
                  onChange={e => {
                    const newPAs = [...comboPAs];
                    newPAs[i] = { ...newPAs[i], concUnit: e.target.value };
                    setComboPAs(newPAs);
                  }}>
                  {UCUM_UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LABORATORIO + FORMA FARMACÉUTICA */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
            LABORATORIO / FABRICANTE <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            placeholder="Ej. AstraZeneca"
            value={lab}
            onChange={e => setLab(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
            FORMA FARMACÉUTICA <span className="text-red-500">*</span>
            <span className="ml-1 font-normal normal-case" style={{ color: 'var(--tx4)' }}>EDQM · ISO 11239</span>
          </label>
          <select
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            value={ff}
            onChange={e => setFf(e.target.value)}>
            <option value="">— Selecciona forma farmacéutica (EDQM) —</option>
            {FF_OPTIONS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {snomedFF && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: '#dbeafe', color: '#2563eb' }}>
                SNOMED CT {snomedFF.code}
              </span>
              <span className="text-xs" style={{ color: 'var(--tx3)' }}>— {snomedFF.term}</span>
            </div>
          )}
        </div>
      </div>

      {/* VÍAS DE ADMINISTRACIÓN */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--tx3)' }}>
          VÍA DE ADMINISTRACIÓN <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg" style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg)' }}>
          {VIAS.map(v => (
            <label key={v.value}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer text-xs font-medium transition-all"
              style={{
                border: `1px solid ${vias.includes(v.value) ? 'var(--green)' : 'var(--bdr)'}`,
                background: vias.includes(v.value) ? 'rgba(61,219,24,.1)' : 'transparent',
                color: vias.includes(v.value) ? 'var(--gdp)' : 'var(--tx)',
              }}>
              <input type="checkbox" className="hidden"
                checked={vias.includes(v.value)}
                onChange={() => toggleVia(v.value)} />
              {v.label}
            </label>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--tx4)' }}>Puedes seleccionar una o más vías</p>
      </div>

      {/* GENÉRICO + CNMB */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
            GENÉRICO <span className="text-red-500">*</span>
          </label>
          <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            value={generico} onChange={e => setGenerico(e.target.value)}>
            <option value="">— Selecciona —</option>
            <option value="Sí">Sí — Medicamento genérico</option>
            <option value="No">No — Medicamento de marca</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
            CNMB <span className="text-xs font-normal normal-case" style={{ color: 'var(--tx4)' }}>Cuadro Nacional de Medicamentos Básicos</span>
          </label>
          <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            value={cnmb} onChange={e => setCnmb(e.target.value)}>
            <option value="">— Selecciona —</option>
            <option value="Sí">Sí — Pertenece al CNMB</option>
            <option value="No">No — No pertenece al CNMB</option>
          </select>
        </div>
      </div>

      {/* TABLA SPMS */}
      <div className="mb-4 rounded-lg overflow-hidden" style={{ border: '1.5px dashed var(--bdr2)', background: 'var(--bg3)' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bdr)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--gdp)' }}>Clasificación estructural automática</span>
          <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: 'var(--green)', color: '#fff' }}>AUTO-GENERADO</span>
        </div>
        <div className="px-4 py-2 text-xs" style={{ color: 'var(--tx3)', borderBottom: '1px solid var(--bdr)' }}>
          Generado automáticamente al ingresar principio activo, concentración, forma farmacéutica y laboratorio
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: 'var(--gdp)', color: '#fff' }}>
              <th className="px-3 py-2 text-left font-mono tracking-widest" style={{ width: '130px' }}>NIVEL</th>
              <th className="px-3 py-2 text-left">EJEMPLO GENERADO</th>
            </tr>
          </thead>
          <tbody>
            {[
              { nivel: 'VTM', desc: 'Entidad Terapéutica Virtual', valor: vtmLabel, snomed: snomedVTM?.code, color: '#7c3aed' },
              { nivel: 'VMP', desc: 'Producto Medicinal Virtual', valor: vmpLabel, color: '#2563eb' },
              { nivel: 'AMP', desc: 'Producto Medicinal Real (marca)', valor: ampLabel, hint: !ampLabel ? 'Requiere nombre comercial y laboratorio' : '', color: '#16a34a' },
              { nivel: 'VMPP', desc: 'Paquete Medicinal Virtual', valor: vmppLabel, hint: !vmppLabel ? 'Requiere unidades y tipo de envase' : '', color: '#0891b2' },
              { nivel: 'AMPP', desc: 'Paquete Medicinal Real', valor: amppLabel, hint: !amppLabel ? 'Requiere nombre comercial, unidades y envase' : '', color: '#059669' },
            ].map((row, i) => (
              <tr key={row.nivel} style={{ background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)', borderBottom: '1px solid var(--bdr)' }}>
                <td className="px-3 py-2 align-top">
                  <span className="inline-block font-mono text-xs font-bold text-white px-2 py-0.5 rounded" style={{ background: row.color }}>
                    {row.nivel}
                  </span>
                  <div className="mt-0.5 text-xs leading-tight" style={{ color: 'var(--tx3)' }}>{row.desc}</div>
                  {row.snomed && <div className="font-mono text-xs mt-0.5" style={{ color: '#7c3aed' }}>{row.snomed}</div>}
                </td>
                <td className="px-3 py-2 align-top">
                  {row.valor
                    ? <span className="font-medium" style={{ color: 'var(--tx)' }}>{row.valor}</span>
                    : <span className="italic" style={{ color: 'var(--tx4)' }}>{row.hint || '—'}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ATC */}
      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
          CÓDIGO ATC <span className="text-xs font-normal normal-case" style={{ color: 'var(--tx4)' }}>ATC-WHO 2025</span>
        </label>
        <AtcAutocomplete value={atc} onChange={(code) => setAtc(code)} placeholder="Ej. C07AB03 o escribe el nombre del PA..." />
        {atc && <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--purple, #7c3aed)' }}>✓ {atc}</p>}
      </div>

      {/* CAPÍTULO + SUBCAPÍTULO */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
            CAPÍTULO TERAPÉUTICO <span className="text-red-500">*</span>
          </label>
          <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            value={chapId} onChange={e => { setChapId(e.target.value); setSubId(''); }}>
            <option value="">— Selecciona capítulo —</option>
            {CHAPS.map(c => <option key={c.id} value={c.id}>{c.n}. {c.name}</option>)}
          </select>
        </div>
        {chapId && getSubcaps(chapId).length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>
              SUBCAPÍTULO
            </label>
            <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
              value={subId} onChange={e => setSubId(e.target.value)}>
              <option value="">— Selecciona subcapítulo —</option>
              {getSubcaps(chapId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* CUM + RS + ESTADO */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>CUM</label>
          <input className="w-full rounded-lg px-3 py-2.5 text-sm font-mono outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            placeholder="Código Único" value={cumCodigo} onChange={e => setCumCodigo(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>N° REGISTRO SANITARIO</label>
          <input className="w-full rounded-lg px-3 py-2.5 text-sm font-mono outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            placeholder="Ej. 4282-MEE-0618" value={rs} onChange={e => setRs(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>ESTADO</label>
          <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="pendiente">Pendiente de revisión</option>
            <option value="autorizado">Autorizado</option>
            <option value="suspendido">Suspendido</option>
            <option value="retirado">Retirado del mercado</option>
          </select>
        </div>
      </div>

      {/* NOMBRE COMERCIAL + ENVASE */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>NOMBRE COMERCIAL (AMP)</label>
          <input className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
            placeholder="Ej. Tenormin 50 mg comprimidos" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>UNIDADES</label>
            <input className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
              placeholder="30" type="number" value={units} onChange={e => setUnits(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--tx3)' }}>ENVASE</label>
            <select className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: '1.5px solid var(--bdr)', background: 'var(--bg2)' }}
              value={envase} onChange={e => setEnvase(e.target.value)}>
              <option value="">—</option>
              {['frasco', 'caja', 'blíster', 'tubo', 'ampolla', 'sobre', 'vial'].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* BOTONES */}
      <div className="flex gap-3">
        <button onClick={handleGuardar} disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'var(--green)', color: '#fff' }}>
          {saving ? 'Guardando...' : '+ Guardar medicamento'}
        </button>
        <button type="button" onClick={() => router.push('/medicamentos')}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ border: '1.5px solid var(--bdr)', color: 'var(--tx)' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
