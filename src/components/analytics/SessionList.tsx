/**
 * SessionList — Displays recent communication sessions with details.
 */

import type { SessionRecord } from '@/types/analytics';

interface SessionListProps {
  sessions: SessionRecord[];
  maxItems?: number;
  showDetails?: boolean;
  emptyMessage?: string;
}

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7)
    return `${date.toLocaleDateString([], { weekday: 'short' })}, ${timeStr}`;
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSessionQuality(session: SessionRecord): {
  label: string;
  color: string;
} {
  const symbols = session.symbolsSelected;
  const sentences = session.sentencesGenerated;

  if (symbols >= 20 && sentences >= 5)
    return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
  if (symbols >= 10 && sentences >= 3)
    return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
  if (symbols >= 3)
    return { label: 'Active', color: 'text-yellow-600 dark:text-yellow-400' };
  return { label: 'Brief', color: 'text-gray-500 dark:text-gray-400' };
}

export default function SessionList({
  sessions,
  maxItems = 10,
  showDetails = true,
  emptyMessage = 'No sessions recorded yet',
}: SessionListProps) {
  const displaySessions = sessions.slice(0, maxItems);

  if (displaySessions.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displaySessions.map((session) => {
        const quality = getSessionQuality(session);

        return (
          <div
            key={session.id}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateTime(session.startedAt)}
                </span>
                <span className={`text-[10px] font-medium ${quality.color}`}>
                  {quality.label}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDuration(session.durationMs)}
              </span>
            </div>

            {showDetails && (
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session.symbolsSelected}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Symbols
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session.sentencesGenerated}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Sentences
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session.sentencesSpoken}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Spoken
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {session.categoriesVisited.length}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Categories
                  </p>
                </div>
              </div>
            )}

            {session.errorsEncountered > 0 && (
              <p className="text-[10px] text-red-500 mt-1">
                {session.errorsEncountered} error{session.errorsEncountered > 1 ? 's' : ''} encountered
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
