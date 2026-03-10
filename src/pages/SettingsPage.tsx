import { useSettings } from '@/hooks/useSettings';
import { useTTS } from '@/hooks/useTTS';
import { useUIStore } from '@/stores/uiStore';
import { storageService } from '@/services/storageService';
import type { UserSettings } from '@/types';

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetSettings,
    toggleDarkMode,
    toggleHighContrast,
  } = useSettings();

  const { getEnglishVoices, speak } = useTTS();
  const { addToast, openModal } = useUIStore();

  const voices = getEnglishVoices();

  const handleExport = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talkboard-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported successfully', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        storageService.importData(text);
        addToast('Data imported successfully. Refresh to apply.', 'success');
      } catch {
        addToast('Invalid backup file', 'error');
      }
    };
    input.click();
  };

  const handleReset = () => {
    openModal({
      title: 'Reset Settings',
      message:
        'Are you sure you want to reset all settings to their defaults? This cannot be undone.',
      confirmText: 'Reset',
      variant: 'danger',
      onConfirm: () => {
        resetSettings();
        addToast('Settings reset to defaults', 'success');
      },
    });
  };

  const handleClearData = () => {
    openModal({
      title: 'Clear All Data',
      message:
        'This will permanently delete all your data including history, quick phrases, and settings. This cannot be undone.',
      confirmText: 'Delete Everything',
      variant: 'danger',
      onConfirm: () => {
        storageService.clearAll();
        addToast('All data cleared. Refresh to apply.', 'success');
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="settings-page">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      {/* Appearance */}
      <Section title="Appearance" icon="🎨">
        <SettingRow label="Dark Mode" description="Switch between light and dark themes">
          <Toggle
            checked={settings.theme === 'dark'}
            onChange={toggleDarkMode}
            testId="toggle-dark-mode"
          />
        </SettingRow>

        <SettingRow label="High Contrast" description="Increase contrast for better visibility">
          <Toggle
            checked={settings.highContrast}
            onChange={toggleHighContrast}
            testId="toggle-high-contrast"
          />
        </SettingRow>

        <SettingRow label="Font Size" description="Adjust text size across the app">
          <select
            value={settings.fontSize}
            onChange={(e) =>
              updateSettings({
                fontSize: e.target.value as UserSettings['fontSize'],
              })
            }
            className="input-field w-32"
            data-testid="select-font-size"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </SettingRow>

        <SettingRow label="Grid Size" description="Size of symbol tiles">
          <select
            value={settings.gridSize}
            onChange={(e) =>
              updateSettings({
                gridSize: e.target.value as UserSettings['gridSize'],
              })
            }
            className="input-field w-32"
            data-testid="select-grid-size"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </SettingRow>

        <SettingRow label="Animations" description="Enable or disable UI animations">
          <Toggle
            checked={settings.animationsEnabled}
            onChange={() =>
              updateSettings({
                animationsEnabled: !settings.animationsEnabled,
              })
            }
            testId="toggle-animations"
          />
        </SettingRow>
      </Section>

      {/* Voice */}
      <Section title="Voice & Speech" icon="🔊">
        <SettingRow label="Voice" description="Select the text-to-speech voice">
          <select
            value={settings.selectedVoiceURI || ''}
            onChange={(e) =>
              updateSettings({ selectedVoiceURI: e.target.value || null })
            }
            className="input-field w-48"
            data-testid="select-voice"
          >
            <option value="">Default</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label="Speech Rate" description={`Speed: ${settings.voiceRate}x`}>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.voiceRate}
            onChange={(e) =>
              updateSettings({ voiceRate: parseFloat(e.target.value) })
            }
            className="w-32"
            data-testid="range-voice-rate"
          />
        </SettingRow>

        <SettingRow label="Pitch" description={`Pitch: ${settings.voicePitch}`}>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.voicePitch}
            onChange={(e) =>
              updateSettings({ voicePitch: parseFloat(e.target.value) })
            }
            className="w-32"
            data-testid="range-voice-pitch"
          />
        </SettingRow>

        <SettingRow label="Volume" description={`Volume: ${Math.round(settings.voiceVolume * 100)}%`}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.voiceVolume}
            onChange={(e) =>
              updateSettings({ voiceVolume: parseFloat(e.target.value) })
            }
            className="w-32"
            data-testid="range-voice-volume"
          />
        </SettingRow>

        <SettingRow label="Test Voice" description="Hear a sample with current settings">
          <button
            onClick={() => speak('Hello! This is TalkBoard speaking.')}
            className="btn-secondary text-sm"
            data-testid="btn-test-voice"
          >
            🔊 Test
          </button>
        </SettingRow>
      </Section>

      {/* Behavior */}
      <Section title="Behavior" icon="⚡">
        <SettingRow label="Auto-Speak" description="Automatically speak when sentence is generated">
          <Toggle
            checked={settings.autoSpeak}
            onChange={() =>
              updateSettings({ autoSpeak: !settings.autoSpeak })
            }
            testId="toggle-auto-speak"
          />
        </SettingRow>

        <SettingRow label="Auto-Save Quick Phrases" description="Automatically save spoken sentences">
          <Toggle
            checked={settings.autoSaveQuickPhrases}
            onChange={() =>
              updateSettings({
                autoSaveQuickPhrases: !settings.autoSaveQuickPhrases,
              })
            }
            testId="toggle-auto-save"
          />
        </SettingRow>

        <SettingRow label="Sound Effects" description="Play sounds on tap and actions">
          <Toggle
            checked={settings.soundEffects}
            onChange={() =>
              updateSettings({ soundEffects: !settings.soundEffects })
            }
            testId="toggle-sounds"
          />
        </SettingRow>

        <SettingRow label="Haptic Feedback" description="Vibrate on symbol selection (mobile)">
          <Toggle
            checked={settings.hapticFeedback}
            onChange={() =>
              updateSettings({ hapticFeedback: !settings.hapticFeedback })
            }
            testId="toggle-haptic"
          />
        </SettingRow>
      </Section>

      {/* Caregiver */}
      <Section title="Caregiver" icon="🔒">
        <SettingRow label="Caregiver PIN" description="Set a PIN to protect caregiver settings">
          <input
            type="password"
            maxLength={6}
            value={settings.caregiverPin || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              updateSettings({ caregiverPin: val || null });
            }}
            placeholder="Enter PIN"
            className="input-field w-32 text-center tracking-widest"
            data-testid="input-caregiver-pin"
          />
        </SettingRow>
      </Section>

      {/* Data */}
      <Section title="Data Management" icon="💾">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary text-sm"
            data-testid="btn-export"
          >
            📤 Export Data
          </button>
          <button
            onClick={handleImport}
            className="btn-secondary text-sm"
            data-testid="btn-import"
          >
            📥 Import Data
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary text-sm text-orange-600 border-orange-300 hover:bg-orange-50"
            data-testid="btn-reset"
          >
            🔄 Reset Settings
          </button>
          <button
            onClick={handleClearData}
            className="btn-danger text-sm"
            data-testid="btn-clear-data"
          >
            🗑️ Clear All Data
          </button>
        </div>
      </Section>
    </div>
  );
}

// --- Sub-components ---

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4 space-y-4" data-testid={`section-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  testId,
}: {
  checked: boolean;
  onChange: () => void;
  testId: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 focus:outline-none focus:ring-2
        focus:ring-primary-400 focus:ring-offset-2
        ${checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}
      `}
      data-testid={testId}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
