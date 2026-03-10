import React, { useState } from 'react';
import { useAssessmentStore } from '../../stores/assessmentStore';
import { DOMAIN_LABELS, DOMAIN_ICONS, PROFICIENCY_LABELS, PROFICIENCY_COLORS, PROFICIENCY_ORDER, type SkillDomain, type ProficiencyLevel } from '../../types/assessment';

const DOMAINS: SkillDomain[] = ['vocabulary', 'syntax', 'pragmatics', 'receptive_language', 'expressive_language', 'motor', 'cognition'];

export const GoalsPanel: React.FC = () => {
  const { goals, addGoal, updateGoal, addMilestone, achieveMilestone } = useAssessmentStore();
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState('');
  const [domain, setDomain] = useState<SkillDomain>('expressive_language');
  const [targetLevel, setTargetLevel] = useState<ProficiencyLevel>('established');
  const [newMilestone, setNewMilestone] = useState<Record<string, string>>({});

  const handleAdd = () => {
    if (!desc.trim()) return;
    const target = new Date();
    target.setMonth(target.getMonth() + 6);
    addGoal(domain, desc.trim(), target.toISOString(), targetLevel);
    setDesc(''); setShowAdd(false);
  };

  const handleAddMilestone = (goalId: string) => {
    const text = newMilestone[goalId];
    if (!text?.trim()) return;
    addMilestone(goalId, text.trim());
    setNewMilestone(prev => ({ ...prev, [goalId]: '' }));
  };

  const active = goals.filter(g => g.isActive);
  const archived = goals.filter(g => !g.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Goals ({goals.length})</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
          {showAdd ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 space-y-3">
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Goal description" rows={2} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          <div className="flex gap-2">
            <select value={domain} onChange={e => setDomain(e.target.value as SkillDomain)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              {DOMAINS.map(d => <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>)}
            </select>
            <select value={targetLevel} onChange={e => setTargetLevel(e.target.value as ProficiencyLevel)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              {PROFICIENCY_ORDER.map(l => <option key={l} value={l}>{PROFICIENCY_LABELS[l]}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Add Goal</button>
        </div>
      )}

      {active.map(goal => (
        <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{DOMAIN_ICONS[goal.domain]}</span>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 dark:text-gray-200">{goal.description}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {DOMAIN_LABELS[goal.domain]} ·
                <span style={{ color: PROFICIENCY_COLORS[goal.currentLevel] }}> {PROFICIENCY_LABELS[goal.currentLevel]}</span>
                → <span style={{ color: PROFICIENCY_COLORS[goal.targetLevel] }}>{PROFICIENCY_LABELS[goal.targetLevel]}</span>
                · Target: {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-600">{goal.progress}%</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
          </div>

          {/* Milestones */}
          <div className="space-y-1">
            {goal.milestones.sort((a, b) => a.order - b.order).map(m => (
              <div key={m.id} className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => !m.isAchieved && achieveMilestone(goal.id, m.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-colors ${
                    m.isAchieved ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
                  }`}
                >
                  {m.isAchieved && '✓'}
                </button>
                <span className={m.isAchieved ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>{m.description}</span>
                {m.achievedAt && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(m.achievedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Add milestone */}
          <div className="flex gap-2">
            <input
              value={newMilestone[goal.id] || ''}
              onChange={e => setNewMilestone(prev => ({ ...prev, [goal.id]: e.target.value }))}
              placeholder="Add milestone..."
              className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)}
            />
            <button onClick={() => handleAddMilestone(goal.id)} className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">
              +
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => updateGoal(goal.id, { isActive: false })} className="text-xs text-gray-400 hover:text-red-500">
              Archive Goal
            </button>
          </div>
        </div>
      ))}

      {archived.length > 0 && (
        <div>
          <h4 className="text-sm text-gray-500 font-medium mb-2">Archived Goals ({archived.length})</h4>
          {archived.map(g => (
            <div key={g.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{g.description}</span>
              <button onClick={() => updateGoal(g.id, { isActive: true })} className="ml-2 text-xs text-emerald-600 hover:underline">Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
