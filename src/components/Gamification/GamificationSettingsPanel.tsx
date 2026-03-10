// ─── Gamification Settings Panel ────────────────────────────────────────────

import { useGamificationStore } from '../../stores/gamificationStore';
import type { GamificationSettings } from '../../types/gamification';

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
          checked ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
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

export default function GamificationSettingsPanel() {
  const { settings, updateSettings } = useGamificationStore();

  function update<K extends keyof GamificationSettings>(key: K, value: GamificationSettings[K]) {
    updateSettings({ [key]: value });
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Gamification Settings
      </h3>

      {/* Master toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <Toggle
          checked={settings.enabled}
          onChange={(v) => update('enabled', v)}
          label="Enable Gamification"
          description="Turn all gamification features on or off"
        />
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 divide-y divide-gray-100 dark:divide-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Notifications
        </h4>
        <Toggle
          checked={settings.showXPNotifications}
          onChange={(v) => update('showXPNotifications', v)}
          label="XP Notifications"
          description="Show popup when you earn experience points"
        />
        <Toggle
          checked={settings.showAchievementPopups}
          onChange={(v) => update('showAchievementPopups', v)}
          label="Achievement Popups"
          description="Show celebration when you unlock achievements"
        />
        <Toggle
          checked={settings.showStreakReminders}
          onChange={(v) => update('showStreakReminders', v)}
          label="Streak Reminders"
          description="Remind you to keep your streak going"
        />
      </div>

      {/* Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 divide-y divide-gray-100 dark:divide-gray-700">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Features
        </h4>
        <Toggle
          checked={settings.showLeaderboard}
          onChange={(v) => update('showLeaderboard', v)}
          label="Leaderboard"
          description="Show the competitive leaderboard"
        />
        <Toggle
          checked={settings.dailyChallengesEnabled}
          onChange={(v) => update('dailyChallengesEnabled', v)}
          label="Daily Challenges"
          description="Enable daily challenges and objectives"
        />
        <Toggle
          checked={settings.soundEffectsEnabled}
          onChange={(v) => update('soundEffectsEnabled', v)}
          label="Sound Effects"
          description="Play sounds for achievements and rewards"
        />
        <Toggle
          checked={settings.celebrationAnimations}
          onChange={(v) => update('celebrationAnimations', v)}
          label="Celebration Animations"
          description="Show particle effects and animations"
        />
      </div>

      {/* Difficulty */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Difficulty
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'easy', label: '🌱 Easy', desc: 'Relaxed goals' },
            { value: 'normal', label: '⚡ Normal', desc: 'Balanced challenge' },
            { value: 'challenging', label: '🔥 Hard', desc: 'For power users' },
          ] as const).map(opt => (
            <button
              key={opt.value}
              onClick={() => update('difficulty', opt.value)}
              className={`p-3 rounded-xl border text-center transition-colors ${
                settings.difficulty === opt.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{opt.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
