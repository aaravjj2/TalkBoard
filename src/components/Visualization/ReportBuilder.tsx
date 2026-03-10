// ─── Report Builder ─────────────────────────────────────────────────────────
// UI for creating custom reports from templates or scratch.

import { useState } from 'react';
import { useVisualizationStore } from '../../stores/visualizationStore';
import type { DataSourceType, AggregationType } from '../../types/visualization';

export default function ReportBuilder() {
  const { templates, createReport, createReportFromTemplate, timeRange } = useVisualizationStore();

  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dataSource, setDataSource] = useState<DataSourceType>('usage');
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const dataSources: { value: DataSourceType; label: string; icon: string }[] = [
    { value: 'usage', label: 'Usage', icon: '📊' },
    { value: 'communication', label: 'Communication', icon: '💬' },
    { value: 'symbols', label: 'Symbols', icon: '🔤' },
    { value: 'vocabulary', label: 'Vocabulary', icon: '📖' },
    { value: 'sessions', label: 'Sessions', icon: '⏱️' },
    { value: 'goals', label: 'Goals', icon: '🎯' },
    { value: 'input_modes', label: 'Input Modes', icon: '🎮' },
    { value: 'learning', label: 'Learning', icon: '📈' },
    { value: 'performance', label: 'Performance', icon: '⚡' },
  ];

  const aggregations: { value: AggregationType; label: string }[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'count', label: 'Count' },
    { value: 'median', label: 'Median' },
  ];

  function handleCreate() {
    if (mode === 'template' && selectedTemplate) {
      createReportFromTemplate(selectedTemplate);
    } else if (mode === 'custom' && title.trim()) {
      createReport(title.trim(), description.trim(), dataSource, timeRange, aggregation);
    }
  }

  const categoryColors: Record<string, string> = {
    usage: '#3B82F6',
    progress: '#10B981',
    communication: '#8B5CF6',
    accessibility: '#F59E0B',
    custom: '#6B7280',
  };

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('template')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
            ${mode === 'template'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
        >
          📋 From Template
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
            ${mode === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
        >
          ✏️ Custom Report
        </button>
      </div>

      {mode === 'template' ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Choose a Template</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-4 rounded-xl border text-left transition-all
                  ${selectedTemplate === tpl.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: categoryColors[tpl.category] || '#6B7280' }}
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {tpl.category}
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{tpl.name}</h5>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tpl.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {tpl.widgets.length} widget{tpl.widgets.length !== 1 ? 's' : ''}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Custom Report"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this report tracks..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Data Source</label>
            <div className="grid grid-cols-3 gap-2">
              {dataSources.map(ds => (
                <button
                  key={ds.value}
                  onClick={() => setDataSource(ds.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    ${dataSource === ds.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                >
                  <span>{ds.icon}</span>
                  <span>{ds.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Aggregation</label>
            <div className="flex flex-wrap gap-2">
              {aggregations.map(agg => (
                <button
                  key={agg.value}
                  onClick={() => setAggregation(agg.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${aggregation === agg.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                >
                  {agg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={mode === 'template' ? !selectedTemplate : !title.trim()}
        className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
      >
        Create Report
      </button>
    </div>
  );
}
