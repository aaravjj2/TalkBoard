/**
 * pwaService — Progressive Web App management service.
 *
 * Handles service worker registration, update detection, cache management,
 * install prompts, and offline status tracking.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PWAStatus {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  serviceWorkerState: 'unsupported' | 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';
  cacheSize: { entries: number; caches: Record<string, number> } | null;
  lastOnlineAt: string | null;
  networkType: string | null;
  effectiveType: string | null;
}

export interface PWAConfig {
  /** Path to the service worker file */
  swPath: string;
  /** Scope for the service worker */
  scope: string;
  /** Whether to auto-check for updates */
  autoCheckUpdates: boolean;
  /** Update check interval in ms */
  updateCheckInterval: number;
  /** Whether to auto-reload on update */
  autoReloadOnUpdate: boolean;
  /** Callback for online/offline transitions */
  onOnlineStatusChange?: (isOnline: boolean) => void;
  /** Callback when an update is available */
  onUpdateAvailable?: () => void;
  /** Callback when app is installed */
  onAppInstalled?: () => void;
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

// ─── State ───────────────────────────────────────────────────────────────────

let registration: ServiceWorkerRegistration | null = null;
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let updateCheckTimer: ReturnType<typeof setInterval> | null = null;

const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

const status: PWAStatus = {
  isInstalled: false,
  isInstallable: false,
  isOffline: !navigator.onLine,
  isUpdateAvailable: false,
  serviceWorkerState: 'unsupported',
  cacheSize: null,
  lastOnlineAt: navigator.onLine ? new Date().toISOString() : null,
  networkType: null,
  effectiveType: null,
};

// ─── Event System ────────────────────────────────────────────────────────────

function emit(event: string, ...args: unknown[]): void {
  listeners.get(event)?.forEach((fn) => fn(...args));
}

export function on(event: string, callback: (...args: unknown[]) => void): () => void {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)!.add(callback);
  return () => {
    listeners.get(event)?.delete(callback);
  };
}

// ─── Service Worker Registration ─────────────────────────────────────────────

export async function registerServiceWorker(
  config: Partial<PWAConfig> = {}
): Promise<ServiceWorkerRegistration | null> {
  const {
    swPath = '/sw.js',
    scope = '/',
    autoCheckUpdates = true,
    updateCheckInterval = 60 * 60 * 1000, // 1 hour
    autoReloadOnUpdate = false,
    onOnlineStatusChange,
    onUpdateAvailable,
    onAppInstalled,
  } = config;

  if (!('serviceWorker' in navigator)) {
    status.serviceWorkerState = 'unsupported';
    emit('status-change', { ...status });
    return null;
  }

  // Setup online/offline listeners
  setupNetworkListeners(onOnlineStatusChange);

  // Setup install prompt listener
  setupInstallPromptListener(onAppInstalled);

  try {
    registration = await navigator.serviceWorker.register(swPath, { scope });

    // Track state changes
    if (registration.installing) {
      status.serviceWorkerState = 'installing';
      trackWorker(registration.installing);
    } else if (registration.waiting) {
      status.serviceWorkerState = 'installed';
      status.isUpdateAvailable = true;
      onUpdateAvailable?.();
    } else if (registration.active) {
      status.serviceWorkerState = 'activated';
    }

    // Listen for new workers
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing;
      if (newWorker) {
        status.serviceWorkerState = 'installing';
        emit('status-change', { ...status });
        trackWorker(newWorker, () => {
          status.isUpdateAvailable = true;
          onUpdateAvailable?.();
          emit('update-available');
          emit('status-change', { ...status });

          if (autoReloadOnUpdate) {
            applyUpdate();
          }
        });
      }
    });

    // Auto-check for updates
    if (autoCheckUpdates) {
      updateCheckTimer = setInterval(() => {
        checkForUpdates();
      }, updateCheckInterval);
    }

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'CACHE_SIZE') {
        status.cacheSize = event.data.size;
        emit('cache-size', event.data.size);
        emit('status-change', { ...status });
      }
    });

    emit('registered', registration);
    emit('status-change', { ...status });
    return registration;
  } catch (error) {
    status.serviceWorkerState = 'redundant';
    emit('error', error);
    emit('status-change', { ...status });
    return null;
  }
}

function trackWorker(worker: ServiceWorker, onInstalled?: () => void): void {
  worker.addEventListener('statechange', () => {
    switch (worker.state) {
      case 'installed':
        status.serviceWorkerState = 'installed';
        onInstalled?.();
        break;
      case 'activating':
        status.serviceWorkerState = 'activating';
        break;
      case 'activated':
        status.serviceWorkerState = 'activated';
        break;
      case 'redundant':
        status.serviceWorkerState = 'redundant';
        break;
    }
    emit('status-change', { ...status });
  });
}

// ─── Update Management ───────────────────────────────────────────────────────

export async function checkForUpdates(): Promise<boolean> {
  if (!registration) return false;

  try {
    await registration.update();
    return status.isUpdateAvailable;
  } catch {
    return false;
  }
}

export function applyUpdate(): void {
  if (!registration?.waiting) return;
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });

  // Reload once the new service worker takes over
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// ─── Install Prompt ──────────────────────────────────────────────────────────

function setupInstallPromptListener(onInstalled?: () => void): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    status.isInstallable = true;
    emit('installable');
    emit('status-change', { ...status });
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    status.isInstalled = true;
    status.isInstallable = false;
    onInstalled?.();
    emit('installed');
    emit('status-change', { ...status });
  });

  // Detect if already installed (standalone mode)
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Record<string, unknown>).standalone === true
  ) {
    status.isInstalled = true;
    status.isInstallable = false;
  }
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredInstallPrompt) return 'unavailable';

  try {
    await deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    status.isInstallable = false;
    emit('status-change', { ...status });
    return outcome;
  } catch {
    return 'unavailable';
  }
}

// ─── Network Status ──────────────────────────────────────────────────────────

function setupNetworkListeners(
  callback?: (isOnline: boolean) => void
): void {
  const updateNetworkInfo = () => {
    const connection =
      (navigator as Record<string, unknown>).connection as
        | { type?: string; effectiveType?: string }
        | undefined;
    status.networkType = connection?.type || null;
    status.effectiveType = connection?.effectiveType || null;
  };

  window.addEventListener('online', () => {
    status.isOffline = false;
    status.lastOnlineAt = new Date().toISOString();
    updateNetworkInfo();
    callback?.(true);
    emit('online');
    emit('status-change', { ...status });
  });

  window.addEventListener('offline', () => {
    status.isOffline = true;
    updateNetworkInfo();
    callback?.(false);
    emit('offline');
    emit('status-change', { ...status });
  });

  // Listen for network info changes
  const connection =
    (navigator as Record<string, unknown>).connection as EventTarget | undefined;
  if (connection) {
    connection.addEventListener('change', () => {
      updateNetworkInfo();
      emit('status-change', { ...status });
    });
  }

  updateNetworkInfo();
}

// ─── Cache Management ────────────────────────────────────────────────────────

export function requestCacheSize(): void {
  registration?.active?.postMessage({ type: 'GET_CACHE_SIZE' });
}

export function precacheUrls(urls: string[]): void {
  registration?.active?.postMessage({ type: 'CACHE_URLS', urls });
}

export async function clearAllCaches(): Promise<void> {
  registration?.active?.postMessage({ type: 'CLEAR_CACHES' });
  status.cacheSize = null;
  emit('status-change', { ...status });
}

export async function getCacheStats(): Promise<{
  entries: number;
  caches: Record<string, number>;
} | null> {
  if (!('caches' in window)) return null;

  const keys = await caches.keys();
  const cacheSizes: Record<string, number> = {};
  let totalEntries = 0;

  for (const key of keys) {
    const cache = await caches.open(key);
    const entries = await cache.keys();
    cacheSizes[key] = entries.length;
    totalEntries += entries.length;
  }

  const result = { entries: totalEntries, caches: cacheSizes };
  status.cacheSize = result;
  return result;
}

// ─── Status ──────────────────────────────────────────────────────────────────

export function getStatus(): PWAStatus {
  return { ...status };
}

export function isSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export function unregister(): void {
  if (updateCheckTimer) {
    clearInterval(updateCheckTimer);
    updateCheckTimer = null;
  }

  registration?.unregister();
  registration = null;
  listeners.clear();
}

// ─── Export service object ───────────────────────────────────────────────────

export const pwaService = {
  registerServiceWorker,
  checkForUpdates,
  applyUpdate,
  promptInstall,
  requestCacheSize,
  precacheUrls,
  clearAllCaches,
  getCacheStats,
  getStatus,
  isSupported,
  isOnline,
  on,
  unregister,
};

export default pwaService;
