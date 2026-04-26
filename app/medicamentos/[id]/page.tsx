'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';

export default function MedicamentoDetalle() {
  const { id } = useParams();
  const [med, setMed] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/medicamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMed(data.medicamento || null);
      } catch {
        setMed(null);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, authLoading]);

  const campo = (label: string, valor: unknown) => valor ? (
    <div className="py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <p className="text-sm text-gray-800 mt-0.5">{String(valor)}</p>
    </div>
  ) : null;

  if (loading) return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </main>
    </div>
  );

  if (!med) return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center flex-col gap-4">
        <p className="text-gray-400">Medicamento no encontrado</p>
        <Link href="/medicamentos" className="text-[#2d6a2d] text-sm hover:underline">← Volver</Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#2d6a2d] capitalize">{String(med.vtm || '')}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {String(med.laboratorio || '')} · {String(med.ff || '')} · {String(med.conc || '')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            med.estado === 'autorizado' ? 'bg-green-100 text-green-700' :
            med.estado === 'suspendido' ? 'bg-yellow-100 text-yellow-700' :
            med.estado === 'retirado' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {String(med.estado || 'pendiente')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h3 className="font-semibold text-[#2d6a2d] text-sm mb-3">Identificación</h3>
            {campo('DCI / VTM', med.vtm)}
            {campo('Laboratorio', med.laboratorio)}
            {campo('Forma farmacéutica', med.ff)}
            {campo('Concentración', med.conc)}
            {campo('Código ATC', med.atc)}
            {campo('Genérico', med.generico)}
            {campo('CNMB', med.cnmb)}
          </div>

          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h3 className="font-semibold text-[#2d6a2d] text-sm mb-3">Registro Sanitario</h3>
            {campo('N° Registro Sanitario', med.rs)}
            {campo('Titular', med.iso11615Titular)}
            {campo('Tipo de RS', med.rsTipo)}
            {campo('Fecha autorización', med.iso11615Fecha)}
            {campo('Fecha vencimiento', med.iso11615Venc)}
            {campo('Estado regulatorio', med.iso11615Estado)}
            {campo('Condición de venta', med.rsCondicion)}
            {campo('País', med.iso11615Pais)}
            {campo('GTIN / EAN', med.gtin)}
            {campo('PMC (USD)', med.pmc)}
          </div>

          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h3 className="font-semibold text-[#2d6a2d] text-sm mb-3">Presentación</h3>
            {campo('Nombre comercial', med.nombre)}
            {campo('Unidades por presentación', med.units)}
            {campo('Unidad de presentación', med.upres)}
            {campo('Tipo de envase', med.envase)}
            {campo('Volumen total', med.vol)}
            {campo('Forma química ISO 11238', med.iso11238Forma)}
            {campo('Estado físico ISO 11238', med.iso11238Estado)}
          </div>

          <div className="bg-white rounded-xl border border-green-100 p-5 shadow-sm">
            <h3 className="font-semibold text-[#2d6a2d] text-sm mb-3">ISO 11616 — PhPID</h3>
            {campo('PhPID Nivel 1', med.phpidL1)}
            {campo('PhPID Nivel 2', med.phpidL2)}
            {campo('PhPID Nivel 3', med.phpidL3)}
            {campo('PhPID Código', med.phpid)}
            <h3 className="font-semibold text-[#2d6a2d] text-sm mb-3 mt-4">Fabricante</h3>
            {campo('Fabricante', med.rsFabricante)}
            {campo('País fabricación', med.rsPaisFab)}
            {campo('Importador', med.rsImportador)}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href={`/medicamentos/${id}/editar`}
            className="bg-[#2d6a2d] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#235223] transition">
            Editar medicamento
          </Link>
          <Link href="/medicamentos"
            className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            ← Volver a la lista
          </Link>
        </div>
      </main>
    </div>
  );
}
