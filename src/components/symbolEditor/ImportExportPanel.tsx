/**
 * ImportExportPanel — Import & export symbol packs.
 * Supports JSON pack files with optional images/audio.
 */
import { useState, useRef } from 'react';
import { useSymbolEditorStore } from '@/stores/symbolEditorStore';
import type { SymbolPackExportOptions } from '@/types/symbolEditor';

export default function ImportExportPanel() {
  const {
    exportPack,
    importPack,
    isExporting,
    isImporting,
    lastImportResult,
    clearImportResult,
    getCustomSymbols,
    getCustomCategories,
    getBoards,
  } = useSymbolEditorStore();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [packOptions, setPackOptions] = useState<SymbolPackExportOptions>({
    includeSymbols: true,
    includeCategories: true,
    includeBoards: true,
    includeImages: true,
    includeAudio: true,
    format: 'json',
    name: '',
    description: '',
    author: '',
  });

  const symbols = getCustomSymbols();
  const categories = getCustomCategories();
  const boards = getBoards();

  const handleExport = () => {
    const result = exportPack(packOptions);
    // Trigger download
    const blob = new Blob([result], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${packOptions.name || 'talkboard-pack'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setImportError('Please select a .json file');
      return;
    }
    setImportFile(file);
    setImportError(null);
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      const text = await importFile.text();
      // Validate it's valid JSON before passing
      JSON.parse(text);
      importPack(text);
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      setImportError('Failed to read or parse the file. Make sure it is valid JSON.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'export'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📤 Export
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'import'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📥 Import
        </button>
      </div>

      {/* Export panel */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              What will be exported
            </h4>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
              <p>• {symbols.length} custom symbol{symbols.length !== 1 ? 's' : ''}</p>
              <p>• {categories.length} custom categor{categories.length !== 1 ? 'ies' : 'y'}</p>
              <p>• {boards.length} board{boards.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Pack metadata */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pack Name
              </label>
              <input
                type="text"
                value={packOptions.name || ''}
                onChange={(e) =>
                  setPackOptions({ ...packOptions, name: e.target.value })
                }
                placeholder="My Symbol Pack"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={packOptions.description || ''}
                onChange={(e) =>
                  setPackOptions({
                    ...packOptions,
                    description: e.target.value,
                  })
                }
                placeholder="Describe this symbol pack..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={packOptions.author || ''}
                onChange={(e) =>
                  setPackOptions({ ...packOptions, author: e.target.value })
                }
                placeholder="Your name"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Options
            </h4>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={packOptions.includeImages}
                onChange={(e) =>
                  setPackOptions({
                    ...packOptions,
                    includeImages: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              Include images
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={packOptions.includeAudio}
                onChange={(e) =>
                  setPackOptions({
                    ...packOptions,
                    includeAudio: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              Include audio
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={packOptions.includeBoards}
                onChange={(e) =>
                  setPackOptions({
                    ...packOptions,
                    includeBoards: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              Include boards
            </label>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting || symbols.length === 0}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : '📤 Export Pack'}
          </button>

          {symbols.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Create some custom symbols before exporting.
            </p>
          )}
        </div>
      )}

      {/* Import panel */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
              ⚠️ Import Notice
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Importing a pack will add new symbols and categories. Duplicates
              (by ID) will be skipped. Your existing data will not be overwritten.
            </p>
          </div>

          {/* File selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Select Pack File
            </label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-3xl mb-2">📁</p>
              {importFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {importFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click to select a .json symbol pack
                </p>
              )}
            </div>
          </div>

          {importError && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-xs text-red-600 dark:text-red-400">
              {importError}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!importFile || isImporting}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl text-sm font-medium transition disabled:cursor-not-allowed"
          >
            {isImporting ? 'Importing...' : '📥 Import Pack'}
          </button>

          {/* Import result */}
          {lastImportResult && (
            <div
              className={`p-3 rounded-xl ${
                lastImportResult.success
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <h4
                className={`text-sm font-medium mb-1 ${
                  lastImportResult.success
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}
              >
                {lastImportResult.success ? '✅ Import Complete' : '❌ Import Failed'}
              </h4>
              <div
                className={`text-xs space-y-0.5 ${
                  lastImportResult.success
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                <p>Symbols imported: {lastImportResult.symbolsImported}</p>
                <p>Categories imported: {lastImportResult.categoriesImported}</p>
                <p>Boards imported: {lastImportResult.boardsImported}</p>
                {lastImportResult.warnings.length > 0 && (
                  <div className="mt-1">
                    <p className="font-medium">Warnings:</p>
                    {lastImportResult.warnings.slice(0, 5).map((w, i) => (
                      <p key={i}>• {w}</p>
                    ))}
                  </div>
                )}
                {lastImportResult.errors.length > 0 && (
                  <div className="mt-1">
                    <p className="font-medium">Errors:</p>
                    {lastImportResult.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                    {lastImportResult.errors.length > 5 && (
                      <p>...and {lastImportResult.errors.length - 5} more</p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={clearImportResult}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
