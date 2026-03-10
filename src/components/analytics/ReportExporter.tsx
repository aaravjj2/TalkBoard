/**
 * ReportExporter — Export analytics data as CSV or JSON with download.
 */

import { useState } from 'react';
import type { ReportPeriod } from '@/types/analytics';

interface ReportExporterProps {
  onExportCSV: (period: ReportPeriod) => string;
  onExportJSON: (period: ReportPeriod) => string;
  period: ReportPeriod;
}

export default function ReportExporter({
  onExportCSV,
  onExportJSON,
  period,
}: ReportExporterProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleExportCSV() {
    setExporting('csv');
    try {
      const csv = onExportCSV(period);
      const date = new Date().toISOString().split('T')[0];
      downloadFile(csv, `talkboard-analytics-${date}.csv`, 'text/csv');
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  }

  function handleExportJSON() {
    setExporting('json');
    try {
      const json = onExportJSON(period);
      const date = new Date().toISOString().split('T')[0];
      downloadFile(json, `talkboard-report-${date}.json`, 'application/json');
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportCSV}
        disabled={exporting !== null}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
          rounded-lg border transition-all duration-200
          ${exporting === 'csv'
            ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
        `}
      >
        {exporting === 'csv' ? '✓ Downloaded' : '📊 Export CSV'}
      </button>

      <button
        onClick={handleExportJSON}
        disabled={exporting !== null}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
          rounded-lg border transition-all duration-200
          ${exporting === 'json'
            ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
        `}
      >
        {exporting === 'json' ? '✓ Downloaded' : '📋 Export JSON'}
      </button>
    </div>
  );
}
