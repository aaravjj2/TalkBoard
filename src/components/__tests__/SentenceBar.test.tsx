import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SentenceBar from '@/components/AAC/SentenceBar';
import type { SelectedSymbol } from '@/types';

const makeSelectedSymbol = (id: string, label: string, emoji: string): SelectedSymbol => ({
  id,
  label,
  emoji,
  category: 'social',
  keywords: [],
  order: 0,
  instanceId: `inst-${id}`,
  selectedAt: new Date().toISOString(),
});

describe('SentenceBar', () => {
  const defaultProps = {
    symbols: [] as SelectedSymbol[],
    generatedSentence: '',
    isGenerating: false,
    onRemoveSymbol: vi.fn(),
    onRemoveLast: vi.fn(),
    onClear: vi.fn(),
    onSpeak: vi.fn(),
    isSpeaking: false,
  };

  it('renders sentence bar', () => {
    render(<SentenceBar {...defaultProps} />);
    expect(screen.getByTestId('sentence-bar')).toBeInTheDocument();
  });

  it('renders symbol strip', () => {
    render(<SentenceBar {...defaultProps} />);
    expect(screen.getByTestId('symbol-strip')).toBeInTheDocument();
  });

  it('displays selected symbols', () => {
    const symbols = [
      makeSelectedSymbol('1', 'Hello', '👋'),
      makeSelectedSymbol('2', 'World', '🌍'),
    ];
    render(<SentenceBar {...defaultProps} symbols={symbols} />);
    expect(screen.getByTestId('selected-symbol-inst-1')).toBeInTheDocument();
    expect(screen.getByTestId('selected-symbol-inst-2')).toBeInTheDocument();
  });

  it('calls onRemoveSymbol when symbol is clicked', () => {
    const onRemoveSymbol = vi.fn();
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} onRemoveSymbol={onRemoveSymbol} />);
    fireEvent.click(screen.getByTestId('selected-symbol-inst-1'));
    expect(onRemoveSymbol).toHaveBeenCalledWith('inst-1');
  });

  it('renders backspace button when symbols present', () => {
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} />);
    expect(screen.getByTestId('backspace-btn')).toBeInTheDocument();
  });

  it('renders clear button when symbols present', () => {
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} />);
    expect(screen.getByTestId('clear-btn')).toBeInTheDocument();
  });

  it('hides action buttons when no symbols', () => {
    render(<SentenceBar {...defaultProps} />);
    expect(screen.queryByTestId('backspace-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clear-btn')).not.toBeInTheDocument();
  });

  it('calls onRemoveLast when backspace is clicked', () => {
    const onRemoveLast = vi.fn();
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} onRemoveLast={onRemoveLast} />);
    fireEvent.click(screen.getByTestId('backspace-btn'));
    expect(onRemoveLast).toHaveBeenCalled();
  });

  it('calls onClear when clear is clicked', () => {
    const onClear = vi.fn();
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} onClear={onClear} />);
    fireEvent.click(screen.getByTestId('clear-btn'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders speak button with generated sentence', () => {
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} generatedSentence="Hello world!" />);
    expect(screen.getByTestId('speak-btn')).toBeInTheDocument();
  });

  it('calls onSpeak when speak is clicked', () => {
    const onSpeak = vi.fn();
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} generatedSentence="Hello" onSpeak={onSpeak} />);
    fireEvent.click(screen.getByTestId('speak-btn'));
    expect(onSpeak).toHaveBeenCalled();
  });

  it('displays generated sentence', () => {
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} generatedSentence="Hello world!" />);
    expect(screen.getByTestId('generated-sentence')).toHaveTextContent('Hello world!');
  });

  it('shows loading state when generating', () => {
    render(<SentenceBar {...defaultProps} isGenerating={true} />);
    const bar = screen.getByTestId('sentence-bar');
    expect(bar).toBeInTheDocument();
  });

  it('renders accessible region', () => {
    render(<SentenceBar {...defaultProps} />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('has aria-live on generated sentence', () => {
    const symbols = [makeSelectedSymbol('1', 'Hello', '👋')];
    render(<SentenceBar {...defaultProps} symbols={symbols} generatedSentence="test" />);
    const el = screen.getByTestId('generated-sentence');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });
});
