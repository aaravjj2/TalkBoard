/**
 * caregiverService — Manages caregiver mode, authentication, sessions,
 * user monitoring, and configuration capabilities.
 *
 * Features:
 * - PIN-based authentication
 * - Timed sessions with auto-expiry
 * - Activity monitoring and logging
 * - Remote configuration of user settings
 * - Symbol visibility control per user
 * - Usage report generation
 * - Caregiver audit log
 */

import { v4 as uuidv4 } from 'uuid';

// ─── Storage Keys ────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  CAREGIVER_PIN: 'talkboard_caregiver_pin',
  CAREGIVER_SESSION: 'talkboard_caregiver_session',
  CAREGIVER_SETTINGS: 'talkboard_caregiver_settings',
  CAREGIVER_ACTIVITY_LOG: 'talkboard_caregiver_activity_log',
  CAREGIVER_PROFILES: 'talkboard_caregiver_profiles',
  CAREGIVER_RESTRICTIONS: 'talkboard_caregiver_restrictions',
  CAREGIVER_SCHEDULES: 'talkboard_caregiver_schedules',
  CAREGIVER_GOALS: 'talkboard_caregiver_goals',
  CAREGIVER_NOTES: 'talkboard_caregiver_notes',
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CaregiverProfile {
  id: string;
  name: string;
  role: 'parent' | 'therapist' | 'teacher' | 'aide' | 'other';
  email: string;
  phone: string;
  avatar: string;
  permissions: CaregiverPermissions;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

export interface CaregiverPermissions {
  canEditSymbols: boolean;
  canEditBoards: boolean;
  canEditSettings: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canSetRestrictions: boolean;
  canSetGoals: boolean;
  canViewActivityLog: boolean;
}

export interface CaregiverSession {
  id: string;
  caregiverId: string;
  authenticatedAt: string;
  expiresAt: string;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface CaregiverSettings {
  sessionDuration: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  requirePinOnEachVisit: boolean;
  autoLogoutOnIdle: boolean;
  idleTimeout: number; // minutes
  showActivityLog: boolean;
  enableNotifications: boolean;
  notifyOnGoalProgress: boolean;
  notifyOnUnusualActivity: boolean;
  restrictedMode: boolean;
  allowedCategories: string[];
  blockedSymbolIds: string[];
  maxSymbolsPerSentence: number;
  requireSupervisedMode: boolean;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  actor: 'user' | 'caregiver';
  actorId?: string;
  description: string;
  metadata: Record<string, string | number | boolean>;
  category: 'communication' | 'navigation' | 'settings' | 'symbols' | 'session';
}

export type ActivityType =
  | 'symbol_selected'
  | 'sentence_generated'
  | 'sentence_spoken'
  | 'category_changed'
  | 'page_visited'
  | 'settings_changed'
  | 'symbol_added'
  | 'symbol_removed'
  | 'symbol_hidden'
  | 'symbol_shown'
  | 'board_modified'
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_expired'
  | 'restriction_set'
  | 'goal_created'
  | 'goal_updated'
  | 'goal_achieved'
  | 'note_added';

export interface CommunicationRestriction {
  id: string;
  type: 'time_limit' | 'category_lock' | 'symbol_block' | 'sentence_limit' | 'quiet_hours';
  name: string;
  description: string;
  isActive: boolean;
  config: RestrictionConfig;
  createdAt: string;
  createdBy: string;
}

export type RestrictionConfig =
  | TimeLimitConfig
  | CategoryLockConfig
  | SymbolBlockConfig
  | SentenceLimitConfig
  | QuietHoursConfig;

interface TimeLimitConfig {
  type: 'time_limit';
  maxMinutesPerDay: number;
  maxMinutesPerSession: number;
}

interface CategoryLockConfig {
  type: 'category_lock';
  allowedCategories: string[];
  reason: string;
}

interface SymbolBlockConfig {
  type: 'symbol_block';
  blockedSymbolIds: string[];
  reason: string;
}

interface SentenceLimitConfig {
  type: 'sentence_limit';
  maxSentencesPerHour: number;
  maxSymbolsPerSentence: number;
}

interface QuietHoursConfig {
  type: 'quiet_hours';
  startTime: string; // HH:mm
  endTime: string;
  daysOfWeek: number[]; // 0-6
  allowEmergency: boolean;
}

export interface CommunicationGoal {
  id: string;
  title: string;
  description: string;
  type: 'symbol_usage' | 'sentence_length' | 'category_exploration' | 'daily_usage' | 'vocabulary_growth' | 'custom';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'achieved' | 'paused' | 'expired';
  milestones: GoalMilestone[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  value: number;
  label: string;
  achievedAt: string | null;
}

export interface CaregiverNote {
  id: string;
  title: string;
  content: string;
  category: 'observation' | 'progress' | 'concern' | 'reminder' | 'general';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface UsageReport {
  period: { start: string; end: string };
  totalSessions: number;
  totalDuration: number; // minutes
  totalSentences: number;
  totalSymbolSelections: number;
  uniqueSymbolsUsed: number;
  averageSessionDuration: number;
  averageSentenceLength: number;
  topSymbols: { id: string; label: string; count: number }[];
  topCategories: { id: string; label: string; count: number }[];
  dailyUsage: { date: string; sessions: number; sentences: number; duration: number }[];
  goalProgress: { goalId: string; title: string; progress: number; target: number }[];
  communicationTrends: {
    vocabularyGrowth: number;
    sentenceLengthTrend: number;
    usageFrequencyTrend: number;
  };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Default Settings ────────────────────────────────────────────────────────

const defaultSettings: CaregiverSettings = {
  sessionDuration: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  requirePinOnEachVisit: true,
  autoLogoutOnIdle: true,
  idleTimeout: 30,
  showActivityLog: true,
  enableNotifications: true,
  notifyOnGoalProgress: true,
  notifyOnUnusualActivity: true,
  restrictedMode: false,
  allowedCategories: [],
  blockedSymbolIds: [],
  maxSymbolsPerSentence: 20,
  requireSupervisedMode: false,
};

const DEFAULT_PERMISSIONS: CaregiverPermissions = {
  canEditSymbols: true,
  canEditBoards: true,
  canEditSettings: true,
  canViewAnalytics: true,
  canExportData: true,
  canManageUsers: false,
  canSetRestrictions: true,
  canSetGoals: true,
  canViewActivityLog: true,
};

// ─── PIN Management ──────────────────────────────────────────────────────────

let loginAttempts = 0;
let lockoutUntil: number | null = null;

export function isPinSet(): boolean {
  return localStorage.getItem(STORAGE_KEYS.CAREGIVER_PIN) !== null;
}

export function setPin(pin: string): boolean {
  if (pin.length < 4 || pin.length > 8) return false;
  if (!/^\d+$/.test(pin)) return false;

  // Store a simple hash (not for serious security — just parental lock)
  const hash = simpleHash(pin);
  localStorage.setItem(STORAGE_KEYS.CAREGIVER_PIN, hash);
  logActivity('settings_changed', 'caregiver', 'PIN updated', 'settings');
  return true;
}

export function verifyPin(pin: string): boolean {
  const now = Date.now();

  // Check lockout
  if (lockoutUntil && now < lockoutUntil) {
    logActivity('login_failure', 'caregiver', 'Login attempted during lockout', 'session');
    return false;
  }

  const storedHash = localStorage.getItem(STORAGE_KEYS.CAREGIVER_PIN);
  if (!storedHash) return false;

  const hash = simpleHash(pin);
  if (hash === storedHash) {
    loginAttempts = 0;
    lockoutUntil = null;
    return true;
  }

  loginAttempts++;
  const settings = getSettings();

  if (loginAttempts >= settings.maxLoginAttempts) {
    lockoutUntil = now + settings.lockoutDuration * 60 * 1000;
    logActivity('login_failure', 'caregiver', `Account locked after ${loginAttempts} failed attempts`, 'session');
    loginAttempts = 0;
  } else {
    logActivity('login_failure', 'caregiver', `Failed login attempt (${loginAttempts}/${settings.maxLoginAttempts})`, 'session');
  }

  return false;
}

export function removePin(): void {
  localStorage.removeItem(STORAGE_KEYS.CAREGIVER_PIN);
  logActivity('settings_changed', 'caregiver', 'PIN removed', 'settings');
}

export function isLockedOut(): boolean {
  return lockoutUntil !== null && Date.now() < lockoutUntil;
}

export function getLockoutRemainingMs(): number {
  if (!lockoutUntil) return 0;
  return Math.max(0, lockoutUntil - Date.now());
}

// Simple hash for PIN (not cryptographic — just obfuscation for parental lock)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `ph_${Math.abs(hash).toString(36)}`;
}

// ─── Session Management ──────────────────────────────────────────────────────

export function createSession(caregiverId?: string): CaregiverSession {
  const settings = getSettings();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + settings.sessionDuration * 60 * 1000);

  const session: CaregiverSession = {
    id: uuidv4(),
    caregiverId: caregiverId || 'default',
    authenticatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
  };

  saveData(STORAGE_KEYS.CAREGIVER_SESSION, session);
  logActivity('login_success', 'caregiver', 'Caregiver session started', 'session', { caregiverId: caregiverId || 'default' });
  return session;
}

export function getActiveSession(): CaregiverSession | null {
  const session = loadData<CaregiverSession | null>(STORAGE_KEYS.CAREGIVER_SESSION, null);
  if (!session || !session.isActive) return null;

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    endSession();
    logActivity('session_expired', 'caregiver', 'Session expired', 'session');
    return null;
  }

  return session;
}

export function extendSession(minutes?: number): CaregiverSession | null {
  const session = getActiveSession();
  if (!session) return null;

  const settings = getSettings();
  const extension = minutes || settings.sessionDuration;
  const newExpiry = new Date(Date.now() + extension * 60 * 1000);

  session.expiresAt = newExpiry.toISOString();
  saveData(STORAGE_KEYS.CAREGIVER_SESSION, session);
  return session;
}

export function endSession(): void {
  const session = loadData<CaregiverSession | null>(STORAGE_KEYS.CAREGIVER_SESSION, null);
  if (session) {
    session.isActive = false;
    saveData(STORAGE_KEYS.CAREGIVER_SESSION, session);
    logActivity('logout', 'caregiver', 'Caregiver session ended', 'session');
  }
}

export function isSessionActive(): boolean {
  return getActiveSession() !== null;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSettings(): CaregiverSettings {
  return loadData<CaregiverSettings>(STORAGE_KEYS.CAREGIVER_SETTINGS, { ...defaultSettings });
}

export function updateSettings(updates: Partial<CaregiverSettings>): CaregiverSettings {
  const current = getSettings();
  const updated = { ...current, ...updates };
  saveData(STORAGE_KEYS.CAREGIVER_SETTINGS, updated);
  logActivity('settings_changed', 'caregiver', 'Caregiver settings updated', 'settings', {
    changedFields: Object.keys(updates).join(', '),
  });
  return updated;
}

export function resetSettings(): CaregiverSettings {
  saveData(STORAGE_KEYS.CAREGIVER_SETTINGS, { ...defaultSettings });
  return { ...defaultSettings };
}

// ─── Caregiver Profiles ──────────────────────────────────────────────────────

export function getProfiles(): CaregiverProfile[] {
  return loadData<CaregiverProfile[]>(STORAGE_KEYS.CAREGIVER_PROFILES, []);
}

export function getProfile(id: string): CaregiverProfile | undefined {
  return getProfiles().find((p) => p.id === id);
}

export function createProfile(data: {
  name: string;
  role: CaregiverProfile['role'];
  email?: string;
  phone?: string;
  avatar?: string;
  permissions?: Partial<CaregiverPermissions>;
}): CaregiverProfile {
  const profiles = getProfiles();
  const now = new Date().toISOString();

  const profile: CaregiverProfile = {
    id: `caregiver_${uuidv4()}`,
    name: data.name,
    role: data.role,
    email: data.email || '',
    phone: data.phone || '',
    avatar: data.avatar || getDefaultAvatar(data.role),
    permissions: { ...DEFAULT_PERMISSIONS, ...data.permissions },
    createdAt: now,
    lastLoginAt: now,
    isActive: true,
  };

  profiles.push(profile);
  saveData(STORAGE_KEYS.CAREGIVER_PROFILES, profiles);
  logActivity('settings_changed', 'caregiver', `Created caregiver profile: ${data.name}`, 'settings');
  return profile;
}

export function updateProfile(
  id: string,
  updates: Partial<Omit<CaregiverProfile, 'id' | 'createdAt'>>
): CaregiverProfile | null {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === id);
  if (index === -1) return null;

  profiles[index] = { ...profiles[index], ...updates };
  saveData(STORAGE_KEYS.CAREGIVER_PROFILES, profiles);
  return profiles[index];
}

export function deleteProfile(id: string): boolean {
  const profiles = getProfiles();
  const filtered = profiles.filter((p) => p.id !== id);
  if (filtered.length === profiles.length) return false;
  saveData(STORAGE_KEYS.CAREGIVER_PROFILES, filtered);
  return true;
}

function getDefaultAvatar(role: CaregiverProfile['role']): string {
  const avatars: Record<string, string> = {
    parent: '👨‍👩‍👧',
    therapist: '🩺',
    teacher: '👩‍🏫',
    aide: '🤝',
    other: '👤',
  };
  return avatars[role] || '👤';
}

// ─── Activity Log ────────────────────────────────────────────────────────────

export function logActivity(
  type: ActivityType,
  actor: 'user' | 'caregiver',
  description: string,
  category: ActivityLogEntry['category'],
  metadata: Record<string, string | number | boolean> = {}
): void {
  const log = getActivityLog();
  const entry: ActivityLogEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    type,
    actor,
    description,
    metadata,
    category,
  };

  log.push(entry);

  // Keep only last 1000 entries
  const trimmed = log.length > 1000 ? log.slice(-1000) : log;
  saveData(STORAGE_KEYS.CAREGIVER_ACTIVITY_LOG, trimmed);
}

export function getActivityLog(
  filters?: {
    startDate?: string;
    endDate?: string;
    type?: ActivityType;
    actor?: 'user' | 'caregiver';
    category?: ActivityLogEntry['category'];
    limit?: number;
  }
): ActivityLogEntry[] {
  let log = loadData<ActivityLogEntry[]>(STORAGE_KEYS.CAREGIVER_ACTIVITY_LOG, []);

  if (filters) {
    if (filters.startDate) {
      log = log.filter((e) => e.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      log = log.filter((e) => e.timestamp <= filters.endDate!);
    }
    if (filters.type) {
      log = log.filter((e) => e.type === filters.type);
    }
    if (filters.actor) {
      log = log.filter((e) => e.actor === filters.actor);
    }
    if (filters.category) {
      log = log.filter((e) => e.category === filters.category);
    }
    if (filters.limit) {
      log = log.slice(-filters.limit);
    }
  }

  return log;
}

export function clearActivityLog(): void {
  saveData(STORAGE_KEYS.CAREGIVER_ACTIVITY_LOG, []);
}

// ─── Communication Restrictions ──────────────────────────────────────────────

export function getRestrictions(): CommunicationRestriction[] {
  return loadData<CommunicationRestriction[]>(STORAGE_KEYS.CAREGIVER_RESTRICTIONS, []);
}

export function getRestriction(id: string): CommunicationRestriction | undefined {
  return getRestrictions().find((r) => r.id === id);
}

export function createRestriction(data: {
  type: CommunicationRestriction['type'];
  name: string;
  description: string;
  config: RestrictionConfig;
  isActive?: boolean;
}): CommunicationRestriction {
  const restrictions = getRestrictions();
  const restriction: CommunicationRestriction = {
    id: `restriction_${uuidv4()}`,
    type: data.type,
    name: data.name,
    description: data.description,
    isActive: data.isActive ?? true,
    config: data.config,
    createdAt: new Date().toISOString(),
    createdBy: getActiveSession()?.caregiverId || 'unknown',
  };

  restrictions.push(restriction);
  saveData(STORAGE_KEYS.CAREGIVER_RESTRICTIONS, restrictions);
  logActivity('restriction_set', 'caregiver', `Created restriction: ${data.name}`, 'settings');
  return restriction;
}

export function updateRestriction(
  id: string,
  updates: Partial<Omit<CommunicationRestriction, 'id' | 'createdAt' | 'createdBy'>>
): CommunicationRestriction | null {
  const restrictions = getRestrictions();
  const index = restrictions.findIndex((r) => r.id === id);
  if (index === -1) return null;

  restrictions[index] = { ...restrictions[index], ...updates };
  saveData(STORAGE_KEYS.CAREGIVER_RESTRICTIONS, restrictions);
  return restrictions[index];
}

export function deleteRestriction(id: string): boolean {
  const restrictions = getRestrictions();
  const filtered = restrictions.filter((r) => r.id !== id);
  if (filtered.length === restrictions.length) return false;
  saveData(STORAGE_KEYS.CAREGIVER_RESTRICTIONS, filtered);
  return true;
}

export function isRestricted(symbolId: string, categoryId?: string): boolean {
  const restrictions = getRestrictions().filter((r) => r.isActive);
  const settings = getSettings();

  // Check global blocked symbols
  if (settings.blockedSymbolIds.includes(symbolId)) return true;

  for (const r of restrictions) {
    if (r.config.type === 'symbol_block') {
      if (r.config.blockedSymbolIds.includes(symbolId)) return true;
    }
    if (r.config.type === 'category_lock' && categoryId) {
      if (!r.config.allowedCategories.includes(categoryId)) return true;
    }
  }

  return false;
}

export function isInQuietHours(): boolean {
  const restrictions = getRestrictions().filter(
    (r) => r.isActive && r.config.type === 'quiet_hours'
  );

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentDay = now.getDay();

  for (const r of restrictions) {
    const config = r.config as QuietHoursConfig;
    if (!config.daysOfWeek.includes(currentDay)) continue;

    if (config.startTime <= config.endTime) {
      // Same day range (e.g., 22:00 - 06:00 would be handled as cross-day)
      if (currentTime >= config.startTime && currentTime <= config.endTime) {
        return true;
      }
    } else {
      // Cross-midnight range
      if (currentTime >= config.startTime || currentTime <= config.endTime) {
        return true;
      }
    }
  }

  return false;
}

// ─── Communication Goals ─────────────────────────────────────────────────────

export function getGoals(): CommunicationGoal[] {
  return loadData<CommunicationGoal[]>(STORAGE_KEYS.CAREGIVER_GOALS, []);
}

export function getGoal(id: string): CommunicationGoal | undefined {
  return getGoals().find((g) => g.id === id);
}

export function createGoal(data: {
  title: string;
  description: string;
  type: CommunicationGoal['type'];
  target: number;
  unit: string;
  endDate?: string;
  milestones?: { value: number; label: string }[];
}): CommunicationGoal {
  const goals = getGoals();
  const now = new Date().toISOString();

  const goal: CommunicationGoal = {
    id: `goal_${uuidv4()}`,
    title: data.title,
    description: data.description,
    type: data.type,
    target: data.target,
    current: 0,
    unit: data.unit,
    startDate: now,
    endDate: data.endDate || null,
    status: 'active',
    milestones: (data.milestones || []).map((m) => ({
      id: uuidv4(),
      value: m.value,
      label: m.label,
      achievedAt: null,
    })),
    createdBy: getActiveSession()?.caregiverId || 'unknown',
    createdAt: now,
    updatedAt: now,
  };

  goals.push(goal);
  saveData(STORAGE_KEYS.CAREGIVER_GOALS, goals);
  logActivity('goal_created', 'caregiver', `Created goal: ${data.title}`, 'settings');
  return goal;
}

export function updateGoalProgress(id: string, progress: number): CommunicationGoal | null {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return null;

  const goal = { ...goals[index] };
  goal.current = progress;
  goal.updatedAt = new Date().toISOString();

  // Check milestones
  for (const milestone of goal.milestones) {
    if (!milestone.achievedAt && progress >= milestone.value) {
      milestone.achievedAt = new Date().toISOString();
      logActivity('goal_updated', 'caregiver', `Milestone reached: ${milestone.label}`, 'settings');
    }
  }

  // Check if goal achieved
  if (progress >= goal.target && goal.status === 'active') {
    goal.status = 'achieved';
    logActivity('goal_achieved', 'caregiver', `Goal achieved: ${goal.title}`, 'settings');
  }

  goals[index] = goal;
  saveData(STORAGE_KEYS.CAREGIVER_GOALS, goals);
  return goal;
}

export function updateGoal(
  id: string,
  updates: Partial<Omit<CommunicationGoal, 'id' | 'createdAt' | 'createdBy'>>
): CommunicationGoal | null {
  const goals = getGoals();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) return null;

  goals[index] = {
    ...goals[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveData(STORAGE_KEYS.CAREGIVER_GOALS, goals);
  return goals[index];
}

export function deleteGoal(id: string): boolean {
  const goals = getGoals();
  const filtered = goals.filter((g) => g.id !== id);
  if (filtered.length === goals.length) return false;
  saveData(STORAGE_KEYS.CAREGIVER_GOALS, filtered);
  return true;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export function getNotes(includeArchived = false): CaregiverNote[] {
  const notes = loadData<CaregiverNote[]>(STORAGE_KEYS.CAREGIVER_NOTES, []);
  return includeArchived ? notes : notes.filter((n) => !n.isArchived);
}

export function getNote(id: string): CaregiverNote | undefined {
  return loadData<CaregiverNote[]>(STORAGE_KEYS.CAREGIVER_NOTES, []).find((n) => n.id === id);
}

export function createNote(data: {
  title: string;
  content: string;
  category: CaregiverNote['category'];
  priority?: CaregiverNote['priority'];
  tags?: string[];
}): CaregiverNote {
  const notes = loadData<CaregiverNote[]>(STORAGE_KEYS.CAREGIVER_NOTES, []);
  const now = new Date().toISOString();

  const note: CaregiverNote = {
    id: `note_${uuidv4()}`,
    title: data.title,
    content: data.content,
    category: data.category,
    priority: data.priority || 'medium',
    tags: data.tags || [],
    createdBy: getActiveSession()?.caregiverId || 'unknown',
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };

  notes.push(note);
  saveData(STORAGE_KEYS.CAREGIVER_NOTES, notes);
  logActivity('note_added', 'caregiver', `Added note: ${data.title}`, 'settings');
  return note;
}

export function updateNote(
  id: string,
  updates: Partial<Omit<CaregiverNote, 'id' | 'createdAt' | 'createdBy'>>
): CaregiverNote | null {
  const notes = loadData<CaregiverNote[]>(STORAGE_KEYS.CAREGIVER_NOTES, []);
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveData(STORAGE_KEYS.CAREGIVER_NOTES, notes);
  return notes[index];
}

export function deleteNote(id: string): boolean {
  const notes = loadData<CaregiverNote[]>(STORAGE_KEYS.CAREGIVER_NOTES, []);
  const filtered = notes.filter((n) => n.id !== id);
  if (filtered.length === notes.length) return false;
  saveData(STORAGE_KEYS.CAREGIVER_NOTES, filtered);
  return true;
}

export function archiveNote(id: string): boolean {
  return updateNote(id, { isArchived: true }) !== null;
}

export function unarchiveNote(id: string): boolean {
  return updateNote(id, { isArchived: false }) !== null;
}

// ─── Usage Reports ───────────────────────────────────────────────────────────

export function generateUsageReport(startDate: string, endDate: string): UsageReport {
  const log = getActivityLog({
    startDate,
    endDate,
  });

  const symbolSelections = log.filter((e) => e.type === 'symbol_selected');
  const sentencesGenerated = log.filter((e) => e.type === 'sentence_generated');
  const sentencesSpoken = log.filter((e) => e.type === 'sentence_spoken');
  const sessions = log.filter((e) => e.type === 'login_success' || e.type === 'logout');

  // Count unique symbols
  const symbolCounts = new Map<string, { id: string; label: string; count: number }>();
  for (const entry of symbolSelections) {
    const symbolId = entry.metadata.symbolId as string;
    const label = entry.metadata.label as string || symbolId;
    const existing = symbolCounts.get(symbolId);
    if (existing) {
      existing.count++;
    } else {
      symbolCounts.set(symbolId, { id: symbolId, label, count: 1 });
    }
  }

  // Count categories
  const categoryCounts = new Map<string, { id: string; label: string; count: number }>();
  for (const entry of log.filter((e) => e.type === 'category_changed')) {
    const catId = entry.metadata.categoryId as string;
    const label = entry.metadata.label as string || catId;
    const existing = categoryCounts.get(catId);
    if (existing) {
      existing.count++;
    } else {
      categoryCounts.set(catId, { id: catId, label, count: 1 });
    }
  }

  // Daily usage
  const dailyMap = new Map<string, { sessions: number; sentences: number; duration: number }>();
  for (const entry of log) {
    const date = entry.timestamp.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { sessions: 0, sentences: 0, duration: 0 });
    }
    const day = dailyMap.get(date)!;
    if (entry.type === 'login_success') day.sessions++;
    if (entry.type === 'sentence_generated') day.sentences++;
  }

  const topSymbols = [...symbolCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topCategories = [...categoryCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const dailyUsage = [...dailyMap.entries()]
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Goal progress
  const goals = getGoals();
  const goalProgress = goals
    .filter((g) => g.status === 'active')
    .map((g) => ({
      goalId: g.id,
      title: g.title,
      progress: g.current,
      target: g.target,
    }));

  const totalSessions = sessions.filter((e) => e.type === 'login_success').length || 1;

  return {
    period: { start: startDate, end: endDate },
    totalSessions,
    totalDuration: totalSessions * 15, // Estimate 15 min per session
    totalSentences: sentencesGenerated.length + sentencesSpoken.length,
    totalSymbolSelections: symbolSelections.length,
    uniqueSymbolsUsed: symbolCounts.size,
    averageSessionDuration: 15,
    averageSentenceLength: sentencesGenerated.length > 0
      ? symbolSelections.length / sentencesGenerated.length
      : 0,
    topSymbols,
    topCategories,
    dailyUsage,
    goalProgress,
    communicationTrends: {
      vocabularyGrowth: symbolCounts.size,
      sentenceLengthTrend: 0,
      usageFrequencyTrend: 0,
    },
  };
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export function clearAllCaregiverData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  loginAttempts = 0;
  lockoutUntil = null;
}

// ─── Export service object ───────────────────────────────────────────────────

export const caregiverService = {
  isPinSet,
  setPin,
  verifyPin,
  removePin,
  isLockedOut,
  getLockoutRemainingMs,
  createSession,
  getActiveSession,
  extendSession,
  endSession,
  isSessionActive,
  getSettings,
  updateSettings,
  resetSettings,
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  logActivity,
  getActivityLog,
  clearActivityLog,
  getRestrictions,
  getRestriction,
  createRestriction,
  updateRestriction,
  deleteRestriction,
  isRestricted,
  isInQuietHours,
  getGoals,
  getGoal,
  createGoal,
  updateGoalProgress,
  updateGoal,
  deleteGoal,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  archiveNote,
  unarchiveNote,
  generateUsageReport,
  clearAllCaregiverData,
};

export default caregiverService;
