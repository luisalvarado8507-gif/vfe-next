'use client';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { MEDDRA_SOC, buscarPT, getSOCLabel, type MedDRAPT } from '@/lib/meddra';

type TipoReporte = 'RAM' | 'FT' | 'EM';
type Gravedad = 'leve' | 'moderada' | 'grave' | 'mortal';
type Causalidad = 'definitiva' | 'probable' | 'posible' | 'dudosa' | 'no_evaluable';

interface RAM { id: string; ptCode: string; ptTerm: string; socCode: string; descripcion: string; fechaInicio: string; fechaFin: string; gravedad: Gravedad; }

interface ReporteRAM {
  tipo: TipoReporte; fechaReporte: string;
  notificadorNombre: string; notificadorProfesion: string; notificadorEmail: string; notificadorInstitucion: string;
  pacienteInicialesNombre: string; pacienteSexo: string; pacienteEdad: string; pacienteEdadUnidad: string; pacientePeso: string; pacienteEmbarazo: string;
  medicamentoSospechoso: string; medicamentoRS: string; medicamentoDosis: string; medicamentoVia: string; medicamentoFechaInicio: string; medicamentoFechaFin: string; medicamentoIndicacion: string; medicamentosConcomitantes: string;
  rams: RAM[]; causalidad: Causalidad; desenlace: string; accionTomada: string; reexposicion: string; informacionAdicional: string;
  icd11Code: string; icd11Term: string; icd11SearchQuery: string;
}

const PROFESIONES = ['Médico/a','Farmacéutico/a','Enfermero/a','Odontólogo/a','Obstetra','Paciente/Consumidor','Otro'];
const GRAVEDAD_CONFIG: Record<Gravedad,{label:string;color:string;bg:string}> = {
  leve:{label:'Leve',color:'#166534',bg:'#DCFCE7'},
  moderada:{label:'Moderada',color:'#854D0E',bg:'#FEF9C3'},
  grave:{label:'Grave',color:'#991B1B',bg:'#FEE2E2'},
  mortal:{label:'Mortal',color:'#fff',bg:'#7F1D1D'},
};
const CAUSALIDAD = [
  {k:'definitiva',label:'Definitiva',desc:'Relación causal clara y confirmada'},
  {k:'probable',label:'Probable',desc:'Relación causal muy probable'},
  {k:'posible',label:'Posible',desc:'Relación causal posible'},
  {k:'dudosa',label:'Dudosa',desc:'Relación causal improbable'},
  {k:'no_evaluable',label:'No evaluable',desc:'Información insuficiente'},
];
const STEPS = ['Tipo y notificador','Paciente','Medicamento','Reacciones MedDRA','Evaluación','Resumen'];

const inp = (s?:any): React.CSSProperties => ({width:'100%',padding:'7px 10px',borderRadius:7,fontSize:12,border:'1px solid var(--bdr)',background:'var(--bg)',color:'var(--tx)',fontFamily:'var(--sans)',...s});
const card: React.CSSProperties = {background:'var(--bg2)',border:'1px solid var(--bdr)',borderRadius:12,padding:'16px 18px',marginBottom:14};
const lbl = (t:string,r?:boolean) => <div style={{fontSize:10,color:'var(--tx3)',fontFamily:'var(--mono)',marginBottom:4,letterSpacing:.5}}>{t}{r&&<span style={{color:'#E24B4A',marginLeft:2}}>*</span>}</div>;
const fld = (l:string,c:React.ReactNode,r?:boolean) => <div style={{marginBottom:12}}>{lbl(l,r)}{c}</div>;

export default function Farmacovigilancia() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [busq, setBusq] = useState('');
  const [sugs, setSugs] = useState<MedDRAPT[]>([]);
  const [socOpen, setSocOpen] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  const [icd11Sugs, setIcd11Sugs] = useState<any[]>([]);
  const [icd11Buscando, setIcd11Buscando] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'nuevo'|'historial'>('nuevo');
  const [medQuery, setMedQuery] = useState('');
  const [medSugs, setMedSugs] = useState<any[]>([]);
  const [medBuscando, setMedBuscando] = useState(false);

  const [rep, setRep] = useState<ReporteRAM>({
    tipo:'RAM', fechaReporte:new Date().toISOString().split('T')[0],
    notificadorNombre:'', notificadorProfesion:'Médico/a', notificadorEmail:user?.email||'', notificadorInstitucion:'',
    pacienteInicialesNombre:'', pacienteSexo:'', pacienteEdad:'', pacienteEdadUnidad:'años', pacientePeso:'', pacienteEmbarazo:'NA',
    medicamentoSospechoso:'', medicamentoRS:'', medicamentoDosis:'', medicamentoVia:'oral',
    medicamentoFechaInicio:'', medicamentoFechaFin:'', medicamentoIndicacion:'', medicamentosConcomitantes:'',
    rams:[], causalidad:'posible', desenlace:'recuperando', accionTomada:'', reexposicion:'desconocido', informacionAdicional:'',
    icd11Code:'', icd11Term:'', icd11SearchQuery:'',
  });

  const s = (k:keyof ReporteRAM,v:any) => setRep(p=>({...p,[k]:v}));

  useEffect(()=>{ if(busq.length>1) setSugs(buscarPT(busq)); else setSugs([]); },[busq]);

  const addRAM = (pt:MedDRAPT) => {
    s('rams',[...rep.rams,{id:Date.now().toString(),ptCode:pt.code,ptTerm:pt.term,socCode:pt.soc,descripcion:'',fechaInicio:'',fechaFin:'',gravedad:'moderada' as Gravedad}]);
    setBusq(''); setSugs([]);
  };
  const rmRAM = (id:string) => s('rams',rep.rams.filter(r=>r.id!==id));
  const upRAM = (id:string,k:keyof RAM,v:any) => s('rams',rep.rams.map(r=>r.id===id?{...r,[k]:v}:r));

  const guardar = async () => {
    setSaving(true);
    try {
      const token = await getAuth().currentUser?.getIdToken()??'';
      const res = await fetch('/api/farmacovigilancia',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(rep)});
      if(res.ok){setSaved(true);setTab('historial');}
    } catch(e){console.error(e);}
    setSaving(false);
  };

  const exportarE2B = async () => {
    try {
      const token = await getAuth().currentUser?.getIdToken() ?? '';
      // Exportar el reporte actual como E2B(R3) XML
      const res = await fetch('/api/farmacovigilancia/e2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(rep),
      });
      if (!res.ok) throw new Error('Error generando E2B');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `E2B_SIMI_${Date.now()}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) { console.error(e); }
  };

  const buscarICD11 = async (q: string) => {
    s('icd11SearchQuery', q);
    if (q.length < 3) { setIcd11Sugs([]); return; }
    setIcd11Buscando(true);
    try {
      // API pública ICD-11 OMS — no requiere token para búsqueda
      const res = await fetch(
        `https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(q)}&subtreeFilterUsage=foundationDescendants&includeKeywordResult=true&useFlexisearch=false&flatResults=true&highlightingEnabled=false`,
        { headers: { 'Accept': 'application/json', 'Accept-Language': 'es', 'API-Version': 'v2' } }
      );
      const data = await res.json();
      const items = (data.destinationEntities || []).slice(0, 8).map((e: any) => ({
        code: e.theCode || e.id?.split('/').pop() || '',
        term: e.title || e.fullySpecifiedName || '',
        id: e.id || '',
      }));
      setIcd11Sugs(items);
    } catch { setIcd11Sugs([]); }
    setIcd11Buscando(false);
  };

  const seleccionarICD11 = (item: any) => {
    s('icd11Code', item.code);
    s('icd11Term', item.term);
    s('icd11SearchQuery', `${item.code} — ${item.term}`);
    setIcd11Sugs([]);
  };

  const buscarMedicamento = async (q: string) => {
    setMedQuery(q);
    s('medicamentoSospechoso', q);
    if (q.length < 2) { setMedSugs([]); return; }
    setMedBuscando(true);
    try {
      const res = await fetch(`/api/search-med?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setMedSugs(Array.isArray(data) ? data : []);
    } catch { setMedSugs([]); }
    setMedBuscando(false);
  };

  const seleccionarMedicamento = (med: any) => {
    setMedQuery(med.nombre || med.amp || '');
    setMedSugs([]);
    setRep(p => ({
      ...p,
      medicamentoSospechoso: med.nombre || med.amp || '',
      medicamentoRS:         med.rs || '',
      medicamentoDosis:      med.conc ? `${med.conc}` : '',
      medicamentoVia:        med.via || med.vias || 'oral',
      medicamentoIndicacion: med.vtm || '',
    }));
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--sans)'}}>
      <Sidebar/>
      <main style={{marginLeft:260,flex:1,padding:'28px 36px',maxWidth:1100}}>

        <div style={{marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <span style={{padding:'4px 10px',borderRadius:6,background:'#FEF9C3',border:'1px solid #FDE68A',fontSize:11,fontWeight:700,color:'#854D0E',fontFamily:'var(--mono)'}}>TARJETA AMARILLA · CNFV ARCSA</span>
            <span style={{padding:'4px 10px',borderRadius:6,background:'#EEEDFE',border:'1px solid #C4B5FD',fontSize:11,fontWeight:700,color:'#5B21B6',fontFamily:'var(--mono)'}}>MedDRA v24.1</span>
          </div>
          <h1 style={{fontSize:22,fontWeight:700,color:'var(--tx)',margin:0,marginBottom:4}}>Farmacovigilancia</h1>
          <p style={{fontSize:13,color:'var(--tx3)',margin:0}}>Notificación de RAM · Falla Terapéutica · Errores de Medicación · CNFV Ecuador</p>
        </div>

        <div style={{display:'flex',gap:6,marginBottom:20}}>
          {(['nuevo','historial'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 16px',borderRadius:8,fontSize:12,cursor:'pointer',background:tab===t?'var(--green)':'var(--bg2)',color:tab===t?'#fff':'var(--tx3)',border:`1px solid ${tab===t?'var(--green)':'var(--bdr)'}`,fontFamily:'var(--sans)',fontWeight:tab===t?700:400}}>
              {t==='nuevo'?'+ Nuevo reporte':'◉ Historial'}
            </button>
          ))}
        </div>

        {tab==='historial'&&(
          <div style={card}>
            {saved
              ? <div style={{padding:'12px 16px',background:'#DCFCE7',borderRadius:8,border:'1px solid #86EFAC',color:'#166534',fontSize:13,fontWeight:600}}>
                  Reporte guardado. El CNFV ARCSA recibirá la notificación en farmaco.vigilancia@controlsanitario.gob.ec
                </div>
              : <div style={{padding:32,textAlign:'center',color:'var(--tx4)',fontSize:13}}>
                  <div style={{fontSize:28,marginBottom:10}}>◎</div>
                  Sin reportes en esta sesión.
                </div>
            }
          </div>
        )}

        {tab==='nuevo'&&(<>
          {/* Stepper */}
          <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:24,overflowX:'auto'}}>
            {STEPS.map((l,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center'}}>
                <button onClick={()=>setStep(i)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',padding:'4px 8px'}}>
                  <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,background:step===i?'var(--green)':step>i?'#22C55E':'var(--bg3)',color:step>=i?'#fff':'var(--tx4)',border:`2px solid ${step===i?'var(--green)':step>i?'#22C55E':'var(--bdr)'}`}}>{step>i?'✓':i+1}</div>
                  <span style={{fontSize:9,color:step===i?'var(--green)':'var(--tx4)',fontFamily:'var(--mono)',whiteSpace:'nowrap'}}>{l}</span>
                </button>
                {i<STEPS.length-1&&<div style={{width:20,height:1,background:step>i?'#22C55E':'var(--bdr)',flexShrink:0}}/>}
              </div>
            ))}
          </div>

          {/* PASO 0 */}
          {step===0&&(
            <div>
              <div style={card}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:12}}>Tipo de reporte</div>
                <div style={{display:'flex',gap:8,marginBottom:8}}>
                  {(['RAM','FT','EM'] as TipoReporte[]).map(t=>(
                    <button key={t} onClick={()=>s('tipo',t)} style={{flex:1,padding:'10px 0',borderRadius:8,fontSize:12,cursor:'pointer',fontWeight:rep.tipo===t?700:400,background:rep.tipo===t?(t==='RAM'?'#FEF9C3':t==='FT'?'#DBEAFE':'#EEEDFE'):'var(--bg)',color:rep.tipo===t?(t==='RAM'?'#854D0E':t==='FT'?'#1E40AF':'#5B21B6'):'var(--tx3)',border:`1.5px solid ${rep.tipo===t?(t==='RAM'?'#FCD34D':t==='FT'?'#93C5FD':'#C4B5FD'):'var(--bdr)'}`,fontFamily:'var(--sans)'}}>
                      {t==='RAM'?'⚠ Reacción Adversa':t==='FT'?'◎ Falla Terapéutica':'⊘ Error de Medicación'}
                    </button>
                  ))}
                </div>
                <div style={{fontSize:11,color:'var(--tx4)'}}>
                  {rep.tipo==='RAM'&&'Respuesta nociva no intencionada a un medicamento a dosis normales de uso terapéutico.'}
                  {rep.tipo==='FT'&&'El medicamento no produce el efecto terapéutico esperado en las condiciones de uso autorizadas.'}
                  {rep.tipo==='EM'&&'Error en el proceso de prescripción, dispensación, preparación o administración del medicamento.'}
                </div>
              </div>
              <div style={card}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:12}}>Datos del notificador</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {fld('Nombre completo',<input value={rep.notificadorNombre} onChange={e=>s('notificadorNombre',e.target.value)} style={inp()} placeholder="Dr. Juan Pérez"/>,true)}
                  {fld('Profesión',<select value={rep.notificadorProfesion} onChange={e=>s('notificadorProfesion',e.target.value)} style={inp()}>{PROFESIONES.map(p=><option key={p}>{p}</option>)}</select>,true)}
                  {fld('Correo electrónico',<input type="email" value={rep.notificadorEmail} onChange={e=>s('notificadorEmail',e.target.value)} style={inp()} placeholder="correo@hospital.ec"/>,true)}
                  {fld('Institución',<input value={rep.notificadorInstitucion} onChange={e=>s('notificadorInstitucion',e.target.value)} style={inp()} placeholder="Hospital General..."/>)}
                  {fld('Fecha del reporte',<input type="date" value={rep.fechaReporte} onChange={e=>s('fechaReporte',e.target.value)} style={inp()}/>,true)}
                </div>
              </div>
            </div>
          )}

          {/* PASO 1 */}
          {step===1&&(
            <div style={card}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:12}}>Datos del paciente (solo iniciales — confidencial)</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                {fld('Iniciales del paciente',<input value={rep.pacienteInicialesNombre} onChange={e=>s('pacienteInicialesNombre',e.target.value)} style={inp()} placeholder="J.P."/>,true)}
                {fld('Sexo biológico',<select value={rep.pacienteSexo} onChange={e=>s('pacienteSexo',e.target.value)} style={inp()}><option value="">Seleccionar...</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="indeterminado">Indeterminado</option></select>)}
                {fld('Edad',<div style={{display:'flex',gap:6}}><input type="number" value={rep.pacienteEdad} onChange={e=>s('pacienteEdad',e.target.value)} style={inp({flex:2})} placeholder="45"/><select value={rep.pacienteEdadUnidad} onChange={e=>s('pacienteEdadUnidad',e.target.value)} style={inp({flex:1})}><option value="años">años</option><option value="meses">meses</option><option value="días">días</option></select></div>)}
                {fld('Peso (kg)',<input type="number" value={rep.pacientePeso} onChange={e=>s('pacientePeso',e.target.value)} style={inp()} placeholder="70"/>)}
                {fld('¿Embarazo?',<select value={rep.pacienteEmbarazo} onChange={e=>s('pacienteEmbarazo',e.target.value)} style={inp()}><option value="NA">No aplica</option><option value="si">Sí</option><option value="no">No</option><option value="desconocido">Desconocido</option></select>)}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step===2&&(
            <div style={card}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:12}}>Medicamento sospechoso</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {fld('Nombre comercial / DCI',
                  <div style={{position:'relative'}}>
                    <input
                      value={medQuery || rep.medicamentoSospechoso}
                      onChange={e => buscarMedicamento(e.target.value)}
                      style={inp()}
                      placeholder="Escribe para buscar en SIMI... (ej: Minart AM)"
                    />
                    {medBuscando && <div style={{position:'absolute',right:10,top:8,fontSize:11,color:'var(--tx4)'}}>⟳</div>}
                    {medSugs.length > 0 && (
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg)',border:'1px solid var(--bdr)',borderRadius:8,zIndex:50,maxHeight:260,overflowY:'auto',boxShadow:'0 4px 16px rgba(0,0,0,.12)'}}>
                        {medSugs.map((med: any, i: number) => (
                          <button key={i} onClick={() => seleccionarMedicamento(med)}
                            style={{display:'flex',alignItems:'flex-start',gap:10,width:'100%',padding:'10px 12px',background:'none',border:'none',cursor:'pointer',textAlign:'left',borderBottom:'1px solid var(--bdr)'}}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:700,color:'var(--tx)',marginBottom:2}}>{med.nombre || med.amp}</div>
                              <div style={{fontSize:10,color:'var(--tx3)',fontFamily:'var(--mono)'}}>
                                {med.vtm && <span style={{marginRight:8}}>{med.vtm}</span>}
                                {med.conc && <span style={{marginRight:8}}>{med.conc}</span>}
                                {med.ff && <span style={{marginRight:8}}>{med.ff}</span>}
                              </div>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0}}>
                              {med.rs && <div style={{fontSize:9,fontFamily:'var(--mono)',color:'var(--tx4)',marginBottom:2}}>{med.rs}</div>}
                              <span style={{fontSize:9,padding:'2px 6px',borderRadius:10,background: med.estado==='autorizado'?'#DCFCE7':'#FEF9C3',color:med.estado==='autorizado'?'#166534':'#854D0E',fontFamily:'var(--mono)',fontWeight:700}}>{med.estado||'pendiente'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>,true)}
                {fld('Registro sanitario ARCSA',<input value={rep.medicamentoRS} onChange={e=>s('medicamentoRS',e.target.value)} style={inp()} placeholder="2967-MEE-0817"/>)}
                {fld('Dosis y frecuencia',<input value={rep.medicamentoDosis} onChange={e=>s('medicamentoDosis',e.target.value)} style={inp()} placeholder="16+2.5mg cada 24h"/>)}
                {fld('Vía de administración',<select value={rep.medicamentoVia} onChange={e=>s('medicamentoVia',e.target.value)} style={inp()}>{['oral','intravenosa','intramuscular','subcutánea','tópica','inhalatoria','oftálmica','rectal','sublingual','transdérmica'].map(v=><option key={v} value={v}>{v}</option>)}</select>)}
                {fld('Fecha inicio',<input type="date" value={rep.medicamentoFechaInicio} onChange={e=>s('medicamentoFechaInicio',e.target.value)} style={inp()}/>)}
                {fld('Fecha fin',<input type="date" value={rep.medicamentoFechaFin} onChange={e=>s('medicamentoFechaFin',e.target.value)} style={inp()}/>)}
                <div style={{gridColumn:'1/-1'}}>{fld('Indicación terapéutica',<input value={rep.medicamentoIndicacion} onChange={e=>s('medicamentoIndicacion',e.target.value)} style={inp()} placeholder="Hipertensión arterial"/>,true)}</div>
                <div style={{gridColumn:'1/-1'}}>{fld('Medicamentos concomitantes',<textarea value={rep.medicamentosConcomitantes} onChange={e=>s('medicamentosConcomitantes',e.target.value)} style={{...inp(),height:70,resize:'vertical'}} placeholder="metformina 500mg, atorvastatina 20mg..."/>)}</div>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step===3&&(
            <div>
              <div style={card}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:10}}>Buscar término MedDRA (PT)</div>
                <div style={{position:'relative'}}>
                  <input value={busq} onChange={e=>setBusq(e.target.value)} style={inp()} placeholder="Escribe el síntoma... (ej: cefalea, nauseas, rash, mareos)"/>
                  {sugs.length>0&&(
                    <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg)',border:'1px solid var(--bdr)',borderRadius:8,zIndex:50,maxHeight:220,overflowY:'auto'}}>
                      {sugs.map(pt=>(
                        <button key={pt.code} onClick={()=>addRAM(pt)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'8px 12px',background:'none',border:'none',cursor:'pointer',textAlign:'left'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='none'}>
                          <span style={{fontSize:10,fontFamily:'var(--mono)',color:'#5B21B6',minWidth:72}}>{pt.code}</span>
                          <div><div style={{fontSize:12,fontWeight:600,color:'var(--tx)'}}>{pt.term}</div><div style={{fontSize:10,color:'var(--tx4)'}}>{getSOCLabel(pt.soc)}</div></div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{marginTop:14}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.2,fontFamily:'var(--mono)',marginBottom:8}}>O EXPLORAR POR SISTEMA DE ÓRGANOS (SOC)</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:4}}>
                    {MEDDRA_SOC.map(soc=>(
                      <div key={soc.code}>
                        <button onClick={()=>setSocOpen(socOpen===soc.code?null:soc.code)} style={{width:'100%',padding:'6px 10px',borderRadius:6,fontSize:11,background:socOpen===soc.code?'#EEEDFE':'var(--bg2)',color:socOpen===soc.code?'#5B21B6':'var(--tx3)',border:`1px solid ${socOpen===soc.code?'#C4B5FD':'var(--bdr)'}`,cursor:'pointer',textAlign:'left',fontFamily:'var(--sans)'}}>
                          {socOpen===soc.code?'▾':'▸'} {soc.label}
                        </button>
                        {socOpen===soc.code&&(
                          <div style={{padding:'4px 0 4px 8px',display:'flex',flexWrap:'wrap',gap:4}}>
                            {soc.pts.map(pt=>(
                              <button key={pt.code} onClick={()=>addRAM(pt)} style={{fontSize:10,padding:'3px 8px',borderRadius:12,cursor:'pointer',background:'var(--bg)',border:'1px solid var(--bdr)',color:'var(--tx3)',fontFamily:'var(--sans)'}}
                                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#EEEDFE';(e.currentTarget as HTMLElement).style.color='#5B21B6';}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='var(--bg)';(e.currentTarget as HTMLElement).style.color='var(--tx3)';}}>
                                + {pt.term}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {rep.rams.length>0&&(
                <div style={card}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:12}}>Reacciones seleccionadas ({rep.rams.length})</div>
                  {rep.rams.map(r=>{
                    const gc=GRAVEDAD_CONFIG[r.gravedad];
                    return (
                      <div key={r.id} style={{padding:'12px 14px',background:'var(--bg)',border:'1px solid var(--bdr)',borderRadius:8,marginBottom:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                          <span style={{fontSize:9,fontFamily:'var(--mono)',color:'#5B21B6',background:'#EEEDFE',padding:'2px 6px',borderRadius:4}}>{r.ptCode}</span>
                          <span style={{fontSize:12,fontWeight:700,color:'var(--tx)',flex:1}}>{r.ptTerm}</span>
                          <span style={{fontSize:10,color:'var(--tx4)',fontStyle:'italic'}}>{getSOCLabel(r.socCode)}</span>
                          <select value={r.gravedad} onChange={e=>upRAM(r.id,'gravedad',e.target.value as Gravedad)} style={{fontSize:10,padding:'2px 6px',borderRadius:6,border:'1px solid var(--bdr)',background:gc.bg,color:gc.color,fontFamily:'var(--sans)',fontWeight:700}}>
                            {Object.entries(GRAVEDAD_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <button onClick={()=>rmRAM(r.id)} style={{fontSize:12,color:'var(--tx4)',background:'none',border:'none',cursor:'pointer'}}>✕</button>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                          <div><div style={{fontSize:9,color:'var(--tx4)',marginBottom:3}}>Fecha inicio</div><input type="date" value={r.fechaInicio} onChange={e=>upRAM(r.id,'fechaInicio',e.target.value)} style={inp({fontSize:11})}/></div>
                          <div><div style={{fontSize:9,color:'var(--tx4)',marginBottom:3}}>Fecha fin</div><input type="date" value={r.fechaFin} onChange={e=>upRAM(r.id,'fechaFin',e.target.value)} style={inp({fontSize:11})}/></div>
                          <div><div style={{fontSize:9,color:'var(--tx4)',marginBottom:3}}>Descripción</div><input value={r.descripcion} onChange={e=>upRAM(r.id,'descripcion',e.target.value)} placeholder="Detalle clínico..." style={inp({fontSize:11})}/></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PASO 4 */}
          {step===4&&(
            <div style={card}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--tx3)',letterSpacing:1.5,fontFamily:'var(--mono)',textTransform:'uppercase',marginBottom:14}}>Evaluación de causalidad y desenlace</div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--tx)',marginBottom:8}}>Causalidad (algoritmo Naranjo / OMS)</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
                  {CAUSALIDAD.map(({k,label,desc})=>(
                    <button key={k} onClick={()=>s('causalidad',k as Causalidad)} style={{padding:'10px 6px',borderRadius:8,cursor:'pointer',border:'1.5px solid',background:rep.causalidad===k?'#EEEDFE':'var(--bg2)',borderColor:rep.causalidad===k?'#5B21B6':'var(--bdr)',fontFamily:'var(--sans)'}}>
                      <div style={{fontSize:11,fontWeight:700,color:rep.causalidad===k?'#5B21B6':'var(--tx)',marginBottom:3}}>{label}</div>
                      <div style={{fontSize:9,color:'var(--tx4)',lineHeight:1.3}}>{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {fld('Desenlace del paciente',<select value={rep.desenlace} onChange={e=>s('desenlace',e.target.value)} style={inp()}><option value="recuperado">Recuperado completamente</option><option value="recuperando">En recuperación</option><option value="no_recuperado">No recuperado</option><option value="secuela">Con secuelas</option><option value="fallecido">Fallecido</option><option value="desconocido">Desconocido</option></select>)}
                {fld('Acción tomada',<select value={rep.accionTomada} onChange={e=>s('accionTomada',e.target.value)} style={inp()}><option value="">Seleccionar...</option><option value="suspendido">Suspendido</option><option value="dosis_reducida">Dosis reducida</option><option value="sin_cambios">Sin cambios</option><option value="desconocido">Desconocido</option></select>)}
                {fld('Reexposición',<select value={rep.reexposicion} onChange={e=>s('reexposicion',e.target.value)} style={inp()}><option value="desconocido">Desconocido</option><option value="si_reaparece">Sí — RAM reaparece</option><option value="si_no_reaparece">Sí — RAM no reaparece</option><option value="no">No se reexpuso</option></select>)}
                <div style={{gridColumn:'1/-1'}}>
                  {fld('Diagnóstico que motivó el uso del medicamento — ICD-11 OMS',
                    <div style={{position:'relative'}}>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <div style={{position:'relative',flex:1}}>
                          <input
                            value={rep.icd11SearchQuery}
                            onChange={e => buscarICD11(e.target.value)}
                            style={inp()}
                            placeholder="Buscar diagnóstico ICD-11... (ej: hipertensión, diabetes, infección urinaria)"
                          />
                          {icd11Buscando && <div style={{position:'absolute',right:10,top:8,fontSize:11,color:'var(--tx4)'}}>⟳</div>}
                        </div>
                        {rep.icd11Code && (
                          <div style={{padding:'6px 10px',borderRadius:7,background:'#EEEDFE',border:'1px solid #C4B5FD',fontSize:11,fontFamily:'var(--mono)',color:'#5B21B6',whiteSpace:'nowrap',fontWeight:700}}>
                            {rep.icd11Code}
                          </div>
                        )}
                        {rep.icd11Code && (
                          <button onClick={()=>{s('icd11Code','');s('icd11Term','');s('icd11SearchQuery','');}} style={{fontSize:11,color:'var(--tx4)',background:'none',border:'none',cursor:'pointer'}}>✕</button>
                        )}
                      </div>
                      {icd11Sugs.length > 0 && (
                        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg)',border:'1px solid var(--bdr)',borderRadius:8,zIndex:50,maxHeight:240,overflowY:'auto',boxShadow:'0 4px 16px rgba(0,0,0,.12)'}}>
                          <div style={{padding:'6px 12px',fontSize:9,fontWeight:700,color:'var(--tx4)',fontFamily:'var(--mono)',letterSpacing:1,borderBottom:'1px solid var(--bdr)',background:'var(--bg2)'}}>
                            ICD-11 · WHO 2024-01 · Clasificación Internacional de Enfermedades
                          </div>
                          {icd11Sugs.map((item:any,i:number) => (
                            <button key={i} onClick={() => seleccionarICD11(item)}
                              style={{display:'flex',alignItems:'flex-start',gap:10,width:'100%',padding:'9px 12px',background:'none',border:'none',cursor:'pointer',textAlign:'left',borderBottom:'1px solid var(--bdr)'}}
                              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='none'}>
                              <span style={{fontSize:11,fontWeight:700,fontFamily:'var(--mono)',color:'#5B21B6',minWidth:60,flexShrink:0}}>{item.code}</span>
                              <span style={{fontSize:12,color:'var(--tx)',lineHeight:1.4}}>{item.term}</span>
                            </button>
                          ))}
                          <div style={{padding:'6px 12px',fontSize:9,color:'var(--tx4)',fontFamily:'var(--mono)',background:'var(--bg2)'}}>
                            Fuente: WHO ICD-11 API · id.who.int · Colaboración ICD-11 ↔ MedDRA (WHO-FIC Hub)
                          </div>
                        </div>
                      )}
                      {rep.icd11Term && (
                        <div style={{marginTop:6,fontSize:11,color:'var(--tx3)',fontFamily:'var(--mono)'}}>
                          ✓ {rep.icd11Code} — {rep.icd11Term}
                        </div>
                      )}
                    </div>,
                    false
                  )}
                </div>
                <div style={{gridColumn:'1/-1'}}>{fld('Información adicional',<textarea value={rep.informacionAdicional} onChange={e=>s('informacionAdicional',e.target.value)} style={{...inp(),height:80,resize:'vertical'}} placeholder="Antecedentes, alergias, exámenes de laboratorio, observaciones clínicas..."/>)}</div>
              </div>
            </div>
          )}

          {/* PASO 5 */}
          {step===5&&(
            <div>
              <div style={{padding:'14px 18px',background:'#FEF9C3',border:'1.5px solid #FDE68A',borderRadius:10,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24}}>⚠</span>
                <div><div style={{fontSize:13,fontWeight:700,color:'#854D0E',marginBottom:2}}>Tarjeta Amarilla lista para enviar al CNFV ARCSA</div><div style={{fontSize:11,color:'#854D0E'}}>Revisa el resumen antes de enviar.</div></div>
              </div>
              <div style={card}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12}}>
                  {[['Tipo','rep.tipo'],['Fecha',rep.fechaReporte],['Notificador',rep.notificadorNombre||'—'],['Paciente',`${rep.pacienteInicialesNombre||'—'}, ${rep.pacienteEdad||'?'} ${rep.pacienteEdadUnidad}`],['Medicamento',rep.medicamentoSospechoso||'—'],['Causalidad',rep.causalidad],['Desenlace',rep.desenlace],['Diagnóstico ICD-11',rep.icd11Code?`${rep.icd11Code} — ${rep.icd11Term}`:'No especificado']].map(([k,v])=>(
                    <div key={k} style={{padding:'8px 10px',background:'var(--bg)',borderRadius:6,border:'1px solid var(--bdr)'}}>
                      <div style={{fontSize:9,color:'var(--tx4)',fontFamily:'var(--mono)',marginBottom:2}}>{k}</div>
                      <div style={{color:'var(--tx)',fontWeight:500}}>{typeof v==='string'&&v.startsWith('rep.')?'':v}</div>
                    </div>
                  ))}
                </div>
                {rep.rams.length>0&&(
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:9,fontWeight:700,color:'var(--tx3)',letterSpacing:1.2,fontFamily:'var(--mono)',marginBottom:6}}>REACCIONES MedDRA ({rep.rams.length})</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {rep.rams.map(r=>{const gc=GRAVEDAD_CONFIG[r.gravedad];return(<span key={r.id} style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:gc.bg,color:gc.color,fontWeight:600}}>{r.ptTerm} — {gc.label}</span>);})}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={guardar} disabled={saving} style={{width:'100%',padding:'12px 0',borderRadius:10,fontSize:14,fontWeight:700,background:saving?'var(--bg3)':'#F59E0B',color:saving?'var(--tx4)':'#1A1A2E',border:'none',cursor:saving?'not-allowed':'pointer',fontFamily:'var(--sans)'}}>
                {saving?'⟳ Guardando...':'⚠ Enviar Tarjeta Amarilla al CNFV ARCSA'}
              </button>
              <div style={{fontSize:10,color:'var(--tx4)',textAlign:'center',marginTop:6}}>farmaco.vigilancia@controlsanitario.gob.ec · Datos del paciente son confidenciales</div>
            </div>
          )}

          <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{padding:'9px 20px',borderRadius:8,fontSize:12,cursor:step===0?'not-allowed':'pointer',background:'var(--bg2)',color:step===0?'var(--tx4)':'var(--tx)',border:'1px solid var(--bdr)',fontFamily:'var(--sans)'}}>← Anterior</button>
            {step<5&&<button onClick={()=>setStep(s=>Math.min(5,s+1))} style={{padding:'9px 20px',borderRadius:8,fontSize:12,cursor:'pointer',background:'var(--green)',color:'#fff',border:'none',fontWeight:700,fontFamily:'var(--sans)'}}>Siguiente →</button>}
          </div>
        </>)}
      </main>
    </div>
  );
}
