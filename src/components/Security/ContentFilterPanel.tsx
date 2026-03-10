import { useState, useMemo } from 'react';
import { useSecurityStore } from '@/stores/securityStore';
import type { ContentCategory, ContentFilterRule } from '@/types/security';

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  profanity: 'Profanity',
  personal_info: 'Personal Info',
  violence: 'Violence',
  inappropriate: 'Inappropriate',
  custom: 'Custom',
};

const SEVERITY_COLORS: Record<string, string> = {
  block: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  flag: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export default function ContentFilterPanel() {
  const {
    settings,
    contentFilterRules,
    setContentFilterLevel,
    addFilterRule,
    removeFilterRule,
    toggleFilterRule,
    filterContent,
  } = useSecurityStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<ReturnType<typeof filterContent> | null>(null);
  const [newRule, setNewRule] = useState({
    category: 'custom' as ContentCategory,
    pattern: '',
    severity: 'warn' as 'block' | 'warn' | 'flag',
    description: '',
  });

  const builtInRules = useMemo(
    () => contentFilterRules.filter((r) => !r.isCustom),
    [contentFilterRules]
  );
  const customRules = useMemo(
    () => contentFilterRules.filter((r) => r.isCustom),
    [contentFilterRules]
  );

  const handleAddRule = () => {
    if (!newRule.pattern || !newRule.description) return;
    addFilterRule(newRule);
    setNewRule({ category: 'custom', pattern: '', severity: 'warn', description: '' });
    setShowAddForm(false);
  };

  const handleTest = () => {
    if (!testInput) return;
    setTestResult(filterContent(testInput));
  };

  const filterLevels = ['none', 'low', 'medium', 'high', 'strict'] as const;

  return (
    <div className="space-y-6">
      {/* Filter Level */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Filter Level
        </h3>
        <div className="flex gap-2 flex-wrap">
          {filterLevels.map((level) => (
            <button
              key={level}
              onClick={() => setContentFilterLevel(level)}
              className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
                settings.contentFilterLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {settings.contentFilterLevel === 'none' && 'No content filtering applied'}
          {settings.contentFilterLevel === 'low' &&
            'Only block critical patterns like SSN and credit cards'}
          {settings.contentFilterLevel === 'medium' &&
            'Block critical patterns and flag personal info'}
          {settings.contentFilterLevel === 'high' &&
            'Block and warn on most sensitive content'}
          {settings.contentFilterLevel === 'strict' &&
            'All rules applied, maximum protection'}
        </p>
      </div>

      {/* Built-in Rules */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Built-in Rules ({builtInRules.length})
        </h3>
        <div className="space-y-2">
          {builtInRules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} onRemove={() => {}} isBuiltIn />
          ))}
        </div>
      </div>

      {/* Custom Rules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Custom Rules ({customRules.length})
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            {showAddForm ? 'Cancel' : '+ Add Rule'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newRule.category}
                  onChange={(e) =>
                    setNewRule({ ...newRule, category: e.target.value as ContentCategory })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  value={newRule.severity}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      severity: e.target.value as 'block' | 'warn' | 'flag',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="flag">Flag</option>
                  <option value="warn">Warn</option>
                  <option value="block">Block</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Regex Pattern
              </label>
              <input
                type="text"
                value={newRule.pattern}
                onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
                placeholder="e.g., \\bpassword\\b"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                placeholder="What this rule detects"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              onClick={handleAddRule}
              disabled={!newRule.pattern || !newRule.description}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add Rule
            </button>
          </div>
        )}

        <div className="space-y-2">
          {customRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onRemove={() => removeFilterRule(rule.id)}
              onToggle={() => toggleFilterRule(rule.id)}
            />
          ))}
          {customRules.length === 0 && !showAddForm && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No custom rules. Click &quot;+ Add Rule&quot; to create one.
            </p>
          )}
        </div>
      </div>

      {/* Test Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Test Content Filter
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter text to test..."
            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleTest}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test
          </button>
        </div>
        {testResult && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  testResult.isAllowed ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="font-medium dark:text-white">
                {testResult.isAllowed ? 'Allowed' : 'Blocked'}
              </span>
            </div>
            {testResult.flags.length > 0 && (
              <div className="space-y-1">
                {testResult.flags.map((flag, i) => (
                  <div
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-xs ${SEVERITY_COLORS[flag.severity]}`}>
                      {flag.severity}
                    </span>{' '}
                    [{flag.category}] matched: &quot;{flag.matchedText}&quot;
                  </div>
                ))}
              </div>
            )}
            {testResult.sanitizedContent !== testInput && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Sanitized: </span>
                <span className="font-mono dark:text-gray-300">
                  {testResult.sanitizedContent}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rule Card ───────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onRemove,
  onToggle,
  isBuiltIn,
}: {
  rule: ContentFilterRule;
  onRemove: () => void;
  onToggle?: () => void;
  isBuiltIn?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        rule.isActive
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-gray-100 dark:border-gray-800 opacity-60'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[rule.severity]}`}>
            {rule.severity}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {CATEGORY_LABELS[rule.category] || rule.category}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {rule.description}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
          /{rule.pattern}/
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          >
            {rule.isActive ? 'Disable' : 'Enable'}
          </button>
        )}
        {!isBuiltIn && (
          <button
            onClick={onRemove}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-200"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
