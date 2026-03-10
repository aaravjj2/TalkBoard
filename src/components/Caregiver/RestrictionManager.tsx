/**
 * RestrictionManager — Manage communication restrictions (time limits,
 * category locks, symbol blocks, quiet hours, sentence limits).
 */
import { useState, useMemo } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';
import type { CommunicationRestriction, RestrictionConfig } from '@/services/caregiverService';

type RestrictionType = CommunicationRestriction['type'];

interface RestrictionFormData {
  type: RestrictionType;
  name: string;
  description: string;
  isActive: boolean;
  // Time limit
  maxMinutesPerDay: number;
  maxMinutesPerSession: number;
  // Category lock
  allowedCategories: string[];
  categoryReason: string;
  // Symbol block
  blockedSymbolIds: string[];
  symbolReason: string;
  // Sentence limit
  maxSentencesPerHour: number;
  maxSymbolsPerSentence: number;
  // Quiet hours
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  allowEmergency: boolean;
}

const emptyForm: RestrictionFormData = {
  type: 'time_limit',
  name: '',
  description: '',
  isActive: true,
  maxMinutesPerDay: 120,
  maxMinutesPerSession: 30,
  allowedCategories: [],
  categoryReason: '',
  blockedSymbolIds: [],
  symbolReason: '',
  maxSentencesPerHour: 20,
  maxSymbolsPerSentence: 10,
  startTime: '21:00',
  endTime: '07:00',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  allowEmergency: true,
};

const restrictionTypes: { value: RestrictionType; label: string; icon: string; description: string }[] = [
  { value: 'time_limit', label: 'Time Limit', icon: '⏱️', description: 'Limit daily or per-session usage time' },
  { value: 'category_lock', label: 'Category Lock', icon: '🔒', description: 'Restrict to specific categories' },
  { value: 'symbol_block', label: 'Symbol Block', icon: '🚫', description: 'Block specific symbols' },
  { value: 'sentence_limit', label: 'Sentence Limit', icon: '📝', description: 'Limit sentences per hour or length' },
  { value: 'quiet_hours', label: 'Quiet Hours', icon: '🌙', description: 'Set communication-free periods' },
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const availableCategories = [
  { id: 'people', label: 'People' },
  { id: 'actions', label: 'Actions' },
  { id: 'feelings', label: 'Feelings' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'places', label: 'Places' },
  { id: 'things', label: 'Things' },
  { id: 'nature', label: 'Nature' },
  { id: 'social', label: 'Social' },
  { id: 'school', label: 'School' },
  { id: 'time', label: 'Time & Numbers' },
];

export default function RestrictionManager() {
  const {
    restrictions,
    isInQuietHours,
    createRestriction,
    updateRestriction,
    deleteRestriction,
    toggleRestriction,
  } = useCaregiverStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RestrictionFormData>({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const activeCount = useMemo(() => restrictions.filter((r) => r.isActive).length, [restrictions]);

  const buildConfig = (data: RestrictionFormData): RestrictionConfig => {
    switch (data.type) {
      case 'time_limit':
        return {
          type: 'time_limit',
          maxMinutesPerDay: data.maxMinutesPerDay,
          maxMinutesPerSession: data.maxMinutesPerSession,
        };
      case 'category_lock':
        return {
          type: 'category_lock',
          allowedCategories: data.allowedCategories,
          reason: data.categoryReason,
        };
      case 'symbol_block':
        return {
          type: 'symbol_block',
          blockedSymbolIds: data.blockedSymbolIds,
          reason: data.symbolReason,
        };
      case 'sentence_limit':
        return {
          type: 'sentence_limit',
          maxSentencesPerHour: data.maxSentencesPerHour,
          maxSymbolsPerSentence: data.maxSymbolsPerSentence,
        };
      case 'quiet_hours':
        return {
          type: 'quiet_hours',
          startTime: data.startTime,
          endTime: data.endTime,
          daysOfWeek: data.daysOfWeek,
          allowEmergency: data.allowEmergency,
        };
    }
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createRestriction({
      type: form.type,
      name: form.name.trim(),
      description: form.description.trim(),
      config: buildConfig(form),
      isActive: form.isActive,
    });
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    updateRestriction(editingId, {
      name: form.name.trim(),
      description: form.description.trim(),
      config: buildConfig(form),
      isActive: form.isActive,
    });
    setEditingId(null);
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleEdit = (restriction: CommunicationRestriction) => {
    const config = restriction.config;
    setForm({
      ...emptyForm,
      type: restriction.type,
      name: restriction.name,
      description: restriction.description,
      isActive: restriction.isActive,
      ...(config.type === 'time_limit' && {
        maxMinutesPerDay: config.maxMinutesPerDay,
        maxMinutesPerSession: config.maxMinutesPerSession,
      }),
      ...(config.type === 'category_lock' && {
        allowedCategories: config.allowedCategories,
        categoryReason: config.reason,
      }),
      ...(config.type === 'symbol_block' && {
        blockedSymbolIds: config.blockedSymbolIds,
        symbolReason: config.reason,
      }),
      ...(config.type === 'sentence_limit' && {
        maxSentencesPerHour: config.maxSentencesPerHour,
        maxSymbolsPerSentence: config.maxSymbolsPerSentence,
      }),
      ...(config.type === 'quiet_hours' && {
        startTime: config.startTime,
        endTime: config.endTime,
        daysOfWeek: config.daysOfWeek,
        allowEmergency: config.allowEmergency,
      }),
    });
    setEditingId(restriction.id);
    setShowForm(true);
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const toggleCategory = (catId: string) => {
    setForm((prev) => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(catId)
        ? prev.allowedCategories.filter((c) => c !== catId)
        : [...prev.allowedCategories, catId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Communication Restrictions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeCount} active restriction{activeCount !== 1 ? 's' : ''}
            {isInQuietHours && ' • Quiet hours active'}
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
          New Restriction
        </button>
      </div>

      {/* Quiet Hours Notice */}
      {isInQuietHours && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800
          rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Quiet hours are currently active. Communication features are restricted.
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Restriction' : 'Create Restriction'}
          </h4>
          <div className="space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Restriction Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {restrictionTypes.map((rt) => (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: rt.value }))}
                    className={`p-3 rounded-lg text-left border-2 transition-colors ${
                      form.type === rt.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{rt.icon}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{rt.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{rt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bedtime quiet hours"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Type-specific config */}
            {form.type === 'time_limit' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Minutes/Day
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxMinutesPerDay}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxMinutesPerDay: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Minutes/Session
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxMinutesPerSession}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxMinutesPerSession: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {form.type === 'category_lock' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allowed Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-sm border-2 transition-colors ${
                        form.allowedCategories.includes(cat.id)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {form.allowedCategories.includes(cat.id) ? '✅' : '⬜'} {cat.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.categoryReason}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryReason: e.target.value }))}
                  placeholder="Reason for restriction"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                />
              </div>
            )}

            {form.type === 'sentence_limit' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Sentences/Hour
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxSentencesPerHour}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxSentencesPerHour: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Symbols/Sentence
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxSymbolsPerSentence}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxSymbolsPerSentence: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                      border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            {form.type === 'quiet_hours' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                        border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                        border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days of Week
                  </label>
                  <div className="flex gap-2">
                    {dayNames.map((name, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                          form.daysOfWeek.includes(i)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.allowEmergency}
                    onChange={(e) => setForm((prev) => ({ ...prev, allowEmergency: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow emergency communication during quiet hours
                  </span>
                </label>
              </div>
            )}

            {/* Active toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active immediately</span>
            </label>

            {/* Buttons */}
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
                disabled={!form.name.trim()}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600
                  disabled:opacity-50 transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restrictions List */}
      {restrictions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="text-gray-500 dark:text-gray-400">No restrictions configured</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add restrictions to control communication behavior
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {restrictions.map((restriction) => {
            const typeInfo = restrictionTypes.find((rt) => rt.value === restriction.type);
            return (
              <div
                key={restriction.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-opacity ${
                  restriction.isActive
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo?.icon || '🛡️'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{restriction.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          restriction.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {restriction.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {restriction.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{restriction.description}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {typeInfo?.label} • Created {new Date(restriction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRestriction(restriction.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        restriction.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      aria-label={restriction.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        restriction.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <button
                      onClick={() => handleEdit(restriction)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                        hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      aria-label="Edit"
                    >
                      ✏️
                    </button>
                    {deleteConfirm === restriction.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { deleteRestriction(restriction.id); setDeleteConfirm(null); }}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 border border-gray-300 text-xs rounded hover:bg-gray-100 
                            dark:border-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(restriction.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        aria-label="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
