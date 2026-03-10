import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings, applyTheme } from '@/hooks/useSettings';
import { useUserStore } from '@/stores/userStore';
import { DEFAULT_SETTINGS } from '@/constants';

describe('useSettings', () => {
  beforeEach(() => {
    act(() => {
      useUserStore.getState().resetSettings();
    });
  });

  describe('settings management', () => {
    it('returns current settings', () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.settings).toBeDefined();
      expect(result.current.settings.theme).toBe(DEFAULT_SETTINGS.theme);
    });

    it('updates individual settings', () => {
      const { result } = renderHook(() => useSettings());
      act(() => {
        result.current.updateSettings({ fontSize: 'large' });
      });
      expect(result.current.settings.fontSize).toBe('large');
    });

    it('resets settings to defaults', () => {
      const { result } = renderHook(() => useSettings());
      act(() => {
        result.current.updateSettings({ fontSize: 'large', highContrast: true });
      });
      act(() => {
        result.current.resetSettings();
      });
      expect(result.current.settings.fontSize).toBe(DEFAULT_SETTINGS.fontSize);
    });
  });

  describe('theme', () => {
    it('toggles dark mode', () => {
      const { result } = renderHook(() => useSettings());
      const initial = result.current.settings.theme;
      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.settings.theme).not.toBe(initial);
    });

    it('toggles high contrast', () => {
      const { result } = renderHook(() => useSettings());
      const initial = result.current.settings.highContrast;
      act(() => {
        result.current.toggleHighContrast();
      });
      expect(result.current.settings.highContrast).toBe(!initial);
    });
  });

  describe('font and grid size', () => {
    it('sets font size', () => {
      const { result } = renderHook(() => useSettings());
      act(() => {
        result.current.setFontSize('xlarge');
      });
      expect(result.current.settings.fontSize).toBe('xlarge');
    });

    it('sets grid size', () => {
      const { result } = renderHook(() => useSettings());
      act(() => {
        result.current.setGridSize('large');
      });
      expect(result.current.settings.gridSize).toBe('large');
    });
  });

  describe('profile', () => {
    it('returns current profile', () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.profile).toBeDefined();
    });

    it('updates profile', () => {
      const { result } = renderHook(() => useSettings());
      // Must set a profile first (initial state is null)
      act(() => {
        result.current.setProfile({ name: '', avatar: '😀', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      });
      act(() => {
        result.current.updateProfile({ name: 'Test User' });
      });
      expect(result.current.profile!.name).toBe('Test User');
    });
  });

  describe('caregiver mode', () => {
    it('starts in non-caregiver mode', () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.isCaregiverMode).toBe(false);
    });

    it('toggles caregiver mode', () => {
      const { result } = renderHook(() => useSettings());
      act(() => {
        result.current.setCaregiverMode(true);
      });
      expect(result.current.isCaregiverMode).toBe(true);
    });
  });

  describe('onboarding', () => {
    it('returns onboarding status', () => {
      const { result } = renderHook(() => useSettings());
      expect(typeof result.current.hasCompletedOnboarding).toBe('boolean');
    });

    it('marks onboarding complete', () => {
      const { result } = renderHook(() => useSettings());
      act(() => {
        result.current.setOnboardingComplete(true);
      });
      expect(result.current.hasCompletedOnboarding).toBe(true);
    });
  });
});

describe('applyTheme', () => {
  it('adds dark class for dark theme', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class for light theme', () => {
    document.documentElement.classList.add('dark');
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
