'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { CHAPS, CapituloTree, SubCapitulo } from '@/lib/capitulos-tree';

interface Med {
  docId: string; id: string; vtm: string; amp: string; nombre: string;
  conc: string; ff: string; vias: string; laboratorio: string; estado: string;
  chapId: string; subId?: string;
  atc?: string; rs?: string; cum?: string; pp?: string; pu?: string;
  generico?: string; cnmb?: string; prospectoUrl?: string; packagingUrl?: string;
  clinData?: Record<string, string>;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function genId(prefix: string) {
  return prefix + Date.now().toString(36);
}

function findSub(subs: SubCapitulo[], id: string): SubCapitulo | null {
  for (const s of subs) {
    if (s.id === id) return s;
    const found = findSub(s.subs, id);
    if (found) return found;
  }
  return null;
}

function updateSub(subs: SubCapitulo[], id: string, fn: (s: SubCapitulo) => SubCapitulo): SubCapitulo[] {
  return subs.map(s => {
    if (s.id === id) return fn(s);
    return { ...s, subs: updateSub(s.subs, id, fn) };
  });
}

function removeSub(subs: SubCapitulo[], id: string): SubCapitulo[] {
  return subs.filter(s => s.id !== id).map(s => ({ ...s, subs: removeSub(s.subs, id) }));
}

function subDepth(sub: SubCapitulo, current = 1): number {
  if (!sub.subs.length) return current;
  return Math.max(...sub.subs.map(s => subDepth(s, current + 1)));
}

// ── SubRow component ──────────────────────────────────────────────────────
function SubRow({ sub, depth, capN, parentNum, isEditor, onSelect, activeSub, onAddSub, onRename, onDelete, medCount }:
  { sub: SubCapitulo; depth: number; capN: string; parentNum: string; isEditor: boolean;
    onSelect: (id: string) => void; activeSub: string | null;
    onAddSub: (parentId: string) => void; onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void; medCount: number }) {

  const isActive = activeSub === sub.id;
  const indent = depth * 12;

  return (
    <div>
      <div
        onClick={() => onSelect(sub.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: `7px 16px 7px ${16 + indent}px`,
          cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500,
          color: isActive ? '#2d6a2d' : '#3a5c30',
          background: isActive ? '#f0fdf4' : 'transparent',
          borderLeft: `3px solid ${isActive ? '#3DDB18' : 'transparent'}`,
          transition: 'all .12s',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fdf8'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#7aaa6a', minWidth: 28 }}>{parentNum}</span>
        <span style={{ flex: 1 }}>{sub.name}</span>
        {medCount > 0 && <span style={{ fontSize: 10, color: '#7aaa6a', fontFamily: 'monospace' }}>{medCount}</span>}
      </div>
      {sub.subs.map((child, i) => (
        <SubRow key={child.id} sub={child} depth={depth + 1} capN={capN}
          parentNum={`${parentNum}.${i + 1}`} isEditor={isEditor}
          onSelect={onSelect} activeSub={activeSub}
          onAddSub={onAddSub} onRename={onRename} onDelete={onDelete}
          medCount={0} />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
export default function CapituloPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken, isEditor } = useAuth();

  const searchParams = useSearchParams();
  const [chaps, setChaps] = useState<CapituloTree[]>(CHAPS);
  const [activeSub, setActiveSub] = useState<string | null>(searchParams?.get('sub') || null);
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'lista' | 'comparativa' | 'completitud'>('lista');

  // Modal state
  const [modal, setModal] = useState<{ type: string; payload?: any } | null>(null);
  const [modalInput, setModalInput] = useState('');

  const cap = chaps.find(c => c.id === id);

  // Sync activeSub with URL param
  useEffect(() => {
    const sub = searchParams?.get('sub') || null;
    if (sub) setActiveSub(sub);
  }, [searchParams]);

  // ── Load chaps from Firestore ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/capitulos')
      .then(r => r.json())
      .then(d => { if (d.chaps) setChaps(d.chaps); })
      .catch(() => {});
  }, []);

  // ── Load meds ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        let all: Med[] = [];
        let cursor: string | null = null;
        while (true) {
          const params = new URLSearchParams({ limit: '500', estado: 'autorizado', capitulo: id as string });
          if (cursor) params.set('cursor', cursor);
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`/api/medicamentos?${params}`, { headers });
          const data = await res.json();
          all = all.concat(data.medicamentos || []);
          cursor = data.nextCursor;
          if (!cursor) break;
        }
        setMeds(all);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    cargar();
  }, [id]);

  // ── Save chaps to Firestore ──────────────────────────────────────────
  const saveChaps = useCallback(async (newChaps: CapituloTree[]) => {
    setSaving(true);
    try {
      const token = await getToken();
      await fetch('/api/capitulos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chaps: newChaps }),
      });
      setChaps(newChaps);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }, [getToken]);

  // ── Editor actions ───────────────────────────────────────────────────
  const handleAddSub = (parentId: string | null) => {
    setModalInput('');
    setModal({ type: 'addSub', payload: { parentId } });
  };

  const handleRename = (id: string, currentName: string) => {
    setModalInput(currentName);
    setModal({ type: 'rename', payload: { id } });
  };

  const handleDelete = (id: string) => {
    setModal({ type: 'delete', payload: { id } });
  };

  const handleAddCap = () => {
    setModalInput('');
    setModal({ type: 'addCap' });
  };

  const confirmModal = async () => {
    if (!cap) return;
    const newChaps = [...chaps];
    const capIdx = newChaps.findIndex(c => c.id === id);

    if (modal?.type === 'addSub') {
      const name = modalInput.trim();
      if (!name) return;
      const newSub: SubCapitulo = { id: genId('s'), name, subs: [] };
      if (modal.payload.parentId === null) {
        newChaps[capIdx] = { ...newChaps[capIdx], subs: [...newChaps[capIdx].subs, newSub] };
      } else {
        newChaps[capIdx] = {
          ...newChaps[capIdx],
          subs: updateSub(newChaps[capIdx].subs, modal.payload.parentId, s => ({ ...s, subs: [...s.subs, newSub] }))
        };
      }
      await saveChaps(newChaps);
    }

    if (modal?.type === 'rename') {
      const name = modalInput.trim();
      if (!name) return;
      newChaps[capIdx] = {
        ...newChaps[capIdx],
        subs: updateSub(newChaps[capIdx].subs, modal.payload.id, s => ({ ...s, name }))
      };
      await saveChaps(newChaps);
    }

    if (modal?.type === 'renameCap') {
      const name = modalInput.trim();
      if (!name) return;
      newChaps[capIdx] = { ...newChaps[capIdx], name };
      await saveChaps(newChaps);
    }

    if (modal?.type === 'delete') {
      newChaps[capIdx] = {
        ...newChaps[capIdx],
        subs: removeSub(newChaps[capIdx].subs, modal.payload.id)
      };
      await saveChaps(newChaps);
      if (activeSub === modal.payload.id) setActiveSub(null);
    }

    if (modal?.type === 'addCap') {
      const name = modalInput.trim();
      if (!name) return;
      const n = String(newChaps.length + 1).padStart(2, '0');
      const newCap: CapituloTree = { id: genId('c'), n, name, subs: [] };
      newChaps.push(newCap);
      await saveChaps(newChaps);
    }

    setModal(null);
  };

  // Calcular completitud de un medicamento
  const calcCompletitud = (m: Med): number => {
    const campos = [m.vtm, m.conc, m.ff, m.vias, m.laboratorio, m.rs, m.atc, m.pp, m.generico, m.cnmb];
    const llenos = campos.filter(v => v && v !== '—' && v !== '').length;
    const tieneClin = m.clinData && Object.keys(m.clinData).length > 0;
    const tieneDoc = m.prospectoUrl || m.packagingUrl;
    return Math.round(((llenos / campos.length) * 70) + (tieneClin ? 20 : 0) + (tieneDoc ? 10 : 0));
  };

  // Stats de completitud del subcapítulo/capítulo
  const calcStats = (medList: Med[]) => {
    if (!medList.length) return { avg: 0, completos: 0, conClin: 0, conDoc: 0, conPrecio: 0 };
    const scores = medList.map(m => calcCompletitud(m));
    return {
      avg: Math.round(scores.reduce((a,b) => a+b, 0) / scores.length),
      completos: scores.filter(s => s >= 80).length,
      conClin: medList.filter(m => m.clinData && Object.keys(m.clinData).length > 0).length,
      conDoc: medList.filter(m => m.prospectoUrl || m.packagingUrl).length,
      conPrecio: medList.filter(m => m.pp && parseFloat(m.pp) > 0).length,
    };
  };

  if (!cap) return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <p style={{ color: '#aaa' }}>Capítulo no encontrado</p>
        <Link href="/dashboard" style={{ color: '#2d6a2d', fontSize: 13 }}>← Volver</Link>
      </main>
    </div>
  );

  const activeSubObj = activeSub ? findSub(cap.subs, activeSub) : null;
  const subMeds = activeSub ? meds.filter(m => m.subId === activeSub) : meds;

  const estadoColor = (e: string) => e === 'autorizado' ? '#3DDB18' : e === 'suspendido' ? '#D97706' : e === 'retirado' ? '#DC2626' : '#9CA3AF';

  const medCountForSub = (subId: string) => meds.filter(m => m.subId === subId).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9f4', display: 'flex', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />

      {/* ── Columna subcapítulos ── */}
      <div style={{ width: 240, marginLeft: 280, background: '#fff', borderRight: '1.5px solid #D0ECC6', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1.5px solid #D0ECC6', background: '#f8fdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7aaa6a', fontFamily: 'monospace', letterSpacing: 1 }}>Cap. {cap.n}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1a3a1a', marginTop: 2, lineHeight: 1.3 }}>{cap.name}</div>
          {isEditor && (
            <button onClick={() => handleRename('__cap__', cap.name)}
              style={{ marginTop: 6, fontSize: 11, color: '#7aaa6a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              ✏ Renombrar capítulo
            </button>
          )}
        </div>

        <div style={{ padding: '8px 0', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', padding: '4px 16px 6px' }}>SUBCAPÍTULOS</div>
          {cap.subs.map((sub, i) => (
            <SubRow key={sub.id} sub={sub} depth={0} capN={cap.n}
              parentNum={`${cap.n}.${i + 1}`} isEditor={isEditor}
              onSelect={setActiveSub} activeSub={activeSub}
              onAddSub={handleAddSub} onRename={handleRename} onDelete={handleDelete}
              medCount={medCountForSub(sub.id)} />
          ))}
          {isEditor && (
            <button onClick={() => handleAddSub(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#3DDB18', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px dashed #D0ECC6', marginTop: 4 }}>
              + Subcapítulo
            </button>
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1.5px solid #D0ECC6' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', fontFamily: 'monospace', letterSpacing: 1 }}>
            {loading ? '...' : meds.length} MEDICAMENTOS
          </div>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, marginLeft: 520, padding: '20px 28px', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#3a5c30', textDecoration: 'none' }}>
            🏠 Inicio
          </Link>
          <span style={{ color: '#aaa' }}>›</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a3a1a' }}>{cap.name}</span>
          {activeSub && <>
            <span style={{ color: '#aaa' }}>›</span>
            <span style={{ fontSize: 13, color: '#555' }}>{activeSubObj?.name}</span>
          </>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {isEditor && (
              <button onClick={handleAddCap}
                style={{ padding: '6px 14px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#2d6a2d', cursor: 'pointer' }}>
                + Capítulo
              </button>
            )}
            <Link href="/medicamentos/nuevo" style={{ padding: '6px 14px', background: '#3DDB18', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              + Nuevo medicamento
            </Link>
          </div>
        </div>

        {/* Vista subcapítulo activo */}
        {activeSub && activeSubObj ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#7aaa6a', fontFamily: 'monospace', marginBottom: 2 }}>{cap.n} › {cap.name}</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a3a1a', margin: 0 }}>{activeSubObj.name}</h1>
              <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{subMeds.length} medicamentos</p>
            </div>

            {/* Botones de edición */}
            {isEditor && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={() => handleAddSub(activeSub)}
                  style={{ padding: '8px 16px', background: '#fff', border: '2px dashed #3DDB18', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#2d6a2d', cursor: 'pointer' }}>
                  + Subnivel
                </button>
                <button onClick={() => handleRename(activeSub, activeSubObj.name)}
                  style={{ padding: '8px 16px', background: '#fff', border: '2px dashed #D0ECC6', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer' }}>
                  ✏ Renombrar
                </button>
                <button onClick={() => handleDelete(activeSub)}
                  style={{ padding: '8px 16px', background: '#fff', border: '2px dashed #fca5a5', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer' }}>
                  🗑 Eliminar
                </button>
              </div>
            )}

            {/* Subniveles */}
            {activeSubObj.subs.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', marginBottom: 10 }}>SUBNIVELES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeSubObj.subs.map((child, i) => (
                    <div key={child.id} onClick={() => setActiveSub(child.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 8, cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3DDB18'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0ECC6'; }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#7aaa6a' }}>{cap.n}.x.{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a1a', flex: 1 }}>{child.name}</span>
                      <span style={{ color: '#aaa', fontSize: 12 }}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medicamentos del subcapítulo */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>Cargando...</div>
            ) : subMeds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#aaa', background: '#fff', borderRadius: 12, border: '1.5px solid #D0ECC6' }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>💊</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Sin medicamentos en este subcapítulo</div>
                <Link href="/medicamentos/nuevo" style={{ display: 'inline-block', marginTop: 10, padding: '6px 14px', background: '#3DDB18', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                  + Agregar medicamento
                </Link>
              </div>
            ) : (
              <MedTable meds={subMeds} router={router} estadoColor={estadoColor} />
            )}
          </>
        ) : (
          /* Vista capítulo principal */
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7aaa6a', letterSpacing: 2, fontFamily: 'monospace', marginBottom: 4 }}>CAPÍTULO {cap.n}</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a3a1a', margin: 0 }}>{cap.name}</h1>
              <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>{cap.subs.length} subcapítulos · {loading ? '...' : meds.length} medicamentos</p>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', marginBottom: 12 }}>
              SELECCIONA UN SUBCAPÍTULO PARA VER SU CONTENIDO CLÍNICO
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {cap.subs.map((sub, i) => {
                const cnt = medCountForSub(sub.id);
                return (
                  <div key={sub.id} onClick={() => setActiveSub(sub.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 10, cursor: 'pointer', transition: 'all .12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3DDB18'; (e.currentTarget as HTMLElement).style.background = '#f0fdf4'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D0ECC6'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#7aaa6a', minWidth: 28 }}>{cap.n}.{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a1a', flex: 1 }}>{sub.name}</span>
                    {cnt > 0 && <span style={{ fontSize: 11, color: '#7aaa6a', fontFamily: 'monospace' }}>{cnt} med.</span>}
                    <span style={{ color: '#aaa', fontSize: 12 }}>›</span>
                  </div>
                );
              })}
              {isEditor && (
                <button onClick={() => handleAddSub(null)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', background: '#f8fdf8', border: '2px dashed #3DDB18', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#2d6a2d' }}>
                  + Nuevo subcapítulo
                </button>
              )}
            </div>

            {!loading && meds.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 1.5, fontFamily: 'monospace', marginBottom: 12 }}>
                  TODOS LOS MEDICAMENTOS DEL CAPÍTULO
                </div>
                <MedTable meds={meds} router={router} estadoColor={estadoColor} />
              </>
            )}
          </>
        )}
      </main>

      {/* ── Modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '24px 28px', width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3a1a', margin: '0 0 16px' }}>
              {modal.type === 'addSub' ? 'Nuevo subcapítulo' :
               modal.type === 'addCap' ? 'Nuevo capítulo' :
               modal.type === 'rename' || modal.type === 'renameCap' ? 'Renombrar' :
               modal.type === 'delete' ? '¿Eliminar subcapítulo?' : ''}
            </h3>

            {modal.type !== 'delete' ? (
              <input
                autoFocus
                value={modalInput}
                onChange={e => setModalInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmModal()}
                placeholder="Nombre..."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />
            ) : (
              <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
                Esta acción no se puede deshacer. Los medicamentos asignados a este subcapítulo no se eliminarán.
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)}
                style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={confirmModal} disabled={saving}
                style={{ padding: '8px 18px', background: modal.type === 'delete' ? '#DC2626' : '#3DDB18', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : modal.type === 'delete' ? 'Eliminar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tabla comparativa ────────────────────────────────────────────────────
function TablaComparativa({ meds, router }: { meds: Med[]; router: any }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--bg3)' }}>
            {['DCI / Principio activo', 'Nombre comercial', 'Concentración', 'Forma farm.', 'Vía', 'ATC', 'Lab.', 'Precio PVP', 'CNMB', 'RS', 'Estado'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--bdr)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {meds.map((m, i) => (
            <tr key={m.docId} onClick={() => router.push(`/medicamentos/${m.docId}`)}
              style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg)', cursor: 'pointer', transition: 'background .1s', borderTop: '1px solid var(--bdr)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : 'var(--bg)'}>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--tx)' }}>{m.vtm}</td>
              <td style={{ padding: '8px 12px', color: 'var(--tx2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.amp || m.nombre || '—'}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--tx3)' }}>{m.conc || '—'}</td>
              <td style={{ padding: '8px 12px', color: 'var(--tx3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.ff || '—'}</td>
              <td style={{ padding: '8px 12px', color: 'var(--tx3)', whiteSpace: 'nowrap' }}>{m.vias || '—'}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--blue, #1D4ED8)', fontWeight: 600 }}>{m.atc || '—'}</td>
              <td style={{ padding: '8px 12px', color: 'var(--tx3)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.laboratorio}</td>
              <td style={{ padding: '8px 12px', fontWeight: 700, color: m.pp ? 'var(--green)' : 'var(--tx4)' }}>{m.pp ? `${parseFloat(m.pp).toFixed(2)}` : '—'}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>{m.cnmb === 'Sí' ? <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-bg)', padding: '1px 6px', borderRadius: 20 }}>✓</span> : <span style={{ color: 'var(--tx4)' }}>—</span>}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx3)' }}>{m.rs || '—'}</td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: m.estado === 'autorizado' ? 'var(--estado-autorizado-bg)' : 'var(--bg3)', color: m.estado === 'autorizado' ? 'var(--estado-autorizado)' : 'var(--tx3)' }}>{m.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tabla de completitud ──────────────────────────────────────────────────
function TablaCompletitud({ meds, router, calcCompletitud }: { meds: Med[]; router: any; calcCompletitud: (m: Med) => number }) {
  const sorted = [...meds].sort((a, b) => calcCompletitud(b) - calcCompletitud(a));
  return (
    <div style={{ background: '#fff', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--bg3)' }}>
            {['Medicamento', 'Completitud', 'Datos básicos', 'Clínica', 'Documentos', 'Precio', 'Acciones'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--bdr)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => {
            const score = calcCompletitud(m);
            const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--red)';
            const hasClin = m.clinData && Object.keys(m.clinData).length > 0;
            const hasDoc = m.prospectoUrl || m.packagingUrl;
            const hasPrecio = m.pp && parseFloat(m.pp) > 0;
            const check = (v: boolean) => v
              ? <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>
              : <span style={{ color: 'var(--tx4)', fontSize: 14 }}>—</span>;
            return (
              <tr key={m.docId} style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg)', borderTop: '1px solid var(--bdr)', cursor: 'pointer' }}
                onClick={() => router.push(`/medicamentos/${m.docId}`)}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--tx)' }}>{m.vtm}<div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{m.amp || m.nombre}</div></td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                      <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32 }}>{score}%</span>
                  </div>
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>{check(!!(m.vtm && m.conc && m.ff && m.rs))}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>{check(hasClin)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>{check(!!hasDoc)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'center' }}>{check(!!hasPrecio)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <a href={`/medicamentos/${m.docId}/editar`} onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Completar →</a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Med table component ───────────────────────────────────────────────────
function MedTable({ meds, router, estadoColor }: { meds: Med[]; router: any; estadoColor: (e: string) => string }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #D0ECC6', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f0fdf4' }}>
            {['NOMBRE COMERCIAL', 'PRINCIPIO ACTIVO', 'CONCENTRACIÓN', 'LABORATORIO', 'ESTADO', ''].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#7aaa6a', letterSpacing: 0.5, fontFamily: 'monospace', borderBottom: '1.5px solid #D0ECC6' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {meds.map((m, i) => (
            <tr key={m.docId} onClick={() => router.push(`/medicamentos/${m.docId}`)}
              style={{ background: i % 2 === 0 ? '#fff' : '#f8fdf8', borderTop: '1px solid #D0ECC6', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? '#fff' : '#f8fdf8'}>
              <td style={{ padding: '9px 14px', fontWeight: 600, color: '#1a3a1a', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.amp || m.nombre || m.vtm}</td>
              <td style={{ padding: '9px 14px', color: '#3a5c30' }}>{m.vtm}</td>
              <td style={{ padding: '9px 14px', color: '#555', fontFamily: 'monospace', fontSize: 12 }}>{m.conc}</td>
              <td style={{ padding: '9px 14px', color: '#888', fontSize: 12 }}>{m.laboratorio}</td>
              <td style={{ padding: '9px 14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: estadoColor(m.estado), display: 'inline-block' }} />
                  {m.estado}
                </span>
              </td>
              <td style={{ padding: '9px 14px' }}><span style={{ fontSize: 12, color: '#7aaa6a', fontWeight: 600 }}>Ver →</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
