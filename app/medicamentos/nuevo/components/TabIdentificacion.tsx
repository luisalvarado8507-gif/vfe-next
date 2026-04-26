'use client';

export default function TabIdentificacion({ data, onChange }: { data: Record<string, string>; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Identificación del medicamento</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">DCI / VTM <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. atenolol" value={data.vtm || ''} onChange={e => onChange('vtm', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Laboratorio <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Pfizer" value={data.laboratorio || ''} onChange={e => onChange('laboratorio', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Concentración <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 50 mg" value={data.conc || ''} onChange={e => onChange('conc', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Forma farmacéutica EDQM / ISO 11239 <span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.ff || ''} onChange={e => onChange('ff', e.target.value)}>
            <option value="">— Selecciona forma farmacéutica (EDQM) —</option>
            <optgroup label="Sólidos orales">
              <option value="comprimido">Comprimido (Tablet)</option>
              <option value="comprimido recubierto con película">Comprimido recubierto con película (Film-coated tablet)</option>
              <option value="comprimido de liberación prolongada">Comprimido de liberación prolongada (Prolonged-release tablet)</option>
              <option value="comprimido masticable">Comprimido masticable (Chewable tablet)</option>
              <option value="comprimido dispersable">Comprimido dispersable (Dispersible tablet)</option>
              <option value="comprimido sublingual">Comprimido sublingual (Sublingual tablet)</option>
            </optgroup>
            <optgroup label="Cápsulas">
              <option value="cápsula dura">Cápsula dura (Hard capsule)</option>
              <option value="cápsula blanda">Cápsula blanda (Soft capsule)</option>
              <option value="cápsula gastrorresistente">Cápsula gastrorresistente (Gastro-resistant capsule)</option>
              <option value="cápsula de liberación prolongada">Cápsula de liberación prolongada (Prolonged-release capsule)</option>
            </optgroup>
            <optgroup label="Líquidos orales">
              <option value="solución oral">Solución oral (Oral solution)</option>
              <option value="suspensión oral">Suspensión oral (Oral suspension)</option>
              <option value="gotas orales, solución">Gotas orales, solución (Oral drops, solution)</option>
              <option value="granulado para solución oral">Granulado para solución oral (Granules for oral solution)</option>
              <option value="polvo para suspensión oral">Polvo para suspensión oral (Powder for oral suspension)</option>
            </optgroup>
            <optgroup label="Parenterales">
              <option value="solución inyectable">Solución inyectable (Solution for injection)</option>
              <option value="polvo para solución inyectable">Polvo para solución inyectable (Powder for solution for injection)</option>
              <option value="suspensión inyectable">Suspensión inyectable (Suspension for injection)</option>
              <option value="solución para perfusión">Solución para perfusión / infusión IV (Solution for infusion)</option>
            </optgroup>
            <optgroup label="Inhalados">
              <option value="solución para inhalación en envase a presión">Inhalador presurizado — solución</option>
              <option value="polvo para inhalación">Polvo para inhalación (Inhalation powder)</option>
              <option value="solución para nebulización">Solución para nebulización (Nebulisation solution)</option>
            </optgroup>
            <optgroup label="Tópicos">
              <option value="crema">Crema (Cream)</option>
              <option value="pomada">Pomada (Ointment)</option>
              <option value="gel">Gel</option>
              <option value="loción">Loción (Lotion)</option>
              <option value="parche transdérmico">Parche transdérmico (Transdermal patch)</option>
            </optgroup>
            <optgroup label="Oftálmicos / Óticos / Nasales">
              <option value="colirio en solución">Colirio, solución (Eye drops, solution)</option>
              <option value="gotas óticas, solución">Gotas óticas, solución (Ear drops, solution)</option>
              <option value="spray nasal, solución">Spray nasal, solución (Nasal spray, solution)</option>
            </optgroup>
            <optgroup label="Rectales / Vaginales">
              <option value="supositorio">Supositorio (Suppository)</option>
              <option value="óvulo vaginal">Óvulo vaginal (Pessary)</option>
              <option value="crema vaginal">Crema vaginal (Vaginal cream)</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Código ATC</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. C07AB03" value={data.atc || ''} onChange={e => onChange('atc', e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">¿Es genérico?</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.generico || ''} onChange={e => onChange('generico', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option value="Sí">Sí — Medicamento genérico</option>
            <option value="No">No — Medicamento de marca</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CNMB</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.cnmb || ''} onChange={e => onChange('cnmb', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option value="Sí">Sí — Pertenece al CNMB</option>
            <option value="No">No — No pertenece al CNMB</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado regulatorio</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.estado || 'pendiente'} onChange={e => onChange('estado', e.target.value)}>
            <option value="pendiente">Pendiente de revisión</option>
            <option value="autorizado">Autorizado</option>
            <option value="suspendido">Suspendido</option>
            <option value="retirado">Retirado del mercado</option>
          </select>
        </div>
      </div>
    </div>
  );
}
