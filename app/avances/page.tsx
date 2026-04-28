'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import { CAPITULOS } from '@/lib/capitulos';

interface Stats {
  total: number;
  principiosActivos: number;
  genericos: number;
  cnmb: number;
  autorizados: number;
  arcsa_pendiente: number;
  porCapitulo: Record<string, number>;
}

export default function Avances() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch('/api/avances', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStats({
          total: data.total ?? 0,
          principiosActivos: data.principiosActivos ?? 0,
          genericos: data.genericos ?? 0,
          cnmb: data.cnmb ?? 0,
          autorizados: data.autorizados ?? 0,
          arcsa_pendiente: data.arcsa_pendiente ?? 0,
          porCapitulo: data.porCapitulo ?? {},
        });
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [authLoading, user]);

  if (loading || !stats) return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-4 h-4 border-2 border-[#2d6a2d] border-t-transparent rounded-full animate-spin"></div>
          Calculando estadísticas...
        </div>
      </main>
    </div>
  );

  const maxCap = Math.max(...Object.values(stats.porCapitulo), 1);

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-6">Panel de avances</h2>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total medicamentos', value: stats.total, color: 'text-[#2d6a2d]' },
            { label: 'Principios activos', value: stats.principiosActivos, color: 'text-blue-600' },
            { label: 'Genéricos', value: stats.genericos, color: 'text-purple-600' },
            { label: 'CNMB', value: stats.cnmb, color: 'text-orange-600' },
            { label: 'Autorizados', value: stats.autorizados, color: 'text-green-600' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-green-100 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value.toLocaleString('es-EC')}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 mb-8">
          <h3 className="font-semibold text-[#2d6a2d] text-sm mb-4">Estado de revisión</h3>
          {[
            { label: 'Autorizados', count: stats.autorizados, color: 'bg-green-500', textColor: 'text-green-600' },
            { label: 'ARCSA - No revisado', count: stats.arcsa_pendiente, color: 'bg-orange-400', textColor: 'text-orange-600' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 mb-2">
              <span className="text-xs text-gray-500 w-36">{s.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div className={`${s.color} h-3 rounded-full`}
                  style={{ width: `${stats.total > 0 ? (s.count / stats.total * 100).toFixed(1) : 0}%` }} />
              </div>
              <span className={`text-xs font-bold ${s.textColor} w-24 text-right`}>
                {s.count.toLocaleString('es-EC')} ({stats.total > 0 ? (s.count / stats.total * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
          <h3 className="font-semibold text-[#2d6a2d] text-sm mb-4">Medicamentos por capítulo terapéutico</h3>
          <div className="space-y-2">
            {CAPITULOS.map(cap => {
              const count = stats.porCapitulo[cap.id] ?? 0;
              const pct = maxCap > 0 ? (count / maxCap * 100) : 0;
              return (
                <div key={cap.id} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">{cap.id.replace('c','')}</span>
                  <Link href={`/medicamentos?capitulo=${cap.id}`}
                    className="text-xs text-gray-700 hover:text-[#2d6a2d] w-48 truncate">{cap.name}</Link>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-[#2d6a2d] h-2 rounded-full"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-12 text-right">
                    {count.toLocaleString('es-EC')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
