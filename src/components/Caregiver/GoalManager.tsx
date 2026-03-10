/**
 * GoalManager — CRUD interface for communication goals with progress tracking
 */
import { useState, useMemo } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';
import type { CommunicationGoal } from '@/services/caregiverService';

type GoalFilter = 'all' | 'active' | 'achieved' | 'paused';

interface GoalFormData {
  title: string;
  description: string;
  type: CommunicationGoal['type'];
  target: number;
  unit: string;
  endDate: string;
  milestones: { value: number; label: string }[];
}

const emptyForm: GoalFormData = {
  title: '',
  description: '',
  type: 'daily_usage',
  target: 10,
  unit: 'times',
  endDate: '',
  milestones: [],
};

const goalTypes: { value: CommunicationGoal['type']; label: string; icon: string; description: string }[] = [
  { value: 'symbol_usage', label: 'Symbol Usage', icon: '🔤', description: 'Track how often specific symbols are used' },
  { value: 'sentence_length', label: 'Sentence Length', icon: '📏', description: 'Encourage longer sentence construction' },
  { value: 'category_exploration', label: 'Category Exploration', icon: '🗂️', description: 'Encourage exploring different categories' },
  { value: 'daily_usage', label: 'Daily Usage', icon: '📅', description: 'Track daily communication frequency' },
  { value: 'vocabulary_growth', label: 'Vocabulary Growth', icon: '📚', description: 'Expand the number of unique symbols used' },
  { value: 'custom', label: 'Custom Goal', icon: '✨', description: 'Create a custom goal with your own criteria' },
];

export default function GoalManager() {
  const {
    goals,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    pauseGoal,
    resumeGoal,
  } = useCaregiverStore();

  const [filter, setFilter] = useState<GoalFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>({ ...emptyForm });
  const [progressInput, setProgressInput] = useState<{ id: string; value: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredGoals = useMemo(() => {
    if (filter === 'all') return goals;
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  const filterCounts = useMemo(() => ({
    all: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    achieved: goals.filter((g) => g.status === 'achieved').length,
    paused: goals.filter((g) => g.status === 'paused').length,
  }), [goals]);

  const handleCreate = () => {
    if (!form.title.trim()) return;
    createGoal({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      target: form.target,
      unit: form.unit,
      endDate: form.endDate || undefined,
      milestones: form.milestones.filter((m) => m.label.trim()),
    });
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleUpdate = () => {
    if (!editingId || !form.title.trim()) return;
    updateGoal(editingId, {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      target: form.target,
      unit: form.unit,
      endDate: form.endDate || null,
    });
    setEditingId(null);
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleEdit = (goal: CommunicationGoal) => {
    setForm({
      title: goal.title,
      description: goal.description,
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      endDate: goal.endDate || '',
      milestones: goal.milestones.map((m) => ({ value: m.value, label: m.label })),
    });
    setEditingId(goal.id);
    setShowForm(true);
  };

  const handleProgressUpdate = () => {
    if (!progressInput) return;
    const value = parseFloat(progressInput.value);
    if (isNaN(value)) return;
    updateGoalProgress(progressInput.id, value);
    setProgressInput(null);
  };

  const addMilestone = () => {
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { value: 0, label: '' }],
    }));
  };

  const removeMilestone = (index: number) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index: number, field: 'value' | 'label', val: string | number) => {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => (i === index ? { ...m, [field]: val } : m)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Communication Goals</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set and track communication objectives
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 
            transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'active', 'achieved', 'paused'] as GoalFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({filterCounts[f]})
          </button>
        ))}
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Goal' : 'Create New Goal'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Use 5 new words daily"
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the goal..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {goalTypes.map((gt) => (
                  <button
                    key={gt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: gt.value }))}
                    className={`p-3 rounded-lg text-left border-2 transition-colors ${
                      form.type === gt.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{gt.icon}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{gt.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.target}
                  onChange={(e) => setForm((prev) => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., words, times, minutes"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                    focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date (optional)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Milestones
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add Milestone
                </button>
              </div>
              {form.milestones.map((milestone, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min={0}
                    value={milestone.value}
                    onChange={(e) => updateMilestone(i, 'value', parseInt(e.target.value) || 0)}
                    placeholder="Value"
                    className="w-24 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                  />
                  <input
                    type="text"
                    value={milestone.label}
                    onChange={(e) => updateMilestone(i, 'label', e.target.value)}
                    placeholder="Milestone label"
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(i)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                    aria-label="Remove milestone"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={!form.title.trim()}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600
                  disabled:opacity-50 transition-colors"
              >
                {editingId ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 dark:text-gray-400">No goals found</p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
            >
              Show all goals
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            const typeInfo = goalTypes.find((gt) => gt.value === goal.type);

            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border transition-colors ${
                  goal.status === 'achieved'
                    ? 'border-green-300 dark:border-green-700'
                    : goal.status === 'paused'
                    ? 'border-gray-300 dark:border-gray-600 opacity-70'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo?.icon || '🎯'}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{goal.title}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      goal.status === 'active'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : goal.status === 'achieved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.min(100, Math.round(progress))}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100
                          ? 'bg-green-500'
                          : progress >= 75
                          ? 'bg-blue-500'
                          : progress >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                {goal.milestones.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {goal.milestones.map((m) => (
                      <span
                        key={m.id}
                        className={`text-xs px-2 py-1 rounded-full ${
                          m.achievedAt
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {m.achievedAt ? '✅' : '⬜'} {m.label} ({m.value})
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Input */}
                {progressInput?.id === goal.id && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="number"
                      min={0}
                      value={progressInput.value}
                      onChange={(e) => setProgressInput({ id: goal.id, value: e.target.value })}
                      placeholder="New progress value"
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                        border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleProgressUpdate}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setProgressInput(null)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm === goal.id && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                    rounded-lg p-3 mb-3 flex items-center justify-between">
                    <p className="text-sm text-red-700 dark:text-red-300">Delete this goal?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { deleteGoal(goal.id); setDeleteConfirm(null); }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  {goal.status === 'active' && (
                    <>
                      <button
                        onClick={() => setProgressInput({ id: goal.id, value: String(goal.current) })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30
                          text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        Update Progress
                      </button>
                      <button
                        onClick={() => pauseGoal(goal.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700
                          text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Pause
                      </button>
                    </>
                  )}
                  {goal.status === 'paused' && (
                    <button
                      onClick={() => resumeGoal(goal.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30
                        text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700
                      text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(goal.id)}
                    className="text-xs px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/30 ml-auto"
                  >
                    Delete
                  </button>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Created {new Date(goal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
