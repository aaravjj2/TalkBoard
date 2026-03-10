/**
 * NoteManager — Caregiver notes CRUD with filtering, archiving, and priority.
 */
import { useState, useMemo } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';
import type { CaregiverNote } from '@/services/caregiverService';

type NoteCategory = CaregiverNote['category'];
type NotePriority = CaregiverNote['priority'];

interface NoteFormData {
  title: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  tags: string;
}

const emptyForm: NoteFormData = {
  title: '',
  content: '',
  category: 'general',
  priority: 'medium',
  tags: '',
};

const categoryOptions: { value: NoteCategory; label: string; icon: string; color: string }[] = [
  { value: 'observation', label: 'Observation', icon: '👁️', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'progress', label: 'Progress', icon: '📈', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'concern', label: 'Concern', icon: '⚠️', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { value: 'reminder', label: 'Reminder', icon: '🔔', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { value: 'general', label: 'General', icon: '📝', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
];

const priorityOptions: { value: NotePriority; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: 'bg-red-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

export default function NoteManager() {
  const {
    notes,
    showArchivedNotes,
    createNote,
    updateNote,
    deleteNote,
    archiveNote,
    unarchiveNote,
    toggleShowArchivedNotes,
  } = useCaregiverStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoteFormData>({ ...emptyForm });
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotePriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filterCategory !== 'all') {
      result = result.filter((n) => n.category === filterCategory);
    }
    if (filterPriority !== 'all') {
      result = result.filter((n) => n.priority === filterPriority);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [notes, filterCategory, filterPriority, searchQuery]);

  const handleCreate = () => {
    if (!form.title.trim()) return;
    createNote({
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      priority: form.priority,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleUpdate = () => {
    if (!editingId || !form.title.trim()) return;
    updateNote(editingId, {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      priority: form.priority,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setEditingId(null);
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleEdit = (note: CaregiverNote) => {
    setForm({
      title: note.title,
      content: note.content,
      category: note.category,
      priority: note.priority,
      tags: note.tags.join(', '),
    });
    setEditingId(note.id);
    setShowForm(true);
  };

  const getCategoryInfo = (cat: NoteCategory) =>
    categoryOptions.find((c) => c.value === cat) || categoryOptions[4];

  const getPriorityInfo = (pri: NotePriority) =>
    priorityOptions.find((p) => p.value === pri) || priorityOptions[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notes</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showArchivedNotes}
              onChange={toggleShowArchivedNotes}
              className="w-4 h-4 rounded border-gray-300 text-blue-500"
            />
            Show archived
          </label>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...emptyForm }); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600
              transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
              border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none
              focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as NoteCategory | 'all')}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as NotePriority | 'all')}
          className="px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
            border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
        >
          <option value="all">All Priorities</option>
          {priorityOptions.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Note' : 'New Note'}
          </h4>
          <div className="space-y-4">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Note title *"
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none
                text-lg font-medium"
              autoFocus
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note..."
              rows={5}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none resize-none"
            />
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, category: c.value }))}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        form.category === c.value
                          ? c.color + ' ring-2 ring-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <div className="flex gap-2">
                  {priorityOptions.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
                        form.priority === p.value
                          ? 'ring-2 ring-blue-400 bg-gray-100 dark:bg-gray-700'
                          : 'bg-gray-100 dark:bg-gray-700'
                      } text-gray-700 dark:text-gray-300`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., speech, motor, progress"
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
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
                {editingId ? 'Update' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500 dark:text-gray-400">
            {notes.length === 0 ? 'No notes yet' : 'No notes match your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => {
            const catInfo = getCategoryInfo(note.category);
            const priInfo = getPriorityInfo(note.priority);
            const isExpanded = expandedNote === note.id;

            return (
              <div
                key={note.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                  dark:border-gray-700 overflow-hidden ${note.isArchived ? 'opacity-60' : ''}`}
              >
                {/* Priority strip */}
                <div className={`h-1 ${priInfo.color}`} />

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${catInfo.color}`}>
                          {catInfo.icon} {catInfo.label}
                        </span>
                        {note.isArchived && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                            Archived
                          </span>
                        )}
                      </div>
                      <h4
                        className="font-bold text-gray-900 dark:text-white cursor-pointer"
                        onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      >
                        {note.title}
                      </h4>
                    </div>
                  </div>

                  {/* Content */}
                  <p className={`text-sm text-gray-600 dark:text-gray-300 ${
                    isExpanded ? '' : 'line-clamp-3'
                  }`}>
                    {note.content}
                  </p>
                  {note.content.length > 150 && (
                    <button
                      onClick={() => setExpandedNote(isExpanded ? null : note.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700
                            text-gray-600 dark:text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100
                          dark:hover:bg-gray-700 rounded text-xs"
                        aria-label="Edit note"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => note.isArchived ? unarchiveNote(note.id) : archiveNote(note.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100
                          dark:hover:bg-gray-700 rounded text-xs"
                        aria-label={note.isArchived ? 'Unarchive' : 'Archive'}
                      >
                        {note.isArchived ? '📤' : '📥'}
                      </button>
                      {deleteConfirm === note.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => { deleteNote(note.id); setDeleteConfirm(null); }}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 border text-xs rounded border-gray-300 dark:border-gray-600
                              text-gray-700 dark:text-gray-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(note.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs"
                          aria-label="Delete note"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
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
