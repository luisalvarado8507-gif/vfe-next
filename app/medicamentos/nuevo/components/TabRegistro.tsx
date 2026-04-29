'use client';

const RS_TIPOS = ['Nuevo', 'Renovación', 'Modificación', 'Homologación', 'Sanitario', 'Fitosanitario'];
const RS_ESTADOS = ['Vigente', 'Suspendido', 'Retirado', 'Cancelado', 'Vencido'];
const RS_CONDICIONES = ['Venta libre (OTC)', 'Bajo receta médica', 'Bajo receta retenida', 'Uso hospitalario', 'Uso veterinario'];
const PAISES = ['Ecuador', 'Colombia', 'Perú', 'Argentina', 'Brasil', 'México', 'España', 'Alemania', 'Francia', 'Italia', 'Estados Unidos', 'India', 'China'];

export default function TabRegistro({ data, onChange }: { data: Record<string, string>; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Registro Sanitario ARCSA — ISO 11615</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            N° Registro Sanitario <span className="text-red-500">*</span>
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 4282-MEE-0618" value={data.rs || ''}
            onChange={e => onChange('rs', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de RS</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.rsTipo || ''} onChange={e => onChange('rsTipo', e.target.value)}>
            <option value="">— Selecciona —</option>
            {RS_TIPOS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado del RS</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Estado || ''} onChange={e => onChange('iso11615Estado', e.target.value)}>
            <option value="">— Selecciona —</option>
            {RS_ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha de autorización</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Fecha || ''} onChange={e => onChange('iso11615Fecha', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha de vencimiento</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Venc || ''} onChange={e => onChange('iso11615Venc', e.target.value)} />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Titular del registro</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Nombre del titular" value={data.iso11615Titular || ''}
            onChange={e => onChange('iso11615Titular', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Condición de venta</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.rsCondicion || ''} onChange={e => onChange('rsCondicion', e.target.value)}>
            <option value="">— Selecciona —</option>
            {RS_CONDICIONES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">País de autorización</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Pais || 'Ecuador'} onChange={e => onChange('iso11615Pais', e.target.value)}>
            {PAISES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">N° Procedimiento</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="N° de procedimiento ARCSA" value={data.iso11615Proc || ''}
            onChange={e => onChange('iso11615Proc', e.target.value)} />
        </div>
      </div>

      {/* Fabricante */}
      <div>
        <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 py-2 rounded-r-lg mb-4">
          <h3 className="font-semibold text-orange-700 text-sm">Fabricante e importador</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fabricante</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Nombre del fabricante" value={data.rsFabricante || ''}
              onChange={e => onChange('rsFabricante', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">País de fabricación</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              value={data.rsPaisFab || ''} onChange={e => onChange('rsPaisFab', e.target.value)}>
              <option value="">— Selecciona —</option>
              {PAISES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Importador</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Nombre del importador" value={data.rsImportador || ''}
              onChange={e => onChange('rsImportador', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Observaciones del RS</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-y min-h-16"
              placeholder="Observaciones adicionales del registro sanitario..." value={data.rsObs || ''}
              onChange={e => onChange('rsObs', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ISO 11616 PhPID */}
      <div>
        <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 py-2 rounded-r-lg mb-4">
          <h3 className="font-semibold text-purple-700 text-sm">ISO 11616 — PhPID (Pharmaceutical Product Identifier)</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Nivel 1</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
              placeholder="phpid-l1" value={data.phpidL1 || ''}
              onChange={e => onChange('phpidL1', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Nivel 2</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
              placeholder="phpid-l2" value={data.phpidL2 || ''}
              onChange={e => onChange('phpidL2', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Nivel 3</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
              placeholder="phpid-l3" value={data.phpidL3 || ''}
              onChange={e => onChange('phpidL3', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Código</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
              placeholder="phpid" value={data.phpid || ''}
              onChange={e => onChange('phpid', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">CNMB — Código</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Código CNMB" value={data.cnmbCodigo || ''}
              onChange={e => onChange('cnmbCodigo', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Concentración UCUM</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Ej. 50 mg/1" value={data.concUcum || ''}
              onChange={e => onChange('concUcum', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}
