import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, UserProfile, QuickPhrase } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';
import { v4 as uuidv4 } from 'uuid';

interface UserState {
  // Profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;

  // Quick Phrases
  quickPhrases: QuickPhrase[];
  addQuickPhrase: (text: string, symbolIds: string[]) => void;
  removeQuickPhrase: (id: string) => void;
  pinQuickPhrase: (id: string) => void;
  unpinQuickPhrase: (id: string) => void;
  incrementQuickPhraseUsage: (id: string) => void;
  reorderQuickPhrases: (from: number, to: number) => void;

  // Caregiver
  isCaregiverMode: boolean;
  setCaregiverMode: (active: boolean) => void;
  validateCaregiverPin: (pin: string) => boolean;

  // Onboarding
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Profile
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (data) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...data, updatedAt: new Date().toISOString() }
            : null,
        })),

      // Settings
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      // Quick Phrases
      quickPhrases: [],
      addQuickPhrase: (text, symbolIds) =>
        set((state) => {
          const existing = state.quickPhrases.find((qp) => qp.text === text);
          if (existing) {
            return {
              quickPhrases: state.quickPhrases.map((qp) =>
                qp.id === existing.id
                  ? {
                      ...qp,
                      usageCount: qp.usageCount + 1,
                      lastUsedAt: new Date().toISOString(),
                    }
                  : qp
              ),
            };
          }
          const newPhrase: QuickPhrase = {
            id: uuidv4(),
            text,
            symbolIds,
            usageCount: 1,
            lastUsedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            isPinned: false,
            order: state.quickPhrases.length,
          };
          return {
            quickPhrases: [...state.quickPhrases, newPhrase].slice(0, 20),
          };
        }),
      removeQuickPhrase: (id) =>
        set((state) => ({
          quickPhrases: state.quickPhrases.filter((qp) => qp.id !== id),
        })),
      pinQuickPhrase: (id) =>
        set((state) => ({
          quickPhrases: state.quickPhrases.map((qp) =>
            qp.id === id ? { ...qp, isPinned: true } : qp
          ),
        })),
      unpinQuickPhrase: (id) =>
        set((state) => ({
          quickPhrases: state.quickPhrases.map((qp) =>
            qp.id === id ? { ...qp, isPinned: false } : qp
          ),
        })),
      incrementQuickPhraseUsage: (id) =>
        set((state) => ({
          quickPhrases: state.quickPhrases.map((qp) =>
            qp.id === id
              ? {
                  ...qp,
                  usageCount: qp.usageCount + 1,
                  lastUsedAt: new Date().toISOString(),
                }
              : qp
          ),
        })),
      reorderQuickPhrases: (from, to) =>
        set((state) => {
          const items = [...state.quickPhrases];
          const [moved] = items.splice(from, 1);
          items.splice(to, 0, moved);
          return { quickPhrases: items.map((qp, i) => ({ ...qp, order: i })) };
        }),

      // Caregiver
      isCaregiverMode: false,
      setCaregiverMode: (active) => set({ isCaregiverMode: active }),
      validateCaregiverPin: (pin) => {
        const { settings } = get();
        if (!settings.caregiverPin) return true;
        return pin === settings.caregiverPin;
      },

      // Onboarding
      hasCompletedOnboarding: false,
      setOnboardingComplete: (complete) =>
        set({ hasCompletedOnboarding: complete }),
    }),
    {
      name: 'talkboard-user',
      partialize: (state) => ({
        profile: state.profile,
        settings: state.settings,
        quickPhrases: state.quickPhrases,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
