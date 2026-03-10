import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  InputMode,
  InputModeConfig,
  VoiceInputSettings,
  VoiceRecognitionResult,
  VoiceCommand,
  VoiceInputState,
  SwitchAccessSettings,
  ScanState,
  GestureSettings,
  GestureType,
  GestureRecognitionState,
  EyeTrackingSettings,
  EyeTrackingState,
  GazePoint,
  HeadTrackingSettings,
  HeadTrackingState,
  KeyboardSettings,
  KeyboardShortcut,
  MultiModalSettings,
  InputEvent,
  InputModeAnalytics,
  InputPerformanceMetrics,
} from '@/types/multiModal';
import { multiModalService } from '@/services/multiModalService';

// ─── Store State ─────────────────────────────────────────────────────────────

interface MultiModalStoreState {
  // Settings
  settings: MultiModalSettings;
  voiceSettings: VoiceInputSettings;
  switchSettings: SwitchAccessSettings;
  gestureSettings: GestureSettings;
  eyeTrackingSettings: EyeTrackingSettings;
  headTrackingSettings: HeadTrackingSettings;
  keyboardSettings: KeyboardSettings;

  // Mode configs
  modeConfigs: InputModeConfig[];
  currentMode: InputMode;

  // Voice state
  voiceState: VoiceInputState;
  voiceCommands: VoiceCommand[];

  // Switch state
  scanState: ScanState;

  // Gesture state
  gestureState: GestureRecognitionState;

  // Eye tracking state
  eyeTrackingState: EyeTrackingState;

  // Head tracking state
  headTrackingState: HeadTrackingState;

  // History & analytics
  inputHistory: InputEvent[];
  modeAnalytics: InputModeAnalytics[];
  performanceMetrics: InputPerformanceMetrics | null;

  // UI
  activeTab: string;
  isInitialized: boolean;
  error: string | null;
}

interface MultiModalStoreActions {
  // Init
  initialize(): void;

  // Settings
  updateSettings(updates: Partial<MultiModalSettings>): void;
  updateVoiceSettings(updates: Partial<VoiceInputSettings>): void;
  updateSwitchSettings(updates: Partial<SwitchAccessSettings>): void;
  updateGestureSettings(updates: Partial<GestureSettings>): void;
  updateEyeTrackingSettings(updates: Partial<EyeTrackingSettings>): void;
  updateHeadTrackingSettings(updates: Partial<HeadTrackingSettings>): void;
  updateKeyboardSettings(updates: Partial<KeyboardSettings>): void;

  // Mode management
  enableMode(mode: InputMode): void;
  disableMode(mode: InputMode): void;
  setPrimaryMode(mode: InputMode): void;

  // Voice
  startListening(): void;
  stopListening(): void;
  addVoiceCommand(data: {
    phrase: string;
    action: string;
    aliases: string[];
    category: VoiceCommand['category'];
  }): void;
  removeVoiceCommand(id: string): void;

  // Keyboard
  addShortcut(data: {
    keys: string;
    action: string;
    description: string;
    category: KeyboardShortcut['category'];
  }): void;
  removeShortcut(id: string): void;
  toggleShortcut(id: string): void;

  // Analytics
  refreshAnalytics(): void;

  // UI
  setActiveTab(tab: string): void;
  clearError(): void;
  resetAll(): void;
}

type MultiModalStore = MultiModalStoreState & MultiModalStoreActions;

// ─── Default voice state ─────────────────────────────────────────────────────

const defaultVoiceState: VoiceInputState = {
  isListening: false,
  isProcessing: false,
  currentTranscript: '',
  interimTranscript: '',
  lastResult: null,
  error: null,
  commandHistory: [],
  matchedCommand: null,
};

const defaultScanState: ScanState = {
  isScanning: false,
  currentGroup: 0,
  currentItem: 0,
  scanLevel: 'group',
  highlightedElements: [],
  lastAction: null,
  lastActionTime: null,
};

const defaultGestureState: GestureRecognitionState = {
  isTracking: false,
  currentGesture: null,
  gestureProgress: 0,
  lastGesture: null,
  touchPoints: [],
};

const defaultEyeState: EyeTrackingState = {
  isCalibrated: false,
  isTracking: false,
  currentGaze: null,
  dwellTarget: null,
  dwellProgress: 0,
  calibrationQuality: 0,
  blinkRate: 0,
  fixations: [],
};

const defaultHeadState: HeadTrackingState = {
  isTracking: false,
  currentPose: null,
  cursorPosition: { x: 0, y: 0 },
  isCalibrated: false,
  centerPose: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useMultiModalStore = create<MultiModalStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      settings: multiModalService.getMultiModalSettings(),
      voiceSettings: multiModalService.getVoiceSettings(),
      switchSettings: multiModalService.getSwitchSettings(),
      gestureSettings: multiModalService.getGestureSettings(),
      eyeTrackingSettings: multiModalService.getEyeTrackingSettings(),
      headTrackingSettings: multiModalService.getHeadTrackingSettings(),
      keyboardSettings: multiModalService.getKeyboardSettings(),
      modeConfigs: [],
      currentMode: 'touch',
      voiceState: defaultVoiceState,
      voiceCommands: [],
      scanState: defaultScanState,
      gestureState: defaultGestureState,
      eyeTrackingState: defaultEyeState,
      headTrackingState: defaultHeadState,
      inputHistory: [],
      modeAnalytics: [],
      performanceMetrics: null,
      activeTab: 'overview',
      isInitialized: false,
      error: null,

      // ── Init ──
      initialize() {
        try {
          const settings = multiModalService.getMultiModalSettings();
          const modeConfigs = multiModalService.getModeConfigs();
          const voiceCommands = multiModalService.getVoiceCommands();
          const analytics = multiModalService.getInputModeAnalytics();
          const metrics = multiModalService.getPerformanceMetrics();
          const history = multiModalService.getInputHistory();

          set({
            settings,
            voiceSettings: multiModalService.getVoiceSettings(),
            switchSettings: multiModalService.getSwitchSettings(),
            gestureSettings: multiModalService.getGestureSettings(),
            eyeTrackingSettings: multiModalService.getEyeTrackingSettings(),
            headTrackingSettings: multiModalService.getHeadTrackingSettings(),
            keyboardSettings: multiModalService.getKeyboardSettings(),
            modeConfigs,
            currentMode: settings.primaryMode,
            voiceCommands,
            modeAnalytics: analytics,
            performanceMetrics: metrics,
            inputHistory: history,
            isInitialized: true,
            error: null,
          });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Initialization failed',
            isInitialized: true,
          });
        }
      },

      // ── Settings ──
      updateSettings(updates) {
        const updated = multiModalService.updateMultiModalSettings(updates);
        set({
          settings: updated,
          modeConfigs: multiModalService.getModeConfigs(),
        });
      },

      updateVoiceSettings(updates) {
        const updated = multiModalService.updateVoiceSettings(updates);
        set({ voiceSettings: updated });
      },

      updateSwitchSettings(updates) {
        const updated = multiModalService.updateSwitchSettings(updates);
        set({ switchSettings: updated });
      },

      updateGestureSettings(updates) {
        const updated = multiModalService.updateGestureSettings(updates);
        set({ gestureSettings: updated });
      },

      updateEyeTrackingSettings(updates) {
        const updated = multiModalService.updateEyeTrackingSettings(updates);
        set({ eyeTrackingSettings: updated });
      },

      updateHeadTrackingSettings(updates) {
        const updated = multiModalService.updateHeadTrackingSettings(updates);
        set({ headTrackingSettings: updated });
      },

      updateKeyboardSettings(updates) {
        const updated = multiModalService.updateKeyboardSettings(updates);
        set({ keyboardSettings: updated });
      },

      // ── Mode Management ──
      enableMode(mode) {
        multiModalService.enableMode(mode);
        set({
          settings: multiModalService.getMultiModalSettings(),
          modeConfigs: multiModalService.getModeConfigs(),
        });
      },

      disableMode(mode) {
        multiModalService.disableMode(mode);
        set({
          settings: multiModalService.getMultiModalSettings(),
          modeConfigs: multiModalService.getModeConfigs(),
        });
      },

      setPrimaryMode(mode) {
        multiModalService.setPrimaryMode(mode);
        set({
          currentMode: mode,
          settings: multiModalService.getMultiModalSettings(),
          modeConfigs: multiModalService.getModeConfigs(),
        });
      },

      // ── Voice ──
      startListening() {
        const success = multiModalService.startVoiceRecognition();
        if (success) {
          set({
            voiceState: {
              ...get().voiceState,
              isListening: true,
              error: null,
            },
          });
        }
      },

      stopListening() {
        multiModalService.stopVoiceRecognition();
        set({
          voiceState: {
            ...get().voiceState,
            isListening: false,
          },
        });
      },

      addVoiceCommand(data) {
        multiModalService.addVoiceCommand(data);
        set({ voiceCommands: multiModalService.getVoiceCommands() });
      },

      removeVoiceCommand(id) {
        multiModalService.removeVoiceCommand(id);
        set({ voiceCommands: multiModalService.getVoiceCommands() });
      },

      // ── Keyboard ──
      addShortcut(data) {
        multiModalService.addKeyboardShortcut(data);
        set({ keyboardSettings: multiModalService.getKeyboardSettings() });
      },

      removeShortcut(id) {
        multiModalService.removeKeyboardShortcut(id);
        set({ keyboardSettings: multiModalService.getKeyboardSettings() });
      },

      toggleShortcut(id) {
        multiModalService.toggleKeyboardShortcut(id);
        set({ keyboardSettings: multiModalService.getKeyboardSettings() });
      },

      // ── Analytics ──
      refreshAnalytics() {
        set({
          modeAnalytics: multiModalService.getInputModeAnalytics(),
          performanceMetrics: multiModalService.getPerformanceMetrics(),
          inputHistory: multiModalService.getInputHistory(),
        });
      },

      // ── UI ──
      setActiveTab(tab) {
        set({ activeTab: tab });
      },

      clearError() {
        set({ error: null });
      },

      resetAll() {
        multiModalService.resetAllSettings();
        get().initialize();
      },
    }),
    {
      name: 'talkboard_multimodal_store',
      partialize: (state) => ({
        activeTab: state.activeTab,
        currentMode: state.currentMode,
      }),
    }
  )
);
