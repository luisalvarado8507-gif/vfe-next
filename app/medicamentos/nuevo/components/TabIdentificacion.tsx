'use client';
import { useEffect, useState } from 'react';
import { CAPITULOS } from '@/lib/capitulos';
import AtcAutocomplete from '@/components/ui/AtcAutocomplete';
import { getSnomedVTM, getSnomedFF } from '@/lib/snomed-db';

export default function TabIdentificacion({ data, onChange }: { data: Record<string, string>; onChange: (f: string, v: string) => void }) {
  const [snomedVTM, setSnomedVTM] = useState<{code: string; term: string} | null>(null);
  const [snomedFF, setSnomedFF] = useState<{code: string; term: string} | null>(null);

  useEffect(() => {
    if (data.vtm) {
      const s = getSnomedVTM(data.vtm);
      setSnomedVTM(s);
      if (s) { onChange('snomed_vtm_code', s.code); onChange('snomed_vtm_term', s.term); }
    }
  }, [data.vtm]);

  useEffect(() => {
    if (data.ff) { setSnomedFF(getSnomedFF(data.ff)); }
    if (data.vtm && data.ff && data.conc) {
      onChange('vmp', data.vtm + ' ' + data.conc + ' ' + data.ff.split('(')[0].trim());
    }
  }, [data.ff, data.vtm, data.conc]);

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Identificacion del medicamento</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">DCI / VTM <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. atenolol" value={data.vtm || ''}
            onChange={e => onChange('vtm', e.target.value.toLowerCase())} />
          {snomedVTM && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">VTM</span>
              <span className="text-xs font-mono text-purple-600">{snomedVTM.code}</span>
              <span className="text-xs text-purple-500">— {snomedVTM.term}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Laboratorio <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Pfizer" value={data.laboratorio || ''}
            onChange={e => onChange('laboratorio', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Concentracion <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 50 mg" value={data.conc || ''}
            onChange={e => onChange('conc', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Forma farmaceutica <span className="text-red-500">*</span>
            <span className="ml-1 text-purple-500 font-normal normal-case">EDQM / ISO 11239</span>
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.ff || ''} onChange={e => onChange('ff', e.target.value)}>
            <option value="">— Selecciona forma farmaceutica (EDQM) —</option>
            <optgroup label="Solidos orales">
              <option value="comprimido">Comprimido (Tablet)</option>
              <option value="comprimido recubierto con pelicula">Comprimido recubierto con pelicula (Film-coated tablet)</option>
              <option value="comprimido de liberacion prolongada">Comprimido de liberacion prolongada (Prolonged-release tablet)</option>
              <option value="comprimido masticable">Comprimido masticable (Chewable tablet)</option>
              <option value="comprimido dispersable">Comprimido dispersable (Dispersible tablet)</option>
              <option value="comprimido sublingual">Comprimido sublingual (Sublingual tablet)</option>
            </optgroup>
            <optgroup label="Capsulas">
              <option value="capsula dura">Capsula dura (Hard capsule)</option>
              <option value="capsula blanda">Capsula blanda (Soft capsule)</option>
              <option value="capsula gastrorresistente">Capsula gastrorresistente (Gastro-resistant capsule)</option>
              <option value="capsula de liberacion prolongada">Capsula de liberacion prolongada (Prolonged-release capsule)</option>
            </optgroup>
            <optgroup label="Liquidos orales">
              <option value="solucion oral">Solucion oral (Oral solution)</option>
              <option value="suspension oral">Suspension oral (Oral suspension)</option>
              <option value="gotas orales, solucion">Gotas orales, solucion (Oral drops, solution)</option>
              <option value="granulado para solucion oral">Granulado para solucion oral</option>
              <option value="polvo para suspension oral">Polvo para suspension oral</option>
            </optgroup>
            <optgroup label="Parenterales">
              <option value="solucion inyectable">Solucion inyectable (Solution for injection)</option>
              <option value="polvo para solucion inyectable">Polvo para solucion inyectable</option>
              <option value="suspension inyectable">Suspension inyectable</option>
              <option value="solucion para perfusion">Solucion para perfusion IV</option>
            </optgroup>
            <optgroup label="Inhalados">
              <option value="solucion para inhalacion en envase a presion">Inhalador presurizado</option>
              <option value="polvo para inhalacion">Polvo para inhalacion</option>
              <option value="solucion para nebulizacion">Solucion para nebulizacion</option>
            </optgroup>
            <optgroup label="Topicos">
              <option value="crema">Crema (Cream)</option>
              <option value="pomada">Pomada (Ointment)</option>
              <option value="gel">Gel</option>
              <option value="locion">Locion (Lotion)</option>
              <option value="parche transdermico">Parche transdermico (Transdermal patch)</option>
            </optgroup>
            <optgroup label="Oftalmicos / Oticos / Nasales">
              <option value="colirio en solucion">Colirio, solucion (Eye drops, solution)</option>
              <option value="gotas oticas, solucion">Gotas oticas, solucion</option>
              <option value="spray nasal, solucion">Spray nasal, solucion</option>
            </optgroup>
            <optgroup label="Rectales / Vaginales">
              <option value="supositorio">Supositorio (Suppository)</option>
              <option value="ovulo vaginal">Ovulo vaginal (Pessary)</option>
              <option value="crema vaginal">Crema vaginal</option>
            </optgroup>
          </select>
          {snomedFF && (
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">FF</span>
              <span className="text-xs font-mono text-blue-600">{snomedFF.code}</span>
              <span className="text-xs text-blue-500">— {snomedFF.term}</span>
            </div>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Codigo ATC
            <span className="ml-1 text-green-600 font-normal normal-case">— escribe codigo o nombre del principio activo</span>
          </label>
          <AtcAutocomplete value={data.atc || ''} onChange={(code) => onChange('atc', code)} placeholder="Ej. C07AB03 o atenolol..." />
          {data.atc && <p className="text-xs text-purple-600 mt-1 font-mono">✓ {data.atc}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CUM — Codigo Unico de Medicamentos</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 20132640" value={data.cumCodigo || ''} onChange={e => onChange('cumCodigo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Capitulo terapeutico <span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.chapId || ''} onChange={e => onChange('chapId', e.target.value)}>
            <option value="">— Selecciona capitulo —</option>
            {CAPITULOS.map(cap => (
              <option key={cap.id} value={cap.id}>{cap.id.replace('c','')}. {cap.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Es generico?</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.generico || ''} onChange={e => onChange('generico', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option value="Si">Si — Medicamento generico</option>
            <option value="No">No — Medicamento de marca</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CNMB</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.cnmb || ''} onChange={e => onChange('cnmb', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option value="Si">Si — Pertenece al CNMB</option>
            <option value="No">No — No pertenece al CNMB</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado regulatorio</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.estado || 'pendiente'} onChange={e => onChange('estado', e.target.value)}>
            <option value="pendiente">Pendiente de revision</option>
            <option value="autorizado">Autorizado</option>
            <option value="suspendido">Suspendido</option>
            <option value="retirado">Retirado del mercado</option>
          </select>
        </div>
      </div>
    </div>
  );
}
