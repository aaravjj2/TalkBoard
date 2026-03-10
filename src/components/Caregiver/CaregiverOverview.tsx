/**
 * CaregiverOverview — Dashboard overview tab showing summary stats, recent activity,
 * active goals, and quick actions.
 */
import { useMemo } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';

export default function CaregiverOverview() {
  const {
    profiles,
    goals,
    restrictions,
    notes,
    activityLog,
    isInQuietHours,
    setDashboardTab,
    generateReport,
    reportPeriod,
  } = useCaregiverStore();

  const activeGoals = useMemo(() => goals.filter((g) => g.status === 'active'), [goals]);
  const achievedGoals = useMemo(() => goals.filter((g) => g.status === 'achieved'), [goals]);
  const activeRestrictions = useMemo(() => restrictions.filter((r) => r.isActive), [restrictions]);
  const highPriorityNotes = useMemo(() => notes.filter((n) => n.priority === 'high' && !n.isArchived), [notes]);
  const recentActivity = useMemo(() => activityLog.slice(-5).reverse(), [activityLog]);

  const stats = useMemo(
    () => [
      {
        label: 'Active Goals',
        value: activeGoals.length,
        total: goals.length,
        icon: '🎯',
        color: 'from-blue-500 to-blue-600',
        tab: 'goals',
      },
      {
        label: 'Restrictions',
        value: activeRestrictions.length,
        total: restrictions.length,
        icon: '🛡️',
        color: 'from-purple-500 to-purple-600',
        tab: 'restrictions',
      },
      {
        label: 'Notes',
        value: notes.length,
        total: undefined,
        icon: '📝',
        color: 'from-green-500 to-green-600',
        tab: 'notes',
      },
      {
        label: 'Profiles',
        value: profiles.length,
        total: undefined,
        icon: '👥',
        color: 'from-orange-500 to-orange-600',
        tab: 'profiles',
      },
    ],
    [activeGoals.length, goals.length, activeRestrictions.length, restrictions.length, notes.length, profiles.length]
  );

  const handleGenerateReport = () => {
    generateReport(reportPeriod.start, reportPeriod.end);
    setDashboardTab('reports');
  };

  return (
    <div className="space-y-6">
      {/* Quiet Hours Alert */}
      {isInQuietHours && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">Quiet Hours Active</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Communication is currently restricted during quiet hours.
            </p>
          </div>
        </div>
      )}

      {/* High Priority Notes Alert */}
      {highPriorityNotes.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-red-900 dark:text-red-200 flex items-center gap-2">
              <span>🚨</span> High Priority Notes ({highPriorityNotes.length})
            </h3>
            <button
              onClick={() => setDashboardTab('notes')}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              View All
            </button>
          </div>
          <ul className="space-y-1">
            {highPriorityNotes.slice(0, 3).map((note) => (
              <li key={note.id} className="text-sm text-red-700 dark:text-red-300">
                • {note.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setDashboardTab(stat.tab)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 
              dark:border-gray-700 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} 
                flex items-center justify-center text-white font-bold text-lg`}>
                {stat.value}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{stat.label}</p>
            {stat.total !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.value} of {stat.total} active
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🎯</span> Active Goals
            </h3>
            <button
              onClick={() => setDashboardTab('goals')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-sm">No active goals</p>
              <button
                onClick={() => setDashboardTab('goals')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                Create a goal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 4).map((goal) => {
                const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {goal.title}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress >= 100
                            ? 'bg-green-500'
                            : progress >= 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Achieved Goals Summary */}
          {achievedGoals.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ {achievedGoals.length} goal{achievedGoals.length !== 1 ? 's' : ''} achieved
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📋</span> Recent Activity
            </h3>
            <button
              onClick={() => setDashboardTab('activity')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    entry.actor === 'caregiver' ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {entry.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Goal', icon: '🎯', tab: 'goals', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
            { label: 'Add Note', icon: '📝', tab: 'notes', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
            { label: 'View Report', icon: '📊', action: handleGenerateReport, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
            { label: 'Settings', icon: '⚙️', tab: 'settings', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => action.action ? action.action() : setDashboardTab(action.tab!)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl ${action.color} 
                hover:opacity-80 transition-opacity font-medium text-sm`}
            >
              <span className="text-lg">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return new Date(isoString).toLocaleDateString();
}
