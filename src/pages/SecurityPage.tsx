import { useEffect, useState } from 'react';
import { useSecurityStore } from '@/stores/securityStore';
import {
  SecurityScoreCard,
  ContentFilterPanel,
  AuditLogViewer,
  PrivacyDashboard,
  EncryptionSettings,
  InputValidationDemo,
  SecuritySettingsPanel,
} from '@/components/Security';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '🛡️' },
  { id: 'filters', label: 'Content Filters', icon: '🔍' },
  { id: 'validation', label: 'Input Validation', icon: '✅' },
  { id: 'audit', label: 'Audit Log', icon: '📝' },
  { id: 'privacy', label: 'Privacy', icon: '👁️' },
  { id: 'encryption', label: 'Encryption', icon: '🔐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SecurityPage() {
  const { activeTab, setActiveTab, isInitialized, initialize, error, clearError } =
    useSecurityStore();
  const [currentTab, setCurrentTab] = useState<TabId>(
    (activeTab as TabId) || 'overview'
  );

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleTabChange = (tab: TabId) => {
    setCurrentTab(tab);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black p-6 text-white">
        <h1 className="text-2xl font-bold">Security &amp; Privacy</h1>
        <p className="text-gray-300 text-sm mt-1">
          Manage content filtering, data privacy, encryption, and security settings
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span role="img" aria-label={tab.label}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-5xl">
        {currentTab === 'overview' && <SecurityScoreCard />}
        {currentTab === 'filters' && <ContentFilterPanel />}
        {currentTab === 'validation' && <InputValidationDemo />}
        {currentTab === 'audit' && <AuditLogViewer />}
        {currentTab === 'privacy' && <PrivacyDashboard />}
        {currentTab === 'encryption' && <EncryptionSettings />}
        {currentTab === 'settings' && <SecuritySettingsPanel />}
      </div>
    </div>
  );
}
