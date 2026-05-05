import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'SIMI — Sistema Integral de Medicamentos Interoperables',
    template: '%s · SIMI Ecuador',
  },
  description: 'Repositorio farmacéutico nacional de Ecuador con nomenclatura SPMS, interoperabilidad FHIR R4, codificación ATC-WHO 2025 y SNOMED CT. Conforme a estándares ISO IDMP, EMA SPOR y ARCSA.',
  keywords: [
    'medicamentos Ecuador', 'farmacología Ecuador', 'ARCSA', 'vademécum Ecuador',
    'FHIR R4', 'ISO IDMP', 'EMA SPOR', 'SNOMED CT', 'ATC WHO',
    'interoperabilidad farmacéutica', 'base de datos medicamentos',
    'registro sanitario Ecuador', 'CNMB Ecuador', 'farmacovigilancia',
    'principio activo', 'INN DCI', 'forma farmacéutica', 'EDQM',
  ],
  authors: [{ name: 'SIMI Ecuador', url: 'https://vfe-next.vercel.app' }],
  creator: 'SIMI Ecuador',
  publisher: 'SIMI Ecuador',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: 'https://vfe-next.vercel.app',
    siteName: 'SIMI — Sistema Integral de Medicamentos Interoperables',
    title: 'SIMI — Repositorio Farmacéutico Nacional de Ecuador',
    description: 'Base de datos farmacéutica nacional con FHIR R4, ISO IDMP, EMA SPOR, ATC-WHO y SNOMED CT.',
  },
  twitter: {
    card: 'summary',
    title: 'SIMI — Sistema Integral de Medicamentos Interoperables',
    description: 'Repositorio farmacéutico nacional de Ecuador · FHIR R4 · ISO IDMP · ARCSA',
  },
  category: 'health',
  classification: 'Government Health Information System',
  manifest: '/manifest.json',
  other: {
    'dc.title': 'SIMI — Sistema Integral de Medicamentos Interoperables',
    'dc.subject': 'Farmacología, Medicamentos, Salud, Ecuador',
    'dc.language': 'es-EC',
    'dc.type': 'InteractiveResource',
    'dc.format': 'text/html',
    'dc.rights': 'Uso institucional Ecuador',
    'healthlit:type': 'pharmaceutical-database',
    'fhir:version': 'R4',
    'iso:standard': 'ISO IDMP 11615/11238/11239/11240/11616',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-EC">
      <head>
        {/* Structured Data — MedicalWebPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalWebPage',
              name: 'SIMI — Sistema Integral de Medicamentos Interoperables',
              url: 'https://vfe-next.vercel.app',
              description: 'Repositorio farmacéutico nacional de Ecuador con interoperabilidad FHIR R4 y estándares ISO IDMP.',
              inLanguage: 'es-EC',
              about: {
                '@type': 'MedicalCondition',
                name: 'Base de datos de medicamentos autorizados en Ecuador',
              },
              audience: {
                '@type': 'MedicalAudience',
                audienceType: 'Clinician, Pharmacist, HealthcareProvider',
              },
              publisher: {
                '@type': 'Organization',
                name: 'SIMI Ecuador',
                url: 'https://vfe-next.vercel.app',
              },
              license: 'https://vfe-next.vercel.app/gobernanza',
            }),
          }}
        />
        {/* Preconnect para APIs externas */}
        <link rel="preconnect" href="https://rxnav.nlm.nih.gov" />
        <link rel="preconnect" href="https://snowstorm.ihtsdotools.org" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
