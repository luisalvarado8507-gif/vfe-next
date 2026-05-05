'use client';
import { useEffect, useState } from 'react';

interface RxNormConcept {
  rxcui: string;
  name: string;
  tty: string;
  url: string;
}

interface RxNormHierarchy {
  ingredient: RxNormConcept | null;
  clinicalDrug: RxNormConcept | null;
  brandName: RxNormConcept | null;
}

interface RxNormLookupProps {
  inn: string;
}

const TTY_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  IN:  { label: 'Ingrediente',       bg: '#FEF3C7', color: '#92400E' },
  PIN: { label: 'Ingrediente preciso', bg: '#FEF9C3', color: '#854D0E' },
  MIN: { label: 'Multi-ingrediente', bg: '#FDE68A', color: '#92400E' },
  SCD: { label: 'Droga clínica',     bg: '#DBEAFE', color: '#1D4ED8' },
  SBD: { label: 'Marca',             bg: '#EDE9FE', color: '#5B21B6' },
  BN:  { label: 'Nombre comercial',  bg: '#F5F3FF', color: '#6D28D9' },
  DF:  { label: 'Forma farmacéutica', bg: '#DCFCE7', color: '#166534' },
};

export default function RxNormLookup({ inn }: RxNormLookupProps) {
  const [hierarchy, setHierarchy] = useState<RxNormHierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!inn || inn.length < 3) return;
    const lookup = async () => {
      setLoading(true);
      try {
        const term = inn.split(' + ')[0].trim();
        // Buscar RxCUI del ingrediente
        const res = await fetch(
          `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(term)}&search=2`
        );
        const data = await res.json();
        const rxcui = data.idGroup?.rxnormId?.[0];
        if (!rxcui) { setLoading(false); return; }

        // Obtener propiedades del concepto
        const propRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
        const propData = await propRes.json();
        const props = propData.properties;

        // Buscar relaciones (Clinical Drug y Brand Name)
        const relRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=SCD+SBD+BN`);
        const relData = await relRes.json();
        const relGroups = relData.relatedGroup?.conceptGroup || [];

        let clinicalDrug: RxNormConcept | null = null;
        let brandName: RxNormConcept | null = null;

        relGroups.forEach((group: any) => {
          if (group.tty === 'SCD' && group.conceptProperties?.[0]) {
            const c = group.conceptProperties[0];
            clinicalDrug = { rxcui: c.rxcui, name: c.name, tty: 'SCD', url: `https://www.rxnav.nlm.nih.gov/RxNav.html?search=${c.rxcui}` };
          }
          if (group.tty === 'SBD' && group.conceptProperties?.[0]) {
            const c = group.conceptProperties[0];
            brandName = { rxcui: c.rxcui, name: c.name, tty: 'SBD', url: `https://www.rxnav.nlm.nih.gov/RxNav.html?search=${c.rxcui}` };
          }
        });

        setHierarchy({
          ingredient: props ? { rxcui, name: props.name, tty: props.tty || 'IN', url: `https://www.rxnav.nlm.nih.gov/RxNav.html?search=${rxcui}` } : null,
          clinicalDrug,
          brandName,
        });
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    lookup();
  }, [inn]);

  if (loading) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', fontFamily: 'var(--mono)' }}>
      RxNorm...
    </span>
  );

  if (!hierarchy?.ingredient) return null;

  const { ingredient, clinicalDrug, brandName } = hierarchy;
  const s = TTY_LABELS[ingredient.tty] || TTY_LABELS['IN'];

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {/* Ingrediente principal */}
        <a href={ingredient.url} target="_blank" rel="noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', background: s.bg, color: s.color, border: `1px solid ${s.bg}`, textDecoration: 'none' }}>
          RxNorm {ingredient.rxcui}
          <span style={{ fontSize: 10, opacity: 0.7 }}>{ingredient.tty}</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>↗</span>
        </a>

        {/* Expandir */}
        {(clinicalDrug || brandName) && (
          <button onClick={() => setExpanded(!expanded)} style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, background: 'var(--bg3)', color: 'var(--tx3)', border: '1px solid var(--bdr)', cursor: 'pointer', fontFamily: 'var(--mono)' }}>
            {expanded ? '▲ menos' : '▼ más'}
          </button>
        )}
      </div>

      {/* Jerarquía expandida */}
      {expanded && (
        <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--r)', border: '1px solid var(--bdr)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx4)', letterSpacing: 1, fontFamily: 'var(--mono)', marginBottom: 6 }}>JERARQUÍA RXNORM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx4)', minWidth: 24 }}>IN</span>
              <span style={{ fontSize: 11, color: 'var(--tx2)' }}>{ingredient.name}</span>
              <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: '#92400E' }}>#{ingredient.rxcui}</span>
            </div>
            {clinicalDrug && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx4)', minWidth: 24 }}>SCD</span>
                <a href={clinicalDrug.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}>
                  {clinicalDrug.name.length > 50 ? clinicalDrug.name.substring(0, 50) + '…' : clinicalDrug.name}
                </a>
              </div>
            )}
            {brandName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx4)', minWidth: 24 }}>SBD</span>
                <a href={brandName.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--purple)', textDecoration: 'none' }}>
                  {brandName.name.length > 50 ? brandName.name.substring(0, 50) + '…' : brandName.name}
                </a>
              </div>
            )}
          </div>
          <div style={{ fontSize: 9, color: 'var(--tx4)', marginTop: 6, fontFamily: 'var(--mono)' }}>
            NLM RxNorm · FDA · National Library of Medicine
          </div>
        </div>
      )}
    </div>
  );
}
