/**
 * CaregiverSettingsPanel — Caregiver-specific settings management.
 */
import { useState } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';

export default function CaregiverSettingsPanel() {
  const {
    settings,
    isPinSet,
    updateSettings,
    resetSettings,
  } = useCaregiverStore();

  const [changePinForm, setChangePinForm] = useState({ current: '', new: '', confirm: '' });
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const { changePin } = useCaregiverStore();

  const handleChangePin = () => {
    setPinError('');
    setPinSuccess(false);

    if (changePinForm.new.length < 4) {
      setPinError('New PIN must be at least 4 digits');
      return;
    }
    if (changePinForm.new !== changePinForm.confirm) {
      setPinError('New PINs do not match');
      return;
    }

    const success = changePin(changePinForm.current, changePinForm.new);
    if (success) {
      setPinSuccess(true);
      setChangePinForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPinSuccess(false), 3000);
    } else {
      setPinError('Current PIN is incorrect');
    }
  };

  const handleReset = () => {
    resetSettings();
    setResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Caregiver Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure caregiver mode behavior and security
        </p>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🔐</span> Security
        </h4>
        <div className="space-y-4">
          {/* Change PIN */}
          {isPinSet && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Change PIN</p>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="password"
                  inputMode="numeric"
                  value={changePinForm.current}
                  onChange={(e) => setChangePinForm((prev) => ({ ...prev, current: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                  placeholder="Current PIN"
                  className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-center"
                  autoComplete="off"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  value={changePinForm.new}
                  onChange={(e) => setChangePinForm((prev) => ({ ...prev, new: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                  placeholder="New PIN"
                  className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-center"
                  autoComplete="off"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  value={changePinForm.confirm}
                  onChange={(e) => setChangePinForm((prev) => ({ ...prev, confirm: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                  placeholder="Confirm"
                  className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-center"
                  autoComplete="off"
                />
              </div>
              {pinError && <p className="text-sm text-red-500">{pinError}</p>}
              {pinSuccess && <p className="text-sm text-green-500">PIN changed successfully!</p>}
              <button
                onClick={handleChangePin}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                  hover:bg-blue-600 transition-colors"
              >
                Change PIN
              </button>
            </div>
          )}

          {/* Login settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={settings.maxLoginAttempts}
                onChange={(e) => updateSettings({ maxLoginAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.lockoutDuration}
                onChange={(e) => updateSettings({ lockoutDuration: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requirePinOnEachVisit}
              onChange={(e) => updateSettings({ requirePinOnEachVisit: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Require PIN on each visit</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ask for PIN every time caregiver mode is accessed
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Session Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>⏱️</span> Session
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={settings.sessionDuration}
                onChange={(e) => updateSettings({ sessionDuration: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Idle Timeout (minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={settings.idleTimeout}
                onChange={(e) => updateSettings({ idleTimeout: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                disabled={!settings.autoLogoutOnIdle}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoLogoutOnIdle}
              onChange={(e) => updateSettings({ autoLogoutOnIdle: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-logout on idle</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically end session after period of inactivity
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🔔</span> Notifications
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Enable notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive alerts about important activity
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer ml-6">
            <input
              type="checkbox"
              checked={settings.notifyOnGoalProgress}
              onChange={(e) => updateSettings({ notifyOnGoalProgress: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
              disabled={!settings.enableNotifications}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Goal progress updates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer ml-6">
            <input
              type="checkbox"
              checked={settings.notifyOnUnusualActivity}
              onChange={(e) => updateSettings({ notifyOnUnusualActivity: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
              disabled={!settings.enableNotifications}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Unusual activity alerts</span>
          </label>
        </div>
      </div>

      {/* Communication Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>💬</span> Communication
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Symbols Per Sentence
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.maxSymbolsPerSentence}
              onChange={(e) => updateSettings({ maxSymbolsPerSentence: parseInt(e.target.value) || 20 })}
              className="w-full max-w-xs px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.restrictedMode}
              onChange={(e) => updateSettings({ restrictedMode: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Restricted mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable restrictions on symbol and category access
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireSupervisedMode}
              onChange={(e) => updateSettings({ requireSupervisedMode: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Supervised mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Require caregiver presence for certain actions
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Activity Log Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📋</span> Activity Log
        </h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showActivityLog}
            onChange={(e) => updateSettings({ showActivityLog: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Show activity log</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Display activity logging in the dashboard
            </p>
          </div>
        </label>
      </div>

      {/* Reset */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-red-200 dark:border-red-800">
        <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">Reset Settings</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This will reset all caregiver settings to their defaults. This cannot be undone.
        </p>
        {resetConfirm ? (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              Yes, Reset Settings
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400
              rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Reset to Defaults
          </button>
        )}
      </div>
    </div>
  );
}
