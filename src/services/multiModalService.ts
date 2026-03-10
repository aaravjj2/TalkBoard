/**
 * multiModalService — Multi-modal input management for TalkBoard.
 * Handles voice recognition, switch access scanning, gesture recognition,
 * eye tracking simulation, head tracking, keyboard shortcuts, and
 * input mode switching / coordination.
 */

import type {
  InputMode,
  InputModeConfig,
  InputModeStatus,
  VoiceInputSettings,
  VoiceRecognitionResult,
  VoiceCommand,
  VoiceInputState,
  SwitchAccessSettings,
  SwitchConfig,
  ScanState,
  GestureSettings,
  GestureMapping,
  GestureType,
  GestureRecognitionState,
  EyeTrackingSettings,
  EyeTrackingState,
  GazePoint,
  HeadTrackingSettings,
  HeadTrackingState,
  HeadPose,
  KeyboardSettings,
  KeyboardShortcut,
  MultiModalSettings,
  InputEvent,
  InputEventType,
  InputModeAnalytics,
  InputPerformanceMetrics,
  ScanMethod,
} from '@/types/multiModal';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  SETTINGS: 'talkboard_multimodal_settings',
  VOICE: 'talkboard_multimodal_voice',
  SWITCH: 'talkboard_multimodal_switch',
  GESTURE: 'talkboard_multimodal_gesture',
  EYE: 'talkboard_multimodal_eye',
  HEAD: 'talkboard_multimodal_head',
  KEYBOARD: 'talkboard_multimodal_keyboard',
  COMMANDS: 'talkboard_multimodal_commands',
  HISTORY: 'talkboard_multimodal_history',
} as const;

const MAX_HISTORY = 500;

// ─── Default Settings ────────────────────────────────────────────────────────

const defaultVoiceSettings: VoiceInputSettings = {
  language: 'en-US',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  confidenceThreshold: 0.7,
  silenceTimeout: 3000,
  autoStart: false,
  wakeWord: 'hey talkboard',
  wakeWordEnabled: false,
  commandMode: true,
  dictationMode: false,
  noiseSuppression: true,
};

const defaultSwitchSettings: SwitchAccessSettings = {
  scanMethod: 'row_column',
  scanSpeed: 1500,
  scanDelay: 500,
  autoScanEnabled: true,
  autoScanDelay: 2000,
  repeatRate: 0,
  switches: [
    { id: 'sw_1', name: 'Primary', key: 'Space', action: 'select', holdTime: 0, debounce: 100 },
    { id: 'sw_2', name: 'Secondary', key: 'Enter', action: 'next', holdTime: 0, debounce: 100 },
    { id: 'sw_3', name: 'Back', key: 'Backspace', action: 'back', holdTime: 0, debounce: 100 },
  ],
  highlightColor: '#3B82F6',
  highlightSize: 4,
  auditoryCueEnabled: true,
  auditoryCueVolume: 0.5,
  wrapping: true,
  pauseOnFirst: true,
  acceptanceDelay: 200,
};

const defaultGestureSettings: GestureSettings = {
  enabled: true,
  sensitivity: 0.7,
  swipeThreshold: 50,
  longPressDelay: 800,
  doubleTapDelay: 300,
  pinchThreshold: 0.15,
  vibrationFeedback: true,
  visualFeedback: true,
  mappings: [
    { id: 'g1', gesture: 'swipe_left', action: 'navigate_back', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g2', gesture: 'swipe_right', action: 'navigate_forward', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g3', gesture: 'swipe_up', action: 'scroll_up', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g4', gesture: 'swipe_down', action: 'scroll_down', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g5', gesture: 'pinch_in', action: 'zoom_out', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g6', gesture: 'pinch_out', action: 'zoom_in', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g7', gesture: 'long_press', action: 'context_menu', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g8', gesture: 'double_tap', action: 'select_symbol', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g9', gesture: 'two_finger_tap', action: 'speak_sentence', parameters: {}, enabled: true, sensitivity: 0.7 },
    { id: 'g10', gesture: 'shake', action: 'clear_sentence', parameters: {}, enabled: true, sensitivity: 0.5 },
  ],
};

const defaultEyeTrackingSettings: EyeTrackingSettings = {
  enabled: false,
  dwellTime: 1000,
  dwellRadius: 30,
  calibrationPoints: 9,
  smoothingEnabled: true,
  smoothingFactor: 0.3,
  blinkDetection: true,
  blinkThreshold: 200,
  fixationThreshold: 100,
  gazePointSize: 20,
  showGazePoint: true,
  gazePointColor: '#EF4444',
  dwellIndicator: 'circle',
  antiDwell: false,
  antiDwellRadius: 50,
};

const defaultHeadTrackingSettings: HeadTrackingSettings = {
  enabled: false,
  sensitivity: 0.5,
  deadZone: 5,
  smoothing: 0.7,
  invertX: false,
  invertY: false,
  clickGesture: 'dwell',
  clickDwellTime: 1200,
  cursorSpeed: 1.0,
  boundaryBehavior: 'stop',
  headPoseAxis: 'yaw_pitch',
};

const defaultKeyboardSettings: KeyboardSettings = {
  enabled: true,
  shortcuts: [
    { id: 'k1', keys: 'Ctrl+Space', action: 'speak_sentence', description: 'Speak current sentence', category: 'system', enabled: true },
    { id: 'k2', keys: 'Ctrl+Backspace', action: 'clear_sentence', description: 'Clear sentence', category: 'editing', enabled: true },
    { id: 'k3', keys: 'Ctrl+Z', action: 'undo', description: 'Undo last action', category: 'editing', enabled: true },
    { id: 'k4', keys: 'Ctrl+Y', action: 'redo', description: 'Redo last action', category: 'editing', enabled: true },
    { id: 'k5', keys: 'Tab', action: 'next_category', description: 'Next category', category: 'navigation', enabled: true },
    { id: 'k6', keys: 'Shift+Tab', action: 'prev_category', description: 'Previous category', category: 'navigation', enabled: true },
    { id: 'k7', keys: 'Escape', action: 'close_modal', description: 'Close modal', category: 'system', enabled: true },
    { id: 'k8', keys: 'Ctrl+S', action: 'save', description: 'Save current state', category: 'system', enabled: true },
    { id: 'k9', keys: 'Ctrl+/', action: 'help', description: 'Show keyboard shortcuts', category: 'system', enabled: true },
    { id: 'k10', keys: 'ArrowLeft', action: 'prev_symbol', description: 'Previous symbol', category: 'navigation', enabled: true },
    { id: 'k11', keys: 'ArrowRight', action: 'next_symbol', description: 'Next symbol', category: 'navigation', enabled: true },
    { id: 'k12', keys: 'Enter', action: 'select_symbol', description: 'Select focused symbol', category: 'selection', enabled: true },
    { id: 'k13', keys: 'Ctrl+1', action: 'goto_home', description: 'Go to home', category: 'navigation', enabled: true },
    { id: 'k14', keys: 'Ctrl+2', action: 'goto_settings', description: 'Go to settings', category: 'navigation', enabled: true },
    { id: 'k15', keys: 'Ctrl+3', action: 'goto_history', description: 'Go to history', category: 'navigation', enabled: true },
    { id: 'k16', keys: 'F11', action: 'toggle_fullscreen', description: 'Toggle fullscreen', category: 'system', enabled: true },
  ],
  stickyKeys: false,
  filterKeys: false,
  filterKeysDelay: 300,
  bounceKeys: false,
  bounceKeysDelay: 300,
  toggleKeysSound: false,
  keyRepeatRate: 30,
  keyRepeatDelay: 500,
  highlightFocus: true,
  tabNavigation: true,
};

const defaultMultiModalSettings: MultiModalSettings = {
  activeModes: ['touch', 'keyboard'],
  primaryMode: 'touch',
  fallbackMode: 'keyboard',
  autoDetect: true,
  modeSwitchingEnabled: true,
  multipleSimultaneous: false,
  inputFeedback: {
    visual: true,
    auditory: false,
    haptic: true,
  },
  accessibility: {
    highContrastCursor: false,
    largeTargets: false,
    targetPadding: 8,
    autoComplete: true,
    wordPrediction: true,
  },
};

// ─── Default Voice Commands ──────────────────────────────────────────────────

const defaultVoiceCommands: VoiceCommand[] = [
  { id: 'vc1', phrase: 'speak', action: 'speak_sentence', parameters: {}, aliases: ['say it', 'read'], category: 'system', enabled: true },
  { id: 'vc2', phrase: 'clear', action: 'clear_sentence', parameters: {}, aliases: ['clear all', 'erase'], category: 'editing', enabled: true },
  { id: 'vc3', phrase: 'undo', action: 'undo', parameters: {}, aliases: ['go back'], category: 'editing', enabled: true },
  { id: 'vc4', phrase: 'redo', action: 'redo', parameters: {}, aliases: ['go forward'], category: 'editing', enabled: true },
  { id: 'vc5', phrase: 'home', action: 'goto_home', parameters: {}, aliases: ['go home', 'main page'], category: 'navigation', enabled: true },
  { id: 'vc6', phrase: 'settings', action: 'goto_settings', parameters: {}, aliases: ['open settings'], category: 'navigation', enabled: true },
  { id: 'vc7', phrase: 'help', action: 'goto_help', parameters: {}, aliases: ['I need help'], category: 'navigation', enabled: true },
  { id: 'vc8', phrase: 'next', action: 'next_category', parameters: {}, aliases: ['next page', 'forward'], category: 'navigation', enabled: true },
  { id: 'vc9', phrase: 'back', action: 'prev_category', parameters: {}, aliases: ['previous', 'go back'], category: 'navigation', enabled: true },
  { id: 'vc10', phrase: 'select', action: 'select_symbol', parameters: {}, aliases: ['choose', 'pick'], category: 'selection', enabled: true },
  { id: 'vc11', phrase: 'delete', action: 'delete_last', parameters: {}, aliases: ['remove last', 'backspace'], category: 'editing', enabled: true },
  { id: 'vc12', phrase: 'stop listening', action: 'stop_voice', parameters: {}, aliases: ['stop'], category: 'system', enabled: true },
];

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function loadData<T>(key: string, fallback: T): T {
  try {
    const json = localStorage.getItem(key);
    if (!json) return fallback;
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.warn(`[MultiModal] Storage write failed for ${key}`);
  }
}

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// ─── Settings Management ─────────────────────────────────────────────────────

export function getMultiModalSettings(): MultiModalSettings {
  return loadData(STORAGE_KEYS.SETTINGS, { ...defaultMultiModalSettings });
}

export function updateMultiModalSettings(
  updates: Partial<MultiModalSettings>
): MultiModalSettings {
  const current = getMultiModalSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

export function getVoiceSettings(): VoiceInputSettings {
  return loadData(STORAGE_KEYS.VOICE, { ...defaultVoiceSettings });
}

export function updateVoiceSettings(
  updates: Partial<VoiceInputSettings>
): VoiceInputSettings {
  const current = getVoiceSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.VOICE, updated);
  return updated;
}

export function getSwitchSettings(): SwitchAccessSettings {
  return loadData(STORAGE_KEYS.SWITCH, { ...defaultSwitchSettings });
}

export function updateSwitchSettings(
  updates: Partial<SwitchAccessSettings>
): SwitchAccessSettings {
  const current = getSwitchSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.SWITCH, updated);
  return updated;
}

export function getGestureSettings(): GestureSettings {
  return loadData(STORAGE_KEYS.GESTURE, { ...defaultGestureSettings });
}

export function updateGestureSettings(
  updates: Partial<GestureSettings>
): GestureSettings {
  const current = getGestureSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.GESTURE, updated);
  return updated;
}

export function getEyeTrackingSettings(): EyeTrackingSettings {
  return loadData(STORAGE_KEYS.EYE, { ...defaultEyeTrackingSettings });
}

export function updateEyeTrackingSettings(
  updates: Partial<EyeTrackingSettings>
): EyeTrackingSettings {
  const current = getEyeTrackingSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.EYE, updated);
  return updated;
}

export function getHeadTrackingSettings(): HeadTrackingSettings {
  return loadData(STORAGE_KEYS.HEAD, { ...defaultHeadTrackingSettings });
}

export function updateHeadTrackingSettings(
  updates: Partial<HeadTrackingSettings>
): HeadTrackingSettings {
  const current = getHeadTrackingSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.HEAD, updated);
  return updated;
}

export function getKeyboardSettings(): KeyboardSettings {
  return loadData(STORAGE_KEYS.KEYBOARD, { ...defaultKeyboardSettings });
}

export function updateKeyboardSettings(
  updates: Partial<KeyboardSettings>
): KeyboardSettings {
  const current = getKeyboardSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.KEYBOARD, updated);
  return updated;
}

// ─── Voice Commands ──────────────────────────────────────────────────────────

export function getVoiceCommands(): VoiceCommand[] {
  return loadData(STORAGE_KEYS.COMMANDS, [...defaultVoiceCommands]);
}

export function addVoiceCommand(data: {
  phrase: string;
  action: string;
  aliases: string[];
  category: VoiceCommand['category'];
}): VoiceCommand {
  const command: VoiceCommand = {
    id: generateId('vc'),
    phrase: data.phrase,
    action: data.action,
    parameters: {},
    aliases: data.aliases,
    category: data.category,
    enabled: true,
  };
  const commands = getVoiceCommands();
  commands.push(command);
  saveData(STORAGE_KEYS.COMMANDS, commands);
  return command;
}

export function removeVoiceCommand(id: string): void {
  const commands = getVoiceCommands().filter((c) => c.id !== id);
  saveData(STORAGE_KEYS.COMMANDS, commands);
}

export function toggleVoiceCommand(id: string): void {
  const commands = getVoiceCommands();
  const cmd = commands.find((c) => c.id === id);
  if (cmd) {
    cmd.enabled = !cmd.enabled;
    saveData(STORAGE_KEYS.COMMANDS, commands);
  }
}

export function matchVoiceCommand(
  transcript: string
): VoiceCommand | null {
  const commands = getVoiceCommands().filter((c) => c.enabled);
  const lower = transcript.toLowerCase().trim();

  // Exact match first
  for (const cmd of commands) {
    if (lower === cmd.phrase.toLowerCase()) return cmd;
    for (const alias of cmd.aliases) {
      if (lower === alias.toLowerCase()) return cmd;
    }
  }

  // Partial match (transcript contains command phrase)
  for (const cmd of commands) {
    if (lower.includes(cmd.phrase.toLowerCase())) return cmd;
    for (const alias of cmd.aliases) {
      if (lower.includes(alias.toLowerCase())) return cmd;
    }
  }

  return null;
}

// ─── Voice Recognition (Web Speech API wrapper) ──────────────────────────────

let recognition: SpeechRecognition | null = null;
let voiceState: VoiceInputState = {
  isListening: false,
  isProcessing: false,
  currentTranscript: '',
  interimTranscript: '',
  lastResult: null,
  error: null,
  commandHistory: [],
  matchedCommand: null,
};

export function isVoiceAvailable(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

export function initVoiceRecognition(
  onResult: (result: VoiceRecognitionResult) => void,
  onCommand: (command: VoiceCommand) => void,
  onError: (error: string) => void
): boolean {
  if (!isVoiceAvailable()) {
    onError('Speech recognition not available in this browser');
    return false;
  }

  const SpeechRecog =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecog();

  const settings = getVoiceSettings();
  recognition.lang = settings.language;
  recognition.continuous = settings.continuous;
  recognition.interimResults = settings.interimResults;
  recognition.maxAlternatives = settings.maxAlternatives;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    voiceState.interimTranscript = interimTranscript;

    if (finalTranscript) {
      const alternatives: Array<{ transcript: string; confidence: number }> = [];
      const lastResult = event.results[event.results.length - 1];
      for (let j = 0; j < lastResult.length; j++) {
        alternatives.push({
          transcript: lastResult[j].transcript,
          confidence: lastResult[j].confidence,
        });
      }

      const result: VoiceRecognitionResult = {
        transcript: finalTranscript,
        confidence: lastResult[0].confidence,
        isFinal: true,
        alternatives,
        timestamp: new Date().toISOString(),
      };

      voiceState.lastResult = result;
      voiceState.currentTranscript = finalTranscript;

      onResult(result);

      // Check for commands
      if (settings.commandMode) {
        const matched = matchVoiceCommand(finalTranscript);
        if (matched) {
          voiceState.matchedCommand = matched;
          voiceState.commandHistory.push(matched);
          onCommand(matched);
        }
      }
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    const errorMsg = `Voice recognition error: ${event.error}`;
    voiceState.error = errorMsg;
    onError(errorMsg);
  };

  recognition.onend = () => {
    voiceState.isListening = false;
    if (settings.continuous && voiceState.error === null) {
      // Restart if continuous and no error
      try {
        recognition?.start();
        voiceState.isListening = true;
      } catch {
        // Already started
      }
    }
  };

  return true;
}

export function startVoiceRecognition(): boolean {
  if (!recognition) return false;
  try {
    recognition.start();
    voiceState.isListening = true;
    voiceState.error = null;
    return true;
  } catch {
    return false;
  }
}

export function stopVoiceRecognition(): void {
  if (recognition) {
    try {
      recognition.stop();
    } catch {
      // Already stopped
    }
    voiceState.isListening = false;
  }
}

export function getVoiceState(): VoiceInputState {
  return { ...voiceState };
}

// ─── Switch Access Scanning ──────────────────────────────────────────────────

let scanTimer: ReturnType<typeof setInterval> | null = null;
let scanState: ScanState = {
  isScanning: false,
  currentGroup: 0,
  currentItem: 0,
  scanLevel: 'group',
  highlightedElements: [],
  lastAction: null,
  lastActionTime: null,
};

export function getScanState(): ScanState {
  return { ...scanState };
}

export function startScanning(
  elements: string[][],
  onHighlight: (ids: string[]) => void,
  onSelect: (id: string) => void
): void {
  const settings = getSwitchSettings();
  if (elements.length === 0) return;

  scanState.isScanning = true;
  scanState.currentGroup = 0;
  scanState.currentItem = 0;
  scanState.scanLevel = settings.scanMethod === 'linear' ? 'item' : 'group';

  const totalGroups = elements.length;
  const flatElements = elements.flat();

  if (settings.autoScanEnabled) {
    scanTimer = setInterval(() => {
      if (settings.scanMethod === 'linear') {
        // Linear: scan each item one by one
        const flatIdx = scanState.currentItem;
        if (flatIdx < flatElements.length) {
          scanState.highlightedElements = [flatElements[flatIdx]];
          onHighlight(scanState.highlightedElements);
          scanState.currentItem++;
          if (scanState.currentItem >= flatElements.length) {
            scanState.currentItem = settings.wrapping ? 0 : flatElements.length - 1;
          }
        }
      } else if (settings.scanMethod === 'row_column') {
        if (scanState.scanLevel === 'group') {
          // Highlight entire row
          scanState.highlightedElements = elements[scanState.currentGroup] || [];
          onHighlight(scanState.highlightedElements);
          scanState.currentGroup++;
          if (scanState.currentGroup >= totalGroups) {
            scanState.currentGroup = settings.wrapping ? 0 : totalGroups - 1;
          }
        } else {
          // Highlight individual item within selected group
          const group = elements[scanState.currentGroup] || [];
          const itemIdx = scanState.currentItem;
          if (itemIdx < group.length) {
            scanState.highlightedElements = [group[itemIdx]];
            onHighlight(scanState.highlightedElements);
            scanState.currentItem++;
            if (scanState.currentItem >= group.length) {
              scanState.currentItem = settings.wrapping ? 0 : group.length - 1;
            }
          }
        }
      }
    }, settings.scanSpeed);
  }
}

export function handleSwitchInput(
  action: string,
  elements: string[][],
  onSelect: (id: string) => void
): void {
  const settings = getSwitchSettings();

  if (action === 'select') {
    if (settings.scanMethod === 'row_column' && scanState.scanLevel === 'group') {
      // Move to item scanning within the selected group
      scanState.scanLevel = 'item';
      scanState.currentItem = 0;
    } else {
      // Select the current item
      const highlighted = scanState.highlightedElements[0];
      if (highlighted) {
        onSelect(highlighted);
        scanState.lastAction = 'select';
        scanState.lastActionTime = new Date().toISOString();
      }
    }
  } else if (action === 'next') {
    // Manual advance
    if (scanState.scanLevel === 'group') {
      scanState.currentGroup =
        (scanState.currentGroup + 1) % elements.length;
    } else {
      const group = elements[scanState.currentGroup] || [];
      scanState.currentItem = (scanState.currentItem + 1) % group.length;
    }
  } else if (action === 'back') {
    if (scanState.scanLevel === 'item') {
      // Go back to group scanning
      scanState.scanLevel = 'group';
      scanState.currentItem = 0;
    }
  }
}

export function stopScanning(): void {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  scanState.isScanning = false;
  scanState.highlightedElements = [];
}

// ─── Gesture Recognition ─────────────────────────────────────────────────────

let gestureState: GestureRecognitionState = {
  isTracking: false,
  currentGesture: null,
  gestureProgress: 0,
  lastGesture: null,
  touchPoints: [],
};

export function getGestureState(): GestureRecognitionState {
  return { ...gestureState };
}

interface TouchTrack {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  id: number;
}

let touchTracks: Map<number, TouchTrack> = new Map();
let gestureCallback: ((gesture: GestureType, data: Record<string, number>) => void) | null = null;

export function initGestureRecognition(
  element: HTMLElement,
  onGesture: (gesture: GestureType, data: Record<string, number>) => void
): () => void {
  const settings = getGestureSettings();
  if (!settings.enabled) return () => {};

  gestureCallback = onGesture;
  gestureState.isTracking = true;

  const handleTouchStart = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      touchTracks.set(touch.identifier, {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        currentX: touch.clientX,
        currentY: touch.clientY,
        id: touch.identifier,
      });
    }
    gestureState.touchPoints = Array.from(touchTracks.values()).map((t) => ({
      x: t.currentX,
      y: t.currentY,
      id: t.id,
    }));
  };

  const handleTouchMove = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const track = touchTracks.get(touch.identifier);
      if (track) {
        track.currentX = touch.clientX;
        track.currentY = touch.clientY;
      }
    }
    gestureState.touchPoints = Array.from(touchTracks.values()).map((t) => ({
      x: t.currentX,
      y: t.currentY,
      id: t.id,
    }));
  };

  const handleTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const track = touchTracks.get(touch.identifier);
      if (track) {
        const dx = touch.clientX - track.startX;
        const dy = touch.clientY - track.startY;
        const duration = Date.now() - track.startTime;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Determine gesture
        if (distance > settings.swipeThreshold) {
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          let gesture: GestureType;

          if (absDx > absDy) {
            gesture = dx > 0 ? 'swipe_right' : 'swipe_left';
          } else {
            gesture = dy > 0 ? 'swipe_down' : 'swipe_up';
          }

          gestureState.lastGesture = gesture;
          gestureState.currentGesture = null;
          if (gestureCallback) {
            gestureCallback(gesture, { dx, dy, distance, duration });
          }
        } else if (duration > settings.longPressDelay && distance < 20) {
          gestureState.lastGesture = 'long_press';
          if (gestureCallback) {
            gestureCallback('long_press', {
              x: touch.clientX,
              y: touch.clientY,
              duration,
            });
          }
        } else if (distance < 20 && duration < 300) {
          // Simple tap
          gestureState.lastGesture = 'tap';
          if (gestureCallback) {
            gestureCallback('tap', {
              x: touch.clientX,
              y: touch.clientY,
              duration,
            });
          }
        }

        touchTracks.delete(touch.identifier);
      }
    }
    gestureState.touchPoints = Array.from(touchTracks.values()).map((t) => ({
      x: t.currentX,
      y: t.currentY,
      id: t.id,
    }));
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
    gestureState.isTracking = false;
    touchTracks.clear();
  };
}

// ─── Eye Tracking (Simulated) ────────────────────────────────────────────────

let eyeState: EyeTrackingState = {
  isCalibrated: false,
  isTracking: false,
  currentGaze: null,
  dwellTarget: null,
  dwellProgress: 0,
  calibrationQuality: 0,
  blinkRate: 0,
  fixations: [],
};

export function getEyeTrackingState(): EyeTrackingState {
  return { ...eyeState };
}

let dwellTimer: ReturnType<typeof setTimeout> | null = null;
let dwellStartTime = 0;

export function simulateEyeTracking(
  onDwell: (elementId: string) => void,
  onGazeUpdate: (point: GazePoint) => void
): () => void {
  const settings = getEyeTrackingSettings();
  if (!settings.enabled) return () => {};

  eyeState.isTracking = true;

  const handleMouseMove = (e: MouseEvent) => {
    const point: GazePoint = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
      confidence: 0.85 + Math.random() * 0.15,
      pupilDiameter: 4 + Math.random() * 2,
    };

    eyeState.currentGaze = point;
    onGazeUpdate(point);

    // Check for dwell target
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const targetId =
      element?.getAttribute('data-symbol-id') ||
      element?.closest('[data-symbol-id]')?.getAttribute('data-symbol-id');

    if (targetId) {
      if (eyeState.dwellTarget === targetId) {
        const elapsed = Date.now() - dwellStartTime;
        eyeState.dwellProgress = Math.min(elapsed / settings.dwellTime, 1);

        if (elapsed >= settings.dwellTime && dwellTimer === null) {
          onDwell(targetId);
          eyeState.dwellTarget = null;
          eyeState.dwellProgress = 0;
          dwellStartTime = 0;
        }
      } else {
        eyeState.dwellTarget = targetId;
        dwellStartTime = Date.now();
        eyeState.dwellProgress = 0;
      }
    } else {
      eyeState.dwellTarget = null;
      eyeState.dwellProgress = 0;
    }
  };

  document.addEventListener('mousemove', handleMouseMove);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    eyeState.isTracking = false;
    if (dwellTimer) {
      clearTimeout(dwellTimer);
      dwellTimer = null;
    }
  };
}

export function calibrateEyeTracking(): Promise<number> {
  // Simulated calibration — returns quality score
  return new Promise((resolve) => {
    setTimeout(() => {
      const quality = 0.7 + Math.random() * 0.3;
      eyeState.isCalibrated = true;
      eyeState.calibrationQuality = quality;
      resolve(quality);
    }, 2000);
  });
}

// ─── Head Tracking (Simulated via mouse) ─────────────────────────────────────

let headState: HeadTrackingState = {
  isTracking: false,
  currentPose: null,
  cursorPosition: { x: 0, y: 0 },
  isCalibrated: false,
  centerPose: null,
};

export function getHeadTrackingState(): HeadTrackingState {
  return { ...headState };
}

export function simulateHeadTracking(
  onCursorMove: (x: number, y: number) => void
): () => void {
  const settings = getHeadTrackingSettings();
  if (!settings.enabled) return () => {};

  headState.isTracking = true;

  // Simulate head tracking with mouse position relative to center
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const handleMouseMove = (e: MouseEvent) => {
    const dx = (e.clientX - centerX) * settings.sensitivity * settings.cursorSpeed;
    const dy = (e.clientY - centerY) * settings.sensitivity * settings.cursorSpeed;

    const x = settings.invertX ? centerX - dx : centerX + dx;
    const y = settings.invertY ? centerY - dy : centerY + dy;

    // Apply boundary behavior
    let finalX = x;
    let finalY = y;

    if (settings.boundaryBehavior === 'stop') {
      finalX = Math.max(0, Math.min(window.innerWidth, x));
      finalY = Math.max(0, Math.min(window.innerHeight, y));
    } else if (settings.boundaryBehavior === 'wrap') {
      finalX = ((x % window.innerWidth) + window.innerWidth) % window.innerWidth;
      finalY = ((y % window.innerHeight) + window.innerHeight) % window.innerHeight;
    }

    headState.cursorPosition = { x: finalX, y: finalY };
    headState.currentPose = {
      yaw: dx * 0.1,
      pitch: dy * 0.1,
      roll: 0,
      timestamp: Date.now(),
    };

    onCursorMove(finalX, finalY);
  };

  document.addEventListener('mousemove', handleMouseMove);

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    headState.isTracking = false;
  };
}

// ─── Keyboard Shortcut Management ────────────────────────────────────────────

export function addKeyboardShortcut(data: {
  keys: string;
  action: string;
  description: string;
  category: KeyboardShortcut['category'];
}): KeyboardShortcut {
  const shortcut: KeyboardShortcut = {
    id: generateId('kb'),
    ...data,
    enabled: true,
  };
  const settings = getKeyboardSettings();
  settings.shortcuts.push(shortcut);
  saveData(STORAGE_KEYS.KEYBOARD, settings);
  return shortcut;
}

export function removeKeyboardShortcut(id: string): void {
  const settings = getKeyboardSettings();
  settings.shortcuts = settings.shortcuts.filter((s) => s.id !== id);
  saveData(STORAGE_KEYS.KEYBOARD, settings);
}

export function toggleKeyboardShortcut(id: string): void {
  const settings = getKeyboardSettings();
  const shortcut = settings.shortcuts.find((s) => s.id === id);
  if (shortcut) {
    shortcut.enabled = !shortcut.enabled;
    saveData(STORAGE_KEYS.KEYBOARD, settings);
  }
}

// ─── Gesture Mapping Management ──────────────────────────────────────────────

export function addGestureMapping(data: {
  gesture: GestureType;
  action: string;
  sensitivity: number;
}): GestureMapping {
  const mapping: GestureMapping = {
    id: generateId('gm'),
    gesture: data.gesture,
    action: data.action,
    parameters: {},
    enabled: true,
    sensitivity: data.sensitivity,
  };
  const settings = getGestureSettings();
  settings.mappings.push(mapping);
  saveData(STORAGE_KEYS.GESTURE, settings);
  return mapping;
}

export function removeGestureMapping(id: string): void {
  const settings = getGestureSettings();
  settings.mappings = settings.mappings.filter((m) => m.id !== id);
  saveData(STORAGE_KEYS.GESTURE, settings);
}

// ─── Switch Configuration ────────────────────────────────────────────────────

export function addSwitchConfig(data: {
  name: string;
  key: string;
  action: string;
}): SwitchConfig {
  const config: SwitchConfig = {
    id: generateId('sw'),
    name: data.name,
    key: data.key,
    action: data.action as SwitchConfig['action'],
    holdTime: 0,
    debounce: 100,
  };
  const settings = getSwitchSettings();
  settings.switches.push(config);
  saveData(STORAGE_KEYS.SWITCH, settings);
  return config;
}

export function removeSwitchConfig(id: string): void {
  const settings = getSwitchSettings();
  settings.switches = settings.switches.filter((s) => s.id !== id);
  saveData(STORAGE_KEYS.SWITCH, settings);
}

// ─── Input Event Logging ─────────────────────────────────────────────────────

export function logInputEvent(
  type: InputEventType,
  mode: InputMode,
  target: string | null,
  data: Record<string, unknown> = {},
  success: boolean = true,
  duration: number = 0
): InputEvent {
  const event: InputEvent = {
    id: generateId('ie'),
    type,
    mode,
    timestamp: new Date().toISOString(),
    target,
    data,
    success,
    duration,
  };

  const history = loadData<InputEvent[]>(STORAGE_KEYS.HISTORY, []);
  history.push(event);
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
  saveData(STORAGE_KEYS.HISTORY, history);

  return event;
}

export function getInputHistory(): InputEvent[] {
  return loadData(STORAGE_KEYS.HISTORY, []);
}

// ─── Input Mode Analytics ────────────────────────────────────────────────────

export function getInputModeAnalytics(): InputModeAnalytics[] {
  const history = getInputHistory();
  const modes = new Map<InputMode, InputModeAnalytics>();

  const allModes: InputMode[] = [
    'touch', 'voice', 'switch', 'eye_tracking',
    'gesture', 'keyboard', 'mouse', 'head_tracking',
  ];

  for (const mode of allModes) {
    const events = history.filter((e) => e.mode === mode);
    const successful = events.filter((e) => e.success);
    const durations = events.map((e) => e.duration).filter((d) => d > 0);

    // Daily breakdown
    const dailyMap = new Map<string, number>();
    for (const event of events) {
      const date = event.timestamp.slice(0, 10);
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    }

    modes.set(mode, {
      mode,
      totalInteractions: events.length,
      successRate: events.length > 0 ? successful.length / events.length : 0,
      averageResponseTime:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
      errorRate:
        events.length > 0
          ? (events.length - successful.length) / events.length
          : 0,
      usageDuration: durations.reduce((a, b) => a + b, 0),
      lastUsed:
        events.length > 0 ? events[events.length - 1].timestamp : '',
      dailyBreakdown: Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  }

  return Array.from(modes.values());
}

export function getPerformanceMetrics(): InputPerformanceMetrics {
  const history = getInputHistory();
  const successful = history.filter((e) => e.success);
  const durations = history.map((e) => e.duration).filter((d) => d > 0);

  const modeDistribution: Record<InputMode, number> = {} as Record<InputMode, number>;
  for (const event of history) {
    modeDistribution[event.mode] =
      (modeDistribution[event.mode] || 0) + 1;
  }

  // Calculate SPM from successful symbol selections
  const symbolSelections = successful.filter(
    (e) => e.type === 'symbol_selected'
  );
  const totalDuration = durations.reduce((a, b) => a + b, 0);
  const spm =
    totalDuration > 0
      ? (symbolSelections.length / totalDuration) * 60000
      : 0;

  // Find peak time
  const hourCounts = new Map<number, number>();
  for (const event of history) {
    const hour = new Date(event.timestamp).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }
  let peakHour = 12;
  let peakCount = 0;
  for (const [hour, count] of hourCounts) {
    if (count > peakCount) {
      peakHour = hour;
      peakCount = count;
    }
  }

  return {
    overallAccuracy:
      history.length > 0 ? successful.length / history.length : 0,
    averageSelectionTime:
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0,
    symbolsPerMinute: spm,
    errorsPerSession: history.filter((e) => !e.success).length,
    fatigueFactor: 0, // Computed from deceleration patterns
    modeDistribution,
    peakPerformanceTime: `${peakHour.toString().padStart(2, '0')}:00`,
    sessionDuration: totalDuration,
  };
}

// ─── Mode Management ─────────────────────────────────────────────────────────

export function getModeConfigs(): InputModeConfig[] {
  const settings = getMultiModalSettings();
  const allModes: InputMode[] = [
    'touch', 'voice', 'switch', 'eye_tracking',
    'gesture', 'keyboard', 'mouse', 'head_tracking',
  ];

  return allModes.map((mode, i) => ({
    mode,
    enabled: settings.activeModes.includes(mode),
    priority: i,
    status: settings.activeModes.includes(mode) ? 'active' : 'inactive' as InputModeStatus,
    lastUsed: null,
    settings: {},
  }));
}

export function enableMode(mode: InputMode): void {
  const settings = getMultiModalSettings();
  if (!settings.activeModes.includes(mode)) {
    settings.activeModes.push(mode);
    saveData(STORAGE_KEYS.SETTINGS, settings);
  }
}

export function disableMode(mode: InputMode): void {
  const settings = getMultiModalSettings();
  settings.activeModes = settings.activeModes.filter((m) => m !== mode);
  saveData(STORAGE_KEYS.SETTINGS, settings);
}

export function setPrimaryMode(mode: InputMode): void {
  const settings = getMultiModalSettings();
  settings.primaryMode = mode;
  if (!settings.activeModes.includes(mode)) {
    settings.activeModes.push(mode);
  }
  saveData(STORAGE_KEYS.SETTINGS, settings);
}

// ─── Reset ───────────────────────────────────────────────────────────────────

export function resetAllSettings(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const multiModalService = {
  // Settings
  getMultiModalSettings,
  updateMultiModalSettings,
  getVoiceSettings,
  updateVoiceSettings,
  getSwitchSettings,
  updateSwitchSettings,
  getGestureSettings,
  updateGestureSettings,
  getEyeTrackingSettings,
  updateEyeTrackingSettings,
  getHeadTrackingSettings,
  updateHeadTrackingSettings,
  getKeyboardSettings,
  updateKeyboardSettings,

  // Voice
  isVoiceAvailable,
  initVoiceRecognition,
  startVoiceRecognition,
  stopVoiceRecognition,
  getVoiceState,
  getVoiceCommands,
  addVoiceCommand,
  removeVoiceCommand,
  toggleVoiceCommand,
  matchVoiceCommand,

  // Switch access
  getScanState,
  startScanning,
  handleSwitchInput,
  stopScanning,
  addSwitchConfig,
  removeSwitchConfig,

  // Gesture
  getGestureState,
  initGestureRecognition,
  addGestureMapping,
  removeGestureMapping,

  // Eye tracking
  getEyeTrackingState,
  simulateEyeTracking,
  calibrateEyeTracking,

  // Head tracking
  getHeadTrackingState,
  simulateHeadTracking,

  // Keyboard
  addKeyboardShortcut,
  removeKeyboardShortcut,
  toggleKeyboardShortcut,

  // Events / Analytics
  logInputEvent,
  getInputHistory,
  getInputModeAnalytics,
  getPerformanceMetrics,

  // Mode management
  getModeConfigs,
  enableMode,
  disableMode,
  setPrimaryMode,

  // Reset
  resetAllSettings,
};
