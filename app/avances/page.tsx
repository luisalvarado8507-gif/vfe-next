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
        // Cargar todos para calcular stats
        let allMeds: Record<string, unknown>[] = [];
        let cursor: string | null = null;
        while (true) {
          const params = new URLSearchParams({ limit: '500' });
          if (cursor) params.set('cursor', cursor);
          const res = await fetch(`/api/medicamentos?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          allMeds = allMeds.concat(data.medicamentos || []);
          cursor = data.nextCursor;
          if (!cursor) break;
        }

        const pas = new Set(allMeds.map((m: Record<string, unknown>) => m.vtm as string).filter(Boolean)).size;
        const genericos = allMeds.filter((m: Record<string, unknown>) => m.generico === 'Sí').length;
        const cnmb = allMeds.filter((m: Record<string, unknown>) => m.cnmb === 'Sí').length;
        const autorizados = allMeds.filter((m: Record<string, unknown>) => m.estado === 'autorizado').length;
        const arcsa = allMeds.filter((m: Record<string, unknown>) => m.estado === 'arcsa_pendiente').length;

        const porCapitulo: Record<string, number> = {};
        CAPITULOS.forEach(c => { porCapitulo[c.id] = 0; });
        allMeds.forEach((m: Record<string, unknown>) => {
          const chapId = m.chapId as string;
          if (chapId && porCapitulo[chapId] !== undefined) porCapitulo[chapId]++;
        });

        setStats({
          total: allMeds.length,
          principiosActivos: pas,
          genericos,
          cnmb,
          autorizados,
          arcsa_pendiente: arcsa,
          porCapitulo,
        });
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [authLoading, user]);

  const maxCap = stats ? Math.max(...Object.values(stats.porCapitulo)) : 1;

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <h2 className="text-xl font-bold text-[#2d6a2d] mb-6">Panel de avances</h2>

        {loading ? (
          <p className="text-gray-400">Calculando estadísticas...</p>
        ) : stats ? (
          <>
            {/* Stats principales */}
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

            {/* Estado de revisión */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 mb-8">
              <h3 className="font-semibold text-[#2d6a2d] text-sm mb-4">Estado de revisión</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs text-gray-500 w-32">Autorizados</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.autorizados / stats.total * 100).toFixed(1) : 0}%` }} />
                </div>
                <span className="text-xs font-bold text-green-600 w-16 text-right">
                  {stats.total > 0 ? (stats.autorizados / stats.total * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-32">ARCSA pendiente</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className="bg-orange-400 h-3 rounded-full transition-all"
                    style={{ width: `${stats.total > 0 ? (stats.arcsa_pendiente / stats.total * 100).toFixed(1) : 0}%` }} />
                </div>
                <span className="text-xs font-bold text-orange-600 w-16 text-right">
                  {stats.total > 0 ? (stats.arcsa_pendiente / stats.total * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>

            {/* Por capítulo */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100">
              <h3 className="font-semibold text-[#2d6a2d] text-sm mb-4">Medicamentos por capítulo terapéutico</h3>
              <div className="space-y-2">
                {CAPITULOS.map(cap => {
                  const count = stats.porCapitulo[cap.id] || 0;
                  const pct = maxCap > 0 ? (count / maxCap * 100) : 0;
                  return (
                    <div key={cap.id} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400 w-6">{cap.id.replace('c','')}</span>
                      <Link href={`/medicamentos?capitulo=${cap.id}`}
                        className="text-xs text-gray-700 hover:text-[#2d6a2d] w-48 truncate">{cap.name}</Link>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-[#2d6a2d] h-2 rounded-full transition-all"
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
          </>
        ) : (
          <p className="text-gray-400">No hay datos disponibles</p>
        )}
      </main>
    </div>
  );
}
