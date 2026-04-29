'use client';

interface Props {
  data: Record<string, string>;
}

function buildPaquete(base: string, units: string, envase: string, vol: string, volUnit: string): string {
  const volStr = vol ? `${vol} ${volUnit || 'mL'}` : '';
  if (volStr && envase) return `${base}, ${envase} ${volStr}`;
  if (volStr) return `${base}, ${volStr}`;
  if (units && envase) return `${base}, ${envase} ${units}`;
  if (units) return `${base} ${units} unidades`;
  return '';
}

export default function SPMSTable({ data }: Props) {
  const vtm = data.vtm?.trim() || '';
  const conc = data.conc?.trim() || '';
  const ff = data.ff?.split('(')[0].trim() || '';
  const lab = data.laboratorio?.trim() || '';
  const nombre = data.nombre?.trim() || '';
  const units = data.units?.trim() || '';
  const envase = data.envase?.trim() || '';
  const vol = data.vol?.trim() || '';
  const volUnit = data.volUnit?.trim() || 'mL';

  const vmp = vtm && ff && conc ? `${vtm} ${conc} ${ff}` : '';
  const amp = vmp && lab
    ? (nombre ? `${nombre} ${conc} ${ff} (${lab})` : `${vmp} (${lab})`)
    : '';
  const vmpp = vmp ? buildPaquete(vmp, units, envase, vol, volUnit) : '';
  const ampp = amp ? buildPaquete(amp, units, envase, vol, volUnit) : '';

  if (!vtm && !vmp) return null;

  const rows = [
    { nivel: 'VTM', desc: 'Entidad Terapéutica Virtual', valor: vtm, color: 'bg-purple-600', snomed: data.snomed_vtm_code },
    { nivel: 'VMP', desc: 'Medicamento Virtual', valor: vmp, color: 'bg-blue-600', snomed: '' },
    { nivel: 'VMPP', desc: 'Presentación Virtual', valor: vmpp, color: 'bg-cyan-600', snomed: '' },
    { nivel: 'AMP', desc: 'Medicamento Real', valor: amp, color: 'bg-green-600', snomed: '' },
    { nivel: 'AMPP', desc: 'Presentación Real', valor: ampp, color: 'bg-emerald-600', snomed: '' },
  ];

  return (
    <div className="col-span-2 mt-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Jerarquía SPMS generada automáticamente
      </p>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#2d6a2d] text-white">
              <th className="px-3 py-2 text-left font-mono tracking-widest w-24">NIVEL</th>
              <th className="px-3 py-2 text-left">VALOR GENERADO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.nivel} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 align-top">
                  <span className={`inline-block font-mono text-xs font-bold text-white px-2 py-0.5 rounded ${row.color}`}>
                    {row.nivel}
                  </span>
                  <div className="text-gray-400 text-xs mt-1 leading-tight">{row.desc}</div>
                  {row.snomed && (
                    <div className="text-purple-500 font-mono text-xs mt-1">{row.snomed}</div>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  {row.valor
                    ? <span className="font-medium text-gray-800">{row.valor}</span>
                    : <span className="text-gray-300 italic">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
