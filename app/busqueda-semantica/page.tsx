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
          </div>
          <SemanticSearch />
        </div>
      </main>
    </div>
  );
}
