/**
 * AdaptiveLearningSettings — UI for configuring adaptive learning.
 */
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';
import type { LearningAlgorithm, AdaptationSpeed } from '@/types/adaptiveLearning';

const ALGORITHMS: { value: LearningAlgorithm; label: string; desc: string }[] = [
  { value: 'frequency', label: 'Frequency', desc: 'Predicts most-used symbols' },
  { value: 'recency', label: 'Recency', desc: 'Favors recently-used symbols' },
  { value: 'context', label: 'Context', desc: 'Uses time/day patterns' },
  { value: 'sequential', label: 'Sequential', desc: 'Learns symbol sequences' },
  { value: 'bayesian', label: 'Bayesian', desc: 'Probabilistic prediction' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Combines all methods (recommended)' },
];

const SPEEDS: { value: AdaptationSpeed; label: string; desc: string }[] = [
  { value: 'slow', label: 'Slow', desc: 'Changes very gradually' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced adaptation' },
  { value: 'fast', label: 'Fast', desc: 'Quick to adapt' },
  { value: 'instant', label: 'Instant', desc: 'Immediate response' },
];

export default function AdaptiveLearningSettingsPanel() {
  const { settings, updateSettings, resetSettings, toggleEnabled, clearAllData } =
    useAdaptiveLearningStore();

  return (
    <div className="space-y-6" data-testid="adaptive-settings">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Adaptive Learning Settings
        </h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer
              ${settings.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            onClick={toggleEnabled}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${settings.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </div>
        </label>
      </div>

      {/* Algorithm Selection */}
      <Section title="Prediction Algorithm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALGORITHMS.map((alg) => (
            <button
              key={alg.value}
              onClick={() => updateSettings({ algorithm: alg.value })}
              className={`p-3 rounded-lg border text-left transition-colors
                ${settings.algorithm === alg.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{alg.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{alg.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Adaptation Speed */}
      <Section title="Adaptation Speed">
        <div className="grid grid-cols-4 gap-2">
          {SPEEDS.map((speed) => (
            <button
              key={speed.value}
              onClick={() => updateSettings({ adaptationSpeed: speed.value })}
              className={`p-2 rounded-lg border text-center transition-colors
                ${settings.adaptationSpeed === speed.value
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{speed.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {speed.desc}
              </p>
            </button>
          ))}
        </div>
      </Section>

      {/* Weight Sliders */}
      <Section title="Prediction Weights">
        <div className="space-y-4">
          <WeightSlider
            label="Frequency"
            value={settings.frequencyWeight}
            onChange={(v) => updateSettings({ frequencyWeight: v })}
            description="Weight of how often symbols are used"
          />
          <WeightSlider
            label="Recency"
            value={settings.recencyWeight}
            onChange={(v) => updateSettings({ recencyWeight: v })}
            description="Weight of how recently symbols were used"
          />
          <WeightSlider
            label="Context"
            value={settings.contextWeight}
            onChange={(v) => updateSettings({ contextWeight: v })}
            description="Weight of time/day contextual patterns"
          />
        </div>
      </Section>

      {/* Feature Toggles */}
      <Section title="Features">
        <div className="space-y-3">
          <Toggle
            label="Sequential Prediction"
            description="Learn and predict symbol sequences"
            checked={settings.enableSequentialPrediction}
            onChange={(v) => updateSettings({ enableSequentialPrediction: v })}
          />
          <Toggle
            label="Time Awareness"
            description="Adjust predictions based on time of day"
            checked={settings.enableTimeAwareness}
            onChange={(v) => updateSettings({ enableTimeAwareness: v })}
          />
          <Toggle
            label="Category Affinity"
            description="Boost symbols from currently active category"
            checked={settings.enableCategoryAffinity}
            onChange={(v) => updateSettings({ enableCategoryAffinity: v })}
          />
          <Toggle
            label="Vocabulary Tracking"
            description="Track vocabulary growth and diversity"
            checked={settings.enableVocabularyTracking}
            onChange={(v) => updateSettings({ enableVocabularyTracking: v })}
          />
          <Toggle
            label="Recommendations"
            description="Show personalized learning suggestions"
            checked={settings.enableRecommendations}
            onChange={(v) => updateSettings({ enableRecommendations: v })}
          />
          <Toggle
            label="Board Reordering"
            description="Automatically reorder symbols by frequency"
            checked={settings.enableBoardReordering}
            onChange={(v) => updateSettings({ enableBoardReordering: v })}
          />
          <Toggle
            label="Privacy Mode"
            description="Limit data collection to essentials only"
            checked={settings.privacyMode}
            onChange={(v) => updateSettings({ privacyMode: v })}
          />
        </div>
      </Section>

      {/* Advanced Settings */}
      <Section title="Advanced">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Prediction Count"
            value={settings.predictionCount}
            min={1}
            max={20}
            onChange={(v) => updateSettings({ predictionCount: v })}
          />
          <NumberInput
            label="Min Confidence"
            value={Math.round(settings.minConfidence * 100)}
            min={0}
            max={100}
            onChange={(v) => updateSettings({ minConfidence: v / 100 })}
            suffix="%"
          />
          <NumberInput
            label="Learning Rate"
            value={Math.round(settings.learningRate * 100)}
            min={1}
            max={100}
            onChange={(v) => updateSettings({ learningRate: v / 100 })}
            suffix="%"
          />
          <NumberInput
            label="History Days"
            value={settings.maxHistoryDays}
            min={7}
            max={365}
            onChange={(v) => updateSettings({ maxHistoryDays: v })}
          />
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Data Management">
        <div className="flex gap-3">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100
              dark:hover:bg-gray-700 transition-colors"
          >
            Reset Settings
          </button>
          <button
            onClick={clearAllData}
            className="px-4 py-2 text-sm border border-red-300 dark:border-red-700
              text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50
              dark:hover:bg-red-900/20 transition-colors"
          >
            Clear All Learning Data
          </button>
        </div>
      </Section>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border
      border-gray-200 dark:border-gray-700">
      <h4 className="font-bold text-gray-900 dark:text-white mb-4">{title}</h4>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
      />
    </label>
  );
}

function WeightSlider({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
          <span className="text-xs text-gray-400 ml-2">{Math.round(value * 100)}%</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
          accent-blue-500"
      />
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm"
        />
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}
