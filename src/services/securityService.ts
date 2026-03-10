/**
 * securityService — Security, content filtering, input validation,
 * audit logging, encryption, and privacy controls for TalkBoard.
 */

import type {
  ContentFilterLevel,
  ContentCategory,
  ContentFilterRule,
  ContentFilterResult,
  ContentFlag,
  InputType,
  ValidationResult,
  ValidationRule,
  EncryptionConfig,
  EncryptedData,
  AuditEventType,
  AuditSeverity,
  AuditLogEntry,
  PrivacySettings,
  DataCategory,
  DataInventoryItem,
  SecuritySettings,
  SecurityAlert,
} from '@/types/security';

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  SECURITY_SETTINGS: 'talkboard_security_settings',
  AUDIT_LOG: 'talkboard_security_audit',
  CONTENT_FILTERS: 'talkboard_security_filters',
  ALERTS: 'talkboard_security_alerts',
} as const;

const MAX_AUDIT_ENTRIES = 1000;
const MAX_ALERTS = 100;

// ─── Default Settings ────────────────────────────────────────────────────────

const defaultPrivacySettings: PrivacySettings = {
  dataRetentionDays: 365,
  enableDataCollection: true,
  collectUsageStats: true,
  collectSentenceHistory: true,
  collectSymbolPreferences: true,
  collectLearningData: true,
  anonymizeExports: false,
  autoDeleteOnPeriod: false,
  deleteOlderThanDays: 90,
  showPrivacyDashboard: true,
  consentGiven: false,
  consentTimestamp: null,
  lastDataPurge: null,
};

const defaultEncryptionConfig: EncryptionConfig = {
  algorithm: 'aes-gcm',
  keyLength: 256,
  enabled: false,
  encryptStorage: false,
  encryptExports: true,
};

const defaultSecuritySettings: SecuritySettings = {
  contentFilterLevel: 'medium',
  customFilterRules: [],
  inputValidationStrict: true,
  encryptionConfig: defaultEncryptionConfig,
  privacySettings: defaultPrivacySettings,
  enableAuditLog: true,
  auditLogRetentionDays: 90,
  maxAuditLogEntries: MAX_AUDIT_ENTRIES,
  rateLimiting: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    windowMinutes: 30,
  },
  sessionSecurity: {
    sessionTimeoutMinutes: 60,
    requireReauthOnSensitive: true,
    maxConcurrentSessions: 1,
  },
  cspEnabled: true,
  sanitizeAllInputs: true,
};

// ─── Built-in Content Filter Patterns ────────────────────────────────────────

const BUILT_IN_FILTERS: ContentFilterRule[] = [
  // Personal info detection
  {
    id: 'filter_email',
    category: 'personal_info',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    severity: 'flag',
    isActive: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    description: 'Detects email addresses',
  },
  {
    id: 'filter_phone',
    category: 'personal_info',
    pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
    severity: 'flag',
    isActive: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    description: 'Detects phone numbers',
  },
  {
    id: 'filter_ssn',
    category: 'personal_info',
    pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
    severity: 'block',
    isActive: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    description: 'Detects social security number patterns',
  },
  {
    id: 'filter_credit_card',
    category: 'personal_info',
    pattern: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\\b',
    severity: 'block',
    isActive: true,
    isCustom: false,
    createdAt: new Date().toISOString(),
    description: 'Detects credit card number patterns',
  },
];

// ─── Validation Rules ────────────────────────────────────────────────────────

const VALIDATION_RULES: Record<InputType, ValidationRule> = {
  text: {
    type: 'text',
    maxLength: 500,
    minLength: 0,
    blockedPatterns: ['<script', 'javascript:', 'onerror=', 'onload='],
  },
  pin: {
    type: 'pin',
    maxLength: 8,
    minLength: 4,
    allowedChars: '0123456789',
  },
  name: {
    type: 'name',
    maxLength: 100,
    minLength: 1,
    pattern: '^[a-zA-Z\\s\\-\\.\']+$',
  },
  email: {
    type: 'email',
    maxLength: 254,
    minLength: 5,
    pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
  },
  url: {
    type: 'url',
    maxLength: 2048,
    minLength: 10,
    pattern: '^https?:\\/\\/',
    blockedPatterns: ['javascript:', 'data:', 'vbscript:'],
  },
  number: {
    type: 'number',
    maxLength: 20,
    minLength: 1,
    allowedChars: '0123456789.,-',
  },
  symbol_id: {
    type: 'symbol_id',
    maxLength: 100,
    minLength: 1,
    pattern: '^[a-zA-Z0-9_\\-]+$',
  },
  category_id: {
    type: 'category_id',
    maxLength: 50,
    minLength: 1,
    pattern: '^[a-zA-Z0-9_\\-]+$',
  },
  phone: {
    type: 'phone',
    maxLength: 20,
    minLength: 7,
    allowedChars: '0123456789+-() ',
  },
};

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
    console.warn(`[Security] Storage write failed for ${key}`);
  }
}

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSettings(): SecuritySettings {
  return loadData(STORAGE_KEYS.SECURITY_SETTINGS, { ...defaultSecuritySettings });
}

export function updateSettings(updates: Partial<SecuritySettings>): SecuritySettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.SECURITY_SETTINGS, updated);
  return updated;
}

export function updatePrivacySettings(
  updates: Partial<PrivacySettings>
): SecuritySettings {
  const current = getSettings();
  const updatedPrivacy = { ...current.privacySettings, ...updates };
  const updated = { ...current, privacySettings: updatedPrivacy };
  saveData(STORAGE_KEYS.SECURITY_SETTINGS, updated);
  return updated;
}

export function resetSettings(): SecuritySettings {
  saveData(STORAGE_KEYS.SECURITY_SETTINGS, { ...defaultSecuritySettings });
  return { ...defaultSecuritySettings };
}

// ─── Input Sanitization ─────────────────────────────────────────────────────

/**
 * Sanitize a string to prevent XSS and injection attacks.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove other control characters (except newline and tab)
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize HTML content — strip all tags.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize URL — only allow http and https protocols.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// ─── Input Validation ────────────────────────────────────────────────────────

export function validateInput(input: string, type: InputType): ValidationResult {
  const rule = VALIDATION_RULES[type];
  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitized = input;

  // Basic sanitization
  sanitized = sanitized.trim();

  // Length checks
  if (sanitized.length < rule.minLength) {
    errors.push(`Minimum length is ${rule.minLength} characters`);
  }
  if (sanitized.length > rule.maxLength) {
    sanitized = sanitized.substring(0, rule.maxLength);
    warnings.push(`Trimmed to ${rule.maxLength} characters`);
  }

  // Allowed chars check
  if (rule.allowedChars) {
    const allowed = new Set(rule.allowedChars.split(''));
    sanitized = sanitized
      .split('')
      .filter((c) => allowed.has(c))
      .join('');
    if (sanitized !== input.trim()) {
      warnings.push('Removed disallowed characters');
    }
  }

  // Pattern check
  if (rule.pattern && sanitized.length > 0) {
    const regex = new RegExp(rule.pattern);
    if (!regex.test(sanitized)) {
      errors.push('Input does not match expected format');
    }
  }

  // Blocked patterns
  if (rule.blockedPatterns) {
    for (const blocked of rule.blockedPatterns) {
      if (sanitized.toLowerCase().includes(blocked.toLowerCase())) {
        errors.push('Input contains blocked content');
        sanitized = sanitized.replace(new RegExp(escapeRegExp(blocked), 'gi'), '');
      }
    }
  }

  // HTML sanitization for text type
  if (type === 'text') {
    sanitized = sanitizeInput(sanitized);
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors,
    warnings,
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Content Filtering ──────────────────────────────────────────────────────

export function getContentFilterRules(): ContentFilterRule[] {
  const custom = loadData<ContentFilterRule[]>(STORAGE_KEYS.CONTENT_FILTERS, []);
  return [...BUILT_IN_FILTERS, ...custom];
}

export function filterContent(content: string): ContentFilterResult {
  const settings = getSettings();
  const level = settings.contentFilterLevel;

  if (level === 'none') {
    return {
      isAllowed: true,
      flags: [],
      sanitizedContent: content,
      matchedRules: [],
    };
  }

  const rules = getContentFilterRules().filter((r) => r.isActive);
  const flags: ContentFlag[] = [];
  const matchedRules: string[] = [];
  let sanitizedContent = content;

  for (const rule of rules) {
    // Skip rules based on filter level
    if (!shouldApplyRule(rule, level)) continue;

    try {
      const regex = new RegExp(rule.pattern, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        flags.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          matchedText: match[0],
          position: match.index,
        });
        matchedRules.push(rule.id);

        if (rule.severity === 'block') {
          sanitizedContent = sanitizedContent.replace(
            match[0],
            '*'.repeat(match[0].length)
          );
        }
      }
    } catch {
      // Invalid regex — skip this rule
      console.warn(`[Security] Invalid filter pattern: ${rule.pattern}`);
    }
  }

  const hasBlocks = flags.some((f) => f.severity === 'block');

  return {
    isAllowed: !hasBlocks,
    flags,
    sanitizedContent,
    matchedRules: [...new Set(matchedRules)],
  };
}

function shouldApplyRule(rule: ContentFilterRule, level: ContentFilterLevel): boolean {
  if (level === 'strict') return true;
  if (level === 'high' && rule.severity !== 'flag') return true;
  if (level === 'medium' && rule.severity === 'block') return true;
  if (level === 'low' && rule.category === 'personal_info' && rule.severity === 'block')
    return true;
  return false;
}

export function addContentFilterRule(data: {
  category: ContentCategory;
  pattern: string;
  severity: 'block' | 'warn' | 'flag';
  description: string;
}): ContentFilterRule {
  const rule: ContentFilterRule = {
    id: generateId('filter'),
    category: data.category,
    pattern: data.pattern,
    severity: data.severity,
    isActive: true,
    isCustom: true,
    createdAt: new Date().toISOString(),
    description: data.description,
  };

  // Validate regex pattern
  try {
    new RegExp(rule.pattern);
  } catch {
    throw new Error('Invalid regex pattern');
  }

  const custom = loadData<ContentFilterRule[]>(STORAGE_KEYS.CONTENT_FILTERS, []);
  custom.push(rule);
  saveData(STORAGE_KEYS.CONTENT_FILTERS, custom);

  logAuditEvent('filter_rule_added', 'info', `Added content filter: ${data.description}`, {
    ruleId: rule.id,
    category: data.category,
    severity: data.severity,
  });

  return rule;
}

export function removeContentFilterRule(id: string): void {
  const custom = loadData<ContentFilterRule[]>(STORAGE_KEYS.CONTENT_FILTERS, []);
  const updated = custom.filter((r) => r.id !== id);
  saveData(STORAGE_KEYS.CONTENT_FILTERS, updated);

  logAuditEvent('filter_rule_removed', 'info', `Removed content filter: ${id}`, { ruleId: id });
}

export function toggleContentFilterRule(id: string): void {
  const custom = loadData<ContentFilterRule[]>(STORAGE_KEYS.CONTENT_FILTERS, []);
  const rule = custom.find((r) => r.id === id);
  if (rule) {
    rule.isActive = !rule.isActive;
    saveData(STORAGE_KEYS.CONTENT_FILTERS, custom);
  }
}

// ─── Audit Logging ───────────────────────────────────────────────────────────

export function getAuditLog(): AuditLogEntry[] {
  return loadData(STORAGE_KEYS.AUDIT_LOG, []);
}

export function logAuditEvent(
  eventType: AuditEventType,
  severity: AuditSeverity,
  description: string,
  metadata: Record<string, string | number | boolean> = {}
): AuditLogEntry {
  const settings = getSettings();
  if (!settings.enableAuditLog) {
    return {
      id: generateId('audit'),
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      description,
      actor: 'system',
      metadata,
    };
  }

  const entry: AuditLogEntry = {
    id: generateId('audit'),
    timestamp: new Date().toISOString(),
    eventType,
    severity,
    description,
    actor: metadata.actor as string || 'system',
    metadata,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  const log = getAuditLog();
  log.push(entry);

  // Trim by count
  if (log.length > settings.maxAuditLogEntries) {
    log.splice(0, log.length - settings.maxAuditLogEntries);
  }

  // Trim by age
  if (settings.auditLogRetentionDays > 0) {
    const cutoff = Date.now() - settings.auditLogRetentionDays * 24 * 60 * 60 * 1000;
    const trimmed = log.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
    saveData(STORAGE_KEYS.AUDIT_LOG, trimmed);
  } else {
    saveData(STORAGE_KEYS.AUDIT_LOG, log);
  }

  // Generate alerts for critical events
  if (severity === 'critical') {
    addSecurityAlert({
      type: 'critical',
      title: `Security Event: ${eventType}`,
      description,
      actionRequired: true,
    });
  }

  return entry;
}

export function clearAuditLog(): void {
  saveData(STORAGE_KEYS.AUDIT_LOG, []);
  logAuditEvent('data_cleared', 'warning', 'Audit log cleared');
}

// ─── Security Alerts ─────────────────────────────────────────────────────────

export function getSecurityAlerts(): SecurityAlert[] {
  return loadData(STORAGE_KEYS.ALERTS, []);
}

export function addSecurityAlert(data: {
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  actionRequired: boolean;
}): SecurityAlert {
  const alert: SecurityAlert = {
    id: generateId('alert'),
    ...data,
    timestamp: new Date().toISOString(),
    dismissed: false,
  };

  const alerts = getSecurityAlerts();
  alerts.push(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts.splice(0, alerts.length - MAX_ALERTS);
  }
  saveData(STORAGE_KEYS.ALERTS, alerts);
  return alert;
}

export function dismissSecurityAlert(id: string): void {
  const alerts = getSecurityAlerts();
  const alert = alerts.find((a) => a.id === id);
  if (alert) {
    alert.dismissed = true;
    saveData(STORAGE_KEYS.ALERTS, alerts);
  }
}

export function clearDismissedAlerts(): void {
  const alerts = getSecurityAlerts().filter((a) => !a.dismissed);
  saveData(STORAGE_KEYS.ALERTS, alerts);
}

// ─── Data Inventory ──────────────────────────────────────────────────────────

export function getDataInventory(): DataInventoryItem[] {
  const inventory: DataInventoryItem[] = [];
  const settings = getSettings();

  const dataStores: Array<{
    category: DataCategory;
    label: string;
    description: string;
    key: string;
    settingKey: keyof PrivacySettings;
  }> = [
    {
      category: 'usage_stats',
      label: 'Usage Statistics',
      description: 'Symbol and category usage frequency data',
      key: 'talkboard_adaptive_usage',
      settingKey: 'collectUsageStats',
    },
    {
      category: 'sentence_history',
      label: 'Sentence History',
      description: 'Previously built sentences',
      key: 'talkboard_sentence_history',
      settingKey: 'collectSentenceHistory',
    },
    {
      category: 'symbol_preferences',
      label: 'Symbol Preferences',
      description: 'Custom symbol positions and board layouts',
      key: 'talkboard_symbol_preferences',
      settingKey: 'collectSymbolPreferences',
    },
    {
      category: 'learning_data',
      label: 'Learning Data',
      description: 'Adaptive learning model and patterns',
      key: 'talkboard_adaptive_frequency',
      settingKey: 'collectLearningData',
    },
    {
      category: 'session_data',
      label: 'Session Data',
      description: 'Learning session history',
      key: 'talkboard_adaptive_sessions',
      settingKey: 'collectLearningData',
    },
    {
      category: 'profile_data',
      label: 'Profile Data',
      description: 'User profiles and settings',
      key: 'talkboard_user',
      settingKey: 'enableDataCollection',
    },
    {
      category: 'caregiver_data',
      label: 'Caregiver Data',
      description: 'Caregiver mode settings, goals, and notes',
      key: 'talkboard_caregiver_settings',
      settingKey: 'enableDataCollection',
    },
    {
      category: 'analytics_data',
      label: 'Analytics Data',
      description: 'Communication analytics and reports',
      key: 'talkboard_analytics',
      settingKey: 'collectUsageStats',
    },
  ];

  for (const store of dataStores) {
    const raw = localStorage.getItem(store.key);
    const size = raw ? new Blob([raw]).size : 0;
    let itemCount = 0;
    let oldestEntry: string | null = null;
    let newestEntry: string | null = null;

    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          itemCount = data.length;
          if (data.length > 0) {
            const timestamps = data
              .map((d: Record<string, string>) => d.timestamp || d.createdAt || d.date)
              .filter(Boolean);
            if (timestamps.length > 0) {
              timestamps.sort();
              oldestEntry = timestamps[0];
              newestEntry = timestamps[timestamps.length - 1];
            }
          }
        } else if (typeof data === 'object') {
          itemCount = Object.keys(data).length;
        }
      } catch {
        // not JSON
      }
    }

    inventory.push({
      category: store.category,
      label: store.label,
      description: store.description,
      itemCount,
      storageSize: size,
      oldestEntry,
      newestEntry,
      isCollectionEnabled:
        settings.privacySettings[store.settingKey] as boolean ?? false,
    });
  }

  return inventory;
}

export function getTotalStorageUsed(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('talkboard_')) {
      const value = localStorage.getItem(key);
      if (value) {
        total += new Blob([value]).size;
      }
    }
  }
  return total;
}

export function deleteDataCategory(category: DataCategory): void {
  const keyMap: Record<DataCategory, string[]> = {
    usage_stats: ['talkboard_adaptive_usage'],
    sentence_history: ['talkboard_sentence_history'],
    symbol_preferences: ['talkboard_symbol_preferences'],
    learning_data: [
      'talkboard_adaptive_frequency',
      'talkboard_adaptive_patterns',
      'talkboard_adaptive_vocab',
      'talkboard_adaptive_vocab_history',
      'talkboard_adaptive_recommendations',
      'talkboard_adaptive_context',
    ],
    session_data: ['talkboard_adaptive_sessions'],
    profile_data: ['talkboard_user'],
    caregiver_data: [
      'talkboard_caregiver_settings',
      'talkboard_caregiver_profiles',
      'talkboard_caregiver_goals',
      'talkboard_caregiver_notes',
      'talkboard_caregiver_restrictions',
      'talkboard_caregiver_activity_log',
    ],
    analytics_data: ['talkboard_analytics'],
  };

  const keys = keyMap[category] || [];
  for (const key of keys) {
    localStorage.removeItem(key);
  }

  logAuditEvent('data_cleared', 'warning', `Deleted data category: ${category}`, {
    category,
  });
}

// ─── Security Score ──────────────────────────────────────────────────────────

export function calculateSecurityScore(): number {
  const settings = getSettings();
  let score = 0;

  // Content filtering (20 points)
  if (settings.contentFilterLevel === 'strict') score += 20;
  else if (settings.contentFilterLevel === 'high') score += 15;
  else if (settings.contentFilterLevel === 'medium') score += 10;
  else if (settings.contentFilterLevel === 'low') score += 5;

  // Input validation (15 points)
  if (settings.inputValidationStrict) score += 10;
  if (settings.sanitizeAllInputs) score += 5;

  // Audit logging (15 points)
  if (settings.enableAuditLog) score += 15;

  // Privacy (20 points)
  if (settings.privacySettings.consentGiven) score += 5;
  if (!settings.privacySettings.collectSentenceHistory) score += 5;
  if (settings.privacySettings.anonymizeExports) score += 5;
  if (settings.privacySettings.autoDeleteOnPeriod) score += 5;

  // Encryption (15 points)
  if (settings.encryptionConfig.enabled) score += 10;
  if (settings.encryptionConfig.encryptExports) score += 5;

  // Session security (15 points)
  if (settings.sessionSecurity.requireReauthOnSensitive) score += 5;
  if (settings.sessionSecurity.sessionTimeoutMinutes <= 60) score += 5;
  if (settings.rateLimiting.maxLoginAttempts <= 5) score += 5;

  return Math.min(score, 100);
}

// ─── Encryption Helpers ──────────────────────────────────────────────────────

let cryptoKey: CryptoKey | null = null;

export async function generateEncryptionKey(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const enc = new TextEncoder();
  const generatedSalt = salt || crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const settings = getSettings();
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: generatedSalt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: settings.encryptionConfig.keyLength,
    },
    false,
    ['encrypt', 'decrypt']
  );

  cryptoKey = key;
  logAuditEvent('encryption_key_generated', 'info', 'Encryption key derived');

  return { key, salt: generatedSalt };
}

export async function encryptData(
  data: string,
  password: string
): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const { key } = await generateEncryptionKey(password, salt);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(data)
  );

  return {
    version: 1,
    algorithm: 'aes-gcm',
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(salt),
    iterations: 100000,
  };
}

export async function decryptData(
  encrypted: EncryptedData,
  password: string
): Promise<string> {
  const salt = base64ToUint8Array(encrypted.salt);
  const { key } = await generateEncryptionKey(password, salt);

  const iv = base64ToUint8Array(encrypted.iv);
  const data = base64ToUint8Array(encrypted.data);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─── Data Purge ──────────────────────────────────────────────────────────────

export function purgeOldData(): { purgedCategories: string[]; purgedItems: number } {
  const settings = getSettings();
  if (!settings.privacySettings.autoDeleteOnPeriod) {
    return { purgedCategories: [], purgedItems: 0 };
  }

  const maxAge = settings.privacySettings.deleteOlderThanDays;
  const cutoff = Date.now() - maxAge * 24 * 60 * 60 * 1000;
  const purgedCategories: string[] = [];
  let purgedItems = 0;

  // Purge audit log
  const auditLog = getAuditLog();
  const filteredAudit = auditLog.filter(
    (e) => new Date(e.timestamp).getTime() >= cutoff
  );
  if (filteredAudit.length < auditLog.length) {
    purgedItems += auditLog.length - filteredAudit.length;
    purgedCategories.push('audit_log');
    saveData(STORAGE_KEYS.AUDIT_LOG, filteredAudit);
  }

  // Update last purge timestamp
  updatePrivacySettings({ lastDataPurge: new Date().toISOString() });

  logAuditEvent('data_cleared', 'info', `Auto-purged ${purgedItems} old data items`, {
    purgedCategories: purgedCategories.join(','),
    purgedItems,
    maxAgeDays: maxAge,
  });

  return { purgedCategories, purgedItems };
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const securityService = {
  // Settings
  getSettings,
  updateSettings,
  updatePrivacySettings,
  resetSettings,

  // Input sanitization
  sanitizeInput,
  stripHtml,
  sanitizeUrl,

  // Input validation
  validateInput,

  // Content filtering
  getContentFilterRules,
  filterContent,
  addContentFilterRule,
  removeContentFilterRule,
  toggleContentFilterRule,

  // Audit logging
  getAuditLog,
  logAuditEvent,
  clearAuditLog,

  // Alerts
  getSecurityAlerts,
  addSecurityAlert,
  dismissSecurityAlert,
  clearDismissedAlerts,

  // Data inventory
  getDataInventory,
  getTotalStorageUsed,
  deleteDataCategory,

  // Security score
  calculateSecurityScore,

  // Encryption
  generateEncryptionKey,
  encryptData,
  decryptData,

  // Data purge
  purgeOldData,
};
