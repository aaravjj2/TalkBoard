import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/stores/userStore';
import { act } from '@testing-library/react';
import { DEFAULT_SETTINGS } from '@/constants';
import type { UserProfile } from '@/types';

const mockProfile: UserProfile = {
  id: 'user-1',
  name: 'Test User',
  avatar: '😊',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('userStore', () => {
  beforeEach(() => {
    const store = useUserStore.getState();
    store.resetSettings();
    act(() => {
      useUserStore.setState({
        profile: null,
        quickPhrases: [],
        isCaregiverMode: false,
        hasCompletedOnboarding: false,
      });
    });
  });

  describe('profile', () => {
    it('should start with null profile', () => {
      expect(useUserStore.getState().profile).toBeNull();
    });

    it('should set profile', () => {
      act(() => {
        useUserStore.getState().setProfile(mockProfile);
      });
      const { profile } = useUserStore.getState();
      expect(profile).not.toBeNull();
      expect(profile?.name).toBe('Test User');
      expect(profile?.avatar).toBe('😊');
    });

    it('should update profile', () => {
      act(() => {
        useUserStore.getState().setProfile(mockProfile);
      });
      act(() => {
        useUserStore.getState().updateProfile({ name: 'New Name' });
      });
      expect(useUserStore.getState().profile?.name).toBe('New Name');
      expect(useUserStore.getState().profile?.avatar).toBe('😊');
    });

    it('should not update profile if null', () => {
      act(() => {
        useUserStore.getState().updateProfile({ name: 'Test' });
      });
      expect(useUserStore.getState().profile).toBeNull();
    });
  });

  describe('settings', () => {
    it('should start with default settings', () => {
      const { settings } = useUserStore.getState();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('should update single setting', () => {
      act(() => {
        useUserStore.getState().updateSettings({ theme: 'dark' });
      });
      expect(useUserStore.getState().settings.theme).toBe('dark');
    });

    it('should update multiple settings', () => {
      act(() => {
        useUserStore.getState().updateSettings({
          theme: 'dark',
          fontSize: 'large',
          highContrast: true,
        });
      });
      const { settings } = useUserStore.getState();
      expect(settings.theme).toBe('dark');
      expect(settings.fontSize).toBe('large');
      expect(settings.highContrast).toBe(true);
    });

    it('should preserve other settings when updating', () => {
      act(() => {
        useUserStore.getState().updateSettings({ theme: 'dark' });
      });
      expect(useUserStore.getState().settings.fontSize).toBe(DEFAULT_SETTINGS.fontSize);
    });

    it('should reset settings to defaults', () => {
      act(() => {
        useUserStore.getState().updateSettings({
          theme: 'dark',
          fontSize: 'extra-large',
        });
      });
      act(() => {
        useUserStore.getState().resetSettings();
      });
      expect(useUserStore.getState().settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('quickPhrases', () => {
    it('should start with empty phrases', () => {
      expect(useUserStore.getState().quickPhrases).toEqual([]);
    });

    it('should add a quick phrase', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('Hello world', ['sym-1', 'sym-2']);
      });
      const { quickPhrases } = useUserStore.getState();
      expect(quickPhrases).toHaveLength(1);
      expect(quickPhrases[0].text).toBe('Hello world');
      expect(quickPhrases[0].usageCount).toBe(1);
    });

    it('should increment usage on duplicate phrase', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('Hello world', ['sym-1']);
      });
      act(() => {
        useUserStore.getState().addQuickPhrase('Hello world', ['sym-1']);
      });
      const { quickPhrases } = useUserStore.getState();
      expect(quickPhrases).toHaveLength(1);
      expect(quickPhrases[0].usageCount).toBe(2);
    });

    it('should remove a quick phrase', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('Test phrase', ['sym-1']);
      });
      const id = useUserStore.getState().quickPhrases[0].id;
      act(() => {
        useUserStore.getState().removeQuickPhrase(id);
      });
      expect(useUserStore.getState().quickPhrases).toHaveLength(0);
    });

    it('should pin a quick phrase', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('Test', ['sym-1']);
      });
      const id = useUserStore.getState().quickPhrases[0].id;
      act(() => {
        useUserStore.getState().pinQuickPhrase(id);
      });
      expect(useUserStore.getState().quickPhrases[0].isPinned).toBe(true);
    });

    it('should unpin a quick phrase', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('Test', ['sym-1']);
      });
      const id = useUserStore.getState().quickPhrases[0].id;
      act(() => {
        useUserStore.getState().pinQuickPhrase(id);
      });
      act(() => {
        useUserStore.getState().unpinQuickPhrase(id);
      });
      expect(useUserStore.getState().quickPhrases[0].isPinned).toBe(false);
    });

    it('should cap quick phrases at 20', () => {
      act(() => {
        for (let i = 0; i < 25; i++) {
          useUserStore.getState().addQuickPhrase(`Phrase ${i}`, [`sym-${i}`]);
        }
      });
      expect(useUserStore.getState().quickPhrases.length).toBeLessThanOrEqual(20);
    });

    it('should increment quick phrase usage', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('Test', ['sym-1']);
      });
      const id = useUserStore.getState().quickPhrases[0].id;
      act(() => {
        useUserStore.getState().incrementQuickPhraseUsage(id);
      });
      expect(useUserStore.getState().quickPhrases[0].usageCount).toBe(2);
    });

    it('should reorder quick phrases', () => {
      act(() => {
        useUserStore.getState().addQuickPhrase('First', ['sym-1']);
        useUserStore.getState().addQuickPhrase('Second', ['sym-2']);
        useUserStore.getState().addQuickPhrase('Third', ['sym-3']);
      });
      act(() => {
        useUserStore.getState().reorderQuickPhrases(2, 0);
      });
      const { quickPhrases } = useUserStore.getState();
      expect(quickPhrases[0].text).toBe('Third');
      expect(quickPhrases[1].text).toBe('First');
    });
  });

  describe('caregiverMode', () => {
    it('should start deactivated', () => {
      expect(useUserStore.getState().isCaregiverMode).toBe(false);
    });

    it('should activate caregiver mode', () => {
      act(() => {
        useUserStore.getState().setCaregiverMode(true);
      });
      expect(useUserStore.getState().isCaregiverMode).toBe(true);
    });

    it('should validate PIN correctly', () => {
      act(() => {
        useUserStore.getState().updateSettings({ caregiverPin: '1234' });
      });
      expect(useUserStore.getState().validateCaregiverPin('1234')).toBe(true);
      expect(useUserStore.getState().validateCaregiverPin('0000')).toBe(false);
    });

    it('should allow access when no PIN set', () => {
      expect(useUserStore.getState().validateCaregiverPin('')).toBe(true);
    });
  });

  describe('onboarding', () => {
    it('should start incomplete', () => {
      expect(useUserStore.getState().hasCompletedOnboarding).toBe(false);
    });

    it('should complete onboarding', () => {
      act(() => {
        useUserStore.getState().setOnboardingComplete(true);
      });
      expect(useUserStore.getState().hasCompletedOnboarding).toBe(true);
    });
  });
});
