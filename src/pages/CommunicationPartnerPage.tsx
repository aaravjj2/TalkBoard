import React, { useEffect } from 'react';
import { useCommunicationPartnerStore } from '../stores/communicationPartnerStore';
import {
  PartnerListPanel,
  SessionHistoryPanel,
  StrategiesPanel,
  ModelingQueuePanel,
  CommunicationLogPanel,
  PartnerProgressPanel,
  PartnerTipsPanel,
  PartnerSettingsPanel,
} from '../components/CommunicationPartner';

const TABS = [
  { id: 'partners', label: 'Partners', icon: '👥' },
  { id: 'sessions', label: 'Sessions', icon: '📋' },
  { id: 'strategies', label: 'Strategies', icon: '🧠' },
  { id: 'modeling', label: 'Modeling', icon: '🎯' },
  { id: 'log', label: 'Log', icon: '📝' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'tips', label: 'Tips', icon: '💡' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const CommunicationPartnerPage: React.FC = () => {
  const { activeTab, setActiveTab, initialize, partners, sessions, tips } = useCommunicationPartnerStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const activePartners = partners.filter(p => p.isActive).length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const unreadTips = tips.filter(t => !t.isRead).length;

  const renderTab = () => {
    switch (activeTab) {
      case 'partners': return <PartnerListPanel />;
      case 'sessions': return <SessionHistoryPanel />;
      case 'strategies': return <StrategiesPanel />;
      case 'modeling': return <ModelingQueuePanel />;
      case 'log': return <CommunicationLogPanel />;
      case 'progress': return <PartnerProgressPanel />;
      case 'tips': return <PartnerTipsPanel />;
      case 'settings': return <PartnerSettingsPanel />;
      default: return <PartnerListPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-1">🤝 Communication Partners</h1>
        <p className="text-purple-100 text-sm mb-3">Support and guide communication partner interactions</p>
        <div className="flex gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">👥 {activePartners} active partners</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">📋 {completedSessions} sessions</span>
          {unreadTips > 0 && (
            <span className="bg-yellow-400/30 px-3 py-1 rounded-full">💡 {unreadTips} new tips</span>
          )}
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
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.id === 'tips' && unreadTips > 0 && (
                <span className="ml-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadTips}
                </span>
              )}
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

export default CommunicationPartnerPage;
