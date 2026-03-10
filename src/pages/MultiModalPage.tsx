import { useEffect, useState } from 'react';
import { useMultiModalStore } from '@/stores/multiModalStore';
import {
  InputModeSelector,
  VoiceInputPanel,
  SwitchAccessPanel,
  GestureSettingsPanel,
  EyeTrackingPanel,
  HeadTrackingPanel,
  KeyboardShortcutsPanel,
  InputAnalyticsPanel,
} from '@/components/MultiModal';

const TABS = [
  { id: 'modes', label: 'Input Modes', icon: '🎛️' },
  { id: 'voice', label: 'Voice', icon: '🎤' },
  { id: 'switch', label: 'Switch Access', icon: '🔘' },
  { id: 'gesture', label: 'Gestures', icon: '🤚' },
  { id: 'eye', label: 'Eye Tracking', icon: '👁️' },
  { id: 'head', label: 'Head Tracking', icon: '🗣️' },
  { id: 'keyboard', label: 'Keyboard', icon: '⌨️' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function MultiModalPage() {
  const { isInitialized, initialize, activeTab, setActiveTab, error } =
    useMultiModalStore();
  const [currentTab, setCurrentTab] = useState<TabId>(
    (activeTab as TabId) || 'modes'
  );

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleTabChange = (tab: TabId) => {
    setCurrentTab(tab);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h1 className="text-xl font-bold">Multi-Modal Input</h1>
        <p className="text-sm text-indigo-100 mt-1">
          Configure voice, switch, gesture, eye tracking, head tracking &amp;
          keyboard input
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                currentTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          {currentTab === 'modes' && <InputModeSelector />}
          {currentTab === 'voice' && <VoiceInputPanel />}
          {currentTab === 'switch' && <SwitchAccessPanel />}
          {currentTab === 'gesture' && <GestureSettingsPanel />}
          {currentTab === 'eye' && <EyeTrackingPanel />}
          {currentTab === 'head' && <HeadTrackingPanel />}
          {currentTab === 'keyboard' && <KeyboardShortcutsPanel />}
          {currentTab === 'analytics' && <InputAnalyticsPanel />}
        </div>
      </div>
    </div>
  );
}
