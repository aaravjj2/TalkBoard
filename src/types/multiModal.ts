/**
 * Types for the multi-modal input system in TalkBoard.
 * Supports voice, gesture, eye-tracking, switch access, and touch input modes.
 */

// ─── Input Mode ──────────────────────────────────────────────────────────────

export type InputMode =
  | 'touch'
  | 'voice'
  | 'switch'
  | 'eye_tracking'
  | 'gesture'
  | 'keyboard'
  | 'mouse'
  | 'head_tracking';

export type InputModeStatus = 'active' | 'inactive' | 'initializing' | 'error' | 'unavailable';

export interface InputModeConfig {
  mode: InputMode;
  enabled: boolean;
  priority: number;
  status: InputModeStatus;
  lastUsed: string | null;
  settings: Record<string, unknown>;
}

// ─── Voice Input ─────────────────────────────────────────────────────────────

export interface VoiceInputSettings {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  confidenceThreshold: number;
  silenceTimeout: number;
  autoStart: boolean;
  wakeWord: string;
  wakeWordEnabled: boolean;
  commandMode: boolean;
  dictationMode: boolean;
  noiseSuppression: boolean;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives: Array<{ transcript: string; confidence: number }>;
  timestamp: string;
}

export interface VoiceCommand {
  id: string;
  phrase: string;
  action: string;
  parameters: Record<string, string>;
  aliases: string[];
  category: 'navigation' | 'selection' | 'editing' | 'system' | 'custom';
  enabled: boolean;
}

export interface VoiceInputState {
  isListening: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  interimTranscript: string;
  lastResult: VoiceRecognitionResult | null;
  error: string | null;
  commandHistory: VoiceCommand[];
  matchedCommand: VoiceCommand | null;
}

// ─── Switch Access ───────────────────────────────────────────────────────────

export type ScanMethod = 'row_column' | 'linear' | 'group' | 'tree';
export type SwitchAction = 'select' | 'next' | 'back' | 'menu' | 'escape';

export interface SwitchConfig {
  id: string;
  name: string;
  key: string;
  action: SwitchAction;
  holdTime: number;
  debounce: number;
}

export interface SwitchAccessSettings {
  scanMethod: ScanMethod;
  scanSpeed: number;
  scanDelay: number;
  autoScanEnabled: boolean;
  autoScanDelay: number;
  repeatRate: number;
  switches: SwitchConfig[];
  highlightColor: string;
  highlightSize: number;
  auditoryCueEnabled: boolean;
  auditoryCueVolume: number;
  wrapping: boolean;
  pauseOnFirst: boolean;
  acceptanceDelay: number;
}

export interface ScanState {
  isScanning: boolean;
  currentGroup: number;
  currentItem: number;
  scanLevel: 'group' | 'row' | 'item';
  highlightedElements: string[];
  lastAction: SwitchAction | null;
  lastActionTime: string | null;
}

// ─── Gesture Input ───────────────────────────────────────────────────────────

export type GestureType =
  | 'swipe_left'
  | 'swipe_right'
  | 'swipe_up'
  | 'swipe_down'
  | 'pinch_in'
  | 'pinch_out'
  | 'tap'
  | 'double_tap'
  | 'long_press'
  | 'two_finger_tap'
  | 'three_finger_tap'
  | 'rotate_cw'
  | 'rotate_ccw'
  | 'shake';

export interface GestureMapping {
  id: string;
  gesture: GestureType;
  action: string;
  parameters: Record<string, string>;
  enabled: boolean;
  sensitivity: number;
}

export interface GestureSettings {
  enabled: boolean;
  sensitivity: number;
  swipeThreshold: number;
  longPressDelay: number;
  doubleTapDelay: number;
  pinchThreshold: number;
  mappings: GestureMapping[];
  vibrationFeedback: boolean;
  visualFeedback: boolean;
}

export interface GestureRecognitionState {
  isTracking: boolean;
  currentGesture: GestureType | null;
  gestureProgress: number;
  lastGesture: GestureType | null;
  touchPoints: Array<{ x: number; y: number; id: number }>;
}

// ─── Eye Tracking ────────────────────────────────────────────────────────────

export interface EyeTrackingSettings {
  enabled: boolean;
  dwellTime: number;
  dwellRadius: number;
  calibrationPoints: number;
  smoothingEnabled: boolean;
  smoothingFactor: number;
  blinkDetection: boolean;
  blinkThreshold: number;
  fixationThreshold: number;
  gazePointSize: number;
  showGazePoint: boolean;
  gazePointColor: string;
  dwellIndicator: 'circle' | 'fill' | 'shrink' | 'none';
  antiDwell: boolean;
  antiDwellRadius: number;
}

export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
  confidence: number;
  pupilDiameter: number;
}

export interface EyeTrackingState {
  isCalibrated: boolean;
  isTracking: boolean;
  currentGaze: GazePoint | null;
  dwellTarget: string | null;
  dwellProgress: number;
  calibrationQuality: number;
  blinkRate: number;
  fixations: GazePoint[];
}

export interface CalibrationPoint {
  x: number;
  y: number;
  accuracy: number;
  completed: boolean;
}

// ─── Head Tracking ───────────────────────────────────────────────────────────

export interface HeadTrackingSettings {
  enabled: boolean;
  sensitivity: number;
  deadZone: number;
  smoothing: number;
  invertX: boolean;
  invertY: boolean;
  clickGesture: 'dwell' | 'blink' | 'smile' | 'raise_eyebrows';
  clickDwellTime: number;
  cursorSpeed: number;
  boundaryBehavior: 'stop' | 'wrap' | 'bounce';
  headPoseAxis: 'yaw_pitch' | 'all';
}

export interface HeadPose {
  yaw: number;
  pitch: number;
  roll: number;
  timestamp: number;
}

export interface HeadTrackingState {
  isTracking: boolean;
  currentPose: HeadPose | null;
  cursorPosition: { x: number; y: number };
  isCalibrated: boolean;
  centerPose: HeadPose | null;
}

// ─── Keyboard Input ──────────────────────────────────────────────────────────

export interface KeyboardShortcut {
  id: string;
  keys: string;
  action: string;
  description: string;
  category: 'navigation' | 'selection' | 'editing' | 'system';
  enabled: boolean;
}

export interface KeyboardSettings {
  enabled: boolean;
  shortcuts: KeyboardShortcut[];
  stickyKeys: boolean;
  filterKeys: boolean;
  filterKeysDelay: number;
  bounceKeys: boolean;
  bounceKeysDelay: number;
  toggleKeysSound: boolean;
  keyRepeatRate: number;
  keyRepeatDelay: number;
  highlightFocus: boolean;
  tabNavigation: boolean;
}

// ─── Input Events ────────────────────────────────────────────────────────────

export type InputEventType =
  | 'symbol_selected'
  | 'category_changed'
  | 'sentence_spoken'
  | 'navigation'
  | 'action'
  | 'command'
  | 'calibration'
  | 'mode_switch';

export interface InputEvent {
  id: string;
  type: InputEventType;
  mode: InputMode;
  timestamp: string;
  target: string | null;
  data: Record<string, unknown>;
  success: boolean;
  duration: number;
}

// ─── Multi-Modal Settings ────────────────────────────────────────────────────

export interface MultiModalSettings {
  activeModes: InputMode[];
  primaryMode: InputMode;
  fallbackMode: InputMode;
  autoDetect: boolean;
  modeSwitchingEnabled: boolean;
  multipleSimultaneous: boolean;
  inputFeedback: {
    visual: boolean;
    auditory: boolean;
    haptic: boolean;
  };
  accessibility: {
    highContrastCursor: boolean;
    largeTargets: boolean;
    targetPadding: number;
    autoComplete: boolean;
    wordPrediction: boolean;
  };
}

export interface MultiModalState {
  currentMode: InputMode;
  modeConfigs: InputModeConfig[];
  voiceState: VoiceInputState;
  switchState: ScanState;
  gestureState: GestureRecognitionState;
  eyeTrackingState: EyeTrackingState;
  headTrackingState: HeadTrackingState;
  inputHistory: InputEvent[];
  isProcessing: boolean;
}

// ─── Input Analytics ─────────────────────────────────────────────────────────

export interface InputModeAnalytics {
  mode: InputMode;
  totalInteractions: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  usageDuration: number;
  lastUsed: string;
  dailyBreakdown: Array<{ date: string; count: number }>;
}

export interface InputPerformanceMetrics {
  overallAccuracy: number;
  averageSelectionTime: number;
  symbolsPerMinute: number;
  errorsPerSession: number;
  fatigueFactor: number;
  modeDistribution: Record<InputMode, number>;
  peakPerformanceTime: string;
  sessionDuration: number;
}
