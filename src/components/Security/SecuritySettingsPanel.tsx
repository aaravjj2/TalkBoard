import { useSecurityStore } from '@/stores/securityStore';

export default function SecuritySettingsPanel() {
  const { settings, updateSettings } = useSecurityStore();

  return (
    <div className="space-y-6">
      {/* Rate Limiting */}
      <Section title="Rate Limiting" icon="🚦">
        <NumberInput
          label="Max Login Attempts"
          description="Maximum failed attempts before lockout"
          value={settings.rateLimiting.maxLoginAttempts}
          min={3}
          max={20}
          onChange={(v) =>
            updateSettings({
              rateLimiting: { ...settings.rateLimiting, maxLoginAttempts: v },
            })
          }
        />
        <NumberInput
          label="Lockout Duration (minutes)"
          description="Duration of lockout after max attempts"
          value={settings.rateLimiting.lockoutDurationMinutes}
          min={5}
          max={120}
          onChange={(v) =>
            updateSettings({
              rateLimiting: { ...settings.rateLimiting, lockoutDurationMinutes: v },
            })
          }
        />
        <NumberInput
          label="Attempt Window (minutes)"
          description="Time window for counting login attempts"
          value={settings.rateLimiting.windowMinutes}
          min={5}
          max={120}
          onChange={(v) =>
            updateSettings({
              rateLimiting: { ...settings.rateLimiting, windowMinutes: v },
            })
          }
        />
      </Section>

      {/* Session Security */}
      <Section title="Session Security" icon="⏱️">
        <NumberInput
          label="Session Timeout (minutes)"
          description="Auto-lock after this duration of inactivity"
          value={settings.sessionSecurity.sessionTimeoutMinutes}
          min={5}
          max={480}
          onChange={(v) =>
            updateSettings({
              sessionSecurity: {
                ...settings.sessionSecurity,
                sessionTimeoutMinutes: v,
              },
            })
          }
        />
        <Toggle
          label="Re-auth for Sensitive Actions"
          description="Require PIN re-entry for settings changes and data deletion"
          checked={settings.sessionSecurity.requireReauthOnSensitive}
          onChange={(v) =>
            updateSettings({
              sessionSecurity: {
                ...settings.sessionSecurity,
                requireReauthOnSensitive: v,
              },
            })
          }
        />
        <NumberInput
          label="Max Concurrent Sessions"
          description="Maximum number of active caregiver sessions"
          value={settings.sessionSecurity.maxConcurrentSessions}
          min={1}
          max={5}
          onChange={(v) =>
            updateSettings({
              sessionSecurity: {
                ...settings.sessionSecurity,
                maxConcurrentSessions: v,
              },
            })
          }
        />
      </Section>

      {/* Audit Logging */}
      <Section title="Audit Logging" icon="📝">
        <Toggle
          label="Enable Audit Log"
          description="Record security events and system activities"
          checked={settings.enableAuditLog}
          onChange={(v) => updateSettings({ enableAuditLog: v })}
        />
        <NumberInput
          label="Retention Period (days)"
          description="How long to keep audit log entries"
          value={settings.auditLogRetentionDays}
          min={7}
          max={365}
          onChange={(v) => updateSettings({ auditLogRetentionDays: v })}
          disabled={!settings.enableAuditLog}
        />
        <NumberInput
          label="Max Log Entries"
          description="Maximum number of audit log entries to keep"
          value={settings.maxAuditLogEntries}
          min={100}
          max={10000}
          step={100}
          onChange={(v) => updateSettings({ maxAuditLogEntries: v })}
          disabled={!settings.enableAuditLog}
        />
      </Section>

      {/* Content Security */}
      <Section title="Content Security" icon="🔒">
        <Toggle
          label="Content Security Policy"
          description="Enable browser CSP headers (prevents inline scripts)"
          checked={settings.cspEnabled}
          onChange={(v) => updateSettings({ cspEnabled: v })}
        />
        <Toggle
          label="Sanitize All Inputs"
          description="Automatically sanitize all user-entered text"
          checked={settings.sanitizeAllInputs}
          onChange={(v) => updateSettings({ sanitizeAllInputs: v })}
        />
        <Toggle
          label="Strict Input Validation"
          description="Enforce strict type-based validation on all inputs"
          checked={settings.inputValidationStrict}
          onChange={(v) => updateSettings({ inputValidationStrict: v })}
        />
      </Section>

      {/* Data Retention */}
      <Section title="Data Retention" icon="📅">
        <NumberInput
          label="Data Retention (days)"
          description="Maximum age for stored data before deletion"
          value={settings.privacySettings.dataRetentionDays}
          min={30}
          max={3650}
          step={30}
          onChange={(v) =>
            updateSettings({
              privacySettings: {
                ...settings.privacySettings,
                dataRetentionDays: v,
              },
            })
          }
        />
      </Section>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

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
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span role="img" aria-label={title}>
          {icon}
        </span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

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
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
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

// ─── Number Input ────────────────────────────────────────────────────────────

function NumberInput({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
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
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 px-3 py-1.5 border rounded-lg text-sm text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
      />
    </div>
  );
}
