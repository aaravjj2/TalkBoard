import { useSecurityStore } from '@/stores/securityStore';

export default function EncryptionSettings() {
  const { settings, updateSettings } = useSecurityStore();
  const { encryptionConfig } = settings;

  const updateEncryption = (updates: Partial<typeof encryptionConfig>) => {
    updateSettings({
      encryptionConfig: { ...encryptionConfig, ...updates },
    });
  };

  const algorithms = [
    { value: 'aes-gcm', label: 'AES-GCM', description: 'Recommended. Authenticated encryption with associated data.' },
    { value: 'aes-cbc', label: 'AES-CBC', description: 'Legacy. Cipher block chaining mode.' },
  ] as const;

  const keyLengths = [128, 192, 256] as const;

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Enable Encryption
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Encrypt sensitive data before storing locally
          </p>
        </div>
        <button
          onClick={() => updateEncryption({ enabled: !encryptionConfig.enabled })}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            encryptionConfig.enabled
              ? 'bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          role="switch"
          aria-checked={encryptionConfig.enabled}
          aria-label="Enable encryption"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              encryptionConfig.enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {/* Algorithm Selection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Encryption Algorithm
        </h4>
        <div className="space-y-2">
          {algorithms.map((alg) => (
            <label
              key={alg.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                encryptionConfig.algorithm === alg.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <input
                type="radio"
                name="algorithm"
                value={alg.value}
                checked={encryptionConfig.algorithm === alg.value}
                onChange={() => updateEncryption({ algorithm: alg.value })}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {alg.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {alg.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Key Length */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Key Length
        </h4>
        <div className="flex gap-2">
          {keyLengths.map((length) => (
            <button
              key={length}
              onClick={() => updateEncryption({ keyLength: length })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                encryptionConfig.keyLength === length
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {length}-bit
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          256-bit provides the strongest security. 128-bit is faster but less secure.
        </p>
      </div>

      {/* Storage & Export Encryption */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          What to Encrypt
        </h4>
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Encrypt Local Storage
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Encrypt all TalkBoard data in browser storage
            </p>
          </div>
          <button
            onClick={() =>
              updateEncryption({ encryptStorage: !encryptionConfig.encryptStorage })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${
              encryptionConfig.encryptStorage
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            role="switch"
            aria-checked={encryptionConfig.encryptStorage}
            aria-label="Encrypt local storage"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                encryptionConfig.encryptStorage ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Encrypt Exports
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Encrypt data when exporting to files
            </p>
          </div>
          <button
            onClick={() =>
              updateEncryption({
                encryptExports: !encryptionConfig.encryptExports,
              })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${
              encryptionConfig.encryptExports
                ? 'bg-blue-600'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            role="switch"
            aria-checked={encryptionConfig.encryptExports}
            aria-label="Encrypt exports"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                encryptionConfig.encryptExports ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
          About Encryption
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>All encryption is performed locally in your browser</li>
          <li>TalkBoard uses the Web Crypto API for secure operations</li>
          <li>Keys are derived from your password using PBKDF2 with 100,000 iterations</li>
          <li>AES-GCM provides both confidentiality and integrity</li>
          <li>If you lose your password, encrypted data cannot be recovered</li>
        </ul>
      </div>
    </div>
  );
}
