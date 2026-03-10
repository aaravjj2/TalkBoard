/**
 * LearningSessionPanel — Shows current learning session stats.
 */
import { useAdaptiveLearningStore } from '@/stores/adaptiveLearningStore';

export default function LearningSessionPanel() {
  const {
    currentSession,
    predictionAccuracy,
    sessionHistory,
    startSession,
    endSession,
  } = useAdaptiveLearningStore();

  const recentSessions = sessionHistory.slice(-10).reverse();

  return (
    <div className="space-y-6" data-testid="learning-session-panel">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Learning Sessions
      </h3>

      {/* Current Session */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
        dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Current Session</h4>
          {currentSession ? (
            <button
              onClick={endSession}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg
                hover:bg-red-600 transition-colors"
            >
              End Session
            </button>
          ) : (
            <button
              onClick={startSession}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg
                hover:bg-green-600 transition-colors"
            >
              Start Session
            </button>
          )}
        </div>

        {currentSession ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSession.symbolsUsed.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Symbols Used</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSession.sentencesBuilt.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sentences</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSession.newSymbolsIntroduced.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">New Symbols</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(predictionAccuracy * 100)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Prediction Accuracy</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No active learning session. Start one to track your usage patterns.
          </p>
        )}
      </div>

      {/* Session History */}
      {recentSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
          dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Recent Sessions
          </h4>
          <div className="space-y-2">
            {recentSessions.map((session) => {
              const duration = session.endTime
                ? Math.round(
                    (new Date(session.endTime).getTime() -
                      new Date(session.startTime).getTime()) /
                      60000
                  )
                : 0;

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50
                    dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(session.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {duration} min · {session.symbolsUsed.length} symbols ·{' '}
                      {session.sentencesBuilt.length} sentences
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.round(session.predictionAccuracy * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">accuracy</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Stats from History */}
      {sessionHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200
          dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Overall Statistics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {sessionHistory.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Sessions</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sessionHistory.reduce((sum, s) => sum + s.symbolsUsed.length, 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Symbols</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(
                  (sessionHistory.reduce((sum, s) => sum + s.predictionAccuracy, 0) /
                    sessionHistory.length) *
                    100
                )}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Accuracy</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
