'use client';
import Sidebar from '@/components/layout/Sidebar';
import SemanticSearch from '@/components/ui/SemanticSearch';

export default function BusquedaSemanticaPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', fontFamily: 'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 272, padding: '28px 36px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--tx3)', letterSpacing: 2, marginBottom: 6 }}>
              SIMI · IA FARMACOLÓGICA
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>
              Búsqueda semántica de medicamentos
            </h1>
            <p style={{ fontSize: 13, color: 'var(--tx3)' }}>
              Usa lenguaje clínico natural — Claude entiende indicaciones, mecanismos de acción y grupos terapéuticos.
            </p>
            <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--amber-bg)', border: '1px solid #FCD34D', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div style={{ fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                <strong>Aviso regulatorio:</strong> Esta herramienta usa inteligencia artificial (Claude API · Anthropic) para interpretar consultas clínicas. Los resultados son orientativos y no constituyen prescripción médica ni recomendación terapéutica. Las consultas se procesan en servidores externos (Anthropic). Verifique siempre contra las fichas técnicas oficiales de ARCSA. Para uso clínico, consulte a un profesional de salud.
              </div>
            </div>
          </div>
          <SemanticSearch />
        </div>
      </main>
    </div>
  );
}
