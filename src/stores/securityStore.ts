import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ContentFilterLevel,
  ContentCategory,
  ContentFilterRule,
  ContentFilterResult,
  ValidationResult,
  InputType,
  AuditEventType,
  AuditSeverity,
  AuditLogEntry,
  PrivacySettings,
  DataCategory,
  DataInventoryItem,
  EncryptedData,
  SecuritySettings,
  SecurityAlert,
} from '@/types/security';
import { securityService } from '@/services/securityService';

// ─── Store State ─────────────────────────────────────────────────────────────

interface SecurityStoreState {
  // Settings
  settings: SecuritySettings;
  securityScore: number;

  // Content filtering
  contentFilterRules: ContentFilterRule[];

  // Audit log
  auditLog: AuditLogEntry[];

  // Alerts
  alerts: SecurityAlert[];
  unreadAlertCount: number;

  // Data inventory
  dataInventory: DataInventoryItem[];
  totalStorageUsed: number;

  // UI state
  activeTab: string;
  isInitialized: boolean;
  error: string | null;
}

interface SecurityStoreActions {
  // Init
  initialize(): void;

  // Settings
  updateSettings(updates: Partial<SecuritySettings>): void;
  updatePrivacySettings(updates: Partial<PrivacySettings>): void;
  setContentFilterLevel(level: ContentFilterLevel): void;
  resetSettings(): void;

  // Content filtering
  filterContent(content: string): ContentFilterResult;
  addFilterRule(data: {
    category: ContentCategory;
    pattern: string;
    severity: 'block' | 'warn' | 'flag';
    description: string;
  }): void;
  removeFilterRule(id: string): void;
  toggleFilterRule(id: string): void;
  refreshFilterRules(): void;

  // Input validation
  validateInput(input: string, type: InputType): ValidationResult;
  sanitize(input: string): string;

  // Audit logging
  logEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    description: string,
    metadata?: Record<string, string | number | boolean>
  ): void;
  refreshAuditLog(): void;
  clearAuditLog(): void;

  // Alerts
  refreshAlerts(): void;
  dismissAlert(id: string): void;
  clearDismissedAlerts(): void;

  // Data inventory
  refreshDataInventory(): void;
  deleteDataCategory(category: DataCategory): void;
  purgeOldData(): { purgedCategories: string[]; purgedItems: number };

  // Encryption
  encryptData(data: string, password: string): Promise<EncryptedData>;
  decryptData(encrypted: EncryptedData, password: string): Promise<string>;

  // UI
  setActiveTab(tab: string): void;
  clearError(): void;
}

type SecurityStore = SecurityStoreState & SecurityStoreActions;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSecurityStore = create<SecurityStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      settings: securityService.getSettings(),
      securityScore: 0,
      contentFilterRules: [],
      auditLog: [],
      alerts: [],
      unreadAlertCount: 0,
      dataInventory: [],
      totalStorageUsed: 0,
      activeTab: 'overview',
      isInitialized: false,
      error: null,

      // ── Init ──
      initialize() {
        try {
          const settings = securityService.getSettings();
          const rules = securityService.getContentFilterRules();
          const log = securityService.getAuditLog();
          const alerts = securityService.getSecurityAlerts();
          const inventory = securityService.getDataInventory();
          const storage = securityService.getTotalStorageUsed();
          const score = securityService.calculateSecurityScore();

          set({
            settings,
            contentFilterRules: rules,
            auditLog: log,
            alerts,
            unreadAlertCount: alerts.filter((a) => !a.dismissed).length,
            dataInventory: inventory,
            totalStorageUsed: storage,
            securityScore: score,
            isInitialized: true,
            error: null,
          });

          // Auto-purge old data if configured
          if (settings.privacySettings.autoDeleteOnPeriod) {
            securityService.purgeOldData();
          }
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to initialize security',
            isInitialized: true,
          });
        }
      },

      // ── Settings ──
      updateSettings(updates) {
        try {
          const updated = securityService.updateSettings(updates);
          set({
            settings: updated,
            securityScore: securityService.calculateSecurityScore(),
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Settings update failed' });
        }
      },

      updatePrivacySettings(updates) {
        try {
          const updated = securityService.updatePrivacySettings(updates);
          set({
            settings: updated,
            securityScore: securityService.calculateSecurityScore(),
          });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Privacy update failed' });
        }
      },

      setContentFilterLevel(level) {
        get().updateSettings({ contentFilterLevel: level });
      },

      resetSettings() {
        const settings = securityService.resetSettings();
        set({
          settings,
          securityScore: securityService.calculateSecurityScore(),
        });
      },

      // ── Content Filtering ──
      filterContent(content) {
        return securityService.filterContent(content);
      },

      addFilterRule(data) {
        try {
          securityService.addContentFilterRule(data);
          set({ contentFilterRules: securityService.getContentFilterRules() });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to add filter' });
        }
      },

      removeFilterRule(id) {
        securityService.removeContentFilterRule(id);
        set({ contentFilterRules: securityService.getContentFilterRules() });
      },

      toggleFilterRule(id) {
        securityService.toggleContentFilterRule(id);
        set({ contentFilterRules: securityService.getContentFilterRules() });
      },

      refreshFilterRules() {
        set({ contentFilterRules: securityService.getContentFilterRules() });
      },

      // ── Input Validation ──
      validateInput(input, type) {
        return securityService.validateInput(input, type);
      },

      sanitize(input) {
        return securityService.sanitizeInput(input);
      },

      // ── Audit Log ──
      logEvent(eventType, severity, description, metadata = {}) {
        securityService.logAuditEvent(eventType, severity, description, metadata);
        get().refreshAuditLog();

        if (severity === 'critical') {
          get().refreshAlerts();
        }
      },

      refreshAuditLog() {
        const log = securityService.getAuditLog();
        set({ auditLog: log });
      },

      clearAuditLog() {
        securityService.clearAuditLog();
        set({ auditLog: [] });
      },

      // ── Alerts ──
      refreshAlerts() {
        const alerts = securityService.getSecurityAlerts();
        set({
          alerts,
          unreadAlertCount: alerts.filter((a) => !a.dismissed).length,
        });
      },

      dismissAlert(id) {
        securityService.dismissSecurityAlert(id);
        get().refreshAlerts();
      },

      clearDismissedAlerts() {
        securityService.clearDismissedAlerts();
        get().refreshAlerts();
      },

      // ── Data Inventory ──
      refreshDataInventory() {
        set({
          dataInventory: securityService.getDataInventory(),
          totalStorageUsed: securityService.getTotalStorageUsed(),
        });
      },

      deleteDataCategory(category) {
        securityService.deleteDataCategory(category);
        get().refreshDataInventory();
      },

      purgeOldData() {
        const result = securityService.purgeOldData();
        get().refreshDataInventory();
        get().refreshAuditLog();
        return result;
      },

      // ── Encryption ──
      async encryptData(data, password) {
        return securityService.encryptData(data, password);
      },

      async decryptData(encrypted, password) {
        return securityService.decryptData(encrypted, password);
      },

      // ── UI ──
      setActiveTab(tab) {
        set({ activeTab: tab });
      },

      clearError() {
        set({ error: null });
      },
    }),
    {
      name: 'talkboard_security_store',
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    }
  )
);
