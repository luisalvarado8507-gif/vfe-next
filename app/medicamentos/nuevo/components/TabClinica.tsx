'use client';
import { useState } from 'react';

const CSECS = [
  { key: 'generalidades', label: 'Generalidades', icon: '📖' },
  { key: 'rolMedicamento', label: 'Rol del medicamento', icon: '🎯' },
  { key: 'embarazoLactancia', label: 'Embarazo y lactancia', icon: '🤰' },
  { key: 'interacciones', label: 'Interacciones', icon: '⚡' },
  { key: 'precauciones', label: 'Precauciones', icon: '⚠️' },
  { key: 'indicaciones', label: 'Indicaciones', icon: '✅' },
  { key: 'contraindicaciones', label: 'Contraindicaciones', icon: '🚫' },
  { key: 'efectosAdversos', label: 'Efectos adversos', icon: '⛔' },
  { key: 'dosificacion', label: 'Dosificación', icon: '💊' },
  { key: 'farmacocinetica', label: 'Farmacocinética', icon: '🔬' },
];

const VIAS = ['oral', 'parenteral', 'inhalada', 'tópica', 'sublingual', 'rectal', 'vaginal', 'oftálmica', 'ótica', 'nasal', 'transdérmica'];

export default function TabClinica({ data, onChange }: { data: Record<string, string>; onChange: (f: string, v: string) => void }) {
  const [secAbierta, setSecAbierta] = useState<string | null>('generalidades');

  const vias = data.vias ? data.vias.split(',').map(v => v.trim()).filter(Boolean) : [];

  const toggleVia = (via: string) => {
    const nuevas = vias.includes(via) ? vias.filter(v => v !== via) : [...vias, via];
    onChange('vias', nuevas.join(', '));
  };

  const getClinField = (key: string) => {
    try {
      const clinData = data.clinData ? JSON.parse(data.clinData) : {};
      return clinData[key] || '';
    } catch { return ''; }
  };

  const setClinField = (key: string, value: string) => {
    try {
      const clinData = data.clinData ? JSON.parse(data.clinData) : {};
      clinData[key] = value;
      onChange('clinData', JSON.stringify(clinData));
    } catch {
      onChange('clinData', JSON.stringify({ [key]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-[#2d6a2d] pl-4 bg-green-50 py-2 rounded-r-lg">
        <h3 className="font-semibold text-[#2d6a2d] text-sm">Datos clínicos</h3>
      </div>

      {/* Vías de administración */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Vías de administración
        </label>
        <div className="flex flex-wrap gap-2">
          {VIAS.map(via => (
            <button key={via} type="button"
              onClick={() => toggleVia(via)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                vias.includes(via)
                  ? 'bg-[#2d6a2d] text-white border-[#2d6a2d]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
              }`}>
              {via}
            </button>
          ))}
        </div>
      </div>

      {/* Dosificación especial */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dosis adulto</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 50 mg cada 12h" value={getClinField('dosAdulto')}
            onChange={e => setClinField('dosAdulto', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dosis pediátrica</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ej. 1 mg/kg/día" value={getClinField('dosPediatrico')}
            onChange={e => setClinField('dosPediatrico', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ajuste renal</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ajuste en insuficiencia renal" value={getClinField('dosRenal')}
            onChange={e => setClinField('dosRenal', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ajuste hepático</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d]"
            placeholder="Ajuste en insuficiencia hepática" value={getClinField('dosHepatico')}
            onChange={e => setClinField('dosHepatico', e.target.value)} />
        </div>
      </div>

      {/* Secciones clínicas expandibles */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Secciones clínicas</p>
        {CSECS.map(sec => (
          <div key={sec.key} className="border border-gray-200 rounded-lg overflow-hidden">
            <button type="button"
              onClick={() => setSecAbierta(secAbierta === sec.key ? null : sec.key)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition">
              <span>{sec.icon}</span>
              <span className="text-sm font-medium text-gray-700">{sec.label}</span>
              <span className="ml-auto text-gray-400 text-xs">{secAbierta === sec.key ? '▲' : '▼'}</span>
              {getClinField(sec.key) && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓</span>
              )}
            </button>
            {secAbierta === sec.key && (
              <div className="px-4 pb-3 border-t border-gray-100">
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2d6a2d] mt-2 min-h-24 resize-y"
                  placeholder={`Texto de ${sec.label}...`}
                  value={getClinField(sec.key)}
                  onChange={e => setClinField(sec.key, e.target.value)} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
