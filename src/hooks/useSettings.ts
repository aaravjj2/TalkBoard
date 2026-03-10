import { useUserStore } from '@/stores/userStore';
import type { UserSettings } from '@/types';

export function useSettings() {
  const {
    settings,
    updateSettings,
    resetSettings,
    profile,
    setProfile,
    updateProfile,
    hasCompletedOnboarding,
    setOnboardingComplete,
    isCaregiverMode,
    setCaregiverMode,
    validateCaregiverPin,
  } = useUserStore();

  const toggleDarkMode = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
    applyTheme(newTheme);
  };

  const toggleHighContrast = () => {
    updateSettings({ highContrast: !settings.highContrast });
  };

  const setFontSize = (size: UserSettings['fontSize']) => {
    updateSettings({ fontSize: size });
  };

  const setGridSize = (size: UserSettings['gridSize']) => {
    updateSettings({ gridSize: size });
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    profile,
    setProfile,
    updateProfile,
    hasCompletedOnboarding,
    setOnboardingComplete,
    isCaregiverMode,
    setCaregiverMode,
    validateCaregiverPin,
    toggleDarkMode,
    toggleHighContrast,
    setFontSize,
    setGridSize,
  };
}

export function applyTheme(theme: string) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    root.classList.toggle('dark', prefersDark);
  }
}
