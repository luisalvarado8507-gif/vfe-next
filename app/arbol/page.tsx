'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';

interface AMP {
  id: string;
  docId: string;
  amp: string;
  lab: string;
  estado: string;
  generico: string;
}
interface VMPP { label: string; amps: AMP[]; }
interface VMP { label: string; ff: string; vmpps: Record<string, VMPP>; }
interface VTMNode { label: string; esCombo: boolean; vmps: Record<string, VMP>; }

type ArbolLevel = 'all' | 'vtm' | 'vmp' | 'amp';

const BADGE: Record<string, { bg: string; label: string }> = {
  'VTM':  { bg: '#1A6B08', label: 'VTM' },
  'VMP':  { bg: '#2DB010', label: 'VMP' },
  'VMPP': { bg: '#2563EB', label: 'VMPP' },
  'AMP':  { bg: '#7C3AED', label: 'AMP' },
};

const NivelBadge = ({ nivel }: { nivel: string }) => (
  <span style={{
    padding: '2px 8px', borderRadius: '4px',
    background: BADGE[nivel]?.bg || '#888',
    color: '#fff', fontSize: '11px', fontWeight: 700,
    fontFamily: "'DM Mono', monospace", flexShrink: 0,
  }}>{nivel}</span>
);

const EstadoDot = ({ estado }: { estado: string }) => {
  const color = estado === 'autorizado' ? 'var(--green)' : estado === 'arcsa_pendiente' ? 'var(--amber)' : 'var(--red)';
  return <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
};

export default function Arbol() {
  const [meds, setMeds] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [level, setLevel] = useState<ArbolLevel>('all');
  const { getToken, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        let all: Record<string, string>[] = [];
        let cursor: string | null = null;
        while (true) {
          const params = new URLSearchParams({ limit: '500', estado: 'autorizado' });
          if (cursor) params.set('cursor', cursor);
          const res = await fetch(`/api/medicamentos?${params}`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          all = all.concat(data.medicamentos || []);
          cursor = data.nextCursor;
          if (!cursor) break;
        }
        setMeds(all);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [authLoading, user]);

  // Build tree
  const tree = useMemo(() => {
    const t: Record<string, VTMNode> = {};
    meds.forEach(m => {
      const vtm = m.vtm || '(Sin VTM)';
      const vmp = m.vmp || `${vtm} ${m.conc || ''} ${m.ff || ''}`.trim();
      const vmpp = m.vmpp || '__';
      const amp = m.nombre || m.vtm || '';
      const lab = m.laboratorio || '';

      if (!t[vtm]) t[vtm] = { label: vtm, esCombo: m.esCombo === 'true', vmps: {} };
      if (!t[vtm].vmps[vmp]) t[vtm].vmps[vmp] = { label: vmp, ff: m.ff || '', vmpps: {} };
      if (!t[vtm].vmps[vmp].vmpps[vmpp]) t[vtm].vmps[vmp].vmpps[vmpp] = { label: vmpp, amps: [] };
      t[vtm].vmps[vmp].vmpps[vmpp].amps.push({
        id: m.id, docId: m.docId, amp, lab,
        estado: m.estado || '', generico: m.generico || '',
      });
    });
    return t;
  }, [meds]);

  const togOpen = (key: string) => {
    setOpen(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const expandAll = (expand: boolean) => {
    if (!expand) { setOpen(new Set()); return; }
    const keys: string[] = [];
    Object.keys(tree).forEach(vtm => {
      keys.push(`vtm:${vtm}`);
      Object.keys(tree[vtm].vmps).forEach(vmp => keys.push(`vmp:${vtm}:${vmp}`));
    });
    setOpen(new Set(keys));
  };

  const q = busqueda.toLowerCase().trim();
  const matches = (txt: string) => !q || (txt || '').toLowerCase().includes(q);

  const vtmList = Object.keys(tree).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  const filteredVTMs = vtmList.filter(vtm => {
    if (!q) return true;
    if (matches(vtm)) return true;
    return Object.keys(tree[vtm].vmps).some(vmp => {
      if (matches(vmp)) return true;
      return Object.values(tree[vtm].vmps[vmp].vmpps).some(pkg =>
        pkg.amps.some(a => matches(a.amp) || matches(a.lab))
      );
    });
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg, #F5FAF3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '280px', padding: '24px 32px' }}>

        {/* SEARCH + CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <input
              placeholder="🔍  Buscar principio activo, VMP o AMP…"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); if (e.target.value) expandAll(true); }}
              style={{
                width: '100%', border: '1.5px solid var(--bdr)', borderRadius: '8px',
                padding: '9px 14px', fontSize: '13px', fontFamily: 'inherit',
                background: 'var(--bg2)', color: 'var(--tx)', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--tx3)', fontFamily: "'DM Mono', monospace" }}>VER:</span>
            {(['all', 'vtm', 'vmp', 'amp'] as ArbolLevel[]).map(lv => (
              <button key={lv} onClick={() => setLevel(lv)}
                style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${level === lv ? 'var(--green)' : 'var(--bdr)'}`,
                  background: level === lv ? 'var(--green)' : 'var(--bg2)',
                  color: level === lv ? '#fff' : 'var(--tx3)',
                  fontFamily: 'inherit',
                }}>
                {lv === 'all' ? 'Todos los niveles' : lv === 'vtm' ? 'Solo VTM' : lv === 'vmp' ? 'VTM + VMP' : 'Hasta AMP'}
              </button>
            ))}
          </div>
          <button onClick={() => expandAll(true)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--bdr)', background: 'var(--bg2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--tx2)' }}>
            Expandir todo
          </button>
          <button onClick={() => expandAll(false)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--bdr)', background: 'var(--bg2)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, color: 'var(--tx2)' }}>
            Colapsar todo
          </button>
        </div>

        {/* LEGEND */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: 'var(--tx3)', letterSpacing: '1px' }}>NIVELES:</span>
          {[
            { nivel: 'VTM', desc: 'Principio activo' },
            { nivel: 'VMP', desc: 'Producto virtual (dosis + forma)' },
            { nivel: 'VMPP', desc: 'Paquete virtual (unidades)' },
            { nivel: 'AMP', desc: 'Nombre comercial registrado' },
          ].map(n => (
            <span key={n.nivel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <NivelBadge nivel={n.nivel} />
              <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{n.desc}</span>
            </span>
          ))}
        </div>

        {/* TREE */}
        <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--tx4)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌳</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Construyendo árbol...</div>
            </div>
          ) : filteredVTMs.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--tx4)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Sin resultados</div>
            </div>
          ) : (
            <div id="arbol-tree">
              {filteredVTMs.map((vtm, vi) => {
                const node = tree[vtm];
                const vtmKey = `vtm:${vtm}`;
                const isVTMOpen = open.has(vtmKey) || level !== 'vtm';
                const vmpList = Object.keys(node.vmps).sort();
                const vmpCount = vmpList.length;
                const ampCount = vmpList.reduce((acc, vmp) =>
                  acc + Object.values(node.vmps[vmp].vmpps).reduce((a2, pkg) => a2 + pkg.amps.length, 0), 0);
                const isLast = vi === filteredVTMs.length - 1;

                return (
                  <div key={vtm}>
                    {/* VTM ROW */}
                    <div style={{ display: 'flex', alignItems: 'center', borderBottom: isLast && !isVTMOpen ? 'none' : '1.5px solid var(--bdr)' }}>
                      <div style={{ width: '4px', background: 'var(--gdp)', alignSelf: 'stretch', flexShrink: 0, borderRadius: vi === 0 ? '12px 0 0 0' : '0' }} />
                      <div onClick={() => togOpen(vtmKey)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 14px', cursor: 'pointer',
                          background: isVTMOpen && open.has(vtmKey) ? '#F0FBF0' : 'var(--bg2)',
                        }}>
                        <span style={{ fontSize: '11px', color: 'var(--tx4)', transition: 'transform .2s', transform: open.has(vtmKey) ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
                        <NivelBadge nivel="VTM" />
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--tx)', flex: 1 }}>{vtm}</span>
                        <span style={{ fontSize: '11px', color: 'var(--tx3)', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>
                          {vmpCount} VMP · {ampCount} AMP
                        </span>
                      </div>
                    </div>

                    {/* VMP LIST */}
                    {(open.has(vtmKey) || level === 'all' || level === 'vmp' || level === 'amp') && open.has(vtmKey) && (
                      <>
                        {vmpList.filter(vmp => {
                          if (!q) return true;
                          if (matches(vtm) || matches(vmp)) return true;
                          return Object.values(node.vmps[vmp].vmpps).some(pkg => pkg.amps.some(a => matches(a.amp) || matches(a.lab)));
                        }).map((vmp, vi2) => {
                          const vmpNode = node.vmps[vmp];
                          const vmpKey = `vmp:${vtm}:${vmp}`;
                          const isVMPOpen = open.has(vmpKey);
                          const vmppList = Object.keys(vmpNode.vmpps);
                          const ampCountVMP = vmppList.reduce((a, k) => a + vmpNode.vmpps[k].amps.length, 0);
                          const isLastVMP = vi2 === vmpList.length - 1;

                          return (
                            <div key={vmp}>
                              {/* VMP ROW */}
                              <div style={{ display: 'flex', alignItems: 'center', borderBottom: isLastVMP && !isVMPOpen ? 'none' : '1px solid var(--bdr)', background: 'var(--bg3)' }}>
                                <div style={{ width: '4px', flexShrink: 0 }} />
                                <div style={{ width: '20px', flexShrink: 0 }} />
                                <div onClick={() => togOpen(vmpKey)}
                                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px 9px 8px', cursor: 'pointer' }}>
                                  <span style={{ fontSize: '10px', color: 'var(--tx4)', transition: 'transform .2s', transform: isVMPOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
                                  <NivelBadge nivel="VMP" />
                                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--tx)', flex: 1 }}>{vmp}</span>
                                  <span style={{ fontSize: '11px', color: 'var(--tx3)', fontFamily: "'DM Mono', monospace" }}>{ampCountVMP} presentac.</span>
                                </div>
                              </div>

                              {/* VMPP + AMP */}
                              {isVMPOpen && vmppList.map((vmpp, vi3) => {
                                const vmppNode = vmpNode.vmpps[vmpp];
                                const isLastVMPP = vi3 === vmppList.length - 1;

                                return (
                                  <div key={vmpp}>
                                    {/* VMPP ROW */}
                                    {vmpp !== '__' && (
                                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--bdr)', background: '#F8FEF5' }}>
                                        <div style={{ width: '4px', flexShrink: 0 }} />
                                        <div style={{ width: '44px', flexShrink: 0 }} />
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px 7px 8px' }}>
                                          <NivelBadge nivel="VMPP" />
                                          <span style={{ fontSize: '12px', color: 'var(--tx2)' }}>{vmpp}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* AMP ROWS */}
                                    {vmppNode.amps.filter(a => !q || matches(vtm) || matches(vmp) || matches(a.amp) || matches(a.lab)).map((amp, ai) => (
                                      <div key={amp.docId}
                                        onClick={() => router.push(`/medicamentos/${amp.docId}`)}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: '8px',
                                          padding: '7px 14px 7px 68px',
                                          borderBottom: ai === vmppNode.amps.length - 1 && isLastVMPP ? 'none' : '1px solid var(--bdr)',
                                          cursor: 'pointer', background: 'var(--bg2)',
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--gg, rgba(61,219,24,.10))'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}>
                                        <NivelBadge nivel="AMP" />
                                        <EstadoDot estado={amp.estado} />
                                        <span style={{ fontSize: '13px', color: 'var(--tx)', flex: 1 }}>
                                          {amp.amp || amp.lab}
                                        </span>
                                        <span style={{ fontSize: '12px', color: 'var(--tx3)', whiteSpace: 'nowrap' }}>
                                          {amp.lab} →
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--tx4)', fontFamily: "'DM Mono', monospace" }}>
          {filteredVTMs.length} VTM · {meds.length.toLocaleString('es-EC')} medicamentos
        </div>
      </main>
    </div>
  );
}
