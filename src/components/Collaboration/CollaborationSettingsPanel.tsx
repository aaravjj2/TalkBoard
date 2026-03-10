// ─── Collaboration Settings Panel ───────────────────────────────────────────

import { useCollaborationStore } from '../../stores/collaborationStore';
import type { CollaborationSettings, BoardVisibility } from '../../types/collaboration';

const visibilityOptions: { value: BoardVisibility; label: string; desc: string }[] = [
  { value: 'private', label: '🔒 Private', desc: 'Only you can access' },
  { value: 'team', label: '👥 Team', desc: 'Team members only' },
  { value: 'public', label: '🌐 Public', desc: 'Anyone with link' },
  { value: 'unlisted', label: '🔗 Unlisted', desc: 'Hidden from search' },
];

function Toggle({ checked, onChange, label, description }: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}

export default function CollaborationSettingsPanel() {
  const { settings, updateSettings } = useCollaborationStore();

  function update<K extends keyof CollaborationSettings>(key: K, value: CollaborationSettings[K]) {
    updateSettings({ [key]: value });
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Collaboration Settings
      </h3>

      {/* Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Default Visibility
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {visibilityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => update('defaultVisibility', opt.value)}
              className={`p-3 rounded-xl border text-left transition-colors ${
                settings.defaultVisibility === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{opt.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sharing & Access */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 divide-y divide-gray-100 dark:divide-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Sharing & Access
        </h4>
        <Toggle
          checked={settings.allowSharing}
          onChange={(v) => update('allowSharing', v)}
          label="Allow Sharing"
          description="Let others share boards with external users"
        />
        <Toggle
          checked={settings.requireApproval}
          onChange={(v) => update('requireApproval', v)}
          label="Require Approval"
          description="New members need approval before joining"
        />
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Max Team Size</p>
              <p className="text-xs text-gray-500">Maximum number of team members</p>
            </div>
            <input
              type="number"
              value={settings.maxTeamSize}
              onChange={(e) => update('maxTeamSize', Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={100}
              className="w-20 px-3 py-1.5 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Communication */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 divide-y divide-gray-100 dark:divide-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Communication
        </h4>
        <Toggle
          checked={settings.allowComments}
          onChange={(v) => update('allowComments', v)}
          label="Allow Comments"
          description="Enable commenting on shared boards"
        />
        <Toggle
          checked={settings.allowFeedback}
          onChange={(v) => update('allowFeedback', v)}
          label="Allow Feedback"
          description="Enable feedback collection from collaborators"
        />
        <Toggle
          checked={settings.allowMessages}
          onChange={(v) => update('allowMessages', v)}
          label="Team Messaging"
          description="Enable real-time messaging between team members"
        />
      </div>

      {/* Notifications & Sync */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 divide-y divide-gray-100 dark:divide-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Notifications & Sync
        </h4>
        <Toggle
          checked={settings.notifyOnChanges}
          onChange={(v) => update('notifyOnChanges', v)}
          label="Change Notifications"
          description="Get notified when boards are modified"
        />
        <Toggle
          checked={settings.notifyOnComments}
          onChange={(v) => update('notifyOnComments', v)}
          label="Comment Notifications"
          description="Get notified on new comments"
        />
        <Toggle
          checked={settings.notifyOnJoin}
          onChange={(v) => update('notifyOnJoin', v)}
          label="Join Notifications"
          description="Get notified when someone joins your team"
        />
        <Toggle
          checked={settings.autoSync}
          onChange={(v) => update('autoSync', v)}
          label="Auto Sync"
          description="Automatically sync boards across devices"
        />
      </div>
    </div>
  );
}
