import React from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';
import { SESSION_TYPE_LABELS, type SessionType, type CommunicationLevel } from '../../types/communicationPartner';

export const PartnerSettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useCommunicationPartnerStore();

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Partner Settings</h3>

      {/* Session Defaults */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Session Defaults</h4>
        <div className="space-y-2">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Default Session Type</label>
            <select
              value={settings.defaultSessionType}
              onChange={e => updateSettings({ defaultSessionType: e.target.value as SessionType })}
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {(Object.keys(SESSION_TYPE_LABELS) as SessionType[]).map(t => (
                <option key={t} value={t}>{SESSION_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Default Duration (minutes)</label>
            <input
              type="number"
              value={settings.defaultSessionDuration}
              onChange={e => updateSettings({ defaultSessionDuration: Number(e.target.value) })}
              min={5} max={120}
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Communication Level */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Communication Level</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['emergent', 'emerging', 'developing', 'proficient'] as CommunicationLevel[]).map(level => (
            <button
              key={level}
              onClick={() => updateSettings({ communicationLevel: level })}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                settings.communicationLevel === level
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Features</h4>
        <Toggle label="Auto-log interactions" value={settings.autoLogInteractions} onChange={v => updateSettings({ autoLogInteractions: v })} />
        <Toggle label="Show partner tips" value={settings.showPartnerTips} onChange={v => updateSettings({ showPartnerTips: v })} />
        <Toggle label="Enable modeling queue" value={settings.enableModelingQueue} onChange={v => updateSettings({ enableModelingQueue: v })} />
        <Toggle label="Prompt hierarchy enabled" value={settings.promptHierarchyEnabled} onChange={v => updateSettings({ promptHierarchyEnabled: v })} />
      </div>

      {/* Reminders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-3">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Reminders</h4>
        <Toggle label="Session reminders" value={settings.sessionReminders} onChange={v => updateSettings({ sessionReminders: v })} />
        {settings.sessionReminders && (
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Reminder Frequency</label>
            <select
              value={settings.reminderFrequency}
              onChange={e => updateSettings({ reminderFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
              className="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
