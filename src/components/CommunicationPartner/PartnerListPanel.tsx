import React, { useState } from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';
import { ROLE_LABELS, ROLE_ICONS, type PartnerRole } from '../../types/communicationPartner';

const ROLES: PartnerRole[] = ['parent', 'therapist', 'teacher', 'aide', 'sibling', 'peer', 'other'];

export const PartnerListPanel: React.FC = () => {
  const { partners, addPartner, updatePartner, removePartner, selectPartner, selectedPartnerId } = useCommunicationPartnerStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<PartnerRole>('parent');
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addPartner(name.trim(), role, email.trim());
    setName(''); setEmail(''); setShowAdd(false);
  };

  const active = partners.filter(p => p.isActive);
  const inactive = partners.filter(p => !p.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Communication Partners ({partners.length})
        </h3>
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
          {showAdd ? 'Cancel' : '+ Add Partner'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Partner name" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          <div className="flex gap-2">
            <select value={role} onChange={e => setRole(e.target.value as PartnerRole)} className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Partner</button>
        </div>
      )}

      {/* Active Partners */}
      <div className="space-y-3">
        {active.length > 0 && <p className="text-sm text-gray-500 font-medium">Active ({active.length})</p>}
        {active.map(p => (
          <div
            key={p.id}
            onClick={() => selectPartner(selectedPartnerId === p.id ? null : p.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedPartnerId === p.id
                ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{p.avatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{p.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    {ROLE_ICONS[p.role]} {ROLE_LABELS[p.role]}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {p.totalInteractions} interactions · Style: {p.preferredStyle}
                </div>
                {p.notes && <div className="text-xs text-gray-400 mt-1">{p.notes}</div>}
              </div>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); updatePartner(p.id, { isActive: false }); }} className="p-1.5 text-gray-400 hover:text-orange-500" title="Deactivate">⏸️</button>
                <button onClick={(e) => { e.stopPropagation(); removePartner(p.id); }} className="p-1.5 text-gray-400 hover:text-red-500" title="Remove">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inactive Partners */}
      {inactive.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">Inactive ({inactive.length})</p>
          {inactive.map(p => (
            <div key={p.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{p.avatar}</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">{p.name}</span>
                  <span className="text-xs ml-2 text-gray-400">{ROLE_LABELS[p.role]}</span>
                </div>
                <button onClick={() => updatePartner(p.id, { isActive: true })} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                  Reactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
