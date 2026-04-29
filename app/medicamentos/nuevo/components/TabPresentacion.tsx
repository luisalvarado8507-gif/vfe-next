'use client';

const ENVASES = ['frasco', 'caja', 'blíster', 'tubo', 'frasco ampolla', 'ampolla', 'bolsa', 'sobre', 'vial', 'dispositivo', 'jeringa prellenada'];
const VOL_UNITS = ['mL', 'L', 'g', 'mg', 'mcg', 'UI', '%'];

export default function TabPresentacion({ data, onChange }: { data: Record<string, string>; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Presentación comercial</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Nombre comercial (AMP)
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Tenormin 50 mg comprimidos" value={data.nombre || ''}
            onChange={e => onChange('nombre', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Unidades por envase
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 30" type="number" value={data.units || ''}
            onChange={e => onChange('units', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Unidad de presentación
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. comprimidos" value={data.upres || ''}
            onChange={e => onChange('upres', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Tipo de envase
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.envase || ''} onChange={e => onChange('envase', e.target.value)}>
            <option value="">— Selecciona —</option>
            {ENVASES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Volumen total
          </label>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Ej. 100" type="number" value={data.vol || ''}
              onChange={e => onChange('vol', e.target.value)} />
            <select className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              value={data.volUnit || 'mL'} onChange={e => onChange('volUnit', e.target.value)}>
              {VOL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            GTIN / EAN / Código de barras
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 7861234567897" maxLength={14} value={data.gtin || ''}
            onChange={e => onChange('gtin', e.target.value.replace(/\D/g, ''))} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            PMC — Precio máximo al consumidor (USD)
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 4.50" type="number" step="0.01" value={data.pmc || ''}
            onChange={e => onChange('pmc', e.target.value)} />
        </div>
      </div>

      {/* Precios por farmacia */}
      <div>
        <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 py-2 rounded-r-lg mb-4">
          <h3 className="font-semibold text-blue-700 text-sm">Precios por farmacia (USD)</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Fybeca', 'Medicity', 'Cruz Azul', 'Pharmacys', 'Sana Sana', 'Edifarm'].map(farm => (
            <div key={farm}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{farm}</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
                placeholder="0.00" type="number" step="0.01"
                value={data[`precio_${farm.toLowerCase().replace(/ /g,'_')}`] || ''}
                onChange={e => onChange(`precio_${farm.toLowerCase().replace(/ /g,'_')}`, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* ISO 11238 */}
      <div>
        <div className="border-l-4 border-purple-400 pl-4 bg-purple-50 py-2 rounded-r-lg mb-4">
          <h3 className="font-semibold text-purple-700 text-sm">ISO 11238 — Forma química</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Forma química</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Ej. Base, Sal, Éster..." value={data.iso11238Forma || ''}
              onChange={e => onChange('iso11238Forma', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado físico</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              value={data.iso11238Estado || ''} onChange={e => onChange('iso11238Estado', e.target.value)}>
              <option value="">— Selecciona —</option>
              <option>Sólido</option>
              <option>Líquido</option>
              <option>Gas</option>
              <option>Semisólido</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
