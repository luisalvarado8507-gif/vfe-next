'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/layout/Sidebar';

interface AMPNode {
  id: string;
  docId: string;
  amp: string;
  laboratorio: string;
  estado: string;
  generico: string;
}

interface VMPPNode {
  label: string;
  amps: AMPNode[];
}

interface VMPNode {
  label: string;
  ff: string;
  vmpps: Record<string, VMPPNode>;
}

interface VTMNode {
  label: string;
  vmps: Record<string, VMPNode>;
  expanded: boolean;
}

export default function Arbol() {
  const [tree, setTree] = useState<Record<string, VTMNode>>({});
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { getToken, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    cargar();
  }, [authLoading, user]);

  const cargar = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      let allMeds: Record<string, string>[] = [];
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
        if (!cursor || allMeds.length >= 2000) break;
      }

      // Construir árbol
      const treeData: Record<string, VTMNode> = {};
      allMeds.forEach(m => {
        const vtm = m.vtm || '(Sin VTM)';
        const vmp = m.vmp || `${vtm} ${m.conc || ''} ${m.ff || ''}`.trim();
        const vmpp = m.vmpp || m.units ? `${m.units || ''} ${m.upres || ''}`.trim() : '__';
        const amp = m.nombre || m.vtm || '';

        if (!treeData[vtm]) treeData[vtm] = { label: vtm, vmps: {}, expanded: false };
        if (!treeData[vtm].vmps[vmp]) treeData[vtm].vmps[vmp] = { label: vmp, ff: m.ff || '', vmpps: {} };
        if (!treeData[vtm].vmps[vmp].vmpps[vmpp]) treeData[vtm].vmps[vmp].vmpps[vmpp] = { label: vmpp, amps: [] };
        treeData[vtm].vmps[vmp].vmpps[vmpp].amps.push({
          id: m.id, docId: m.docId, amp, laboratorio: m.laboratorio || '',
          estado: m.estado || '', generico: m.generico || ''
        });
      });

      setTree(treeData);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (vtm: string) => {
    setTree(prev => ({
      ...prev,
      [vtm]: { ...prev[vtm], expanded: !prev[vtm].expanded }
    }));
  };

  const estadoColor = (estado: string) => {
    switch(estado) {
      case 'autorizado': return 'bg-green-100 text-green-700';
      case 'arcsa_pendiente': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const vtms = Object.entries(tree).filter(([vtm]) =>
    !busqueda || vtm.toLowerCase().includes(busqueda.toLowerCase())
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-[#f4f9f4] flex">
      <Sidebar />
      <main className="flex-1 ml-64 px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2d6a2d]">Árbol de medicamentos</h2>
          <span className="text-sm text-gray-500">{vtms.length} VTM</span>
        </div>

        <input
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm mb-6 focus:outline-none focus:border-[#2d6a2d]"
          placeholder="Buscar principio activo (VTM)..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)} />

        {loading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-4 h-4 border-2 border-[#2d6a2d] border-t-transparent rounded-full animate-spin"></div>
            Construyendo árbol...
          </div>
        ) : (
          <div className="space-y-1">
            {vtms.slice(0, 200).map(([vtm, node]) => (
              <div key={vtm} className="bg-white rounded-lg border border-green-100 overflow-hidden">
                <button
                  onClick={() => toggle(vtm)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition text-left">
                  <span className="text-gray-400 w-4">{node.expanded ? '▼' : '▶'}</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">VTM</span>
                  <span className="font-medium text-gray-800 capitalize">{vtm}</span>
                  <span className="text-xs text-gray-400 ml-auto">{Object.keys(node.vmps).length} VMP</span>
                </button>

                {node.expanded && (
                  <div className="border-t border-gray-50">
                    {Object.entries(node.vmps).map(([vmp, vmpNode]) => (
                      <div key={vmp} className="ml-6 border-l-2 border-purple-100 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-mono">VMP</span>
                          <span className="text-sm text-gray-700">{vmp}</span>
                          {vmpNode.ff && <span className="text-xs text-gray-400">· {vmpNode.ff}</span>}
                        </div>
                        {Object.entries(vmpNode.vmpps).map(([vmpp, vmppNode]) => (
                          <div key={vmpp} className="ml-4 mb-2">
                            {vmpp !== '__' && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">VMPP</span>
                                <span className="text-xs text-gray-600">{vmpp}</span>
                              </div>
                            )}
                            <div className="ml-4 space-y-1">
                              {vmppNode.amps.map(amp => (
                                <Link key={amp.docId} href={`/medicamentos/${amp.docId}`}
                                  className="flex items-center gap-2 hover:bg-gray-50 rounded px-2 py-1 transition">
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">AMP</span>
                                  <span className="text-xs text-gray-700">{amp.amp || amp.laboratorio}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ml-auto ${estadoColor(amp.estado)}`}>
                                    {amp.estado === 'arcsa_pendiente' ? 'ARCSA' : amp.estado}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {vtms.length > 200 && (
              <p className="text-xs text-gray-400 text-center py-4">
                Mostrando 200 de {vtms.length} VTM. Usa el buscador para filtrar.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
