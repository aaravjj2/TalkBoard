/**
 * Service Worker for TalkBoard PWA
 *
 * Implements a cache-first strategy for static assets and network-first for
 * API calls. Provides offline support with graceful fallbacks.
 *
 * Cache strategy:
 * - Static assets (JS, CSS, images): Cache-first with network update
 * - HTML pages: Network-first with cache fallback
 * - API calls: Network-first with stale-while-revalidate
 * - Fonts: Cache-first (long-lived)
 */

/// <reference lib="webworker" />

const CACHE_VERSION = 'talkboard-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

const MAX_DYNAMIC_CACHE_SIZE = 100;
const MAX_API_CACHE_SIZE = 50;
const API_CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => (self as unknown as ServiceWorkerGlobalScope).skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('talkboard-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE && key !== FONT_CACHE)
          .map((key) => caches.delete(key))
      )
    )
    .then(() => (self as unknown as ServiceWorkerGlobalScope).clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Font files — cache-first, long-lived
  if (url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // Static assets (JS, CSS, images) — stale-while-revalidate
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // API-like routes — network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, API_CACHE_MAX_AGE));
    return;
  }

  // HTML / navigation — network-first, cache fallback to app shell
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ─── Cache Strategies ────────────────────────────────────────────────────────

async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
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
    return new Response('', { status: 408, statusText: 'Request Timeout' });
  }
}

async function networkFirst(
  request: Request,
  cacheName: string,
  maxAge?: number
): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const cloned = response.clone();

      // Add timestamp header for cache age tracking
      if (maxAge) {
        const headers = new Headers(cloned.headers);
        headers.set('sw-cache-timestamp', Date.now().toString());
        const timedResponse = new Response(await cloned.blob(), {
          status: cloned.status,
          statusText: cloned.statusText,
          headers,
        });
        cache.put(request, timedResponse);
      } else {
        cache.put(request, cloned);
      }

      await trimCache(cacheName, MAX_DYNAMIC_CACHE_SIZE);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      // Check if cached response is too old
      if (maxAge) {
        const timestamp = cached.headers.get('sw-cache-timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          if (age > maxAge) {
            // Stale but return anyway with a warning header
            const headers = new Headers(cached.headers);
            headers.set('sw-stale', 'true');
            return new Response(await cached.blob(), {
              status: cached.status,
              statusText: cached.statusText,
              headers,
            });
          }
        }
      }
      return cached;
    }

    // Return the offline fallback page
    return caches.match('/') || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(
  request: Request,
  cacheName: string
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || (await networkPromise) || new Response('', { status: 408 });
}

// ─── Cache Utilities ─────────────────────────────────────────────────────────

async function trimCache(cacheName: string, maxSize: number): Promise<void> {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

// ─── Background Sync ─────────────────────────────────────────────────────────

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

async function syncAnalytics(): Promise<void> {
  // Analytics sync would go here when backend is available
  // For now, analytics are stored locally
}

async function syncUserData(): Promise<void> {
  // User data sync would go here for cloud backup
}

// ─── Push Notifications ──────────────────────────────────────────────────────

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() ?? {
    title: 'TalkBoard',
    body: 'You have a new update!',
    icon: '/icons/icon-192x192.png',
  };

  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: data.data,
      }
    )
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    (self as unknown as ServiceWorkerGlobalScope).clients
      .matchAll({ type: 'window' })
      .then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return (self as unknown as ServiceWorkerGlobalScope).clients.openWindow('/');
      })
  );
});

// ─── Message handling ────────────────────────────────────────────────────────

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
  }

  if (event.data?.type === 'CACHE_URLS') {
    const urls: string[] = event.data.urls || [];
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        Promise.all(
          urls.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) cache.put(url, response);
              })
              .catch(() => {
                // Silently skip failed precaching
              })
          )
        )
      )
    );
  }

  if (event.data?.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.map((key) => caches.delete(key)))
      )
    );
  }

  if (event.data?.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.source?.postMessage({
          type: 'CACHE_SIZE',
          size,
        });
      })
    );
  }
});

async function getCacheSize(): Promise<{
  entries: number;
  caches: Record<string, number>;
}> {
  const keys = await caches.keys();
  const cacheSizes: Record<string, number> = {};
  let totalEntries = 0;

  for (const key of keys) {
    const cache = await caches.open(key);
    const entries = await cache.keys();
    cacheSizes[key] = entries.length;
    totalEntries += entries.length;
  }

  return { entries: totalEntries, caches: cacheSizes };
}

// Type augmentation for ServiceWorker events
interface SyncEvent extends ExtendableEvent {
  tag: string;
}

interface PushEvent extends ExtendableEvent {
  data: PushMessageData | null;
}

interface PushMessageData {
  json(): Record<string, unknown>;
  text(): string;
}

interface NotificationEvent extends ExtendableEvent {
  notification: Notification;
  action: string;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface ExtendableMessageEvent extends Event {
  data: Record<string, unknown>;
  source: Client | ServiceWorker | MessagePort | null;
}

interface Client {
  focus(): Promise<Client>;
  postMessage(message: unknown): void;
}
