'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  );

  if (!user) return null;

  return <>{children}</>;
}
