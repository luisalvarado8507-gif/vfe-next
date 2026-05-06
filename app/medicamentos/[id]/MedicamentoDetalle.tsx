'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CHAPS } from '@/lib/capitulos-tree';
import { getEDQMDoseForm, getEDQMRoute } from '@/lib/edqm';
import TablaIngredientes, { simiToIngredientes } from '@/components/ui/TablaIngredientes';
import AtcHierarchy from '@/components/ui/AtcHierarchy';
import RxNormLookup from '@/components/ui/RxNormLookup';
import SNOMEDValidator from '@/components/ui/SNOMEDValidator';
import EMASPORLookup from '@/components/ui/EMASPORLookup';
import Sidebar from '@/components/layout/Sidebar';

// ── SNOMED databases ──────────────────────────────────────────────────────
const SNOMED_FF: Record<string, { code: string; term: string }> = {
  'comprimido': { code: '385055001', term: 'Tablet' },
  'comprimido recubierto': { code: '385057009', term: 'Coated tablet' },
  'comprimidos recubiertos': { code: '385057009', term: 'Coated tablet' },
  'comprimido recubierto con película': { code: '385057009', term: 'Film-coated tablet' },
  'comprimido de liberación prolongada': { code: '385061003', term: 'Modified-release tablet' },
  'comprimido masticable': { code: '66076007', term: 'Chewable tablet' },
  'cápsula': { code: '385049006', term: 'Capsule' },
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

// ── Componentes ───────────────────────────────────────────────────────────
function SnomedChip({ label, code, term, type }: { label: string; code: string; term: string; type: 'vtm' | 'ff' | 'route' }) {
  const styles = {
    vtm:   { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    ff:    { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    route: { bg: '#CCFBF1', color: '#0F766E', border: '#5EEAD4' },
  };
  const s = styles[type];
  return (
    <span title={term} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', cursor: 'default' }}>
      ● {code} <span style={{ fontWeight: 400, fontFamily: 'var(--sans)', fontSize: 11 }}>{label}</span>
    </span>
  );
}

function Field({ label, value, full, mono, children }: { label: string; value?: string; full?: boolean; mono?: boolean; children?: React.ReactNode }) {
  if (!value && !children) return null;
  return (
    <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px', gridColumn: full ? '1 / -1' : undefined }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      {value && <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', fontFamily: mono ? 'var(--mono)' : undefined }}>{value}</div>}
      {children}
    </div>
  );
}

function Badge({ text, type }: { text: string; type: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    autorizado:      { bg: 'var(--estado-autorizado-bg)',  color: 'var(--estado-autorizado)' },
    arcsa_pendiente: { bg: 'var(--estado-pendiente-bg)',   color: 'var(--estado-pendiente)' },
    suspendido:      { bg: 'var(--estado-suspendido-bg)',  color: 'var(--estado-suspendido)' },
    retirado:        { bg: 'var(--estado-retirado-bg)',    color: 'var(--estado-retirado)' },
    combo:           { bg: 'var(--purple-bg)',             color: 'var(--purple)' },
    generico:        { bg: 'var(--blue-bg)',               color: 'var(--blue)' },
    marca:           { bg: 'var(--bg3)',                   color: 'var(--tx3)' },
    cnmb:            { bg: 'var(--estado-autorizado-bg)',  color: 'var(--estado-autorizado)' },
    ff:              { bg: 'var(--bg3)',                   color: 'var(--tx2)' },
    via:             { bg: '#E0F2FE',                      color: '#0369A1' },
  };
  const s = styles[type] || { bg: 'var(--bg3)', color: 'var(--tx3)' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {text}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════
interface MedicamentoDetalleProps {
  id?: string;
  initialData?: Record<string, any> | null;
}
export default function MedicamentoDetalle({ id: propId, initialData }: MedicamentoDetalleProps = {}) {
  const { id } = useParams();
  const [med, setMed] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState(0);
  const [versiones, setVersiones] = useState<Record<string, any>[]>([]);
  const [sporData, setSporData] = useState<Record<string, any> | null>(null);
  const [loadingSpor, setLoadingSpor] = useState(false);
  const [loadingVer, setLoadingVer] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`/api/medicamentos/${id}`);
        const data = await res.json();
        if (data.medicamento) setMed(data.medicamento);
        else setError(true);
      } catch { setError(true); }
      finally { setLoading(false); }
    };
    cargar();
  }, [id]);

  useEffect(() => {
    if (tab !== 5 || !id) return;
    const cargarSpor = async () => {
      setLoadingSpor(true);
      try {
        const res = await fetch(`/api/spor?id=${id}`);
        const data = await res.json();
        setSporData(data);
      } catch(e) { console.error(e); }
      finally { setLoadingSpor(false); }
    };
    cargarSpor();
  }, [tab, id]);

  useEffect(() => {
    if (tab !== 4 || !id) return;
    const cargarVersiones = async () => {
      setLoadingVer(true);
      try {
        const res = await fetch(`/api/medicamentos/${id}/versiones`);
        const data = await res.json();
        setVersiones(data.versiones || []);
      } catch(e) { console.error(e); }
      finally { setLoadingVer(false); }
    };
    cargarVersiones();
  }, [tab, id]);

  useEffect(() => {
    if (tab !== 4 || !id) return;
    const cargarVersiones = async () => {
      setLoadingVer(true);
      try {
        const res = await fetch(`/api/medicamentos/${id}/versiones`);
        const data = await res.json();
        setVersiones(data.versiones || []);
      } catch(e) { console.error(e); }
      finally { setLoadingVer(false); }
    };
    cargarVersiones();
  }, [tab, id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'var(--tx3)', fontSize: 13 }}>Cargando medicamento...</p>
      </main>
    </div>
  );

  if (error || !med) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 40 }}>💊</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>Medicamento no encontrado</p>
        <Link href="/medicamentos" style={{ color: 'var(--green)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>← Volver a la lista</Link>
      </main>
    </div>
  );

  // Datos procesados
  const esCombo = med.esCombo || (med.vtm && med.vtm.includes(' + '));
  const vias: string[] = Array.isArray(med.vias) ? med.vias : med.via ? [med.via] : (typeof med.vias === 'string' && med.vias ? med.vias.split(', ') : []);
  const sFF = getSnomedFF(med.ff || '');
  const sVias = vias.map(v => getSnomedRoute(v)).filter(Boolean) as { code: string; term: string }[];
  const clinData: Record<string, string> = med.clinData || {};
  const clinKeys = Object.keys(clinData);

  const tabs = [
    { label: 'Identificación', icon: '◉' },
    { label: 'Presentación',   icon: '⊞' },
    { label: 'Registro',       icon: '⊟' },
    { label: 'Clínica',        icon: '⚕' },
    { label: 'Historial',      icon: '⟳' },
    { label: 'SPOR/IDMP',      icon: '⊕' },
  ];

  const hasRegistro = med.rs || med.rsTitular || med.rsFabricante || med.phpid;
  const hasPresentacion = med.vmp || med.vmpp || med.amp || med.ampp || med.units || med.farmPrices;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* ── CABECERA DARK ── */}
        <div style={{ background: 'var(--green-dark, #1B4332)', padding: '20px 32px 0', flexShrink: 0 }}>

          {/* Breadcrumb semántico con ATC y capítulo */}
          {(() => {
            const cap = med.chapId ? CHAPS.find(c => c.id === med.chapId) : null;
            const atcL1 = med.atc ? med.atc[0]?.toUpperCase() : null;
            const atcL2 = med.atc?.length >= 3 ? med.atc.substring(0, 3).toUpperCase() : null;
            const crumbs = [
              { label: 'SIMI', href: '/dashboard', icon: '⌂' },
              { label: 'Base de datos', href: '/medicamentos', icon: null },
              ...(cap ? [{ label: `${cap.n}. ${cap.name}`, href: `/capitulos/${cap.id}`, icon: null, atc: atcL1 }] : []),
              ...(atcL2 && med.atclbl ? [{ label: med.atclbl, href: `/medicamentos?q=${atcL2}&tipo=atc`, icon: null, atc: atcL2 }] : []),
              { label: med.vtm, href: null, icon: null, atc: med.atc || null, current: true },
            ];
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
                {crumbs.map((crumb, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {i > 0 && <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 11 }}>›</span>}
                    {crumb.href && !crumb.current ? (
                      <Link href={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'color .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.85)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}>
                        {crumb.icon && <span>{crumb.icon}</span>}
                        <span>{crumb.label}</span>
                        {crumb.atc && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', letterSpacing: 0.5 }}>{crumb.atc}</span>}
                      </Link>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: crumb.current ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.5)', fontWeight: crumb.current ? 600 : 400, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {crumb.label}
                        {crumb.current && crumb.atc && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)', letterSpacing: 0.5 }}>{crumb.atc}</span>}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Nombre e info principal */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
            {/* Icono */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: esCombo ? 'rgba(109,40,217,.3)' : 'rgba(116,198,157,.2)', border: `1.5px solid ${esCombo ? 'rgba(109,40,217,.4)' : 'rgba(116,198,157,.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {esCombo ? '⊕' : '💊'}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 4 }}>
                {med.amp || med.nombre || med.vtm || '—'}
              </h1>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>
                {med.vtm || '—'}{med.conc ? ` · ${med.conc}` : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <Badge text={med.estado || 'pendiente'} type={med.estado || 'pendiente'} />
                {esCombo && <Badge text="⊕ Combinación" type="combo" />}
                {med.ff && <Badge text={med.ff} type="ff" />}
                {vias.map((v, i) => <Badge key={i} text={v} type="via" />)}
                {med.generico === 'Sí' ? <Badge text="Genérico" type="generico" /> : <Badge text="Marca" type="marca" />}
                {med.cnmb === 'Sí' && <Badge text="CNMB" type="cnmb" />}
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Link href={`/medicamentos/${id}/editar`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}>
                ✏ Editar
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: tab === i ? 600 : 400, fontFamily: 'var(--sans)',
                color: tab === i ? '#fff' : 'rgba(255,255,255,.5)',
                borderBottom: `2px solid ${tab === i ? 'var(--green-light, #74C69D)' : 'transparent'}`,
                transition: 'all .15s',
              }}
                onMouseEnter={e => { if (tab !== i) e.currentTarget.style.color = 'rgba(255,255,255,.8)'; }}
                onMouseLeave={e => { if (tab !== i) e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENIDO TABS ── */}
        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>

          {/* TAB 0: IDENTIFICACIÓN */}
          {tab === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>

              {/* VTM */}
              <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px', gridColumn: esCombo ? '1 / -1' : undefined }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>
                  VTM — {esCombo ? 'Principios activos (combinación)' : 'Principio activo'}
                </div>
                {esCombo && med.comboData?.pas ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    {med.comboData.pas.map((pa: string, i: number) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'var(--bg3)', border: '1.5px solid var(--bdr2)', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {pa}
                        {med.comboData.concs?.[i] && <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 11 }}>{med.comboData.concs[i]}</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 4 }}>{med.vtm || '—'}</div>
                )}
                {/* SNOMED VTM */}
                {sFF && !esCombo && <SNOMEDValidator conceptId={sFF.code} term={sFF.term} type="vtm" />}
                {/* Tabla de ingredientes ISO 11238 */}
                <div style={{ marginTop: 16 }}>
                  <TablaIngredientes ingredientes={simiToIngredientes(med)} />
                </div>

                {/* RxNorm FDA */}
                {med.vtm && <RxNormLookup inn={med.vtm} />}
                {/* EMA SPOR + G-SRS */}
                {med.vtm && <EMASPORLookup inn={med.vtm} />}
              </div>

              <Field label="VMP — Producto virtual" value={med.vmp || '—'} />
              <Field label="AMP — Producto real" value={med.amp || '—'} />
              <Field label="Laboratorio / Fabricante" value={med.laboratorio || '—'} />
              <Field label="Concentración / Dosis" value={med.conc || '—'} mono />

              {/* FF con EDQM Standard Terms */}
              {(() => {
                const edqmFF = getEDQMDoseForm(med.ff || '');
                if (!edqmFF) return null;
                return (
                  <a href={`https://standardterms.edqm.eu/standardterms/TermsList`}
                    target="_blank" rel="noreferrer"
                    title={`EDQM Standard Terms: ${edqmFF.term} (${edqmFF.code}) · ${edqmFF.isoStandard}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7', textDecoration: 'none', marginTop: 4 }}>
                    EDQM {edqmFF.code} · {edqmFF.term}
                    <span style={{ fontSize: 9, opacity: 0.7 }}>{edqmFF.isoStandard}</span>
                    <span style={{ fontSize: 10, opacity: 0.6 }}>↗</span>
                  </a>
                );
              })()}
              {/* FF con SNOMED */}
              <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>Forma farmacéutica</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 6 }}>{med.ff || '—'}</div>
                {sFF && <SNOMEDValidator conceptId={sFF.code} term={sFF.term} type="ff" />}
              </div>

              {/* Vías con SNOMED */}
              <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>Vía(s) de administración</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 6 }}>{vias.join(' / ') || '—'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {sVias.map((sv, i) => sv && <SnomedChip key={i} label={vias[i] || 'Vía'} code={sv.code} term={sv.term} type="route" />)}
                </div>
              </div>

              {/* ATC Jerarquía completa */}
              <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px', gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 8 }}>
                  Código ATC — Clasificación WHO
                </div>
                <AtcHierarchy code={med.atc || ''} label={med.atclbl || ''} />
              </div>
              <Field label="CNMB" value={med.cnmb || '—'} />
              <Field label="Genérico" value={med.generico || '—'} />

              {/* Precio */}
              {med.pp && (
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>Precio referencial (mediana)</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green, #2D6A4F)' }}>$ {parseFloat(med.pp).toFixed(2)}</div>
                  {med.pu && <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 4 }}>Precio unitario: $ {parseFloat(med.pu).toFixed(2)}</div>}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PRESENTACIÓN */}
          {tab === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <Field label="VMP — Producto virtual" value={med.vmp || '—'} full />
              <Field label="VMPP — Paquete virtual" value={med.vmpp || '—'} />
              <Field label="AMP — Producto real" value={med.amp || '—'} />
              <Field label="AMPP — Paquete real" value={med.ampp || '—'} />
              <Field label="Unidades por presentación" value={med.units ? `${med.units} ${med.envase || ''}`.trim() : '—'} />
              <Field label="Tipo de envase" value={med.envase || '—'} />
              {med.rango && <Field label="Rango de precios" value={med.rango} full />}

              {/* Precios por farmacia */}
              {med.farmPrices && Object.keys(med.farmPrices).length > 0 && (
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '10px 14px', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 8 }}>Precios por farmacia</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(med.farmPrices).map(([k, v]: [string, any]) => {
                      const isRef = k.toLowerCase() === 'farmaprecios';
                      return (
                        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: isRef ? 'var(--bg3)' : 'var(--estado-autorizado-bg)', border: `1.5px solid ${isRef ? 'var(--bdr)' : 'var(--bdr2)'}`, borderRadius: 20, fontSize: 12, opacity: isRef ? 0.7 : 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', fontSize: 10, fontFamily: 'var(--mono)' }}>{k}{isRef ? ' ⟲' : ''}</span>
                          <span style={{ color: isRef ? 'var(--tx3)' : 'var(--green)', fontWeight: 700 }}>$ {parseFloat(v).toFixed(2)}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTRO */}
          {tab === 2 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                <Field label="N° Registro sanitario" value={med.rs || '—'} mono />
                <Field label="Titular" value={med.rsTitular || '—'} />
                <Field label="Tipo de RS" value={med.rsTipo || '—'} />
                <Field label="Fecha autorización" value={med.rsFecha || '—'} />
                <Field label="Fecha vencimiento" value={med.rsVence || '—'} />
                <Field label="Condición de venta" value={med.rsCondicion || '—'} />
                <Field label="Fabricante" value={med.rsFabricante || '—'} />
                <Field label="País de fabricación" value={med.rsPaisFab || '—'} />
                <Field label="Importador" value={med.rsImportador || '—'} />
                <Field label="PMC (USD)" value={med.pmc ? `$ ${med.pmc}` : '—'} />
                <Field label="GTIN / EAN" value={med.gtin || '—'} mono />
              </div>

              {/* ISO 11616 PhPID */}
              {(med.phpid || med.phpidL1) && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 10, marginTop: 4 }}>
                    ISO 11616 — PhPID
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {med.phpidL1 && <Field label="PhPID nivel 1" value={med.phpidL1} mono />}
                    {med.phpidL2 && <Field label="PhPID nivel 2" value={med.phpidL2} mono />}
                    {med.phpidL3 && <Field label="PhPID nivel 3" value={med.phpidL3} mono />}
                    {med.phpid && <Field label="PhPID código" value={med.phpid} mono />}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: CLÍNICA */}
          {tab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {clinKeys.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tx4)', background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>⚕</div>
                  <div style={{ fontWeight: 600, color: 'var(--tx3)' }}>Sin información clínica</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Edita el medicamento para añadir secciones clínicas</div>
                  <Link href={`/medicamentos/${id}/editar`} style={{ display: 'inline-block', marginTop: 14, padding: '7px 16px', background: 'var(--green)', color: '#fff', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    ✏ Editar medicamento
                  </Link>
                </div>
              ) : clinKeys.map(k => (
                <div key={k} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', background: 'var(--bg3)', borderBottom: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx2)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>{k}</span>
                    <Link href={`/medicamentos/${id}/editar`} style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>✏ Editar</Link>
                  </div>
                  <div style={{ padding: '14px 16px', fontSize: 13, color: 'var(--tx)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{clinData[k]}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: HISTORIAL DE VERSIONES */}
          {tab === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                  Historial de versiones regulatorias
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
                <span style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>
                  v{med.version || 1} actual
                </span>
              </div>
              {loadingVer ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--tx4)' }}>Cargando historial...</div>
              ) : versiones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', color: 'var(--tx4)' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>⟳</div>
                  <div style={{ fontWeight: 600 }}>Sin versiones anteriores</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Las versiones se guardan automáticamente al editar</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Versión actual */}
                  <div style={{ background: 'var(--bg3)', border: '1.5px solid var(--green)', borderRadius: 'var(--r)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--green)', color: '#fff' }}>
                      v{med.version || 1} · Actual
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--tx2)' }}>
                      Última modificación por <strong>{med.updatedBy || '—'}</strong>
                    </span>
                  </div>
                  {/* Versiones anteriores */}
                  {versiones.map((v, i) => (
                    <div key={v.id} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--bg3)', color: 'var(--tx3)' }}>
                          v{v.version}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>
                          {v.savedAt ? new Date(v.savedAt).toLocaleString('es-EC') : '—'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--tx2)', marginLeft: 4 }}>
                          por <strong>{v.savedBy || '—'}</strong>
                        </span>
                        {v.estado && (
                          <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 20, background: 'var(--bg3)', color: 'var(--tx3)', marginLeft: 'auto' }}>
                            {v.estado}
                          </span>
                        )}
                      </div>
                      {v.motivo && v.motivo !== 'Actualización' && (
                        <div style={{ fontSize: 11, color: 'var(--tx3)', fontStyle: 'italic' }}>
                          Motivo: {v.motivo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HISTORIAL DE VERSIONES */}
          {tab === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                  Historial de versiones regulatorias
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
                <span style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>
                  v{med.version || 1} actual
                </span>
              </div>
              {loadingVer ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--tx4)' }}>Cargando historial...</div>
              ) : versiones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', color: 'var(--tx4)' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>⟳</div>
                  <div style={{ fontWeight: 600 }}>Sin versiones anteriores</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Las versiones se guardan automáticamente al editar</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Versión actual */}
                  <div style={{ background: 'var(--bg3)', border: '1.5px solid var(--green)', borderRadius: 'var(--r)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--green)', color: '#fff' }}>
                      v{med.version || 1} · Actual
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--tx2)' }}>
                      Última modificación por <strong>{med.updatedBy || '—'}</strong>
                    </span>
                  </div>
                  {/* Versiones anteriores */}
                  {versiones.map((v, i) => (
                    <div key={v.id} style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--bg3)', color: 'var(--tx3)' }}>
                          v{v.version}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--tx3)', fontFamily: 'var(--mono)' }}>
                          {v.savedAt ? new Date(v.savedAt).toLocaleString('es-EC') : '—'}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--tx2)', marginLeft: 4 }}>
                          por <strong>{v.savedBy || '—'}</strong>
                        </span>
                        {v.estado && (
                          <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 20, background: 'var(--bg3)', color: 'var(--tx3)', marginLeft: 'auto' }}>
                            {v.estado}
                          </span>
                        )}
                      </div>
                      {v.motivo && v.motivo !== 'Actualización' && (
                        <div style={{ fontSize: 11, color: 'var(--tx3)', fontStyle: 'italic' }}>
                          Motivo: {v.motivo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SPOR/IDMP */}
          {tab === 5 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
                  EMA SPOR — ISO IDMP 11615/11238
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--bdr)' }} />
                <a href="https://spor.ema.europa.eu" target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: 'var(--green)', textDecoration: 'none', fontWeight: 600, padding: '2px 8px', border: '1px solid var(--bdr)', borderRadius: 20 }}>
                  EMA SPOR →
                </a>
              </div>
              {loadingSpor ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--tx4)' }}>Calculando modelo SPOR...</div>
              ) : sporData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Substance */}
                  <div style={{ background: 'var(--bg2)', border: '1.5px solid #C4B5FD', borderRadius: 'var(--r)', padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#5B21B6', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginBottom: 8 }}>S — SUBSTANCE (ISO 11238)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        ['ID SIMI', sporData.substance?.simiId],
                        ['INN/DCI', sporData.substance?.inn],
                        ['SNOMED CT', sporData.substance?.snomed || '—'],
                        ['Código ATC', sporData.substance?.atcCode || '—'],
                        ['CAS', sporData.substance?.cas || '—'],
                      ].map(([l, v]) => (
                        <div key={l} style={{ background: '#F5F3FF', borderRadius: 6, padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#7C3AED', fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)', fontFamily: 'var(--mono)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Product */}
                  <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginBottom: 8 }}>P — PRODUCT (ISO 11615)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {[
                        ['VTM ID', sporData.product?.vtmId],
                        ['VMP ID', sporData.product?.vmpId],
                        ['AMP ID', sporData.product?.ampId],
                        ['AMPP ID', sporData.product?.amppId || '—'],
                        ['Registro sanitario', sporData.product?.rs || '—'],
                        ['CUM', sporData.product?.cum || '—'],
                        ['GTIN', sporData.product?.gtin || '—'],
                        ['PhPID', sporData.product?.phpid || '—'],
                      ].map(([l, v]) => (
                        <div key={l} style={{ background: 'var(--bg3)', borderRadius: 6, padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)', fontFamily: 'var(--mono)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Organisation */}
                  <div style={{ background: 'var(--bg2)', border: '1.5px solid #BAE6FD', borderRadius: 'var(--r)', padding: '12px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0369A1', letterSpacing: 1.5, fontFamily: 'var(--mono)', marginBottom: 8 }}>O — ORGANISATION (ISO 11615)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {[
                        ['ID SIMI', sporData.organisation?.simiId],
                        ['Nombre', sporData.organisation?.name],
                        ['Tipo', sporData.organisation?.type],
                        ['País', sporData.organisation?.country || '—'],
                      ].map(([l, v]) => (
                        <div key={l} style={{ background: '#F0F9FF', borderRadius: 6, padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: '#0369A1', fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx)', fontFamily: 'var(--mono)' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--tx4)', fontFamily: 'var(--mono)', textAlign: 'center' }}>
                    Modelo EMA SPOR · ISO IDMP 11615/11238 · SIMI Ecuador v1.0
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Botones inferiores */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--bdr)' }}>
            <Link href={`/medicamentos/${id}/editar`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'var(--green)', color: '#fff', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--green)')}>
              ✏ Editar medicamento
            </Link>
            <Link href="/medicamentos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: 'var(--bg2)', color: 'var(--tx2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; }}>
              ← Volver a la lista
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
