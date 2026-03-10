import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '@/services/storageService';
import { STORAGE_KEYS } from '@/constants';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getItem', () => {
    it('should return fallback for non-existent key', () => {
      expect(storageService.getItem('nonexistent', null)).toBeNull();
      expect(storageService.getItem('nonexistent', 'default')).toBe('default');
    });

    it('should return stored value', () => {
      localStorage.setItem('test-key', JSON.stringify({ value: 42 }));
      expect(storageService.getItem('test-key', null)).toEqual({ value: 42 });
    });

    it('should return fallback for invalid JSON', () => {
      localStorage.setItem('bad-key', 'not json');
      expect(storageService.getItem('bad-key', null)).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should store value as JSON', () => {
      storageService.setItem('key', { name: 'test' });
      const stored = localStorage.getItem('key');
      expect(stored).toBe(JSON.stringify({ name: 'test' }));
    });

    it('should store string values', () => {
      storageService.setItem('key', 'hello');
      expect(storageService.getItem('key', null)).toBe('hello');
    });

    it('should store arrays', () => {
      storageService.setItem('key', [1, 2, 3]);
      expect(storageService.getItem('key', null)).toEqual([1, 2, 3]);
    });
  });

  describe('removeItem', () => {
    it('should remove stored item', () => {
      storageService.setItem('key', 'value');
      storageService.removeItem('key');
      expect(storageService.getItem('key', null)).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all STORAGE_KEYS items', () => {
      // clearAll only removes known STORAGE_KEYS values
      const key = STORAGE_KEYS.USER_PROFILE;
      localStorage.setItem(key, JSON.stringify({ name: 'test' }));
      storageService.clearAll();
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('exportData', () => {
    it('should export stored data as JSON string', () => {
      // exportData uses STORAGE_KEYS names as object keys
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify({ name: 'test' }));
      const exported = storageService.exportData();
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed).toHaveProperty('USER_PROFILE');
    });
  });

  describe('importData', () => {
    it('should import valid JSON data using STORAGE_KEYS names', () => {
      const data = JSON.stringify({
        USER_PROFILE: { name: 'imported' },
      });
      storageService.importData(data);
      // importData maps name -> STORAGE_KEYS[name] -> localStorage
      expect(localStorage.getItem(STORAGE_KEYS.USER_PROFILE)).toBe(
        JSON.stringify({ name: 'imported' })
      );
    });

    it('should throw on invalid JSON', () => {
      expect(() => storageService.importData('not json')).toThrow();
    });
  });

  describe('getStorageUsage', () => {
    it('should return usage info', () => {
      storageService.setItem('test', { data: 'some value' });
      const usage = storageService.getStorageUsage();
      expect(usage).toHaveProperty('used');
      expect(usage.used).toBeGreaterThan(0);
    });
  });
});
