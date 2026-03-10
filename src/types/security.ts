/**
 * Security & Privacy Types — Type definitions for security, content filtering,
 * data encryption, audit logging, and privacy controls.
 */

// ─── Content Filtering ──────────────────────────────────────────────────────

export type ContentFilterLevel = 'none' | 'low' | 'medium' | 'high' | 'strict';

export type ContentCategory =
  | 'profanity'
  | 'violence'
  | 'sexual'
  | 'discrimination'
  | 'self_harm'
  | 'substance'
  | 'personal_info'
  | 'custom';

export interface ContentFilterRule {
  id: string;
  category: ContentCategory;
  pattern: string; // regex pattern or keyword
  severity: 'block' | 'warn' | 'flag';
  isActive: boolean;
  isCustom: boolean;
  createdAt: string;
  description: string;
}

export interface ContentFilterResult {
  isAllowed: boolean;
  flags: ContentFlag[];
  sanitizedContent: string;
  matchedRules: string[];
}

export interface ContentFlag {
  ruleId: string;
  category: ContentCategory;
  severity: 'block' | 'warn' | 'flag';
  matchedText: string;
  position: number;
}

// ─── Input Validation ────────────────────────────────────────────────────────

export type InputType =
  | 'text'
  | 'pin'
  | 'name'
  | 'email'
  | 'url'
  | 'number'
  | 'symbol_id'
  | 'category_id'
  | 'phone';

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  type: InputType;
  maxLength: number;
  minLength: number;
  pattern?: string;
  allowedChars?: string;
  blockedPatterns?: string[];
  customValidator?: (input: string) => boolean;
}

// ─── Encryption ──────────────────────────────────────────────────────────────

export type EncryptionAlgorithm = 'aes-gcm' | 'aes-cbc' | 'none';

export interface EncryptionConfig {
  algorithm: EncryptionAlgorithm;
  keyLength: 128 | 192 | 256;
  enabled: boolean;
  encryptStorage: boolean;
  encryptExports: boolean;
}

export interface EncryptedData {
  version: number;
  algorithm: EncryptionAlgorithm;
  iv: string; // base64
  data: string; // base64
  tag?: string; // base64 for GCM
  salt: string; // base64
  iterations: number;
}

// ─── Audit Logging ───────────────────────────────────────────────────────────

export type AuditEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'pin_changed'
  | 'pin_reset'
  | 'settings_changed'
  | 'data_exported'
  | 'data_imported'
  | 'data_cleared'
  | 'content_blocked'
  | 'content_flagged'
  | 'unauthorized_access'
  | 'session_expired'
  | 'encryption_key_generated'
  | 'profile_created'
  | 'profile_deleted'
  | 'restriction_applied'
  | 'restriction_removed'
  | 'lockout_triggered'
  | 'lockout_cleared'
  | 'privacy_mode_changed'
  | 'filter_rule_added'
  | 'filter_rule_removed';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  description: string;
  actor: string;
  metadata: Record<string, string | number | boolean>;
  ipAddress?: string;
  userAgent?: string;
}

// ─── Privacy Controls ────────────────────────────────────────────────────────

export type DataCategory =
  | 'usage_stats'
  | 'sentence_history'
  | 'symbol_preferences'
  | 'learning_data'
  | 'session_data'
  | 'profile_data'
  | 'caregiver_data'
  | 'analytics_data';

export interface PrivacySettings {
  dataRetentionDays: number;
  enableDataCollection: boolean;
  collectUsageStats: boolean;
  collectSentenceHistory: boolean;
  collectSymbolPreferences: boolean;
  collectLearningData: boolean;
  anonymizeExports: boolean;
  autoDeleteOnPeriod: boolean;
  deleteOlderThanDays: number;
  showPrivacyDashboard: boolean;
  consentGiven: boolean;
  consentTimestamp: string | null;
  lastDataPurge: string | null;
}

export interface DataInventoryItem {
  category: DataCategory;
  label: string;
  description: string;
  itemCount: number;
  storageSize: number; // bytes
  oldestEntry: string | null;
  newestEntry: string | null;
  isCollectionEnabled: boolean;
}

// ─── Security Settings ───────────────────────────────────────────────────────

export interface SecuritySettings {
  contentFilterLevel: ContentFilterLevel;
  customFilterRules: ContentFilterRule[];
  inputValidationStrict: boolean;
  encryptionConfig: EncryptionConfig;
  privacySettings: PrivacySettings;
  enableAuditLog: boolean;
  auditLogRetentionDays: number;
  maxAuditLogEntries: number;
  rateLimiting: {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    windowMinutes: number;
  };
  sessionSecurity: {
    sessionTimeoutMinutes: number;
    requireReauthOnSensitive: boolean;
    maxConcurrentSessions: number;
  };
  cspEnabled: boolean;
  sanitizeAllInputs: boolean;
}

// ─── Security State ──────────────────────────────────────────────────────────

export interface SecurityState {
  isInitialized: boolean;
  settings: SecuritySettings;
  auditLog: AuditLogEntry[];
  contentFilterRules: ContentFilterRule[];
  dataInventory: DataInventoryItem[];
  totalStorageUsed: number;
  lastSecurityScan: string | null;
  securityScore: number; // 0-100
  alerts: SecurityAlert[];
}

export interface SecurityAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  timestamp: string;
  dismissed: boolean;
  actionRequired: boolean;
}
