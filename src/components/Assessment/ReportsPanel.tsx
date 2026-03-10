import React from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';

export const ReportsPanel: React.FC = () => {
  const { reports, reportConfigs, generateReport } = useAssessmentStore();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Reports</h3>

      {/* Report Templates */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Templates</h4>
        <div className="grid gap-3">
          {reportConfigs.map(config => (
            <div key={config.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">{config.title}</div>
                <div className="text-sm text-gray-500">
                  {config.format} · {config.includeDomains.length} domains
                  {config.generatedAt && ` · Last: ${formatDate(config.generatedAt)}`}
                </div>
              </div>
              <button
                onClick={() => generateReport(config.id)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
              >
                📄 Generate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Reports */}
      <div>
        <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Generated Reports ({reports.length})</h4>
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📄</div>
            <p>No reports generated yet. Use a template above to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{report.title}</div>
                      <div className="text-sm text-gray-500">
                        Generated: {formatDate(report.generatedAt)} · {report.format} · {report.content.length} sections
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                      {report.format}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{report.summary}</p>
                </div>

                <div className="p-4 space-y-4">
                  {report.content.map((section, i) => (
                    <div key={i}>
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{section.title}</h5>
                      {section.type === 'list' ? (
                        <ul className="space-y-1">
                          {section.content.split('\n').map((line, j) => (
                            <li key={j} className="text-sm text-gray-600 dark:text-gray-400">• {line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{section.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
