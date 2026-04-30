'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';
import NuevoMedicamentoForm from '@/components/forms/NuevoMedicamentoForm';

export default function EditarMedicamento() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const { getToken, isEditor, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const cargar = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/medicamentos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.medicamento) {
          const med = result.medicamento;
          const flat: Record<string, any> = {};
          Object.keys(med).forEach(k => {
            const v = med[k];
            if (v !== null && v !== undefined && typeof v !== 'object') {
              flat[k] = String(v);
            }
          });
          // Asegurar campo vias como string separado por coma
          if (Array.isArray(med.vias)) flat.vias = med.vias.join(', ');
          // Pasar farmPrices como objeto para que el formulario lo lea
          if (med.farmPrices) flat.farmPrices = med.farmPrices;
          // Pasar clinData
          if (med.clinData) flat.clinData = med.clinData;
          setData(flat);
        }
      } catch {
        console.error('Error cargando medicamento');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, authLoading]);

  if (authLoading || loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:280, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'var(--tx4)' }}>Cargando medicamento...</p>
      </main>
    </div>
  );

  if (!isEditor) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:280, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ color:'var(--red,#DC2626)' }}>No tienes permisos de editor.</p>
      </main>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', fontFamily:'var(--sans)' }}>
      <Sidebar />
      <main style={{ flex:1, marginLeft:280, padding:'28px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <Link href={`/medicamentos/${id}`}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'var(--bg3)', border:'1.5px solid var(--bdr)', borderRadius:8, fontSize:13, fontWeight:600, color:'var(--tx2)', textDecoration:'none' }}>
            ← Volver al medicamento
          </Link>
          <h2 style={{ fontSize:18, fontWeight:700, color:'var(--gdp)' }}>Editar medicamento</h2>
          {data?.vtm && (
            <span style={{ fontSize:13, color:'var(--tx3)' }}>{data.vtm} · {data.laboratorio}</span>
          )}
        </div>
        {data && (
          <NuevoMedicamentoForm initialData={data} editId={id} />
        )}
      </main>
    </div>
  );
}
