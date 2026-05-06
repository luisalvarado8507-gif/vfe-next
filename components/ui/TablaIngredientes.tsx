'use client';
import { getEDQMDoseForm } from '@/lib/edqm';

// Roles de ingredientes según ISO 11238
export type RolIngrediente = 'active' | 'excipient' | 'adjuvant' | 'residue';

export interface Ingrediente {
  sustancia: string;           // INN/DCI
  rol: RolIngrediente;
  concentracion?: string;      // Valor numérico
  unidad?: string;             // Unidad EDQM/UCUM
  concentracionDenominador?: string;
  unidadDenominador?: string;
  snomedCode?: string;         // SNOMED CT concept ID
  snomedTerm?: string;
  referencia?: boolean;        // Concentración de referencia (ISO 11238)
}

const ROL_CONFIG: Record<RolIngrediente, { label: string; bg: string; color: string; desc: string }> = {
  active:    { label: 'Activo',      bg: '#DBEAFE', color: '#1E40AF', desc: 'Principio activo (ISO 11238 §4.2)' },
  excipient: { label: 'Excipiente',  bg: '#F1F5F9', color: '#475569', desc: 'Excipiente (ISO 11238 §4.3)' },
  adjuvant:  { label: 'Adyuvante',   bg: '#ECFDF5', color: '#065F46', desc: 'Adyuvante inmunológico' },
  residue:   { label: 'Residuo',     bg: '#FEF3C7', color: '#92400E', desc: 'Residuo de proceso' },
};

interface TablaIngredientesProps {
  ingredientes: Ingrediente[];
  editable?: boolean;
  onChange?: (ingredientes: Ingrediente[]) => void;
}

export default function TablaIngredientes({ ingredientes, editable, onChange }: TablaIngredientesProps) {
  if (!ingredientes || ingredientes.length === 0) {
    return (
      <div style={{ padding: '16px', background: 'var(--bg3)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--tx4)', textAlign: 'center' }}>
        Sin ingredientes declarados
      </div>
    );
  }

  const activos = ingredientes.filter(i => i.rol === 'active');
  const excipientes = ingredientes.filter(i => i.rol !== 'active');

  return (
    <div>
      {/* Header ISO 11238 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
          Tabla de ingredientes · ISO 11238
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
        <span style={{ fontSize: 10, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>
          {activos.length} activo{activos.length !== 1 ? 's' : ''} · {excipientes.length} excipiente{excipientes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              {['Sustancia (INN/DCI)', 'Rol', 'Concentración', 'Unidad', 'SNOMED CT', 'Ref.'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '7px 12px', fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1px solid var(--bdr)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing, i) => {
              const rc = ROL_CONFIG[ing.rol] || ROL_CONFIG.active;
              return (
                <tr key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--bdr)', background: ing.rol === 'active' ? '#FAFBFF' : '#fff' }}>
                  <td style={{ padding: '8px 12px', fontWeight: ing.rol === 'active' ? 600 : 400, color: 'var(--tx)' }}>
                    {ing.sustancia}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: rc.bg, color: rc.color }} title={rc.desc}>
                      {rc.label}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx2)' }}>
                    {ing.concentracion || '—'}
                    {ing.concentracionDenominador ? `/${ing.concentracionDenominador}` : ''}
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx3)' }}>
                    {ing.unidad || '—'}
                    {ing.unidadDenominador ? `/${ing.unidadDenominador}` : ''}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {ing.snomedCode ? (
                      <a href={`https://browser.ihtsdotools.org/?perspective=full&conceptId1=${ing.snomedCode}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#5B21B6', textDecoration: 'none', fontWeight: 600 }}>
                        {ing.snomedCode} ↗
                      </a>
                    ) : <span style={{ color: 'var(--tx4)', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    {ing.referencia ? (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }} title="Concentración de referencia ISO 11238">R</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nota ISO */}
      <div style={{ fontSize: 9, color: 'var(--tx4)', marginTop: 6, fontFamily: 'var(--mono)', textAlign: 'right' }}>
        ISO 11238 · Pharmaceutical Substances · EDQM Standard Terms
      </div>
    </div>
  );
}

// Función para convertir datos planos SIMI a Ingredientes ISO 11238
export function simiToIngredientes(med: Record<string, any>): Ingrediente[] {
  if (med.esCombo && med.comboData?.pas?.length) {
    return med.comboData.pas.map((pa: string, i: number) => ({
      sustancia: pa,
      rol: 'active' as RolIngrediente,
      concentracion: med.comboData.concs?.[i] ? String(med.comboData.concs[i]) : undefined,
      unidad: med.comboData.units?.[i] || 'mg',
      referencia: i === 0,
    }));
  }
  if (med.vtm) {
    return [{
      sustancia: med.vtm,
      rol: 'active',
      concentracion: med.conc ? med.conc.replace(/[^0-9.,]/g, '').trim() : undefined,
      unidad: med.conc ? med.conc.replace(/[0-9.,\s]/g, '').trim() || 'mg' : 'mg',
      snomedCode: med.snomed_vtm_code,
      snomedTerm: med.vtm,
      referencia: true,
    }];
  }
  return [];
}
