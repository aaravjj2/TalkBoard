/**
 * ProfileManager — Manage caregiver profiles with permissions.
 */
import { useState } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';
import type { CaregiverProfile, CaregiverPermissions } from '@/services/caregiverService';

interface ProfileFormData {
  name: string;
  role: CaregiverProfile['role'];
  email: string;
  phone: string;
  permissions: CaregiverPermissions;
}

const defaultPermissions: CaregiverPermissions = {
  canEditSymbols: true,
  canEditBoards: true,
  canEditSettings: true,
  canViewAnalytics: true,
  canExportData: true,
  canManageUsers: false,
  canSetRestrictions: true,
  canSetGoals: true,
  canViewActivityLog: true,
};

const emptyForm: ProfileFormData = {
  name: '',
  role: 'parent',
  email: '',
  phone: '',
  permissions: { ...defaultPermissions },
};

const roleOptions = [
  { value: 'parent' as const, label: 'Parent / Guardian', emoji: '👨‍👩‍👧' },
  { value: 'therapist' as const, label: 'Speech Therapist', emoji: '🩺' },
  { value: 'teacher' as const, label: 'Teacher', emoji: '👩‍🏫' },
  { value: 'aide' as const, label: 'Classroom Aide', emoji: '🤝' },
  { value: 'other' as const, label: 'Other', emoji: '👤' },
];

const permissionLabels: { key: keyof CaregiverPermissions; label: string; description: string }[] = [
  { key: 'canEditSymbols', label: 'Edit Symbols', description: 'Create, modify, and delete symbols' },
  { key: 'canEditBoards', label: 'Edit Boards', description: 'Create and modify communication boards' },
  { key: 'canEditSettings', label: 'Edit Settings', description: 'Change app settings and preferences' },
  { key: 'canViewAnalytics', label: 'View Analytics', description: 'Access usage analytics and charts' },
  { key: 'canExportData', label: 'Export Data', description: 'Export user data and reports' },
  { key: 'canManageUsers', label: 'Manage Users', description: 'Add, edit, or remove other caregivers' },
  { key: 'canSetRestrictions', label: 'Set Restrictions', description: 'Create and manage communication restrictions' },
  { key: 'canSetGoals', label: 'Set Goals', description: 'Create and track communication goals' },
  { key: 'canViewActivityLog', label: 'View Activity Log', description: 'Access the activity history log' },
];

export default function ProfileManager() {
  const {
    profiles,
    activeProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
  } = useCaregiverStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormData>({ ...emptyForm });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createProfile({
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    updateProfile(editingId, {
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim(),
      phone: form.phone.trim(),
      permissions: form.permissions,
    });
    setEditingId(null);
    setShowForm(false);
    setForm({ ...emptyForm });
  };

  const handleEdit = (profile: CaregiverProfile) => {
    setForm({
      name: profile.name,
      role: profile.role,
      email: profile.email,
      phone: profile.phone,
      permissions: { ...profile.permissions },
    });
    setEditingId(profile.id);
    setShowForm(true);
  };

  const togglePermission = (key: keyof CaregiverPermissions) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Caregiver Profiles</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
            {activeProfile && ` • Active: ${activeProfile.name}`}
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
          Add Profile
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Edit Profile' : 'Add Caregiver Profile'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as CaregiverProfile['role'] }))}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.emoji} {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700
                    border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Permissions (only when editing) */}
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {permissionLabels.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.permissions[perm.key]}
                        onChange={() => togglePermission(perm.key)}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
                {editingId ? 'Update' : 'Add Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500 dark:text-gray-400">No caregiver profiles</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Add profiles for parents, therapists, or teachers
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const roleInfo = roleOptions.find((r) => r.value === profile.role);
            const isActive = activeProfile?.id === profile.id;
            const isExpanded = expandedProfile === profile.id;

            return (
              <div
                key={profile.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-colors ${
                  isActive
                    ? 'border-blue-400 dark:border-blue-600 ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 
                        flex items-center justify-center text-2xl">
                        {profile.avatar || roleInfo?.emoji || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white">{profile.name}</h4>
                          {isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30
                              text-blue-700 dark:text-blue-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {roleInfo?.label || profile.role}
                          {profile.email && ` • ${profile.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          onClick={() => setActiveProfile(profile.id)}
                          className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30
                            text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200
                            dark:hover:bg-blue-900/50"
                        >
                          Set Active
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveProfile(null)}
                          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700
                            text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200
                            dark:hover:bg-gray-600"
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(profile)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        aria-label="Edit profile"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setExpandedProfile(isExpanded ? null : profile.id)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Phone:</span>{' '}
                          <span className="text-gray-900 dark:text-white">{profile.phone || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Created:</span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Last login:</span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {new Date(profile.lastLoginAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {permissionLabels.map((perm) => (
                            <span
                              key={perm.key}
                              className={`text-xs px-2 py-1 rounded-full ${
                                profile.permissions[perm.key]
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {profile.permissions[perm.key] ? '✅' : '❌'} {perm.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {deleteConfirm === profile.id ? (
                        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/30
                          border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-sm text-red-700 dark:text-red-300">Delete this profile?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { deleteProfile(profile.id); setDeleteConfirm(null); }}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg 
                                text-sm text-gray-700 dark:text-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(profile.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete profile
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
