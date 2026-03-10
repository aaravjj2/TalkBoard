import { useState } from 'react';
import { useSecurityStore } from '@/stores/securityStore';
import type { InputType } from '@/types/security';

const INPUT_TYPES: { type: InputType; label: string; placeholder: string }[] = [
  { type: 'text', label: 'General Text', placeholder: 'Enter any text...' },
  { type: 'name', label: 'Name', placeholder: 'John Doe' },
  { type: 'email', label: 'Email', placeholder: 'user@example.com' },
  { type: 'url', label: 'URL', placeholder: 'https://example.com' },
  { type: 'pin', label: 'PIN', placeholder: '1234' },
  { type: 'phone', label: 'Phone', placeholder: '+1 555-123-4567' },
  { type: 'number', label: 'Number', placeholder: '42' },
  { type: 'symbol_id', label: 'Symbol ID', placeholder: 'my_symbol_1' },
  { type: 'category_id', label: 'Category ID', placeholder: 'greetings' },
];

export default function InputValidationDemo() {
  const { validateInput, sanitize, settings, updateSettings } = useSecurityStore();

  const [selectedType, setSelectedType] = useState<InputType>('text');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<ReturnType<typeof validateInput> | null>(null);
  const [sanitizeResult, setSanitizeResult] = useState<string | null>(null);

  const handleValidate = () => {
    if (!inputValue) return;
    const r = validateInput(inputValue, selectedType);
    setResult(r);
    setSanitizeResult(null);
  };

  const handleSanitize = () => {
    if (!inputValue) return;
    const s = sanitize(inputValue);
    setSanitizeResult(s);
    setResult(null);
  };

  const selectedInfo = INPUT_TYPES.find((t) => t.type === selectedType);

  // Test payloads for demo
  const testPayloads = [
    { label: 'XSS Script', value: '<script>alert("xss")</script>' },
    { label: 'Email', value: 'user@example.com' },
    { label: 'SSN', value: '123-45-6789' },
    { label: 'Phone', value: '555-123-4567' },
    { label: 'Credit Card', value: '4111111111111111' },
    { label: 'SQL Injection', value: "'; DROP TABLE users; --" },
    { label: 'JS Protocol', value: 'javascript:alert(1)' },
    { label: 'Normal Text', value: 'Hello, I want water please' },
  ];

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 min-w-[250px]">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Strict Validation
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Extra checks on all inputs
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({
                inputValidationStrict: !settings.inputValidationStrict,
              })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.inputValidationStrict
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            role="switch"
            aria-checked={settings.inputValidationStrict}
            aria-label="Strict validation"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.inputValidationStrict ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 min-w-[250px]">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Sanitize All Inputs
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Auto-sanitize before processing
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({ sanitizeAllInputs: !settings.sanitizeAllInputs })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.sanitizeAllInputs
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            role="switch"
            aria-checked={settings.sanitizeAllInputs}
            aria-label="Sanitize all inputs"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.sanitizeAllInputs ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Validator */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Input Validator &amp; Sanitizer
        </h3>

        {/* Type Selector */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
            Input Type
          </label>
          <div className="flex flex-wrap gap-2">
            {INPUT_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => {
                  setSelectedType(t.type);
                  setResult(null);
                  setSanitizeResult(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === t.type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedInfo?.placeholder || 'Enter value...'}
            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Validate
          </button>
          <button
            onClick={handleSanitize}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Sanitize
          </button>
        </div>

        {/* Quick Test Payloads */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Quick test payloads:
          </p>
          <div className="flex flex-wrap gap-1">
            {testPayloads.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setInputValue(p.value);
                  setResult(null);
                  setSanitizeResult(null);
                }}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded hover:bg-gray-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Result */}
        {result && (
          <div
            className={`p-3 rounded-lg border ${
              result.isValid
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {result.isValid ? '✅' : '❌'}
              </span>
              <span
                className={`font-medium ${
                  result.isValid
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {result.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>

            {result.errors.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                  Errors:
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 list-disc list-inside">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                  Warnings:
                </p>
                <ul className="text-xs text-yellow-600 dark:text-yellow-400 list-disc list-inside">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Sanitized:</p>
              <p className="text-sm font-mono bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200 mt-1 break-all">
                {result.sanitized || '(empty)'}
              </p>
            </div>
          </div>
        )}

        {/* Sanitize Result */}
        {sanitizeResult !== null && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Sanitized output:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Original:</p>
                <p className="text-sm font-mono bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200 break-all">
                  {inputValue}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Sanitized:</p>
                <p className="text-sm font-mono bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200 break-all">
                  {sanitizeResult}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
