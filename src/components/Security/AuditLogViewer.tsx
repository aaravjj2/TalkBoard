import { useState, useMemo } from 'react';
import { useSecurityStore } from '@/stores/securityStore';
import type { AuditEventType, AuditSeverity } from '@/types/security';

const SEVERITY_STYLES: Record<AuditSeverity, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
};

const EVENT_ICONS: Partial<Record<AuditEventType, string>> = {
  login_success: '🔓',
  login_failure: '🔒',
  logout: '👋',
  settings_changed: '⚙️',
  data_exported: '📤',
  data_imported: '📥',
  data_cleared: '🗑️',
  filter_rule_added: '➕',
  filter_rule_removed: '➖',
  content_blocked: '🚫',
  encryption_key_generated: '🔑',
  password_changed: '🔐',
  session_expired: '⏰',
  privacy_settings_changed: '🛡️',
  consent_given: '✅',
  consent_revoked: '❌',
  profile_created: '👤',
  profile_deleted: '👤',
  permission_changed: '🔧',
  suspicious_activity: '⚠️',
  system_error: '💥',
};

export default function AuditLogViewer() {
  const { auditLog, refreshAuditLog, clearAuditLog } = useSecurityStore();

  const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | 'all'>('all');
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Get unique event types for filter dropdown
  const eventTypes = useMemo(() => {
    const types = new Set(auditLog.map((e) => e.eventType));
    return Array.from(types).sort();
  }, [auditLog]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let entries = [...auditLog].reverse(); // newest first

    if (filterSeverity !== 'all') {
      entries = entries.filter((e) => e.severity === filterSeverity);
    }

    if (filterEventType !== 'all') {
      entries = entries.filter((e) => e.eventType === filterEventType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q)
      );
    }

    if (dateRange.from) {
      const from = new Date(dateRange.from).getTime();
      entries = entries.filter((e) => new Date(e.timestamp).getTime() >= from);
    }
    if (dateRange.to) {
      const to = new Date(dateRange.to).getTime() + 86400000; // include full day
      entries = entries.filter((e) => new Date(e.timestamp).getTime() <= to);
    }

    return entries;
  }, [auditLog, filterSeverity, filterEventType, searchQuery, dateRange]);

  const handleClear = () => {
    clearAuditLog();
    setShowConfirmClear(false);
  };

  const handleExport = () => {
    const data = JSON.stringify(filteredEntries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talkboard-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof filteredEntries> = {};
    for (const entry of filteredEntries) {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    }
    return groups;
  }, [filteredEntries]);

  return (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Audit Log ({auditLog.length} entries)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => refreshAuditLog()}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={filteredEntries.length === 0}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            Export
          </button>
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200"
            >
              Clear All
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Severity
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AuditSeverity | 'all')}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Event Type
          </label>
          <select
            value={filterEventType}
            onChange={(e) => setFilterEventType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All</option>
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              From
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-2 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              To
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-2 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredEntries.length} of {auditLog.length} entries
      </p>

      {/* Log Entries */}
      <div className="space-y-4">
        {Object.entries(groupedEntries).map(([date, entries]) => (
          <div key={date}>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sticky top-0 bg-white dark:bg-gray-900 py-1">
              {date}
            </h4>
            <div className="space-y-1">
              {entries.map((entry) => (
                <AuditLogRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
        {filteredEntries.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No audit log entries found
          </p>
        )}
      </div>
    </div>
  );
}

function AuditLogRow({
  entry,
}: {
  entry: {
    id: string;
    timestamp: string;
    eventType: AuditEventType;
    severity: AuditSeverity;
    description: string;
    actor: string;
    metadata: Record<string, string | number | boolean>;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const icon = EVENT_ICONS[entry.eventType] || '📝';

  return (
    <div
      className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" role="img" aria-label={entry.eventType}>
          {icon}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">
          {time}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[entry.severity]}`}>
          {entry.severity}
        </span>
        <span className="text-sm text-gray-900 dark:text-white flex-1 truncate">
          {entry.description}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{entry.actor}</span>
      </div>
      {expanded && Object.keys(entry.metadata).length > 0 && (
        <div className="mt-2 ml-8 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono space-y-1">
          {Object.entries(entry.metadata).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-gray-500 dark:text-gray-400">{key}:</span>
              <span className="text-gray-900 dark:text-white">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
