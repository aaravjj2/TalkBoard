import { useMemo } from 'react';
import { useSecurityStore } from '@/stores/securityStore';
import type { DataCategory } from '@/types/security';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const CATEGORY_ICONS: Record<DataCategory, string> = {
  usage_stats: '📊',
  sentence_history: '💬',
  symbol_preferences: '⭐',
  learning_data: '🧠',
  session_data: '📋',
  profile_data: '👤',
  caregiver_data: '🏥',
  analytics_data: '📈',
};

export default function PrivacyDashboard() {
  const {
    settings,
    dataInventory,
    totalStorageUsed,
    updatePrivacySettings,
    refreshDataInventory,
    deleteDataCategory,
    purgeOldData,
  } = useSecurityStore();

  const { privacySettings } = settings;

  // Compute categories with data
  const categoriesWithData = useMemo(
    () => dataInventory.filter((item) => item.itemCount > 0 || item.storageSize > 0),
    [dataInventory]
  );

  const handlePurge = () => {
    const result = purgeOldData();
    if (result.purgedItems > 0) {
      refreshDataInventory();
    }
  };

  const handleGiveConsent = () => {
    updatePrivacySettings({
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
    });
  };

  const handleRevokeConsent = () => {
    updatePrivacySettings({
      consentGiven: false,
      consentTimestamp: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Consent Banner */}
      {!privacySettings.consentGiven && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Data Collection Consent
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            TalkBoard collects usage data locally on your device to improve predictions
            and learning. No data is sent to external servers. You can control exactly
            what data is collected below.
          </p>
          <button
            onClick={handleGiveConsent}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            I Understand &amp; Consent
          </button>
        </div>
      )}

      {/* Storage Overview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Storage Overview
          </h3>
          <button
            onClick={() => refreshDataInventory()}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Refresh
          </button>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {formatBytes(totalStorageUsed)}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total storage used by TalkBoard data
        </p>

        {/* Storage breakdown bar */}
        {totalStorageUsed > 0 && (
          <div className="mt-3 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {dataInventory.map((item, i) => {
              const pct = (item.storageSize / totalStorageUsed) * 100;
              if (pct < 0.5) return null;
              const colors = [
                'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
                'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
              ];
              return (
                <div
                  key={item.category}
                  className={`${colors[i % colors.length]} h-full`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${formatBytes(item.storageSize)}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Data Collection Controls */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Data Collection
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Enable Data Collection"
            description="Master switch for all data collection"
            checked={privacySettings.enableDataCollection}
            onChange={(v) => updatePrivacySettings({ enableDataCollection: v })}
          />
          <Toggle
            label="Collect Usage Statistics"
            description="Symbol and category usage frequency"
            checked={privacySettings.collectUsageStats}
            onChange={(v) => updatePrivacySettings({ collectUsageStats: v })}
            disabled={!privacySettings.enableDataCollection}
          />
          <Toggle
            label="Collect Sentence History"
            description="Previously built sentences for prediction"
            checked={privacySettings.collectSentenceHistory}
            onChange={(v) => updatePrivacySettings({ collectSentenceHistory: v })}
            disabled={!privacySettings.enableDataCollection}
          />
          <Toggle
            label="Collect Symbol Preferences"
            description="Custom symbol positions and layouts"
            checked={privacySettings.collectSymbolPreferences}
            onChange={(v) => updatePrivacySettings({ collectSymbolPreferences: v })}
            disabled={!privacySettings.enableDataCollection}
          />
          <Toggle
            label="Collect Learning Data"
            description="Adaptive learning model and patterns"
            checked={privacySettings.collectLearningData}
            onChange={(v) => updatePrivacySettings({ collectLearningData: v })}
            disabled={!privacySettings.enableDataCollection}
          />
        </div>
      </div>

      {/* Export & Privacy */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Privacy Controls
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Anonymize Exports"
            description="Remove identifying info when exporting data"
            checked={privacySettings.anonymizeExports}
            onChange={(v) => updatePrivacySettings({ anonymizeExports: v })}
          />
          <Toggle
            label="Auto-Delete Old Data"
            description={`Automatically delete data older than ${privacySettings.deleteOlderThanDays} days`}
            checked={privacySettings.autoDeleteOnPeriod}
            onChange={(v) => updatePrivacySettings({ autoDeleteOnPeriod: v })}
          />
          {privacySettings.autoDeleteOnPeriod && (
            <div className="ml-6">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Delete data older than (days)
              </label>
              <input
                type="number"
                min={7}
                max={365}
                value={privacySettings.deleteOlderThanDays}
                onChange={(e) =>
                  updatePrivacySettings({ deleteOlderThanDays: Number(e.target.value) })
                }
                className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePurge}
              disabled={!privacySettings.autoDeleteOnPeriod}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm"
            >
              Run Purge Now
            </button>
            {privacySettings.lastDataPurge && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last purge: {new Date(privacySettings.lastDataPurge).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data Inventory */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Data Inventory
        </h3>
        <div className="space-y-2">
          {dataInventory.map((item) => (
            <DataInventoryRow
              key={item.category}
              item={item}
              onDelete={() => deleteDataCategory(item.category)}
            />
          ))}
        </div>
      </div>

      {/* Consent Management */}
      {privacySettings.consentGiven && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Consent given on{' '}
                {privacySettings.consentTimestamp
                  ? new Date(privacySettings.consentTimestamp).toLocaleString()
                  : 'unknown'}
              </p>
            </div>
            <button
              onClick={handleRevokeConsent}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200"
            >
              Revoke Consent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toggle Component ────────────────────────────────────────────────────────

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked
            ? 'bg-blue-600'
            : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

// ─── Data Inventory Row ──────────────────────────────────────────────────────

function DataInventoryRow({
  item,
  onDelete,
}: {
  item: {
    category: DataCategory;
    label: string;
    description: string;
    itemCount: number;
    storageSize: number;
    isCollectionEnabled: boolean;
  };
  onDelete: () => void;
}) {
  const icon = CATEGORY_ICONS[item.category] || '📦';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className="text-2xl" role="img" aria-label={item.label}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {item.label}
          </p>
          <span
            className={`w-2 h-2 rounded-full ${
              item.isCollectionEnabled ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={item.isCollectionEnabled ? 'Collection active' : 'Collection disabled'}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {formatBytes(item.storageSize)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {item.itemCount} items
        </p>
      </div>
      <button
        onClick={onDelete}
        disabled={item.storageSize === 0}
        className="px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded hover:bg-red-200 disabled:opacity-30"
      >
        Delete
      </button>
    </div>
  );
}
