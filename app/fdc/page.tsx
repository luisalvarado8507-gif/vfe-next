'use client';
import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import Sidebar from '@/components/layout/Sidebar';

interface CriterioScore {
  id: string; nombre: string; score: 0|1|2; justificacion: string; fuente?: string;
}
interface Evaluacion {
  nombre: string;
  principiosActivos: string[];
  concentraciones: string[];
  scoreTotal: number;
  porcentaje: number;
  vetoAutomatico: boolean;
  veredicto: 'RACIONAL'|'REVISION_EXTENDIDA'|'IRRACIONAL';
  criterios: CriterioScore[];
  evidencia: {
    pubmedCount: number;
    nivelEvidencia: string;
    enWHO_EML: boolean;
    aprobadaEMA: boolean;
    aprobadaFDA: boolean;
    fuentes: string[];
  };
  recomendacion: string;
  fechaEvaluacion: string;
}

const VEREDICTO_CONFIG = {
  RACIONAL:           { bg: '#DCFCE7', color: '#166534', border: '#86EFAC', icon: '✅', label: 'Racional' },
  REVISION_EXTENDIDA: { bg: '#FEF9C3', color: '#854D0E', border: '#FDE68A', icon: '⚠️', label: 'Revisión extendida' },
  IRRACIONAL:         { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', icon: '❌', label: 'Irracional' },
};

const CRITERIO_LABELS: Record<string,string> = {
  C1:'Contribución terapéutica', C2:'Mecanismos complementarios',
  C3:'Farmacocinética compatible', C4:'Toxicidad no supraditiva',
  C5:'Balance beneficio/riesgo', C6:'Dosis fija justificada',
  C7:'Evidencia clínica publicada', C8:'Aprobada en referencia',
};

// Ejemplos precargados
const EJEMPLOS = [
  { nombre: 'Nimesulida + Paracetamol 100+325mg', pas: ['nimesulida','paracetamol'], concs: ['100mg','325mg'] },
  { nombre: 'Amoxicilina + Ácido Clavulánico 500+125mg', pas: ['amoxicilina','ácido clavulánico'], concs: ['500mg','125mg'] },
  { nombre: 'Candesartán + Amlodipino 16+2.5mg', pas: ['candesartán','amlodipino'], concs: ['16mg','2.5mg'] },
  { nombre: 'Diclofenaco + Serratopeptidasa 50+10mg', pas: ['diclofenaco','serratopeptidasa'], concs: ['50mg','10mg'] },
  { nombre: 'Isoniazida + Rifampicina + Pirazinamida', pas: ['isoniazida','rifampicina','pirazinamida'], concs: ['75mg','150mg','400mg'] },
  { nombre: 'Ibuprofeno + Paracetamol + Cafeína', pas: ['ibuprofeno','paracetamol','cafeína'], concs: ['200mg','325mg','30mg'] },
  { nombre: 'Metformina + Glibenclamida 500+5mg', pas: ['metformina','glibenclamida'], concs: ['500mg','5mg'] },
  { nombre: 'Losartán + Hidroclorotiazida 50+12.5mg', pas: ['losartán','hidroclorotiazida'], concs: ['50mg','12.5mg'] },
];

export default function FDCSandbox() {
  const [nombre, setNombre] = useState('');
  const [numPAs, setNumPAs] = useState(2);
  const [pas, setPas] = useState(['','']);
  const [concs, setConcs] = useState(['','']);
  const [evaluando, setEvaluando] = useState(false);
  const [resultado, setResultado] = useState<Evaluacion|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [historial, setHistorial] = useState<Evaluacion[]>([]);

  const updatePA = (i: number, val: string) => {
    const n = [...pas]; n[i] = val; setPas(n);
  };
  const updateConc = (i: number, val: string) => {
    const n = [...concs]; n[i] = val; setConcs(n);
  };
  const setNumPAsHandler = (n: number) => {
    setNumPAs(n);
    setPas(Array(n).fill('').map((_,i) => pas[i]||''));
    setConcs(Array(n).fill('').map((_,i) => concs[i]||''));
  };

  const cargarEjemplo = (ej: typeof EJEMPLOS[0]) => {
    setNombre(ej.nombre);
    setNumPAsHandler(ej.pas.length);
    setPas(ej.pas);
    setConcs(ej.concs);
    setResultado(null);
    setError(null);
  };

  const evaluar = async () => {
    const pasValidos = pas.filter(p => p.trim());
    if (pasValidos.length < 2) { setError('Ingresa al menos 2 principios activos.'); return; }
    setEvaluando(true); setError(null); setResultado(null);

    try {
      const token = await getAuth().currentUser?.getIdToken() ?? '';
      const res = await fetch('/api/fdc/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: nombre || pasValidos.join(' + '),
          pas: pasValidos,
          concs: concs.filter((_,i) => pas[i]?.trim()),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResultado(data);
      setHistorial(prev => [data, ...prev].slice(0,10));
    } catch(e: any) {
      setError(e.message);
    } finally {
      setEvaluando(false);
    }
  };

  const limpiar = () => {
    setNombre(''); setPas(Array(numPAs).fill('')); setConcs(Array(numPAs).fill(''));
    setResultado(null); setError(null);
  };

  const vc = resultado ? VEREDICTO_CONFIG[resultado.veredicto] : null;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--sans)' }}>
      <Sidebar />
      <main style={{ marginLeft:260, flex:1, padding:'28px 36px', maxWidth:1200 }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <div style={{ padding:'4px 10px', borderRadius:6, background:'#EDE9FE', border:'1px solid #C4B5FD' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#5B21B6', fontFamily:'var(--mono)', letterSpacing:0.5 }}>SANDBOX · NO PUBLICA</span>
            </div>
          </div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--tx)', margin:0, marginBottom:4 }}>
            ⚗ Laboratorio FDC — Evaluación de racionalidad
          </h1>
          <p style={{ fontSize:13, color:'var(--tx3)', margin:0 }}>
            Prueba el algoritmo WHO-EMA-FDA con cualquier combinación. Los resultados no se guardan en la base de datos de medicamentos.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:20, alignItems:'start' }}>

          {/* Panel izquierdo — formulario */}
          <div>
            {/* Ejemplos rápidos */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bdr)', borderRadius:12, padding:'14px 16px', marginBottom:14 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'var(--tx3)', letterSpacing:1.5, fontFamily:'var(--mono)', textTransform:'uppercase', marginBottom:10 }}>Ejemplos rápidos</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {EJEMPLOS.map(ej => (
                  <button key={ej.nombre} onClick={() => cargarEjemplo(ej)} style={{
                    fontSize:10, padding:'4px 10px', borderRadius:20, cursor:'pointer',
                    background:'var(--bg)', border:'1px solid var(--bdr)', color:'var(--tx3)',
                    fontFamily:'var(--sans)', transition:'all .12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='var(--green)'; (e.currentTarget as HTMLElement).style.color='#fff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='var(--bg)'; (e.currentTarget as HTMLElement).style.color='var(--tx3)'; }}
                  >
                    {ej.pas.join(' + ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--bdr)', borderRadius:12, padding:'16px' }}>
              <div style={{ fontSize:9, fontWeight:700, color:'var(--tx3)', letterSpacing:1.5, fontFamily:'var(--mono)', textTransform:'uppercase', marginBottom:12 }}>Configurar combinación</div>

              {/* Nombre comercial (opcional) */}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:10, color:'var(--tx3)', fontFamily:'var(--mono)', display:'block', marginBottom:4 }}>NOMBRE COMERCIAL (opcional)</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="ej. Minart AM 16+2.5mg"
                  style={{ width:'100%', padding:'7px 10px', borderRadius:7, border:'1px solid var(--bdr)', fontSize:12, background:'var(--bg)', color:'var(--tx)', fontFamily:'var(--sans)' }} />
              </div>

              {/* Número de PAs */}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:10, color:'var(--tx3)', fontFamily:'var(--mono)', display:'block', marginBottom:6 }}>NÚMERO DE PRINCIPIOS ACTIVOS</label>
                <div style={{ display:'flex', gap:6 }}>
                  {[2,3,4].map(n => (
                    <button key={n} onClick={() => setNumPAsHandler(n)} style={{
                      padding:'5px 14px', borderRadius:7, fontSize:12, cursor:'pointer',
                      background: numPAs===n ? 'var(--green)' : 'var(--bg)',
                      color: numPAs===n ? '#fff' : 'var(--tx3)',
                      border: `1px solid ${numPAs===n ? 'var(--green)' : 'var(--bdr)'}`,
                      fontFamily:'var(--sans)',
                    }}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Principios activos */}
              {Array.from({length:numPAs}).map((_,i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <label style={{ fontSize:10, color:'var(--tx3)', fontFamily:'var(--mono)', display:'block', marginBottom:4 }}>
                    INN / DCI #{i+1}
                  </label>
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={pas[i]||''} onChange={e => updatePA(i, e.target.value)}
                      placeholder={['amoxicilina','ácido clavulánico','pirazinamida'][i]||`principio activo ${i+1}`}
                      style={{ flex:2, padding:'7px 10px', borderRadius:7, border:'1px solid var(--bdr)', fontSize:12, background:'var(--bg)', color:'var(--tx)', fontFamily:'var(--sans)' }} />
                    <input value={concs[i]||''} onChange={e => updateConc(i, e.target.value)}
                      placeholder="500mg"
                      style={{ flex:1, padding:'7px 10px', borderRadius:7, border:'1px solid var(--bdr)', fontSize:12, background:'var(--bg)', color:'var(--tx)', fontFamily:'var(--mono)' }} />
                  </div>
                </div>
              ))}

              {error && <div style={{ padding:'8px 12px', background:'#FEE2E2', borderRadius:7, color:'#991B1B', fontSize:11, marginBottom:12 }}>{error}</div>}

              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button onClick={evaluar} disabled={evaluando} style={{
                  flex:1, padding:'10px 0', borderRadius:8, fontSize:13, fontWeight:700,
                  background: evaluando ? 'var(--bg3)' : 'var(--green)', color:'#fff',
                  border:'none', cursor: evaluando ? 'not-allowed' : 'pointer', fontFamily:'var(--sans)',
                }}>
                  {evaluando ? '⟳ Evaluando...' : '▶ Evaluar combinación'}
                </button>
                <button onClick={limpiar} style={{
                  padding:'10px 14px', borderRadius:8, fontSize:12, background:'var(--bg)',
                  color:'var(--tx3)', border:'1px solid var(--bdr)', cursor:'pointer', fontFamily:'var(--sans)',
                }}>✕</button>
              </div>
            </div>

            {/* Historial */}
            {historial.length > 0 && (
              <div style={{ background:'var(--bg2)', border:'1px solid var(--bdr)', borderRadius:12, padding:'14px 16px', marginTop:14 }}>
                <div style={{ fontSize:9, fontWeight:700, color:'var(--tx3)', letterSpacing:1.5, fontFamily:'var(--mono)', textTransform:'uppercase', marginBottom:10 }}>Historial de sesión</div>
                {historial.map((h,i) => {
                  const hvc = VEREDICTO_CONFIG[h.veredicto];
                  return (
                    <div key={i} onClick={() => setResultado(h)} style={{
                      display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:7,
                      cursor:'pointer', marginBottom:4, background:'var(--bg)', border:'1px solid var(--bdr)',
                      transition:'all .12s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--green)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='var(--bdr)'}
                    >
                      <span style={{ fontSize:12 }}>{hvc.icon}</span>
                      <span style={{ fontSize:11, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--tx2)' }}>{h.principiosActivos.join(' + ')}</span>
                      <span style={{ fontSize:10, fontFamily:'var(--mono)', color:hvc.color, fontWeight:700 }}>{h.scoreTotal}/16</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel derecho — resultado */}
          <div>
            {!resultado && !evaluando && (
              <div style={{ padding:60, textAlign:'center', background:'var(--bg2)', borderRadius:12, border:'1.5px dashed var(--bdr)' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>⚗</div>
                <div style={{ fontSize:15, fontWeight:600, color:'var(--tx)', marginBottom:8 }}>Laboratorio FDC listo</div>
                <div style={{ fontSize:12, color:'var(--tx4)', lineHeight:1.6 }}>
                  Selecciona un ejemplo o ingresa los principios activos<br/>de la combinación que deseas evaluar.
                </div>
              </div>
            )}

            {evaluando && (
              <div style={{ padding:60, textAlign:'center', background:'var(--bg2)', borderRadius:12 }}>
                <div style={{ fontSize:32, marginBottom:12, animation:'spin 1s linear infinite' }}>⟳</div>
                <div style={{ fontSize:14, color:'var(--tx3)' }}>Consultando PubMed · WHO EML · Aplicando criterios...</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {resultado && vc && (
              <div>
                {/* Veredicto */}
                <div style={{ padding:'18px 22px', borderRadius:12, background:vc.bg, border:`1.5px solid ${vc.border}`, marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ fontSize:36 }}>{vc.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:20, fontWeight:700, color:vc.color, marginBottom:4 }}>
                      {vc.label}
                      {resultado.vetoAutomatico && <span style={{ fontSize:10, marginLeft:10, background:'#FCA5A5', color:'#7F1D1D', padding:'2px 8px', borderRadius:4, fontFamily:'var(--mono)' }}>VETO AUTOMÁTICO</span>}
                    </div>
                    <div style={{ fontSize:12, color:vc.color, opacity:0.85, lineHeight:1.5 }}>{resultado.recomendacion}</div>
                    <div style={{ fontSize:11, color:'var(--tx4)', marginTop:6, fontFamily:'var(--mono)' }}>
                      {resultado.principiosActivos.join(' + ')} · {new Date(resultado.fechaEvaluacion).toLocaleTimeString('es-EC')}
                    </div>
                  </div>
                  <div style={{ textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontSize:32, fontWeight:700, color:vc.color, fontFamily:'var(--mono)' }}>{resultado.scoreTotal}/16</div>
                    <div style={{ fontSize:11, color:vc.color, opacity:0.7 }}>{resultado.porcentaje}%</div>
                  </div>
                </div>

                {/* Barra */}
                <div style={{ height:8, background:'var(--bg3)', borderRadius:4, overflow:'hidden', marginBottom:16 }}>
                  <div style={{ height:'100%', borderRadius:4, width:`${resultado.porcentaje}%`, background: resultado.porcentaje>=75 ? '#22C55E' : resultado.porcentaje>=50 ? '#F59E0B' : '#EF4444', transition:'width .6s' }} />
                </div>

                {/* Criterios */}
                <div style={{ fontSize:9, fontWeight:700, color:'var(--tx3)', letterSpacing:1.5, fontFamily:'var(--mono)', textTransform:'uppercase', marginBottom:10 }}>Criterios WHO-EMA-FDA</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                  {resultado.criterios.map(c => (
                    <div key={c.id} style={{ padding:'10px 12px', borderRadius:8, background: c.score===2?'#F0FDF4':c.score===1?'#FEFCE8':'#FEF2F2', border:`1px solid ${c.score===2?'#86EFAC':c.score===1?'#FDE68A':'#FCA5A5'}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                        <span style={{ fontSize:9, fontWeight:700, fontFamily:'var(--mono)', color:'var(--tx3)' }}>{c.id}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:'1px 7px', borderRadius:4, background: c.score===2?'#86EFAC':c.score===1?'#FDE68A':'#FCA5A5', color: c.score===2?'#166534':c.score===1?'#854D0E':'#991B1B', fontFamily:'var(--mono)' }}>{c.score}/2</span>
                      </div>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--tx)', marginBottom:3 }}>{CRITERIO_LABELS[c.id]||c.nombre}</div>
                      <div style={{ fontSize:10, color:'var(--tx3)', lineHeight:1.4 }}>{c.justificacion}</div>
                      {c.fuente && <div style={{ fontSize:9, color:'var(--tx4)', marginTop:4, fontFamily:'var(--mono)' }}>{c.fuente}</div>}
                    </div>
                  ))}
                </div>

                {/* Evidencia */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
                  {[
                    { label:'RCTs PubMed', value:String(resultado.evidencia.pubmedCount), ok:resultado.evidencia.pubmedCount>=3 },
                    { label:'Nivel evidencia', value:resultado.evidencia.nivelEvidencia, ok:['Ia','Ib'].includes(resultado.evidencia.nivelEvidencia) },
                    { label:'WHO EML', value:resultado.evidencia.enWHO_EML?'Incluida':'No incluida', ok:resultado.evidencia.enWHO_EML },
                    { label:'Referencia', value:[resultado.evidencia.aprobadaEMA&&'EMA',resultado.evidencia.aprobadaFDA&&'FDA'].filter(Boolean).join(' · ')||'—', ok:resultado.evidencia.aprobadaEMA||resultado.evidencia.aprobadaFDA },
                  ].map(item => (
                    <div key={item.label} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg2)', border:'1px solid var(--bdr)', textAlign:'center' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:item.ok?'#166534':'#991B1B', fontFamily:'var(--mono)', marginBottom:3 }}>{item.value||'—'}</div>
                      <div style={{ fontSize:9, color:'var(--tx4)', textTransform:'uppercase', letterSpacing:0.8 }}>{item.label}</div>
                    </div>
                  ))}
                </div>

                {/* Fuentes */}
                <div style={{ padding:'10px 14px', background:'var(--bg2)', borderRadius:8, border:'1px solid var(--bdr)' }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--tx3)', letterSpacing:1.2, fontFamily:'var(--mono)', textTransform:'uppercase', marginBottom:6 }}>Fuentes consultadas</div>
                  {resultado.evidencia.fuentes.map((f,i) => (
                    <div key={i} style={{ fontSize:10, color:'var(--tx4)', fontFamily:'var(--mono)', marginBottom:2 }}>· {f}</div>
                  ))}
                  <div style={{ fontSize:9, color:'var(--tx4)', marginTop:8, fontStyle:'italic' }}>
                    ⚗ Sandbox — resultado NO guardado en base de datos
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
