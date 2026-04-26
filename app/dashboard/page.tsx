'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

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
    <div className="min-h-screen bg-[#f4f9f4]">
      <header className="bg-[#2d6a2d] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📗</span>
          <div>
            <h1 className="font-bold text-lg">VFE</h1>
            <p className="text-xs text-green-200">El Libro Verde de los Medicamentos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-200 text-xs">{user?.email}</span>
          <Link href="/medicamentos/nuevo"
            className="bg-white text-[#2d6a2d] px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition">
            + Nuevo medicamento
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
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
