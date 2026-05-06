'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { CHAPS } from '@/lib/capitulos-tree';
import { Suspense } from 'react';

interface Medicamento {
  id: string;
  docId: string;
  vtm: string;
  laboratorio: string;
  ff: string;
  conc: string;
  estado: string;
  amp?: string;
  vmp?: string;
  hasPrices?: boolean;
  prospectoUrl?: string;
  packagingUrl?: string;
  atc?: string;
  rs?: string;
  cum?: string;
  generico?: string;
  nombre?: string;
  cnmb?: string;
}

const PER_PAGE = 15;

const estadoOrden = (estado: string) => {
  if (estado === 'autorizado') return 0;
  if (estado === 'suspendido') return 1;
  if (estado === 'retirado') return 2;
  if (estado === 'arcsa_pendiente') return 4;
  return 3;
};

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  autorizado:      { bg: 'var(--estado-autorizado-bg)',  color: 'var(--estado-autorizado)',  label: 'Autorizado' },
  suspendido:      { bg: 'var(--estado-suspendido-bg)',  color: 'var(--estado-suspendido)',  label: 'Suspendido' },
  retirado:        { bg: 'var(--estado-retirado-bg)',    color: 'var(--estado-retirado)',    label: 'Retirado' },
  arcsa_pendiente: { bg: 'var(--estado-pendiente-bg)',   color: 'var(--estado-pendiente)',   label: 'ARCSA pendiente' },
};

function SlideOver({ med, onClose, isEditor }: { med: Medicamento | null; onClose: () => void; isEditor: boolean }) {
  if (!med) return null;
  const id = med.docId || med.id;

  const field = (label: string, value?: string | null, mono?: boolean) => value ? (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.2, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', fontFamily: mono ? 'var(--mono)' : undefined }}>{value}</div>
    </div>
  ) : null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 200, backdropFilter: 'blur(2px)' }} />
      {/* Panel */}
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 420, background: 'var(--bg2)', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,.15)', animation: 'slideIn .2s ease' }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div style={{ background: 'var(--green-dark, #0F2D5E)', padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--mono)', marginBottom: 3 }}>
                {(med as any).atc || 'Sin ATC'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>
                {(med as any).nombre || med.vtm}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{med.vtm}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
            <EstadoBadge estado={med.estado} />
            {(med as any).cnmb === 'Sí' && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--amber-bg)', color: 'var(--amber)' }}>CNMB</span>}
            {(med as any).generico === 'Sí' && <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'var(--blue-bg)', color: 'var(--blue)' }}>Genérico</span>}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Identificación */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--bdr)' }}>Identificación</div>
          {field('Principio activo (DCI/INN)', med.vtm)}
          {field('Nombre comercial', (med as any).nombre || (med as any).amp)}
          {field('Concentración', med.conc, true)}
          {field('Forma farmacéutica', med.ff)}
          {field('Vía de administración', (med as any).vias || (med as any).via)}
          {field('Código ATC', (med as any).atc, true)}
          {field('Descripción ATC', (med as any).atclbl)}
          {field('Laboratorio', med.laboratorio)}

          {/* Registro */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', margin: '14px 0 10px', paddingBottom: 6, borderBottom: '1px solid var(--bdr)' }}>Registro sanitario</div>
          {field('N° Registro sanitario', (med as any).rs, true)}
          {field('CUM — Código único ARCSA', (med as any).cum, true)}
          {field('Condición de venta', (med as any).rsCondicion)}
          {field('Fecha autorización', (med as any).rsFecha)}
          {field('Fecha vencimiento RS', (med as any).rsVence)}
          {field('Titular del RS', (med as any).rsTitular)}

          {/* Precios */}
          {((med as any).pp || (med as any).pu) && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', margin: '14px 0 10px', paddingBottom: 6, borderBottom: '1px solid var(--bdr)' }}>Precios</div>
              {(med as any).pp && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 4 }}>PRESENTACIÓN</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>$ {parseFloat((med as any).pp).toFixed(2)}</div>
                  </div>
                  {(med as any).pu && (
                    <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '10px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 4 }}>UNITARIO</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--tx)' }}>$ {parseFloat((med as any).pu).toFixed(4)}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* PDFs */}
          {((med as any).prospectoUrl || (med as any).packagingUrl) && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', margin: '14px 0 10px', paddingBottom: 6, borderBottom: '1px solid var(--bdr)' }}>Documentos</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(med as any).prospectoUrl && (
                  <a href={(med as any).prospectoUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--blue-bg)', color: 'var(--blue)', border: '1.5px solid #BFDBFE', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    📄 Prospecto
                  </a>
                )}
                {(med as any).packagingUrl && (
                  <a href={(med as any).packagingUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'var(--purple-bg)', color: 'var(--purple)', border: '1.5px solid #C4B5FD', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    📦 Packaging
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '12px 20px', borderTop: '1.5px solid var(--bdr)', flexShrink: 0, display: 'flex', gap: 8 }}>
          <a href={`/medicamentos/${id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: 'var(--green)', color: '#fff', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Ver ficha completa →
          </a>
          {isEditor && (
            <a href={`/medicamentos/${id}/editar`} style={{ padding: '9px 16px', background: 'var(--bg2)', color: 'var(--blue)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              ✏ Editar
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] || { bg: 'var(--bg3)', color: 'var(--tx3)', label: estado };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function BaseDatosContent() {
  const [todos, setTodos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroGenerico, setFiltroGenerico] = useState('todos');
  const [filtroCNMB, setFiltroCNMB] = useState(false);
  const [filtroCondicion, setFiltroCondicion] = useState('todos'); // todos | otc | prescripcion
  const [pagina, setPagina] = useState(1);
  const [busquedaResults, setBusquedaResults] = useState<Medicamento[] | null>(null);
  const [selectedMed, setSelectedMed] = useState<Medicamento | null>(null);
  const [tipoBusqueda, setTipoBusqueda] = useState<'todo' | 'nombre' | 'vtm' | 'atc' | 'rs'>('todo');
  const { getToken, user, isEditor, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const capitulo = searchParams.get('capitulo');
  const capNombre = capitulo ? CHAPS.find(c => c.id === capitulo)?.name : null;

  const cargarTodos = useCallback(async () => {
    setLoading(true);
    setCargando(true);
    try {
      const token = await getToken();
      if (!token) return;
      let cursorActual: string | null = null;
      let acumulado: Medicamento[] = [];
      let intentos = 0;
      while (intentos < 50) {
        intentos++;
        const params = new URLSearchParams({ limit: '500' });
        if (cursorActual) params.set('cursor', cursorActual);
        if (capitulo) params.set('capitulo', capitulo);
        const res = await fetch(`/api/medicamentos?${params}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        acumulado = [...acumulado, ...(data.medicamentos || [])];
        setTodos([...acumulado]);
        setLoading(false);
        cursorActual = data.nextCursor || null;
        if (!cursorActual) break;
      }
    } catch(e) { console.error(e); }
    finally { setCargando(false); setLoading(false); }
  }, [getToken, capitulo]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    setTodos([]);
    setBusqueda('');
    setPagina(1);
    cargarTodos();
  }, [authLoading, user, capitulo]);

  useEffect(() => {
    if (!busqueda.trim()) { setBusquedaResults(null); setPagina(1); return; }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`/api/busqueda?q=${encodeURIComponent(busqueda)}&tipo=${tipoBusqueda}${capitulo ? `&capitulo=${capitulo}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setBusquedaResults(data.medicamentos || []);
        setPagina(1);
      } catch(e) { console.error(e); }
      finally { setBuscando(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [busqueda, tipoBusqueda]);

  const fuente = busquedaResults ?? todos;
  const ordenados = [...fuente].sort((a, b) => {
    const est = estadoOrden(a.estado) - estadoOrden(b.estado);
    if (est !== 0) return est;
    return ((b as any).hasPrices ? 1 : 0) - ((a as any).hasPrices ? 1 : 0);
  });
  const filtrados = ordenados.filter(m => {
    if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false;
    if (filtroGenerico === 'si' && m.generico !== 'Sí') return false;
    if (filtroGenerico === 'no' && m.generico !== 'No') return false;
    if (filtroCNMB && (m as any).cnmb !== 'Sí') return false;
    if (filtroCondicion === 'otc' && (m as any).rsCondicion !== 'Venta libre') return false;
    if (filtroCondicion === 'prescripcion' && (m as any).rsCondicion === 'Venta libre') return false;
    return true;
  });

  const totalPags = Math.max(1, Math.ceil(filtrados.length / PER_PAGE));
  const paginados = filtrados.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  const limpiarFiltros = () => { setFiltroEstado('todos'); setFiltroGenerico('todos'); setFiltroCNMB(false); setFiltroCondicion('todos'); setBusqueda(''); setPagina(1); };

  const chipBtn = (activo: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    cursor: 'pointer', border: `1.5px solid ${activo ? 'var(--green)' : 'var(--bdr)'}`,
    background: activo ? 'var(--green)' : 'var(--bg2)',
    color: activo ? '#fff' : 'var(--tx2)', transition: 'all .13s',
  });

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--tx4)' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header dark ── */}
        <div style={{ background: 'var(--green-dark, #1B4332)', padding: '20px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Link href="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.85)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}>
              ← Dashboard
            </Link>
            {capNombre && <>
              <span style={{ color: 'rgba(255,255,255,.25)' }}>/</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{capNombre}</span>
            </>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                {capNombre || 'Base de datos'}
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                {filtrados.length} medicamentos
                {cargando && <span style={{ color: 'var(--green-light, #74C69D)', marginLeft: 8 }}>· cargando...</span>}
              </p>
            </div>
            <Link href="/medicamentos/nuevo" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'var(--green-light, #74C69D)', color: 'var(--green-dark, #1B4332)', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'opacity .15s' }}>
              ＋ Nuevo medicamento
            </Link>
          </div>

          {/* Buscador */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <input
              style={{ width: '100%', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 'var(--r)', padding: '11px 16px 11px 40px', fontSize: 14, outline: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', fontFamily: 'var(--sans)', boxSizing: 'border-box', transition: 'border-color .15s' }}
              placeholder="Buscar por principio activo, nombre comercial, laboratorio, ATC…"
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)')}
            />
            {buscando && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Buscando...</span>}
            {busqueda && !buscando && <button onClick={() => { setBusqueda(''); setBusquedaResults(null); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>}
          </div>
        </div>

        {/* ── Filtros ── */}
        <div style={{ background: 'var(--bg2)', borderBottom: '1.5px solid var(--bdr)', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)' }}>ESTADO</span>
            {[['todos', 'Todos'], ['autorizado', 'Autorizado'], ['arcsa_pendiente', 'Pendiente'], ['suspendido', 'Suspendido'], ['retirado', 'Retirado']].map(([val, lbl]) => (
              <button key={val} onClick={() => { setFiltroEstado(val); setPagina(1); }} style={chipBtn(filtroEstado === val)}>{lbl}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)' }}>TIPO</span>
            {[['todos', 'Todos'], ['si', 'Genérico'], ['no', 'Marca']].map(([val, lbl]) => (
              <button key={val} onClick={() => { setFiltroGenerico(val); setPagina(1); }} style={chipBtn(filtroGenerico === val)}>{lbl}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)' }}>BÚSQUEDA POR</span>
            {[['nombre', 'Nombre comercial'], ['vtm', 'INN / DCI'], ['atc', 'Código ATC'], ['rs', 'Registro sanitario'], ['todo', 'Todo']].map(([val, lbl]) => (
              <button key={val} onClick={() => { setTipoBusqueda(val as any); setPagina(1); }} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                border: `1.5px solid ${tipoBusqueda === val ? 'var(--green)' : 'var(--bdr)'}`,
                background: tipoBusqueda === val ? 'var(--green)' : 'var(--bg2)',
                color: tipoBusqueda === val ? '#fff' : 'var(--tx2)', transition: 'all .13s',
              }}>{lbl}</button>
            ))}
          </div>
          {/* Filtros clínicos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)' }}>CLÍNICO</span>
            <button onClick={() => { setFiltroCNMB(!filtroCNMB); setPagina(1); }} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: `1.5px solid ${filtroCNMB ? 'var(--amber)' : 'var(--bdr)'}`,
              background: filtroCNMB ? 'var(--amber-bg)' : 'var(--bg2)',
              color: filtroCNMB ? 'var(--amber)' : 'var(--tx2)', transition: 'all .13s',
            }}>CNMB / Esencial</button>
            {[['todos','Todos'],['otc','Venta libre'],['prescripcion','Prescripción']].map(([val, lbl]) => (
              <button key={val} onClick={() => { setFiltroCondicion(val); setPagina(1); }} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: `1.5px solid ${filtroCondicion === val ? 'var(--green)' : 'var(--bdr)'}`,
                background: filtroCondicion === val ? 'var(--green)' : 'var(--bg2)',
                color: filtroCondicion === val ? '#fff' : 'var(--tx2)', transition: 'all .13s',
              }}>{lbl}</button>
            ))}
          </div>
          {(filtroEstado !== 'todos' || filtroGenerico !== 'todos' || filtroCNMB || filtroCondicion !== 'todos' || busqueda) && (
            <button onClick={limpiarFiltros} style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1.5px solid var(--bdr)', background: 'transparent', color: 'var(--tx3)', transition: 'all .13s' }}>
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* ── Tabla ── */}
        <div style={{ flex: 1, padding: '20px 32px' }}>
          <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bdr)', borderRadius: 'var(--rl)', overflow: 'hidden', boxShadow: 'var(--sh)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    {['S — Principio activo (INN)', 'P — Nombre comercial', 'Conc. / FF', 'ATC', 'O — Laboratorio', 'RS / CUM', 'Estado', ''].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 0.8, fontFamily: 'var(--mono)', textTransform: 'uppercase', borderBottom: '1.5px solid var(--bdr)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--tx4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <div style={{ width: 20, height: 20, border: '2px solid var(--bdr)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        Cargando medicamentos...
                      </div>
                    </td></tr>
                  ) : paginados.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48 }}>
                      <div style={{ color: 'var(--tx4)', fontSize: 13 }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>💊</div>
                        <div style={{ fontWeight: 600 }}>No se encontraron medicamentos</div>
                        {busqueda && <div style={{ fontSize: 12, marginTop: 4 }}>Intenta con otro término de búsqueda</div>}
                      </div>
                    </td></tr>
                  ) : paginados.map((m, i) => {
                    const id = m.docId || m.id;
                    const amp = m.amp || m.nombre || '';
                    return (
                      <tr key={id}
                        onClick={() => setSelectedMed(m)}
                        style={{ borderTop: '1px solid var(--bdr)', background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)', cursor: 'pointer', transition: 'background .1s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--bg2)' : 'var(--bg)'}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--tx)' }}>
                          {m.vtm}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--tx2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {amp || <span style={{ color: 'var(--tx4)', fontStyle: 'italic', fontSize: 11 }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--tx3)', fontSize: 12 }}>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{m.conc || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--tx4)', marginTop: 1 }}>{m.ff || ''}</div>
                        </td>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--blue, #1D4ED8)', fontWeight: 600 }}>
                          {(m as any).atc || '—'}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--tx2)', fontSize: 12 }}>
                          {m.laboratorio || '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <EstadoBadge estado={m.estado} />
                        </td>
                        <td style={{ padding: '8px 14px' }}>
                          {(m as any).rs ? (
                            <div>
                              <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx2)', fontWeight: 600 }}>{(m as any).rs}</div>
                              {(m as any).cum && <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--tx4)', marginTop: 1 }}>CUM: {(m as any).cum}</div>}
                              {(m as any).cnmb === 'Sí' && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 20, background: 'var(--amber-bg)', color: 'var(--amber)', marginTop: 2, display: 'inline-block' }}>CNMB</span>}
                            </div>
                          ) : <span style={{ fontSize: 11, color: 'var(--tx4)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Link href={`/medicamentos/${id}`} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1.5px solid var(--bdr)', color: 'var(--green)', background: 'var(--bg2)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .13s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; }}>
                              Ver
                            </Link>
                            {m.prospectoUrl && (
                              <a href={m.prospectoUrl} target="_blank" rel="noreferrer"
                                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1.5px solid #BFDBFE', color: '#1D4ED8', background: '#EFF6FF', textDecoration: 'none', whiteSpace: 'nowrap' }}
                                title="Ver prospecto PDF">
                                📄 Prospecto
                              </a>
                            )}
                            {m.packagingUrl && (
                              <a href={m.packagingUrl} target="_blank" rel="noreferrer"
                                style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1.5px solid #E9D5FF', color: '#6D28D9', background: '#F5F3FF', textDecoration: 'none', whiteSpace: 'nowrap' }}
                                title="Ver packaging PDF">
                                📦 Packaging
                              </a>
                            )}
                            {isEditor && (
                              <Link href={`/medicamentos/${id}/editar`} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1.5px solid var(--bdr)', color: 'var(--blue, #1D4ED8)', background: 'var(--bg2)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .13s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)'; (e.currentTarget as HTMLElement).style.background = 'var(--blue-bg)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--bdr)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; }}>
                                Editar
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPags > 1 && (() => {
              const delta = 2;
              const pages: (number | string)[] = [];
              pages.push(1);
              if (pagina - delta > 2) pages.push('...');
              for (let p = Math.max(2, pagina - delta); p <= Math.min(totalPags - 1, pagina + delta); p++) pages.push(p);
              if (pagina + delta < totalPags - 1) pages.push('...');
              if (totalPags > 1) pages.push(totalPags);
              return (
                <div style={{ padding: '12px 16px', borderTop: '1.5px solid var(--bdr)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap', background: 'var(--bg3)' }}>
                  <button onClick={() => { setPagina(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }} disabled={pagina === 1}
                    style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid var(--bdr)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--bg2)', color: pagina === 1 ? 'var(--tx4)' : 'var(--tx2)', opacity: pagina === 1 ? 0.4 : 1 }}>‹</button>
                  {pages.map((p, i) => typeof p === 'string'
                    ? <span key={'dot' + i} style={{ fontSize: 13, color: 'var(--tx3)', padding: '0 2px' }}>···</span>
                    : <button key={p} onClick={() => { setPagina(p as number); window.scrollTo(0, 0); }}
                      style={{ minWidth: 32, height: 32, borderRadius: 6, border: '1.5px solid var(--bdr)', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: pagina === p ? 'var(--green)' : 'var(--bg2)', color: pagina === p ? '#fff' : 'var(--tx2)', padding: '0 6px', transition: 'all .13s' }}>
                      {p}
                    </button>
                  )}
                  <button onClick={() => { setPagina(p => Math.min(totalPags, p + 1)); window.scrollTo(0, 0); }} disabled={pagina === totalPags}
                    style={{ padding: '5px 12px', borderRadius: 6, border: '1.5px solid var(--bdr)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--bg2)', color: pagina === totalPags ? 'var(--tx4)' : 'var(--tx2)', opacity: pagina === totalPags ? 0.4 : 1 }}>›</button>
                  <span style={{ fontSize: 12, color: 'var(--tx3)', marginLeft: 8 }}>Pág. {pagina} de {totalPags} · {filtrados.length} registros</span>
                </div>
              );
            })()}
          </div>
        {selectedMed && <SlideOver med={selectedMed} onClose={() => setSelectedMed(null)} isEditor={isEditor} />}
      </div>
      </main>
    </div>
  );
}

export default function BaseDatos() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--tx4)' }}>Cargando...</div>}>
      <BaseDatosContent />
    </Suspense>
  );
}
