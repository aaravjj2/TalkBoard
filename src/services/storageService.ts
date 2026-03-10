/**
 * Storage Service — Handles localStorage operations with JSON serialization,
 * error handling, and migration support.
 */

import { STORAGE_KEYS } from '@/constants';

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('localStorage write failed:', err);
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeItem(key);
  });
}

export function getStorageUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  let used = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
  } catch {
    // ignore
  }

  // Typical localStorage limit is ~5MB (5,242,880 chars, 2 bytes each)
  const total = 5 * 1024 * 1024;
  return {
    used: used * 2, // chars → bytes (UTF-16)
    total: total * 2,
    percentage: (used / total) * 100,
  };
}

export function exportData(): string {
  const data: Record<string, unknown> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      try {
        data[name] = JSON.parse(raw);
      } catch {
        data[name] = raw;
      }
    }
  });
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): void {
  const data = JSON.parse(jsonString) as Record<string, unknown>;
  Object.entries(data).forEach(([name, value]) => {
    const key = (STORAGE_KEYS as Record<string, string>)[name];
    if (key) {
      setItem(key, value);
    }
  });
}

export const storageService = {
  getItem,
  setItem,
  removeItem,
  clearAll,
  getStorageUsage,
  exportData,
  importData,
};
