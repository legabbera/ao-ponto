/**
 * Service Worker Oficial — Ao Ponto PWA
 * Fornece caching inteligente, carregamento rápido e suporte offline básico.
 */
const CACHE_NAME = 'ao-ponto-cache-v4';
const ASSETS_ESTATICOS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/logo.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_ESTATICOS).catch((err) => {
        console.warn('Alguns assets iniciais não puderam ser cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) => {
      return Promise.all(
        chaves
          .filter((chave) => chave !== CACHE_NAME)
          .map((chave) => caches.delete(chave))
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Ignora requisições de métodos que não sejam GET e requisições para Supabase/APIs externas
  if (req.method !== 'GET' || req.url.includes('supabase.co') || req.url.includes('mercadopago.com')) {
    return;
  }

  // Navegações de página: busca sempre da rede para ter o HTML mais novo e não travar em versões antigas
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((respostaRede) => {
          if (respostaRede && respostaRede.status === 200) {
            const respostaClone = respostaRede.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, respostaClone));
          }
          return respostaRede;
        })
        .catch(async () => {
          const emCache = await caches.match(req) || await caches.match('/index.html');
          return emCache || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((respostaRede) => {
        // Se a resposta for válida, clona e atualiza no cache
        if (respostaRede && respostaRede.status === 200 && respostaRede.type === 'basic') {
          const respostaParaCache = respostaRede.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, respostaParaCache);
          });
        }
        return respostaRede;
      })
      .catch(async () => {
        // Em caso de falha de conexão / offline, busca no cache
        const respostaCache = await caches.match(req);
        if (respostaCache) {
          return respostaCache;
        }
        return new Response('Sem conexão com a internet', {
          status: 503,
          statusText: 'Offline',
          headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      })
  );
});

