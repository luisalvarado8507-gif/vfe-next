'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { CAPITULOS } from '@/lib/capitulos';

export default function Dashboard() {
  const [total, setTotal] = useState(0);
  const [autorizados, setAutorizados] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const { getToken, loading: authLoading, user } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/medicamentos?limit=50', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        const meds = data.medicamentos || [];
        setTotal(meds.length);
        setAutorizados(meds.filter((m: {estado: string}) => m.estado === 'autorizado').length);
        setPendientes(meds.filter((m: {estado: string}) => m.estado === 'pendiente').length);
      } catch {
        console.error('Error cargando stats');
      }
    };
    cargar();
  }, [authLoading]);

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2d6a2d] text-white flex flex-col min-h-screen">
        <div className="px-5 py-5 border-b border-green-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📗</span>
            <div>
              <h1 className="font-bold text-sm">VFE</h1>
              <p className="text-xs text-green-300">El Libro Verde</p>
            </div>
          </div>
          <p className="text-xs text-green-400 mt-2 truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs text-green-400 uppercase tracking-wider px-2 mb-2">Capítulos</p>
          {CAPITULOS.map(cap => (
            <Link key={cap.id} href={`/medicamentos?capitulo=${cap.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-green-100 hover:bg-green-700 transition mb-0.5">
              <span className="text-green-400 font-mono w-5">{cap.id}</span>
              {cap.name}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-green-700 space-y-1">
          <Link href="/medicamentos"
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
            📋 Base de datos
          </Link>
          <Link href="/medicamentos/nuevo"
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
            ➕ Nuevo medicamento
          </Link>
          <Link href="/audit"
            className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-green-100 hover:bg-green-700 transition">
            🔍 Audit log
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-8 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-6">Dashboard</h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
            <p className="text-sm text-gray-500 mb-1">Total medicamentos</p>
            <p className="text-3xl font-bold text-[#2d6a2d]">{total}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
            <p className="text-sm text-gray-500 mb-1">Autorizados</p>
            <p className="text-3xl font-bold text-green-600">{autorizados}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
            <p className="text-sm text-gray-500 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600">{pendientes}</p>
          </div>
        </div>

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
