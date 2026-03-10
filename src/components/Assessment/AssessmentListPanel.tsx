import React, { useState } from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_TYPE_ICONS,
  type AssessmentType,
  type AssessmentStatus,
} from '../../types/assessment';

const STATUS_COLORS: Record<AssessmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  reviewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export const AssessmentListPanel: React.FC = () => {
  const { assessments, createAssessment, selectAssessment, selectedAssessmentId } = useAssessmentStore();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AssessmentType>('vocabulary');
  const [assessor, setAssessor] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim() || !assessor.trim()) return;
    createAssessment(newTitle.trim(), newType, assessor.trim(), null);
    setNewTitle(''); setAssessor(''); setShowNew(false);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Assessments ({assessments.length})
        </h3>
        <button onClick={() => setShowNew(!showNew)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
          {showNew ? 'Cancel' : '+ New Assessment'}
        </button>
      </div>

      {showNew && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Assessment title" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          <div className="flex gap-2">
            <select value={newType} onChange={e => setNewType(e.target.value as AssessmentType)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              {(Object.keys(ASSESSMENT_TYPE_LABELS) as AssessmentType[]).map(t => (
                <option key={t} value={t}>{ASSESSMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
            <input value={assessor} onChange={e => setAssessor(e.target.value)} placeholder="Assessor name" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Create</button>
        </div>
      )}

      <div className="space-y-3">
        {assessments.map(a => (
          <div
            key={a.id}
            onClick={() => selectAssessment(selectedAssessmentId === a.id ? null : a.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedAssessmentId === a.id
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ASSESSMENT_TYPE_ICONS[a.type]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{a.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {ASSESSMENT_TYPE_LABELS[a.type]} · {a.assessorName} · {a.items.length} items
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Created {formatDate(a.createdAt)}
                  {a.completedAt && ` · Completed ${formatDate(a.completedAt)}`}
                </div>
              </div>
              {a.status === 'completed' && (
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-600">{a.duration}min</div>
                  <div className="text-xs text-gray-400">{a.recommendations.length} recs</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
