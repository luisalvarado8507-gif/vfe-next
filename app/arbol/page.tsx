'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

interface AMP {
  id: string;
  docId: string;
  amp: string;
  lab: string;
  estado: string;
  generico: string;
}
interface VMPP { label: string; amps: AMP[]; }
interface VMP  { label: string; ff: string; vmpps: Record<string, VMPP>; }
interface VTMNode { label: string; esCombo: boolean; vmps: Record<string, VMP>; }
type ArbolLevel = 'all' | 'vtm' | 'vmp' | 'amp';

// ── Nivel badges ──────────────────────────────────────────────────────────
const NIVEL_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  VTM:  { bg: '#0F2D5E', color: '#fff', border: '#1D4ED8' },
  VMP:  { bg: '#1D4ED8', color: '#fff', border: '#3B82F6' },
  VMPP: { bg: '#2563EB', color: '#fff', border: '#60A5FA' },
  AMP:  { bg: '#6D28D9', color: '#fff', border: '#A78BFA' },
};

function NivelBadge({ nivel }: { nivel: string }) {
  const s = NIVEL_STYLES[nivel] || { bg: '#6B7280', color: '#fff', border: '#9CA3AF' };
  return (
    <span style={{ padding: '2px 7px', borderRadius: 4, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, fontFamily: 'var(--mono)', flexShrink: 0, letterSpacing: 0.5, border: `1px solid ${s.border}` }}>
      {nivel}
    </span>
  );
}

function EstadoDot({ estado }: { estado: string }) {
  const color = estado === 'autorizado' ? 'var(--green)' : estado === 'arcsa_pendiente' ? 'var(--amber)' : 'var(--red)';
  return <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />;
}

// ═════════════════════════════════════════════════════════════════════════
export default function Arbol() {
  const [meds, setMeds] = useState<Record<string, any>[]>([]);
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
        let all: Record<string, any>[] = [];
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
      const vmpp = m.vmpp || (m.units ? `${m.vmp || vtm} ${m.conc || ''}, ${m.units} ${m.envase || 'unidades'}`.trim() : '__');
      const amp = m.amp || m.nombre || m.vtm || '';
      const lab = m.laboratorio || '';
      if (!t[vtm]) t[vtm] = { label: vtm, esCombo: m.esCombo === 'true' || m.esCombo === true, vmps: {} };
      if (!t[vtm].vmps[vmp]) t[vtm].vmps[vmp] = { label: vmp, ff: m.ff || '', vmpps: {} };
      if (!t[vtm].vmps[vmp].vmpps[vmpp]) t[vtm].vmps[vmp].vmpps[vmpp] = { label: vmpp, amps: [] };
      t[vtm].vmps[vmp].vmpps[vmpp].amps.push({ id: m.id, docId: m.docId, amp, lab, estado: m.estado || '', generico: m.generico || '' });
    });
    return t;
  }, [meds]);

  const togOpen = (key: string) => {
    setOpen(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
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
    return Object.keys(tree[vtm].vmps).some(vmp =>
      matches(vmp) ||
      Object.values(tree[vtm].vmps[vmp].vmpps).some(pkg =>
        pkg.amps.some(a => matches(a.amp) || matches(a.lab))
      )
    );
  });

  const totalMeds = Object.values(tree).reduce((acc, node) =>
    acc + Object.values(node.vmps).reduce((a2, vmp) =>
      a2 + Object.values(vmp.vmpps).reduce((a3, pkg) => a3 + pkg.amps.length, 0), 0), 0);

  // Row styles
  const rowBase: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', transition: 'background .1s', borderTop: '1px solid var(--bdr)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header dark ── */}
        <div style={{ background: 'var(--green-dark, #1B4332)', padding: '20px 32px' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,.4)', letterSpacing: '2px', marginBottom: 6 }}>ÁRBOL SPMS</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Árbol de medicamentos</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 16 }}>
            Nomenclatura VTM → VMP → VMPP → AMP conforme al modelo SPMS
          </p>

          {/* Buscador */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar principio activo, VMP o nombre comercial..."
              style={{ width: '100%', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 'var(--r)', padding: '10px 14px 10px 40px', fontSize: 13, outline: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', fontFamily: 'var(--sans)', boxSizing: 'border-box' }}
            />
            {busqueda && <button onClick={() => setBusqueda('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16 }}>✕</button>}
          </div>
        </div>

        {/* ── Controles ── */}
        <div style={{ background: 'var(--bg2)', borderBottom: '1.5px solid var(--bdr)', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Nivel de vista */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)' }}>VER</span>
            {([['all','Todos los niveles'],['vtm','Solo VTM'],['vmp','VTM + VMP'],['amp','Hasta AMP']] as [ArbolLevel, string][]).map(([val, lbl]) => (
              <button key={val} onClick={() => setLevel(val)} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: `1.5px solid ${level === val ? 'var(--green)' : 'var(--bdr)'}`,
                background: level === val ? 'var(--green)' : 'var(--bg2)',
                color: level === val ? '#fff' : 'var(--tx2)', transition: 'all .13s',
              }}>{lbl}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => expandAll(true)} style={{ padding: '5px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--bdr)', background: 'var(--bg2)', color: 'var(--tx2)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Expandir todo
            </button>
            <button onClick={() => expandAll(false)} style={{ padding: '5px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--bdr)', background: 'var(--bg2)', color: 'var(--tx2)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Colapsar todo
            </button>
          </div>
        </div>

        {/* ── Leyenda niveles ── */}
        <div style={{ padding: '8px 32px', background: 'var(--bg)', borderBottom: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx4)', letterSpacing: 1.5, fontFamily: 'var(--mono)' }}>NIVELES:</span>
          {[
            { nivel: 'VTM', desc: 'Principio activo' },
            { nivel: 'VMP', desc: 'Producto virtual (dosis + forma)' },
            { nivel: 'VMPP', desc: 'Paquete virtual (unidades)' },
            { nivel: 'AMP', desc: 'Nombre comercial registrado' },
          ].map(({ nivel, desc }) => (
            <div key={nivel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <NivelBadge nivel={nivel} />
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{desc}</span>
            </div>
          ))}
        </div>

        {/* ── Árbol ── */}
        <div style={{ flex: 1, padding: '20px 32px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: 'var(--tx4)' }}>
              <div style={{ width: 24, height: 24, border: '3px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Construyendo árbol...
            </div>
          ) : (
            <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
              {filteredVTMs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--tx4)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
                  <div style={{ fontWeight: 600 }}>Sin resultados</div>
                </div>
              ) : filteredVTMs.map((vtm, vi) => {
                const node = tree[vtm];
                const isVTMOpen = open.has(`vtm:${vtm}`) || level !== 'vtm';
                const vmpList = Object.keys(node.vmps);
                const ampCount = vmpList.reduce((acc, vmp) =>
                  acc + Object.values(node.vmps[vmp].vmpps).reduce((a, pkg) => a + pkg.amps.length, 0), 0);

                return (
                  <div key={vtm}>
                    {/* VTM ROW */}
                    <div
                      onClick={() => togOpen(`vtm:${vtm}`)}
                      style={{ ...rowBase, background: vi % 2 === 0 ? 'var(--bg2)' : 'var(--bg)', borderTop: vi === 0 ? 'none' : '1px solid var(--bdr)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = vi % 2 === 0 ? 'var(--bg2)' : 'var(--bg)'}>
                      <span style={{ fontSize: 10, color: 'var(--tx4)', transition: 'transform .2s', transform: isVTMOpen && vmpList.length > 0 ? 'rotate(90deg)' : 'none', display: 'inline-block', flexShrink: 0 }}>▶</span>
                      <NivelBadge nivel="VTM" />
                      {node.esCombo && <span style={{ padding: '1px 6px', borderRadius: 20, background: 'var(--purple-bg)', color: 'var(--purple)', fontSize: 10, fontWeight: 700 }}>⊕</span>}
                      <span style={{ flex: 1, fontWeight: 600, color: 'var(--tx)', fontSize: 13 }}>{vtm}</span>
                      <span style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>
                        {vmpList.length} VMP · {ampCount} AMP
                      </span>
                    </div>

                    {/* VMPs */}
                    {isVTMOpen && vmpList.map((vmp, vi2) => {
                      const vmpNode = node.vmps[vmp];
                      const isVMPOpen = open.has(`vmp:${vtm}:${vmp}`) || level === 'all' || level === 'amp';
                      const vmppList = Object.keys(vmpNode.vmpps);
                      const ampCountVMP = vmppList.reduce((a, k) => a + vmpNode.vmpps[k].amps.length, 0);
                      const shouldShow = level === 'vtm' ? false : true;
                      if (!shouldShow) return null;

                      return (
                        <div key={vmp}>
                          {/* VMP ROW */}
                          <div
                            onClick={() => togOpen(`vmp:${vtm}:${vmp}`)}
                            style={{ ...rowBase, paddingLeft: 40, background: 'var(--bg3)' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg4, #E8F0EA)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}>
                            <span style={{ fontSize: 10, color: 'var(--tx4)', transition: 'transform .2s', transform: isVMPOpen && vmppList.length > 0 ? 'rotate(90deg)' : 'none', display: 'inline-block', flexShrink: 0 }}>▶</span>
                            <NivelBadge nivel="VMP" />
                            <span style={{ flex: 1, fontWeight: 600, color: 'var(--tx2)', fontSize: 13 }}>{vmpNode.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)' }}>
                              {ampCountVMP} presentac.
                            </span>
                          </div>

                          {/* VMPP + AMP */}
                          {isVMPOpen && vmppList.map((vmpp, vi3) => {
                            const vmppNode = vmpNode.vmpps[vmpp];
                            const isLastVMPP = vi3 === vmppList.length - 1;

                            return (
                              <div key={vmpp}>
                                {/* VMPP ROW */}
                                {vmpp !== '__' && (level === 'all' || level === 'amp') && (
                                  <div style={{ ...rowBase, paddingLeft: 66, background: 'var(--bg2)' }}>
                                    <NivelBadge nivel="VMPP" />
                                    <span style={{ flex: 1, fontSize: 12, color: 'var(--tx3)' }}>{vmppNode.label}</span>
                                  </div>
                                )}

                                {/* AMP ROWS */}
                                {(level === 'all' || level === 'amp') && vmppNode.amps.map((amp, ai) => (
                                  <div key={amp.id || ai}
                                    onClick={() => router.push(`/medicamentos/${amp.docId || amp.id}`)}
                                    style={{ ...rowBase, paddingLeft: vmpp !== '__' ? 88 : 66, background: 'var(--bg)', justifyContent: 'space-between' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg)'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                      <NivelBadge nivel="AMP" />
                                      <EstadoDot estado={amp.estado} />
                                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {amp.amp || '—'}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                      <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{amp.lab}</span>
                                      {amp.generico === 'Sí' && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--green)', background: 'var(--estado-autorizado-bg)', padding: '1px 6px', borderRadius: 20 }}>Genérico</span>}
                                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Ver →</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats footer */}
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--tx4)', fontFamily: 'var(--mono)', textAlign: 'center' }}>
            {filteredVTMs.length} VTM · {totalMeds} medicamentos
            {busqueda && <span style={{ color: 'var(--green)', marginLeft: 8 }}>· filtrando por "{busqueda}"</span>}
          </div>
        </div>
      </main>
    </div>
  );
}
