'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

// ── SNOMED databases (subset) ─────────────────────────────────────────────
const SNOMED_FF: Record<string, { code: string; term: string }> = {
  'comprimido': { code: '385055001', term: 'Tablet (basic dose form)' },
  'comprimido recubierto': { code: '385057009', term: 'Coated tablet' },
  'comprimidos recubiertos': { code: '385057009', term: 'Coated tablet' },
  'comprimido recubierto con película': { code: '385057009', term: 'Film-coated tablet' },
  'comprimido de liberación prolongada': { code: '385061003', term: 'Modified-release tablet' },
  'comprimido masticable': { code: '66076007', term: 'Chewable tablet' },
  'cápsula': { code: '385049006', term: 'Capsule (basic dose form)' },
  'cápsula dura': { code: '385049006', term: 'Hard capsule' },
  'cápsula gastrorresistente': { code: '385060002', term: 'Gastro-resistant capsule' },
  'cápsula de liberación prolongada': { code: '385051005', term: 'Modified-release capsule' },
  'solución oral': { code: '385023006', term: 'Oral solution' },
  'suspensión oral': { code: '385024000', term: 'Oral suspension' },
  'solución inyectable': { code: '385219001', term: 'Solution for injection' },
  'solución para perfusión': { code: '385229001', term: 'Solution for infusion' },
  'polvo para inhalación': { code: '421606006', term: 'Inhalation powder' },
  'crema': { code: '385087005', term: 'Cream' },
  'pomada': { code: '385101003', term: 'Ointment' },
  'gel': { code: '385093007', term: 'Gel' },
  'parche transdérmico': { code: '385134005', term: 'Transdermal patch' },
  'colirio': { code: '385122005', term: 'Eye drops solution' },
  'spray nasal': { code: '385150006', term: 'Nasal spray solution' },
  'supositorio': { code: '385194003', term: 'Suppository' },
  'jarabe': { code: '385023006', term: 'Oral solution' },
};

const SNOMED_ROUTE: Record<string, { code: string; term: string }> = {
  'oral': { code: '26643006', term: 'Oral route' },
  'intravenosa': { code: '47625008', term: 'Intravenous route' },
  'intramuscular': { code: '78421000', term: 'Intramuscular route' },
  'subcutánea': { code: '34206005', term: 'Subcutaneous route' },
  'inhalatoria': { code: '372268001', term: 'Inhalation route' },
  'tópica': { code: '6064005', term: 'Topical route' },
  'transdérmica': { code: '45890007', term: 'Transdermal route' },
  'sublingual': { code: '37839007', term: 'Sublingual route' },
  'rectal': { code: '37161004', term: 'Rectal route' },
  'oftálmica': { code: '54485002', term: 'Ophthalmic route' },
  'nasal': { code: '46713006', term: 'Nasal route' },
};

function getSnomedFF(ff: string) { return SNOMED_FF[(ff || '').toLowerCase().trim()] || null; }
function getSnomedRoute(v: string) { return SNOMED_ROUTE[(v || '').toLowerCase().trim()] || null; }

// ── Chip de SNOMED ────────────────────────────────────────────────────────
function SnomedChip({ label, code, term, color }: { label: string; code: string; term: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 20,
      background: color + '18', border: `1.5px solid ${color}55`,
      fontSize: 11, fontWeight: 700, color, fontFamily: 'monospace',
      cursor: 'default'
    }} title={term}>
      ● {code} <span style={{ fontWeight: 400, color: '#666', fontFamily: 'sans-serif' }}>{label}</span>
    </span>
  );
}

// ── Campo de la grilla ────────────────────────────────────────────────────
function Mdf({ label, value, full, children, mono }: {
  label: string; value?: string; full?: boolean; children?: React.ReactNode; mono?: boolean
}) {
  if (!value && !children) return null;
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 10,
      padding: '10px 14px', gridColumn: full ? '1 / -1' : undefined,
      display: 'flex', flexDirection: 'column', gap: 4
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}>
        {label}
      </div>
      {value && (
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a1a', fontFamily: mono ? 'monospace' : undefined }}>
          {value}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
  const colors: Record<string, { bg: string; tx: string }> = {
    green: { bg: '#dcfce7', tx: '#166534' },
    yellow: { bg: '#fef9c3', tx: '#854d0e' },
    red: { bg: '#fee2e2', tx: '#991b1b' },
    orange: { bg: '#ffedd5', tx: '#9a3412' },
    gray: { bg: '#f3f4f6', tx: '#374151' },
    blue: { bg: '#dbeafe', tx: '#1e40af' },
    purple: { bg: '#ede9fe', tx: '#5b21b6' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.tx, display: 'inline-block'
    }}>{text}</span>
  );
}

function estadoBadge(estado: string) {
  if (estado === 'autorizado') return <Badge text="autorizado" color="green" />;
  if (estado === 'suspendido') return <Badge text="suspendido" color="yellow" />;
  if (estado === 'retirado') return <Badge text="retirado" color="red" />;
  if (estado === 'arcsa_pendiente') return <Badge text="arcsa_pendiente" color="orange" />;
  return <Badge text={estado || 'pendiente'} color="gray" />;
}

// ═════════════════════════════════════════════════════════════════════════
export default function MedicamentoDetalle() {
  const { id } = useParams();
  const [med, setMed] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`/api/medicamentos/${id}`);
        const data = await res.json();
        if (data.medicamento) setMed(data.medicamento);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7aaa6a' }}>Cargando medicamento...</p>
      </main>
    </div>
  );

  if (error || !med) return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#999' }}>Medicamento no encontrado</p>
        <Link href="/medicamentos" style={{ color: '#2d6a2d', fontSize: 13 }}>← Volver a la lista</Link>
      </main>
    </div>
  );

  // ── Preparar datos ────────────────────────────────────────────────────
  const esCombo = med.esCombo || (med.vtm && med.vtm.includes(' + '));
  const vias: string[] = Array.isArray(med.vias) ? med.vias : med.via ? [med.via] : [];
  const sFF = getSnomedFF(med.ff || '');
  const sVias = vias.map(v => getSnomedRoute(v)).filter(Boolean) as { code: string; term: string }[];
  const clinData: Record<string, string> = med.clinData || {};
  const clinKeys = Object.keys(clinData);

  // Combo PAs
  const comboDisplay = esCombo && med.comboData?.pas
    ? med.comboData.pas.map((pa: string, i: number) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', background: '#f0fdf4',
          border: '1.5px solid #86efac', borderRadius: 20,
          fontSize: 12, fontWeight: 600
        }}>
          {pa}
          {med.comboData.concs?.[i] && (
            <span style={{ color: '#3DDB18', fontFamily: 'monospace', fontSize: 11 }}>
              {med.comboData.concs[i]}
            </span>
          )}
        </span>
      ))
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 280, padding: '24px 28px', maxWidth: 1200 }}>

        {/* ── Breadcrumb ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Link href="/medicamentos" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', background: '#fff', border: '1.5px solid #D0ECC6',
            borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#3a5c30', textDecoration: 'none'
          }}>
            🏠 Inicio
          </Link>
          <span style={{ color: '#aaa', fontSize: 13 }}>›</span>
          <span style={{ fontSize: 13, color: '#3a5c30', fontWeight: 600 }}>
            {med.amp || med.nombre || med.vtm}
          </span>
          <Link href={`/medicamentos/${id}/editar`} style={{
            marginLeft: 'auto', padding: '6px 14px',
            background: '#3DDB18', color: '#fff', borderRadius: 8,
            fontSize: 12, fontWeight: 700, textDecoration: 'none'
          }}>
            ✏ Editar
          </Link>
        </div>

        {/* ── Header ── */}
        <div style={{
          background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 14,
          padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'flex-start', gap: 14
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
            background: esCombo ? '#ede9fe' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
          }}>
            {esCombo ? '⊕' : '🌿'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a3a1a' }}>
              {med.amp || med.nombre || med.vtm || '—'}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 3 }}>
              {med.vtm || '—'} · {med.conc || ''}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {estadoBadge(med.estado)}
              {esCombo && <Badge text="⊕ COMBINACIÓN" color="purple" />}
              {med.ff && <Badge text={med.ff} color="gray" />}
              {vias.map((v, i) => <Badge key={i} text={v} color="blue" />)}
              {med.generico === 'Sí' && <Badge text="Genérico" color="green" />}
              {med.generico !== 'Sí' && <Badge text="Marca" color="gray" />}
              {med.cnmb === 'Sí' && <Badge text="CNMB" color="green" />}
            </div>
          </div>
        </div>

        {/* ── Grilla principal ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>

          {/* VTM */}
          <Mdf label={esCombo ? 'VTM — PRINCIPIOS ACTIVOS (COMBINACIÓN)' : 'VTM — PRINCIPIO ACTIVO'} full={esCombo}>
            {esCombo && comboDisplay
              ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>{comboDisplay}</div>
              : <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a1a' }}>{med.vtm || '—'}</div>
            }
          </Mdf>

          <Mdf label="VMP — PRODUCTO VIRTUAL" value={med.vmp || '—'} />
          <Mdf label="AMP — PRODUCTO REAL" value={med.amp || '—'} />
          <Mdf label="VMPP — PAQUETE VIRTUAL" value={med.vmpp || '—'} />
          <Mdf label="AMPP — PAQUETE REAL" value={med.ampp || '—'} />
          <Mdf label="LABORATORIO" value={med.laboratorio || '—'} />

          {/* Forma farmacéutica con SNOMED */}
          <Mdf label="FORMA FARMACÉUTICA">
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a1a' }}>{med.ff || '—'}</div>
            {sFF && (
              <div style={{ marginTop: 4 }}>
                <SnomedChip label="FF" code={sFF.code} term={sFF.term} color="#2563eb" />
                <span style={{ fontSize: 10, color: '#888', marginLeft: 6, fontFamily: 'monospace' }}>{sFF.term}</span>
              </div>
            )}
          </Mdf>

          {/* Vías con SNOMED */}
          <Mdf label="VÍA(S) DE ADMINISTRACIÓN">
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a1a' }}>{vias.join(' / ') || '—'}</div>
            {sVias.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                {sVias.map((sv, i) => sv && (
                  <SnomedChip key={i} label={vias[i] || 'Vía'} code={sv.code} term={sv.term} color="#0d9488" />
                ))}
              </div>
            )}
          </Mdf>

          <Mdf label="CNMB" value={med.cnmb || '—'} />

          <Mdf label="CÓDIGO ATC" value={med.atc || '—'} mono />
          <Mdf label="DESCRIPCIÓN ATC" value={med.atclbl || '—'} full />

          <Mdf label="REGISTRO SANITARIO" value={med.rs || '—'} mono />
          <Mdf label="UNIDADES / ENVASE" value={med.units ? `${med.units} ${med.envase || ''}`.trim() : '—'} />

          {med.pp && (
            <Mdf label="PRECIO REFERENCIAL (MEDIANA)">
              <div style={{ fontSize: 18, fontWeight: 800, color: '#3DDB18' }}>
                $ {parseFloat(med.pp).toFixed(2)}
              </div>
            </Mdf>
          )}
          {med.pu && <Mdf label="PRECIO UNITARIO" value={`$ ${parseFloat(med.pu).toFixed(2)}`} />}
          {med.rango && <Mdf label="RANGO DE PRECIOS" value={med.rango} />}
        </div>

        {/* ── Precios por farmacia ── */}
        {med.farmPrices && Object.keys(med.farmPrices).length > 0 && (
          <div style={{
            background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 10,
            padding: '10px 14px', marginBottom: 16
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1, fontFamily: 'monospace', marginBottom: 8 }}>
              PRECIOS POR FARMACIA
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(med.farmPrices).map(([k, v]: [string, any]) => {
                const isRef = k.toLowerCase() === 'farmaprecios';
                return (
                  <span key={k} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', background: isRef ? '#f9fafb' : '#f0fdf4',
                    border: `1.5px solid ${isRef ? '#e5e7eb' : '#86efac'}`,
                    borderRadius: 20, fontSize: 12, opacity: isRef ? 0.75 : 1
                  }}>
                    <span style={{ fontWeight: 600, color: '#666', textTransform: 'uppercase', fontSize: 10, fontFamily: 'monospace' }}>
                      {k}{isRef ? ' ⟲' : ''}
                    </span>
                    <span style={{ color: isRef ? '#666' : '#3DDB18', fontWeight: 700 }}>
                      ${parseFloat(v).toFixed(2)}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Registro Sanitario extendido ── */}
        {(med.rs || med.rsTitular || med.rsFabricante) && (
          <div style={{
            background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 14,
            padding: '14px 18px', marginBottom: 16
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3DDB18', marginBottom: 10 }}>
              📋 Registro Sanitario
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {med.rs && <Mdf label="N° REGISTRO SANITARIO" value={med.rs} mono />}
              {med.rsTitular && <Mdf label="TITULAR" value={med.rsTitular} />}
              {med.rsTipo && <Mdf label="TIPO DE RS" value={med.rsTipo} />}
              {med.rsFecha && <Mdf label="FECHA AUTORIZACIÓN" value={med.rsFecha} />}
              {med.rsVence && <Mdf label="FECHA VENCIMIENTO" value={med.rsVence} />}
              {med.rsCondicion && <Mdf label="CONDICIÓN DE VENTA" value={med.rsCondicion} />}
              {med.rsFabricante && <Mdf label="FABRICANTE" value={med.rsFabricante} />}
              {med.rsPaisFab && <Mdf label="PAÍS FABRICACIÓN" value={med.rsPaisFab} />}
              {med.rsImportador && <Mdf label="IMPORTADOR" value={med.rsImportador} />}
              {med.pmc && <Mdf label="PMC (USD)" value={`$ ${med.pmc}`} />}
              {med.gtin && <Mdf label="GTIN / EAN" value={med.gtin} mono />}
            </div>
          </div>
        )}

        {/* ── ISO 11616 PhPID ── */}
        {(med.phpid || med.phpidL1) && (
          <div style={{
            background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 14,
            padding: '14px 18px', marginBottom: 16
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3DDB18', marginBottom: 10 }}>
              🔬 ISO 11616 — PhPID
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {med.phpidL1 && <Mdf label="PhPID NIVEL 1" value={med.phpidL1} mono />}
              {med.phpidL2 && <Mdf label="PhPID NIVEL 2" value={med.phpidL2} mono />}
              {med.phpidL3 && <Mdf label="PhPID NIVEL 3" value={med.phpidL3} mono />}
              {med.phpid && <Mdf label="PhPID CÓDIGO" value={med.phpid} mono />}
            </div>
          </div>
        )}

        {/* ── Secciones clínicas ── */}
        {clinKeys.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {clinKeys.map(k => (
              <div key={k} style={{
                background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 12,
                padding: '14px 18px'
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#7aaa6a',
                  letterSpacing: 1, fontFamily: 'monospace', marginBottom: 8
                }}>
                  {k.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {clinData[k]}
                </div>
              </div>
            ))}
          </div>
        )}

        {clinKeys.length === 0 && (
          <p style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', marginTop: 8 }}>
            Sin secciones clínicas. Edita para añadir.
          </p>
        )}

        {/* ── Botones ── */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Link href={`/medicamentos/${id}/editar`} style={{
            background: '#3DDB18', color: '#fff', padding: '8px 18px',
            borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none'
          }}>
            ✏ Editar medicamento
          </Link>
          <Link href="/medicamentos" style={{
            background: '#fff', color: '#555', padding: '8px 18px',
            border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 13,
            fontWeight: 600, textDecoration: 'none'
          }}>
            ← Volver a la lista
          </Link>
        </div>

      </main>
    </div>
  );
}
