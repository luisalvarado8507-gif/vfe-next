'use client';
import Sidebar from '@/components/layout/Sidebar';
import NuevoMedicamentoForm from '@/components/forms/NuevoMedicamentoForm';

export default function NuevoMedicamento() {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg, #F5FAF3)', fontFamily: 'var(--sans, sans-serif)' }}>
      <Sidebar />
      <main style={{ marginLeft: "280px", padding: "32px", flex: 1 }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--gdp, #1A6B08)' }}>Nuevo medicamento</h2>
        <NuevoMedicamentoForm />
      </main>
    </div>
  );
}
