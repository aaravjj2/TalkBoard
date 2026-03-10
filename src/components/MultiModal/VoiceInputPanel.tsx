import { useState } from 'react';
import { useMultiModalStore } from '@/stores/multiModalStore';

export default function VoiceInputPanel() {
  const {
    voiceSettings,
    voiceState,
    voiceCommands,
    startListening,
    stopListening,
    updateVoiceSettings,
    addVoiceCommand,
    removeVoiceCommand,
  } = useMultiModalStore();

  const [showAddCommand, setShowAddCommand] = useState(false);
  const [newCommand, setNewCommand] = useState({
    phrase: '',
    action: '',
    aliases: '',
    category: 'custom' as const,
  });

  const handleAddCommand = () => {
    if (!newCommand.phrase || !newCommand.action) return;
    addVoiceCommand({
      phrase: newCommand.phrase,
      action: newCommand.action,
      aliases: newCommand.aliases.split(',').map((a) => a.trim()).filter(Boolean),
      category: newCommand.category,
    });
    setNewCommand({ phrase: '', action: '', aliases: '', category: 'custom' });
    setShowAddCommand(false);
  };

  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
    { code: 'it-IT', label: 'Italian' },
    { code: 'pt-BR', label: 'Portuguese (BR)' },
    { code: 'ja-JP', label: 'Japanese' },
    { code: 'ko-KR', label: 'Korean' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'hi-IN', label: 'Hindi' },
    { code: 'ar-SA', label: 'Arabic' },
  ];

  return (
    <div className="space-y-6">
      {/* Voice Status */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                voiceState.isListening
                  ? 'bg-red-100 dark:bg-red-900 animate-pulse'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className="text-2xl">🎤</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {voiceState.isListening ? 'Listening...' : 'Voice Input'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {voiceState.isListening
                  ? voiceState.interimTranscript || 'Waiting for speech...'
                  : 'Click to start voice input'}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              voiceState.isListening ? stopListening() : startListening()
            }
            className={`px-4 py-2 rounded-lg font-medium ${
              voiceState.isListening
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {voiceState.isListening ? 'Stop' : 'Start'}
          </button>
        </div>

        {voiceState.lastResult && (
          <div className="mt-3 p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last recognized:</p>
            <p className="font-medium dark:text-white">
              {voiceState.lastResult.transcript}
            </p>
            <p className="text-xs text-gray-400">
              Confidence: {(voiceState.lastResult.confidence * 100).toFixed(1)}%
            </p>
          </div>
        )}

        {voiceState.matchedCommand && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400">
              Command matched: <strong>{voiceState.matchedCommand.phrase}</strong> →{' '}
              {voiceState.matchedCommand.action}
            </p>
          </div>
        )}

        {voiceState.error && (
          <p className="mt-2 text-sm text-red-500 dark:text-red-400">
            {voiceState.error}
          </p>
        )}
      </div>

      {/* Voice Settings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Voice Settings
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            <select
              value={voiceSettings.language}
              onChange={(e) => updateVoiceSettings({ language: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Confidence Threshold: {(voiceSettings.confidenceThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.3}
              max={0.95}
              step={0.05}
              value={voiceSettings.confidenceThreshold}
              onChange={(e) =>
                updateVoiceSettings({ confidenceThreshold: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Silence Timeout: {voiceSettings.silenceTimeout}ms
            </label>
            <input
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={voiceSettings.silenceTimeout}
              onChange={(e) =>
                updateVoiceSettings({ silenceTimeout: Number(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Toggle
              label="Continuous"
              checked={voiceSettings.continuous}
              onChange={(v) => updateVoiceSettings({ continuous: v })}
            />
            <Toggle
              label="Interim Results"
              checked={voiceSettings.interimResults}
              onChange={(v) => updateVoiceSettings({ interimResults: v })}
            />
            <Toggle
              label="Command Mode"
              checked={voiceSettings.commandMode}
              onChange={(v) => updateVoiceSettings({ commandMode: v })}
            />
            <Toggle
              label="Noise Suppression"
              checked={voiceSettings.noiseSuppression}
              onChange={(v) => updateVoiceSettings({ noiseSuppression: v })}
            />
          </div>
        </div>
      </div>

      {/* Voice Commands */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Voice Commands ({voiceCommands.length})
          </h4>
          <button
            onClick={() => setShowAddCommand(!showAddCommand)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {showAddCommand ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showAddCommand && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-2">
            <input
              type="text"
              value={newCommand.phrase}
              onChange={(e) => setNewCommand({ ...newCommand, phrase: e.target.value })}
              placeholder="Trigger phrase"
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              value={newCommand.action}
              onChange={(e) => setNewCommand({ ...newCommand, action: e.target.value })}
              placeholder="Action (e.g., goto_home)"
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              value={newCommand.aliases}
              onChange={(e) => setNewCommand({ ...newCommand, aliases: e.target.value })}
              placeholder="Aliases (comma-separated)"
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleAddCommand}
              disabled={!newCommand.phrase || !newCommand.action}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Add Command
            </button>
          </div>
        )}

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {voiceCommands.map((cmd) => (
            <div
              key={cmd.id}
              className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700 text-sm"
            >
              <span className={`w-2 h-2 rounded-full ${cmd.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium text-gray-900 dark:text-white min-w-[80px]">
                &quot;{cmd.phrase}&quot;
              </span>
              <span className="text-gray-400 dark:text-gray-500">→</span>
              <span className="text-gray-600 dark:text-gray-400 flex-1">
                {cmd.action}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                {cmd.category}
              </span>
              <button
                onClick={() => removeVoiceCommand(cmd.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-700 cursor-pointer">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </label>
  );
}
