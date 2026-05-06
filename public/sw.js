// SIMI Service Worker — Offline-first con Stale-While-Revalidate
// Cache prioritario de medicamentos CNMB para zonas sin conectividad
// Versión: 1.0.0

const CACHE_NAME = 'simi-v1';
const STATIC_CACHE = 'simi-static-v1';
const API_CACHE = 'simi-api-v1';

// Recursos estáticos a cachear en instalación
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/medicamentos',
  '/gobernanza',
  '/manifest.json',
  '/icon.svg',
];

// URLs de API a cachear con Stale-While-Revalidate
const API_ROUTES = [
  '/api/avances',
  '/api/capitulos',
];

// Instalación — cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SIMI SW] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SIMI SW] Error cacheando static assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activación — limpiar caches antiguas
self.addEventListener('activate', (event) => {
  console.log('[SIMI SW] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — estrategia por tipo de recurso
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // API routes — Stale-While-Revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE));
    return;
  }

  // Assets estáticos — Cache First
  if (url.pathname.match(/\.(js|css|svg|png|ico|woff2?)$/)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Páginas — Network First con fallback a cache
  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

// Cache First — para assets estáticos
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Stale While Revalidate — para API
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || fetchPromise || new Response(
    JSON.stringify({ error: 'Sin conexión', offline: true }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

// Network First — para páginas HTML
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/') || new Response(
      '<h1>SIMI — Sin conexión</h1><p>Verifica tu conexión a internet.</p>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Mensaje para pre-cachear medicamentos CNMB
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_CNMB') {
    console.log('[SIMI SW] Pre-cacheando medicamentos CNMB...');
    caches.open(API_CACHE).then(cache => {
      cache.add('/api/medicamentos?cnmb=true&limit=500');
    });
  }
});
