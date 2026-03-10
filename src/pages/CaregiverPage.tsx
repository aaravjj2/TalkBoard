import { useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useSettings } from '@/hooks/useSettings';
import { useUIStore } from '@/stores/uiStore';

export default function CaregiverPage() {
  const { isCaregiverMode, setCaregiverMode, validateCaregiverPin } =
    useUserStore();
  const { settings } = useSettings();
  const { addToast } = useUIStore();
  const [pinInput, setPinInput] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);

  const handleEnterCaregiver = useCallback(() => {
    if (!settings.caregiverPin) {
      setCaregiverMode(true);
      addToast('Caregiver mode activated', 'success');
      return;
    }
    setShowPinEntry(true);
  }, [settings.caregiverPin, setCaregiverMode, addToast]);

  const handlePinSubmit = useCallback(() => {
    if (validateCaregiverPin(pinInput)) {
      setCaregiverMode(true);
      setPinInput('');
      setShowPinEntry(false);
      addToast('Caregiver mode activated', 'success');
    } else {
      addToast('Incorrect PIN', 'error');
      setPinInput('');
    }
  }, [pinInput, validateCaregiverPin, setCaregiverMode, addToast]);

  const handleExitCaregiver = useCallback(() => {
    setCaregiverMode(false);
    addToast('Caregiver mode deactivated', 'info');
  }, [setCaregiverMode, addToast]);

  if (!isCaregiverMode && showPinEntry) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]" data-testid="caregiver-pin-entry">
        <div className="card p-8 text-center space-y-4 w-full">
          <span className="text-5xl">🔒</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Enter Caregiver PIN
          </h1>
          <input
            type="password"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            placeholder="Enter PIN"
            className="input-field text-center text-2xl tracking-[0.5em] w-full"
            autoFocus
            data-testid="pin-input"
          />
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setShowPinEntry(false);
                setPinInput('');
              }}
              className="btn-secondary"
              data-testid="pin-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handlePinSubmit}
              disabled={!pinInput}
              className="btn-primary disabled:opacity-50"
              data-testid="pin-submit"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isCaregiverMode) {
    return (
      <div className="max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]" data-testid="caregiver-locked">
        <div className="card p-8 text-center space-y-4">
          <span className="text-5xl">🔒</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Caregiver Mode
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Caregiver mode provides access to advanced settings, usage
            statistics, and symbol customization.
          </p>
          <button
            onClick={handleEnterCaregiver}
            className="btn-primary"
            data-testid="btn-enter-caregiver"
          >
            🔓 Enter Caregiver Mode
          </button>
        </div>
      </div>
    );
  }

  // Caregiver mode is active
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="caregiver-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🔓</span> Caregiver Dashboard
        </h1>
        <button
          onClick={handleExitCaregiver}
          className="btn-secondary text-sm"
          data-testid="btn-exit-caregiver"
        >
          🔒 Lock
        </button>
      </div>

      {/* Usage Stats */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          📊 Usage Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Sentences Spoken" value="0" icon="💬" />
          <StatCard label="Symbols Used" value="0" icon="🧩" />
          <StatCard label="Quick Phrases" value="0" icon="⚡" />
          <StatCard label="Days Active" value="1" icon="📅" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionButton
            icon="📝"
            label="Edit Symbols"
            description="Customize symbol labels and categories"
            testId="action-edit-symbols"
          />
          <ActionButton
            icon="📊"
            label="View Reports"
            description="Detailed usage analytics"
            testId="action-view-reports"
          />
          <ActionButton
            icon="👤"
            label="Manage Profiles"
            description="Create or switch user profiles"
            testId="action-manage-profiles"
          />
          <ActionButton
            icon="💾"
            label="Backup & Restore"
            description="Export or import user data"
            testId="action-backup"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  testId,
}: {
  icon: string;
  label: string;
  description: string;
  testId: string;
}) {
  return (
    <button
      className="card card-hover p-3 flex items-center gap-3 text-left w-full"
      data-testid={testId}
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </button>
  );
}
