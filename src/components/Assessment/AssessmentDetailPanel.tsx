import React from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';
import { DOMAIN_LABELS, DOMAIN_ICONS, PROFICIENCY_LABELS, PROFICIENCY_COLORS, PROFICIENCY_ORDER, type ProficiencyLevel } from '../../types/assessment';

export const AssessmentDetailPanel: React.FC = () => {
  const { assessments, selectedAssessmentId, updateItem, selectAssessment } = useAssessmentStore();
  const assessment = assessments.find(a => a.id === selectedAssessmentId);

  if (!assessment) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p>Select an assessment from the list to view details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{assessment.title}</h3>
        <button onClick={() => selectAssessment(null)} className="text-sm text-emerald-600 hover:underline">Back to List</button>
      </div>

      {/* Notes & Recommendations */}
      {assessment.overallNotes && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Overall Notes</h4>
          <p className="text-sm text-blue-600 dark:text-blue-400">{assessment.overallNotes}</p>
        </div>
      )}

      {assessment.recommendations.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Recommendations</h4>
          <ul className="space-y-1">
            {assessment.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-green-600 dark:text-green-400">• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {assessment.nextSteps.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Next Steps</h4>
          <ul className="space-y-1">
            {assessment.nextSteps.map((s, i) => (
              <li key={i} className="text-sm text-purple-600 dark:text-purple-400">→ {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Assessment Items */}
      <h4 className="font-semibold text-gray-700 dark:text-gray-300">Assessment Items ({assessment.items.length})</h4>
      <div className="space-y-3">
        {assessment.items.map(item => (
          <div key={item.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{DOMAIN_ICONS[item.domain]}</span>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.skill}</span>
                  <span className="text-xs ml-2 text-gray-400">{DOMAIN_LABELS[item.domain]}</span>
                </div>
              </div>
              <select
                value={item.proficiency}
                onChange={e => updateItem(assessment.id, item.id, { proficiency: e.target.value as ProficiencyLevel })}
                className="text-sm px-2 py-1 rounded-lg border"
                style={{ borderColor: PROFICIENCY_COLORS[item.proficiency], color: PROFICIENCY_COLORS[item.proficiency] }}
              >
                {PROFICIENCY_ORDER.map(level => (
                  <option key={level} value={level}>{PROFICIENCY_LABELS[level]}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 mb-2">{item.description}</p>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>Attempts: {item.attempts}</span>
              <span>Success: {Math.round(item.successRate * 100)}%</span>
              {item.previousProficiency && (
                <span>
                  Previous: <span style={{ color: PROFICIENCY_COLORS[item.previousProficiency] }}>{PROFICIENCY_LABELS[item.previousProficiency]}</span>
                  → <span style={{ color: PROFICIENCY_COLORS[item.proficiency] }}>{PROFICIENCY_LABELS[item.proficiency]}</span>
                </span>
              )}
            </div>
            {item.notes && <div className="text-xs text-gray-400 mt-1 italic">{item.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
