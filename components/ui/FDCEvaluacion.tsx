'use client';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import type { EvaluacionFDC } from '@/lib/fdc-algorithm';

interface Props {
  medicamentoId: string;
  esCombo: boolean;
  nombre: string;
}

const VEREDICTO_CONFIG = {
  RACIONAL: { bg: '#DCFCE7', color: '#166534', border: '#86EFAC', icon: '✅', label: 'Racional' },
  REVISION_EXTENDIDA: { bg: '#FEF9C3', color: '#854D0E', border: '#FDE68A', icon: '⚠️', label: 'Revisión extendida' },
  IRRACIONAL: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', icon: '❌', label: 'Irracional' },
};

const CRITERIO_LABELS: Record<string, string> = {
  C1: 'Contribución terapéutica',
  C2: 'Mecanismos complementarios',
  C3: 'Farmacocinética compatible',
  C4: 'Toxicidad no supraditiva',
  C5: 'Balance beneficio/riesgo',
  C6: 'Dosis fija justificada',
  C7: 'Evidencia clínica publicada',
  C8: 'Aprobada en referencia',
};

export default function FDCEvaluacion({ medicamentoId, esCombo, nombre }: Props) {
  const [evaluacion, setEvaluacion] = useState<EvaluacionFDC | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluando, setEvaluando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!esCombo) return;
    setLoading(true);
    fetch(`/api/fdc/evaluar?id=${medicamentoId}`)
      .then(r => r.json())
      .then(d => { setEvaluacion(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [medicamentoId, esCombo]);

  const ejecutarEvaluacion = async () => {
    setEvaluando(true);
    setError(null);
    try {
      const token = await getAuth().currentUser?.getIdToken() ?? '';
      const res = await fetch('/api/fdc/evaluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ medicamentoId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvaluacion(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEvaluando(false);
    }
  };

  if (!esCombo) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--tx4)', fontSize: 13 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>◎</div>
        Este medicamento no es una combinación de dosis fija (FDC).<br/>
        El algoritmo de racionalidad aplica solo a medicamentos con dos o más principios activos.
      </div>
    );
  }

  const vc = evaluacion ? VEREDICTO_CONFIG[evaluacion.veredicto] : null;

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 4 }}>
            Evaluación FDC · Algoritmo WHO-EMA-FDA
          </div>
          <div style={{ fontSize: 13, color: 'var(--tx2)' }}>
            Análisis de racionalidad para combinaciones de dosis fija
          </div>
        </div>
        <button
          onClick={ejecutarEvaluacion}
          disabled={evaluando}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: evaluando ? 'var(--bg3)' : 'var(--green)', color: '#fff',
            border: 'none', cursor: evaluando ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--sans)', transition: 'all .15s',
          }}
        >
          {evaluando ? '⟳ Evaluando...' : evaluacion ? '↻ Re-evaluar' : '▶ Ejecutar evaluación'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, color: '#991B1B', fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--tx4)', fontSize: 13 }}>
          Cargando evaluación previa...
        </div>
      )}

      {!loading && !evaluacion && !evaluando && (
        <div style={{ textAlign: 'center', padding: 40, background: 'var(--bg2)', borderRadius: 12, border: '1.5px dashed var(--bdr)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⊙</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>Sin evaluación registrada</div>
          <div style={{ fontSize: 12, color: 'var(--tx4)', marginBottom: 16 }}>
            Ejecuta el algoritmo para determinar si <strong>{nombre}</strong> es una combinación racional según criterios internacionales.
          </div>
        </div>
      )}

      {evaluacion && vc && (
        <>
          {/* Veredicto principal */}
          <div style={{ padding: '16px 20px', borderRadius: 12, background: vc.bg, border: `1.5px solid ${vc.border}`, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>{vc.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: vc.color, marginBottom: 4 }}>
                {vc.label}
                {evaluacion.vetoAutomatico && <span style={{ fontSize: 11, marginLeft: 8, background: '#FCA5A5', color: '#7F1D1D', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--mono)' }}>VETO AUTOMÁTICO</span>}
              </div>
              <div style={{ fontSize: 12, color: vc.color, opacity: 0.85, lineHeight: 1.5 }}>{evaluacion.recomendacion}</div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: vc.color, fontFamily: 'var(--mono)' }}>{evaluacion.scoreTotal}/16</div>
              <div style={{ fontSize: 10, color: vc.color, opacity: 0.7 }}>{evaluacion.porcentaje}% cumplimiento</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, transition: 'width .5s',
                width: `${evaluacion.porcentaje}%`,
                background: evaluacion.porcentaje >= 75 ? '#22C55E' : evaluacion.porcentaje >= 50 ? '#F59E0B' : '#EF4444',
              }} />
            </div>
          </div>

          {/* Criterios */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 10 }}>
            Criterios WHO-EMA-FDA (8 criterios · 16 puntos máx.)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {evaluacion.criterios.map(c => (
              <div key={c.id} style={{
                padding: '10px 12px', borderRadius: 8,
                background: c.score === 2 ? '#F0FDF4' : c.score === 1 ? '#FEFCE8' : '#FEF2F2',
                border: `1px solid ${c.score === 2 ? '#86EFAC' : c.score === 1 ? '#FDE68A' : '#FCA5A5'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--tx3)' }}>{c.id}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                    background: c.score === 2 ? '#86EFAC' : c.score === 1 ? '#FDE68A' : '#FCA5A5',
                    color: c.score === 2 ? '#166534' : c.score === 1 ? '#854D0E' : '#991B1B',
                    fontFamily: 'var(--mono)',
                  }}>
                    {c.score}/2
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)', marginBottom: 3 }}>{CRITERIO_LABELS[c.id] || c.nombre}</div>
                <div style={{ fontSize: 10, color: 'var(--tx3)', lineHeight: 1.4 }}>{c.justificacion}</div>
              </div>
            ))}
          </div>

          {/* Evidencia científica */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.5, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 10 }}>
            Evidencia científica
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'RCTs PubMed', value: evaluacion.evidencia.pubmedCount.toString(), ok: evaluacion.evidencia.pubmedCount >= 3 },
              { label: 'Nivel evidencia', value: evaluacion.evidencia.nivelEvidencia, ok: ['Ia','Ib'].includes(evaluacion.evidencia.nivelEvidencia) },
              { label: 'WHO EML', value: evaluacion.evidencia.enWHO_EML ? 'Incluida' : 'No incluida', ok: evaluacion.evidencia.enWHO_EML },
              { label: 'Agencias referencia', value: [evaluacion.evidencia.aprobadaEMA && 'EMA', evaluacion.evidencia.aprobadaFDA && 'FDA'].filter(Boolean).join(' · ') || 'Ninguna', ok: evaluacion.evidencia.aprobadaEMA || evaluacion.evidencia.aprobadaFDA },
            ].map(item => (
              <div key={item.label} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--bdr)', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: item.ok ? '#166534' : '#991B1B', fontFamily: 'var(--mono)', marginBottom: 3 }}>{item.value || '—'}</div>
                <div style={{ fontSize: 9, color: 'var(--tx4)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Fuentes */}
          <div style={{ padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--bdr)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1.2, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 6 }}>Fuentes consultadas</div>
            {evaluacion.evidencia.fuentes.map((f, i) => (
              <div key={i} style={{ fontSize: 10, color: 'var(--tx4)', fontFamily: 'var(--mono)', marginBottom: 2 }}>· {f}</div>
            ))}
            <div style={{ fontSize: 9, color: 'var(--tx4)', marginTop: 8, fontStyle: 'italic' }}>
              Evaluado: {new Date(evaluacion.fechaEvaluacion).toLocaleDateString('es-EC')} · Algoritmo v1 · Revisión comité: {evaluacion.revisadoPorComite ? '✓ Completada' : '⏳ Pendiente'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
