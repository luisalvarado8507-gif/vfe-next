import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  keywords: ['medicamentos', 'farmacología', 'Ecuador', 'ARCSA', 'FHIR', 'ISO IDMP', 'SPOR'],
    title: 'SIMI — Sistema Integral de Medicamentos Interoperables',
  description: 'Base de datos de medicamentos de referencia para Ecuador',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
