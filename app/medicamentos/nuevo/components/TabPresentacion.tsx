'use client';

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function TabPresentacion({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Presentación y precio</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Nombre comercial
          </label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Tenormin"
            value={data.nombre || ''}
            onChange={e => onChange('nombre', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Unidades por presentación
          </label>
          <input type="number" min="1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 28"
            value={data.units || ''}
            onChange={e => onChange('units', e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Unidad de presentación <span className="text-gray-400 font-normal">ISO 11239</span>
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.upres || ''}
            onChange={e => onChange('upres', e.target.value)}>
            <option value="">— Selecciona —</option>
            <optgroup label="Sólidos orales">
              <option>comprimido</option>
              <option>cápsula</option>
              <option>gragea</option>
              <option>polvo oral</option>
            </optgroup>
            <optgroup label="Parenterales">
              <option>vial</option>
              <option>ampolla</option>
              <option>jeringa precargada</option>
              <option>bolsa IV</option>
            </optgroup>
            <optgroup label="Tópicos/otros">
              <option>tubo</option>
              <option>parche</option>
              <option>supositorio</option>
              <option>sobre</option>
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Tipo de envase
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.envase || ''}
            onChange={e => onChange('envase', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>blíster</option>
            <option>frasco</option>
            <option>tubo</option>
            <option>vial</option>
            <option>ampolla</option>
            <option>jeringa precargada</option>
            <option>inhalador</option>
            <option>sobre</option>
            <option>caja</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Volumen total del envase <span className="text-gray-400 font-normal">opcional</span>
          </label>
          <div className="flex gap-2">
            <input type="number" step="0.1" min="0"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="Ej. 150"
              value={data.vol || ''}
              onChange={e => onChange('vol', e.target.value)} />
            <select className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              value={data.volUnit || 'mL'}
              onChange={e => onChange('volUnit', e.target.value)}>
              <option>mL</option>
              <option>L</option>
              <option>g</option>
              <option>mg</option>
            </select>
          </div>
        </div>
      </div>

      {/* ISO 11238 */}
      <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-blue-700 text-sm">Forma química y estado físico <span className="font-normal text-blue-500">ISO 11238</span></h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Forma química <span className="text-gray-400 font-normal">ISO 11238</span>
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11238Forma || ''}
            onChange={e => onChange('iso11238Forma', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>sal</option>
            <option>base</option>
            <option>éster</option>
            <option>hidrato</option>
            <option>polimórfico</option>
            <option>profármaco</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Estado físico <span className="text-gray-400 font-normal">ISO 11238</span>
          </label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11238Estado || ''}
            onChange={e => onChange('iso11238Estado', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>sólido cristalino</option>
            <option>sólido amorfo</option>
            <option>líquido</option>
            <option>gas</option>
            <option>semisólido</option>
          </select>
        </div>
      </div>

      {/* Precios */}
      <div className="border-l-4 border-green-400 pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-green-700 text-sm">Precios por farmacia (USD)</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['Fybeca', 'Cruz Azul', 'Pharmacys', 'Medicity', 'Farmaprecios'].map(f => (
          <div key={f}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {f}
            </label>
            <input type="number" step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
              placeholder="0.00"
              value={data[`precio_${f}`] || ''}
              onChange={e => onChange(`precio_${f}`, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}
