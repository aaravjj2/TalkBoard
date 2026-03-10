import React from 'react';
import { useCommunicationPartnerStore } from '../../stores/communicationPartnerStore';

export const PartnerTipsPanel: React.FC = () => {
  const { tips, markTipRead } = useCommunicationPartnerStore();

  const unread = tips.filter(t => !t.isRead).length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        Partner Tips ({tips.length}) {unread > 0 && <span className="text-sm text-purple-600">· {unread} unread</span>}
      </h3>

      <div className="space-y-3">
        {tips.sort((a, b) => a.order - b.order).map(tip => (
          <div
            key={tip.id}
            className={`p-4 rounded-xl border transition-all ${
              tip.isRead
                ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 opacity-70'
                : 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {!tip.isRead && <span className="w-2 h-2 bg-purple-500 rounded-full" />}
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{tip.title}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full capitalize">
                    {tip.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip.content}</p>
              </div>
              {!tip.isRead && (
                <button
                  onClick={() => markTipRead(tip.id)}
                  className="ml-3 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 whitespace-nowrap"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
