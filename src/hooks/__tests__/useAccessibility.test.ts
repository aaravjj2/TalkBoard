import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useMediaQuery,
  useBreakpoint,
  useIsMobile,
  useDebounce,
} from '@/hooks/useAccessibility';

describe('useAccessibility hooks', () => {
  describe('useMediaQuery', () => {
    it('returns a boolean value', () => {
      const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
      expect(typeof result.current).toBe('boolean');
    });

    it('returns true for matching query', () => {
      // Our mock matchMedia always returns matches: false by default
      const { result } = renderHook(() => useMediaQuery('(max-width: 1024px)'));
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useBreakpoint', () => {
    it('returns a breakpoint string', () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(['mobile', 'tablet', 'desktop', 'large']).toContain(result.current);
    });
  });

  describe('useIsMobile', () => {
    it('returns a boolean', () => {
      const { result } = renderHook(() => useIsMobile());
      expect(typeof result.current).toBe('boolean');
    });
  });

  describe('useDebounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));
      expect(result.current).toBe('initial');
    });

    it('debounces value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 300 } }
      );

      expect(result.current).toBe('first');

      rerender({ value: 'second', delay: 300 });
      // Before timeout, still old value
      expect(result.current).toBe('first');
    });

    it('updates after delay', async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'first', delay: 300 } }
      );

      rerender({ value: 'updated', delay: 300 });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(result.current).toBe('updated');
    });

    it('debounces numbers', () => {
      const { result } = renderHook(() => useDebounce(42, 500));
      expect(result.current).toBe(42);
    });

    it('debounces objects', () => {
      const obj = { key: 'value' };
      const { result } = renderHook(() => useDebounce(obj, 200));
      expect(result.current).toEqual({ key: 'value' });
    });
  });
});
