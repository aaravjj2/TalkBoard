/**
 * usePWA — Hook for Progressive Web App features.
 *
 * Provides reactive access to PWA status, install prompts,
 * update notifications, offline detection, and cache management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PWAStatus } from '@/services/pwaService';
import {
  registerServiceWorker,
  checkForUpdates,
  applyUpdate,
  promptInstall,
  clearAllCaches,
  getCacheStats,
  getStatus,
  isSupported,
  on,
} from '@/services/pwaService';

export interface UsePWAReturn {
  /** Current PWA status */
  status: PWAStatus;
  /** Whether the browser supports PWA features */
  isSupported: boolean;
  /** Whether the app is currently offline */
  isOffline: boolean;
  /** Whether an update is available */
  isUpdateAvailable: boolean;
  /** Whether the app can be installed */
  isInstallable: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Prompt the user to install the app */
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Check for service worker updates */
  checkUpdate: () => Promise<boolean>;
  /** Apply a pending update (reloads the page) */
  update: () => void;
  /** Clear all service worker caches */
  clearCaches: () => Promise<void>;
  /** Get cache statistics */
  getCacheSize: () => Promise<{ entries: number; caches: Record<string, number> } | null>;
  /** Whether the network connection is slow */
  isSlowConnection: boolean;
}

export function usePWA(): UsePWAReturn {
  const [status, setStatus] = useState<PWAStatus>(getStatus);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    // Register service worker on mount
    registerServiceWorker({
      autoCheckUpdates: true,
      updateCheckInterval: 60 * 60 * 1000, // 1 hour
    });

    // Listen for status changes
    const unsubStatus = on('status-change', (newStatus) => {
      setStatus(newStatus as PWAStatus);
    });

    // Listen for specific events
    const unsubOnline = on('online', () => {
      setStatus(getStatus());
    });
    const unsubOffline = on('offline', () => {
      setStatus(getStatus());
    });
    const unsubUpdate = on('update-available', () => {
      setStatus(getStatus());
    });
    const unsubInstallable = on('installable', () => {
      setStatus(getStatus());
    });
    const unsubInstalled = on('installed', () => {
      setStatus(getStatus());
    });

    return () => {
      unsubStatus();
      unsubOnline();
      unsubOffline();
      unsubUpdate();
      unsubInstallable();
      unsubInstalled();
    };
  }, []);

  const install = useCallback(async () => {
    return promptInstall();
  }, []);

  const checkUpdate = useCallback(async () => {
    return checkForUpdates();
  }, []);

  const update = useCallback(() => {
    applyUpdate();
  }, []);

  const clearCachesAction = useCallback(async () => {
    await clearAllCaches();
    setStatus(getStatus());
  }, []);

  const getCacheSizeAction = useCallback(async () => {
    return getCacheStats();
  }, []);

  const isSlowConnection =
    status.effectiveType === '2g' || status.effectiveType === 'slow-2g';

  return {
    status,
    isSupported: isSupported(),
    isOffline: status.isOffline,
    isUpdateAvailable: status.isUpdateAvailable,
    isInstallable: status.isInstallable,
    isInstalled: status.isInstalled,
    install,
    checkUpdate,
    update,
    clearCaches: clearCachesAction,
    getCacheSize: getCacheSizeAction,
    isSlowConnection,
  };
}

export default usePWA;
