import React, { useEffect } from 'react';
import { useAssessmentStore } from '../stores/assessmentStore';
import {
  AssessmentOverview,
  AssessmentListPanel,
  AssessmentDetailPanel,
  GoalsPanel,
  ProgressTrackingPanel,
  ReportsPanel,
  BenchmarksPanel,
} from '../components/Assessment';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'assessments', label: 'Assessments', icon: '📋' },
  { id: 'goals', label: 'Goals', icon: '🎯' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'benchmarks', label: 'Benchmarks', icon: '📐' },
  { id: 'reports', label: 'Reports', icon: '📄' },
];

const AssessmentPage: React.FC = () => {
  const { activeTab, setActiveTab, initialize, assessments, goals, selectedAssessmentId } = useAssessmentStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const completedCount = assessments.filter(a => a.status === 'completed').length;
  const activeGoals = goals.filter(g => g.isActive).length;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <AssessmentOverview />;
      case 'assessments': return selectedAssessmentId ? <AssessmentDetailPanel /> : <AssessmentListPanel />;
      case 'goals': return <GoalsPanel />;
      case 'progress': return <ProgressTrackingPanel />;
      case 'benchmarks': return <BenchmarksPanel />;
      case 'reports': return <ReportsPanel />;
      default: return <AssessmentOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">📊 Assessment & Reporting</h1>
        <p className="text-emerald-100 text-sm mb-3">Track skills, set goals, and generate progress reports</p>
        <div className="flex gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">📋 {completedCount} completed assessments</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">🎯 {activeGoals} active goals</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">📄 {assessments.length} total</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {renderTab()}
      </div>
    </div>
  );
};

export default AssessmentPage;
