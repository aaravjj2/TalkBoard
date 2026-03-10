/**
 * CaregiverDashboardPage — Full caregiver dashboard with tabbed navigation,
 * PIN auth, setup wizard, and comprehensive management tools.
 */
import { useState, useEffect, useCallback } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';
import {
  PinDialog,
  PinSetup,
  CaregiverOverview,
  GoalManager,
  RestrictionManager,
  NoteManager,
  ActivityLogViewer,
  UsageReportViewer,
  ProfileManager,
  CaregiverSettingsPanel,
} from '@/components/Caregiver';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'restrictions', label: 'Restrictions', icon: '🚫' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'activity', label: 'Activity', icon: '📋' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'profiles', label: 'Profiles', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function CaregiverDashboardPage() {
  const {
    isPinSet,
    isAuthenticated,
    caregiverMode,
    showPinDialog,
    showSetupWizard,
    dashboardTab,
    currentSession,
    activeProfile,
    isLoading,
    error,
    initialize,
    logout,
    extendSession,
    checkSession,
    setDashboardTab,
    setShowPinDialog,
    setShowSetupWizard,
    clearError,
  } = useCaregiverStore();

  const [sessionWarning, setSessionWarning] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Periodic session check
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkSession();

      // Warn when session is close to expiring (5 min)
      if (currentSession) {
        const remaining = new Date(currentSession.expiresAt).getTime() - Date.now();
        setSessionWarning(remaining < 5 * 60 * 1000 && remaining > 0);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [isAuthenticated, currentSession, checkSession]);

  const handleEnterCaregiverMode = useCallback(() => {
    if (!isPinSet) {
      setShowSetupWizard(true);
    } else {
      setShowPinDialog(true);
    }
  }, [isPinSet, setShowPinDialog, setShowSetupWizard]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleExtendSession = useCallback(() => {
    extendSession(30);
    setSessionWarning(false);
  }, [extendSession]);

  // ─── Not Authenticated: Show Entry Screen ─────────────────────────

  if (!caregiverMode || !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6
            border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600
              rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">🔒</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Caregiver Mode
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                Access advanced settings, usage analytics, communication goals,
                and symbol management tools.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleEnterCaregiverMode}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600
                  text-white rounded-xl font-semibold shadow-md
                  hover:from-blue-600 hover:to-purple-700 transition-all
                  active:scale-[0.98]"
                data-testid="btn-enter-caregiver"
              >
                {isPinSet ? '🔓 Unlock Caregiver Mode' : '🚀 Set Up Caregiver Mode'}
              </button>

              {isPinSet && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  PIN required to access caregiver tools
                </p>
              )}
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {[
                { icon: '🎯', label: 'Track Goals' },
                { icon: '📊', label: 'Usage Reports' },
                { icon: '📝', label: 'Take Notes' },
                { icon: '👥', label: 'Manage Profiles' },
              ].map((feature) => (
                <div key={feature.label} className="text-center py-2">
                  <span className="text-xl">{feature.icon}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PIN Dialog */}
        {showPinDialog && (
          <PinDialog />
        )}

        {/* Setup Wizard */}
        {showSetupWizard && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full
              max-h-[90vh] overflow-y-auto">
              <PinSetup />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Authenticated: Show Dashboard ─────────────────────────────────

  const currentTab = dashboardTab as TabId;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4" data-testid="caregiver-dashboard">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
        dark:border-gray-700 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600
              rounded-full flex items-center justify-center">
              <span className="text-xl">🔓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Caregiver Dashboard
              </h1>
              {activeProfile && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeProfile.name} · {activeProfile.role}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentSession && (
              <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                Session: {formatSessionTime(currentSession.expiresAt)}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400
                border border-red-200 dark:border-red-800 rounded-lg
                hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              data-testid="btn-exit-caregiver"
            >
              🔒 Lock
            </button>
          </div>
        </div>

        {/* Session warning */}
        {sessionWarning && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200
            dark:border-amber-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ Your session will expire soon.
            </p>
            <button
              onClick={handleExtendSession}
              className="px-3 py-1 text-sm bg-amber-500 text-white rounded-lg
                hover:bg-amber-600 transition-colors"
            >
              Extend 30 min
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200
            dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-600 text-lg">×</button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
        dark:border-gray-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDashboardTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors min-w-0
                ${currentTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              data-testid={`tab-${tab.id}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Tab Content */}
      {!isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200
          dark:border-gray-700 p-4 sm:p-6">
          {currentTab === 'overview' && <CaregiverOverview />}
          {currentTab === 'goals' && <GoalManager />}
          {currentTab === 'restrictions' && <RestrictionManager />}
          {currentTab === 'notes' && <NoteManager />}
          {currentTab === 'activity' && <ActivityLogViewer />}
          {currentTab === 'reports' && <UsageReportViewer />}
          {currentTab === 'profiles' && <ProfileManager />}
          {currentTab === 'settings' && <CaregiverSettingsPanel />}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionTime(expiresAt: string): string {
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) return 'Expired';
  const minutes = Math.floor(remaining / 60_000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m left`;
}
