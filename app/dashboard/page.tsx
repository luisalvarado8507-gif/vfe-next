'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  total: number;
  autorizados: number;
  pendientes: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, autorizados: 0, pendientes: 0 });

  useEffect(() => {
    fetch('/api/medicamentos?limit=1')
      .then(r => r.json())
      .then(data => setStats(s => ({ ...s, total: data.total || 0 })))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f9f4]">
      {/* Header */}
      <header className="bg-[#2d6a2d] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📗</span>
          <div>
            <h1 className="font-bold text-lg">VFE</h1>
            <p className="text-xs text-green-200">El Libro Verde de los Medicamentos</p>
          </div>
        </div>
        <Link href="/medicamentos/nuevo"
          className="bg-white text-[#2d6a2d] px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition">
          + Nuevo medicamento
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total medicamentos', value: stats.total, color: 'bg-white' },
            { label: 'Autorizados', value: stats.autorizados, color: 'bg-white' },
            { label: 'Pendientes', value: stats.pendientes, color: 'bg-white' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-6 shadow-sm border border-green-100`}>
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-[#2d6a2d]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: '/medicamentos', label: '📋 Base de datos', desc: 'Ver todos los medicamentos' },
            { href: '/medicamentos/nuevo', label: '➕ Nuevo medicamento', desc: 'Añadir al catálogo' },
            { href: '/audit', label: '🔍 Audit log', desc: 'Registro de cambios' },
            { href: '/capitulos', label: '📂 Capítulos', desc: 'Gestionar capítulos terapéuticos' },
          ].map((item, i) => (
            <Link key={i} href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-green-100 hover:border-green-300 transition">
              <p className="font-medium text-gray-800 mb-1">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
