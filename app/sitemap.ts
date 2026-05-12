import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://vfe-next.vercel.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://vfe-next.vercel.app/medicamentos', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://vfe-next.vercel.app/busqueda-semantica', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://vfe-next.vercel.app/arbol', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://vfe-next.vercel.app/avances', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://vfe-next.vercel.app/fdc', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://vfe-next.vercel.app/farmacovigilancia', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://vfe-next.vercel.app/gobernanza', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://vfe-next.vercel.app/api/fhir/r4/metadata', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];
}
