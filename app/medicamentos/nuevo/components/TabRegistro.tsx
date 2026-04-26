'use client';

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function TabRegistro({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* RS Ecuador */}
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Registro Sanitario Ecuador <span className="font-normal text-green-600">ARCSA / ISO 11615</span></h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">N° Registro Sanitario <span className="text-red-500">*</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. ARCSA-01-2024-123456"
            value={data.rs || ''} onChange={e => onChange('rs', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Titular del RS <span className="text-gray-400 font-normal">ISO 11615</span></label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Pfizer Ecuador S.A."
            value={data.iso11615Titular || ''} onChange={e => onChange('iso11615Titular', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de RS</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.rsTipo || ''} onChange={e => onChange('rsTipo', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>Innovador</option><option>Genérico</option>
            <option>Biotecnológico</option><option>Homeopático</option>
            <option>Natural/fitoterapéutico</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha de autorización</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Fecha || ''} onChange={e => onChange('iso11615Fecha', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha de vencimiento RS</label>
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Venc || ''} onChange={e => onChange('iso11615Venc', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado regulatorio</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Estado || ''} onChange={e => onChange('iso11615Estado', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>Autorizado</option><option>Suspendido</option>
            <option>Retirado del mercado</option><option>En revisión</option><option>Caducado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">País de autorización</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.iso11615Pais || 'Ecuador'} onChange={e => onChange('iso11615Pais', e.target.value)}>
            <option>Ecuador</option><option>Colombia</option><option>Perú</option>
            <option>Estados Unidos (FDA)</option><option>Unión Europea (EMA)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Condición de venta</label>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            value={data.rsCondicion || ''} onChange={e => onChange('rsCondicion', e.target.value)}>
            <option value="">— Selecciona —</option>
            <option>Venta libre (OTC)</option>
            <option>Bajo receta médica</option>
            <option>Bajo receta especial (psicotrópico)</option>
            <option>Uso hospitalario</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">N° Procedimiento</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. ARCSA-2024-0123"
            value={data.iso11615Proc || ''} onChange={e => onChange('iso11615Proc', e.target.value)} />
        </div>
      </div>

      {/* Fabricante */}
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Fabricante y cadena de suministro</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fabricante</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Pfizer Manufacturing Belgium"
            value={data.rsFabricante || ''} onChange={e => onChange('rsFabricante', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">País de fabricación</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Bélgica"
            value={data.rsPaisFab || ''} onChange={e => onChange('rsPaisFab', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Importador / Distribuidor</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. Representaciones Médicas Cia. Ltda."
            value={data.rsImportador || ''} onChange={e => onChange('rsImportador', e.target.value)} />
        </div>
      </div>

      {/* Códigos */}
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Códigos e identificadores</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">GTIN / EAN</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 7861234567890"
            value={data.gtin || ''} onChange={e => onChange('gtin', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Código CNMB</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 01.01.001"
            value={data.cnmbCodigo || ''} onChange={e => onChange('cnmbCodigo', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Precio máximo al consumidor (USD)</label>
          <input type="number" step="0.01" min="0"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 12.50"
            value={data.pmc || ''} onChange={e => onChange('pmc', e.target.value)} />
        </div>
      </div>

      {/* ISO 11616 */}
      <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-blue-700 text-sm">Identificador farmacéutico global <span className="font-normal text-blue-500">ISO 11616</span></h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Nivel 1 — Sustancia + Forma farmacéutica</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. amlodipino comprimido recubierto con película"
            value={data.phpidL1 || ''} onChange={e => onChange('phpidL1', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Nivel 2 — + Concentración</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. amlodipino comp. recubierto 5 mg"
            value={data.phpidL2 || ''} onChange={e => onChange('phpidL2', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">PhPID Código</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. PhPID-C08CA01-5MG-COMP"
            value={data.phpid || ''} onChange={e => onChange('phpid', e.target.value.toUpperCase())} />
        </div>
      </div>
    </div>
  );
}
