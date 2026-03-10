import { useSymbols } from '@/hooks/useSymbols';
import { useSentence } from '@/hooks/useSentence';
import { useTTS } from '@/hooks/useTTS';
import { useSettings } from '@/hooks/useSettings';
import CategoryTabs from '@/components/AAC/CategoryTabs';
import SymbolGrid from '@/components/AAC/SymbolGrid';
import SentenceBar from '@/components/AAC/SentenceBar';
import SearchBar from '@/components/AAC/SearchBar';

export default function HomePage() {
  const {
    activeCategory,
    setActiveCategory,
    filteredSymbols,
    categorySymbols,
    searchQuery,
    setSearchQuery,
    selectSymbol,
    selectedSymbols,
    removeSymbol,
    removeLastSymbol,
    clearSymbols,
  } = useSymbols();

  const {
    generatedSentence,
    aiStatus,
    speakAndSave,
    stopSpeaking,
    clearAndReset,
  } = useSentence();

  const { isSpeaking } = useTTS();
  const { settings } = useSettings();

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakAndSave();
    }
  };

  const displaySymbols = searchQuery.trim()
    ? filteredSymbols
    : categorySymbols;

  return (
    <div
      className="flex flex-col h-full"
      data-testid="home-page"
    >
      {/* Sentence Bar — top */}
      <SentenceBar
        symbols={selectedSymbols}
        generatedSentence={generatedSentence}
        isGenerating={aiStatus === 'loading'}
        onRemoveSymbol={removeSymbol}
        onRemoveLast={removeLastSymbol}
        onClear={clearAndReset}
        onSpeak={handleSpeak}
        isSpeaking={isSpeaking}
      />

      {/* Search */}
      <div className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </div>

      {/* Category tabs */}
      {!searchQuery.trim() && (
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      {/* Symbol grid — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <SymbolGrid
          symbols={displaySymbols}
          activeCategory={activeCategory}
          onSymbolSelect={selectSymbol}
          gridSize={settings.gridSize}
          isSearchResult={!!searchQuery.trim()}
        />
      </div>
    </div>
  );
}
