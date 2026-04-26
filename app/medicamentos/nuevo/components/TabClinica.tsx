'use client';
import { useState } from 'react';

interface Props {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const SECCIONES = [
  'Generalidades', 'Indicaciones', 'Dosificación', 'Contraindicaciones',
  'Efectos adversos', 'Interacciones', 'Embarazo y lactancia',
  'Precauciones', 'Farmacocinética', 'Rol del medicamento'
];

export default function TabClinica({ data, onChange }: Props) {
  const [activas, setActivas] = useState<string[]>([]);

  const toggle = (s: string) => {
    setActivas(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Secciones clínicas — selecciona las que aplican</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECCIONES.map(s => (
          <button key={s} onClick={() => toggle(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              activas.includes(s)
                ? 'bg-[#2d6a2d] text-white border-[#2d6a2d]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {activas.map(s => (
        <div key={s} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-[#2d6a2d] uppercase tracking-wide mb-3">{s}</h4>

          {s === 'Dosificación' && (
            <div className="grid grid-cols-2 gap-3">
              {[['cf_dos_adulto','Adultos'],['cf_dos_pediatrico','Pediátrica'],
                ['cf_dos_renal','Insuf. renal'],['cf_dos_hepatico','Insuf. hepática'],
                ['cf_dos_geriatrico','Adultos mayores'],['cf_dos_via','Vía / Frecuencia']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
                    value={data[k] || ''} onChange={e => onChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {s === 'Farmacocinética' && (
            <div className="grid grid-cols-2 gap-3">
              {[['cf_fk_absorcion','Absorción / Biodisponibilidad'],
                ['cf_fk_distribucion','Distribución / Vd'],
                ['cf_fk_metabolismo','Metabolismo / CYP'],
                ['cf_fk_t12','Semivida (t½)'],
                ['cf_fk_excrecion','Excreción'],
                ['cf_fk_onset','Inicio / Pico / Duración']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
                    value={data[k] || ''} onChange={e => onChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {s === 'Efectos adversos' && (
            <div className="grid grid-cols-3 gap-3">
              {[['cf_ea_frecuentes','Muy frecuentes / Frecuentes (>1/100)'],
                ['cf_ea_pf','Poco frecuentes (1/100–1/1000)'],
                ['cf_ea_raros','Raros / Muy raros (<1/1000)']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
                    value={data[k] || ''} onChange={e => onChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {s === 'Contraindicaciones' && (
            <div className="grid grid-cols-3 gap-3">
              {[['cf_ci_absolutas','Absolutas'],
                ['cf_ci_relativas','Relativas'],
                ['cf_ci_advertencias','Advertencias especiales']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
                    value={data[k] || ''} onChange={e => onChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {s === 'Embarazo y lactancia' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoría FDA/EMA</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
                  value={data.cf_emb_cat || ''} onChange={e => onChange('cf_emb_cat', e.target.value)}>
                  <option value="">— Selecciona —</option>
                  <option>Categoría A</option><option>Categoría B</option>
                  <option>Categoría C</option><option>Categoría D</option><option>Categoría X</option>
                </select>
              </div>
              {[['cf_emb_embarazo','Embarazo'],['cf_emb_lactancia','Lactancia']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
                    value={data[k] || ''} onChange={e => onChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {s === 'Indicaciones' && (
            <div className="space-y-3">
              {[['cf_ind_aprobadas','Indicaciones aprobadas (ficha técnica)'],
                ['cf_ind_offlabel','Uso off-label documentado (opcional)']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
                    value={data[k] || ''} onChange={e => onChange(k, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {!['Dosificación','Farmacocinética','Efectos adversos','Contraindicaciones','Embarazo y lactancia','Indicaciones'].includes(s) && (
            <textarea rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] resize-none"
              placeholder={`${s}...`}
              value={data[`cf_${s.replace(/\s/g,'_').toLowerCase()}`] || ''}
              onChange={e => onChange(`cf_${s.replace(/\s/g,'_').toLowerCase()}`, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );
}
