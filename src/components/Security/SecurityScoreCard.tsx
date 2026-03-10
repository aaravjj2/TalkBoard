import { useSecurityStore } from '@/stores/securityStore';

export default function SecurityScoreCard() {
  const { securityScore, settings, alerts, auditLog } = useSecurityStore();

  const unreadAlerts = alerts.filter((a) => !a.dismissed).length;
  const criticalAlerts = alerts.filter(
    (a) => !a.dismissed && a.type === 'critical'
  ).length;

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    if (score >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  // Score breakdown
  const breakdown = [
    {
      label: 'Content Filtering',
      value:
        settings.contentFilterLevel === 'strict'
          ? 20
          : settings.contentFilterLevel === 'high'
            ? 15
            : settings.contentFilterLevel === 'medium'
              ? 10
              : settings.contentFilterLevel === 'low'
                ? 5
                : 0,
      max: 20,
    },
    {
      label: 'Input Validation',
      value: (settings.inputValidationStrict ? 10 : 0) + (settings.sanitizeAllInputs ? 5 : 0),
      max: 15,
    },
    {
      label: 'Audit Logging',
      value: settings.enableAuditLog ? 15 : 0,
      max: 15,
    },
    {
      label: 'Privacy',
      value:
        (settings.privacySettings.consentGiven ? 5 : 0) +
        (!settings.privacySettings.collectSentenceHistory ? 5 : 0) +
        (settings.privacySettings.anonymizeExports ? 5 : 0) +
        (settings.privacySettings.autoDeleteOnPeriod ? 5 : 0),
      max: 20,
    },
    {
      label: 'Encryption',
      value:
        (settings.encryptionConfig.enabled ? 10 : 0) +
        (settings.encryptionConfig.encryptExports ? 5 : 0),
      max: 15,
    },
    {
      label: 'Session Security',
      value:
        (settings.sessionSecurity.requireReauthOnSensitive ? 5 : 0) +
        (settings.sessionSecurity.sessionTimeoutMinutes <= 60 ? 5 : 0) +
        (settings.rateLimiting.maxLoginAttempts <= 5 ? 5 : 0),
      max: 15,
    },
  ];

  // SVG Ring Progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (securityScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Main Score */}
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={getScoreRingColor(securityScore)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
          </div>
        </div>
        <div>
          <h3 className={`text-xl font-bold ${getScoreColor(securityScore)}`}>
            {getScoreLabel(securityScore)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Security score based on your current settings and configuration
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Filter Level"
          value={settings.contentFilterLevel}
          icon="🛡️"
        />
        <StatCard
          label="Audit Entries"
          value={auditLog.length.toString()}
          icon="📝"
        />
        <StatCard
          label="Active Alerts"
          value={unreadAlerts.toString()}
          icon="🔔"
          highlight={criticalAlerts > 0}
        />
        <StatCard
          label="Data Retention"
          value={`${settings.privacySettings.dataRetentionDays}d`}
          icon="📅"
        />
      </div>

      {/* Score Breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Score Breakdown
        </h4>
        <div className="space-y-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300 w-36">
                {item.label}
              </span>
              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.value === item.max
                      ? 'bg-green-500'
                      : item.value >= item.max * 0.5
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                {item.value}/{item.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Recommendations
        </h4>
        <div className="space-y-2">
          {breakdown
            .filter((item) => item.value < item.max)
            .map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
              >
                <span className="text-blue-500 mt-0.5">💡</span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Improve <strong>{item.label}</strong>: Currently {item.value}/
                  {item.max} points. Enable additional settings to increase your score.
                </span>
              </div>
            ))}
          {breakdown.every((item) => item.value === item.max) && (
            <p className="text-sm text-green-600 dark:text-green-400 text-center py-2">
              🎉 All security features are maximally configured!
            </p>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      {unreadAlerts > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Active Alerts ({unreadAlerts})
          </h4>
          <div className="space-y-2">
            {alerts
              .filter((a) => !a.dismissed)
              .slice(0, 5)
              .map((alert) => (
                <AlertRow key={alert.id} alert={alert} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        highlight
          ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span role="img" aria-label={label}>
          {icon}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p
        className={`text-lg font-bold capitalize ${
          highlight
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-white'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function AlertRow({
  alert,
}: {
  alert: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  };
}) {
  const { dismissAlert } = useSecurityStore();

  const typeColor =
    alert.type === 'critical'
      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
      : alert.type === 'warning'
        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';

  return (
    <div className={`p-3 rounded-lg border-l-4 ${typeColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {alert.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {alert.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => dismissAlert(alert.id)}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
