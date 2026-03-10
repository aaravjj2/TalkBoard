import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { applyTheme } from '@/hooks/useSettings';
import { ttsService } from '@/services/ttsService';

import Layout from '@/components/Layout/Layout';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';
import HistoryPage from '@/pages/HistoryPage';
import QuickPhrasesPage from '@/pages/QuickPhrasesPage';
import CaregiverPage from '@/pages/CaregiverPage';
import HelpPage from '@/pages/HelpPage';
import OnboardingPage from '@/pages/OnboardingPage';
import ProfilePage from '@/pages/ProfilePage';
import AnalyticsDashboardPage from '@/pages/AnalyticsDashboardPage';
import SymbolEditorPage from '@/pages/SymbolEditorPage';

export default function App() {
  const { settings, hasCompletedOnboarding } = useUserStore();

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    ttsService.init().catch(console.warn);
  }, []);

  // Apply font size class to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    const sizeMap: Record<string, string> = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      'extra-large': 'text-xl',
    };
    root.classList.add(sizeMap[settings.fontSize] || 'text-base');
  }, [settings.fontSize]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle(
      'high-contrast',
      settings.highContrast
    );
  }, [settings.highContrast]);

  return (
    <BrowserRouter>
      <Routes>
        {!hasCompletedOnboarding ? (
          <Route path="*" element={<OnboardingPage />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/quick-phrases" element={<QuickPhrasesPage />} />
            <Route path="/caregiver" element={<CaregiverPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/symbol-editor" element={<SymbolEditorPage />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
