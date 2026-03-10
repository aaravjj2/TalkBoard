import React, { useState } from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';

export const ModelingQueuePanel: React.FC = () => {
  const { modelingQueue, addModelingItem, markDemonstrated, markAttempted, removeModelingItem } = useCommunicationPartnerStore();
  const [showAdd, setShowAdd] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [category, setCategory] = useState('requesting');

  const handleAdd = () => {
    if (!phrase.trim()) return;
    const symbols = phrase.trim().split(/\s+/);
    addModelingItem(phrase.trim(), symbols, category);
    setPhrase('');
    setShowAdd(false);
  };

  const demonstrated = modelingQueue.filter(m => m.demonstrated).length;
  const attempted = modelingQueue.filter(m => m.userAttempted).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Modeling Queue ({modelingQueue.length})
        </h3>
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
          {showAdd ? 'Cancel' : '+ Add Phrase'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{modelingQueue.length}</div>
          <div className="text-xs text-blue-500">Total Phrases</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{demonstrated}</div>
          <div className="text-xs text-green-500">Demonstrated</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{attempted}</div>
          <div className="text-xs text-purple-500">User Attempted</div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 space-y-3">
          <input value={phrase} onChange={e => setPhrase(e.target.value)} placeholder="Target phrase (e.g., 'I want more')" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
            <option value="requesting">Requesting</option>
            <option value="commenting">Commenting</option>
            <option value="feelings">Feelings</option>
            <option value="social">Social</option>
            <option value="actions">Actions</option>
            <option value="refusing">Refusing</option>
            <option value="questions">Questions</option>
          </select>
          <button onClick={handleAdd} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add to Queue</button>
        </div>
      )}

      {/* Modeling Items */}
      <div className="space-y-3">
        {modelingQueue.map(item => (
          <div key={item.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  "{item.targetPhrase}"
                </span>
                <span className="text-xs ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                  {item.category}
                </span>
              </div>
              <button onClick={() => removeModelingItem(item.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
            </div>

            {/* Symbols */}
            <div className="flex gap-1 mb-3">
              {item.symbols.map((sym, i) => (
                <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm">
                  {sym}
                </span>
              ))}
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className={`w-3 h-3 rounded-full ${item.demonstrated ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.demonstrated ? 'Demonstrated' : 'Not demonstrated'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className={`w-3 h-3 rounded-full ${item.userAttempted ? 'bg-purple-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.userAttempted ? 'User attempted' : 'Not attempted'}
                </span>
              </div>
              <div className="flex gap-1">
                {!item.demonstrated && (
                  <button onClick={() => markDemonstrated(item.id)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                    ✓ Demonstrated
                  </button>
                )}
                {!item.userAttempted && (
                  <button onClick={() => markAttempted(item.id)} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                    ✓ Attempted
                  </button>
                )}
              </div>
            </div>

            {item.notes && <div className="text-xs text-gray-400 mt-2 italic">{item.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
