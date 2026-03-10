import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SymbolGrid from '@/components/AAC/SymbolGrid';
import type { AACSymbol, SymbolCategoryId } from '@/types';

const makeSymbols = (count: number): AACSymbol[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `sym-${i}`,
    label: `Symbol ${i}`,
    emoji: '🧪',
    category: 'social' as SymbolCategoryId,
    keywords: [],
    order: i,
  }));

describe('SymbolGrid', () => {
  const defaultProps = {
    symbols: makeSymbols(6),
    activeCategory: 'social' as SymbolCategoryId,
    onSymbolSelect: vi.fn(),
  };

  it('renders grid', () => {
    render(<SymbolGrid {...defaultProps} />);
    expect(screen.getByTestId('symbol-grid')).toBeInTheDocument();
  });

  it('renders with role="grid"', () => {
    render(<SymbolGrid {...defaultProps} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders all symbols', () => {
    render(<SymbolGrid {...defaultProps} />);
    defaultProps.symbols.forEach((sym) => {
      expect(screen.getByTestId(`symbol-${sym.id}`)).toBeInTheDocument();
    });
  });

  it('displays emoji and label for each symbol', () => {
    const symbols = [{ id: 's1', label: 'Hello', emoji: '👋', category: 'social' as SymbolCategoryId, keywords: [], order: 0 }];
    render(<SymbolGrid {...defaultProps} symbols={symbols} />);
    const btn = screen.getByTestId('symbol-s1');
    expect(btn.textContent).toContain('👋');
    expect(btn.textContent).toContain('Hello');
  });

  it('calls onSymbolSelect when symbol is clicked', () => {
    const onSymbolSelect = vi.fn();
    render(<SymbolGrid {...defaultProps} onSymbolSelect={onSymbolSelect} />);
    fireEvent.click(screen.getByTestId('symbol-sym-0'));
    expect(onSymbolSelect).toHaveBeenCalledWith(defaultProps.symbols[0]);
  });

  it('renders gridcell role for each symbol', () => {
    render(<SymbolGrid {...defaultProps} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBe(6);
  });

  it('renders empty state when no symbols', () => {
    render(<SymbolGrid {...defaultProps} symbols={[]} />);
    expect(screen.getByTestId('symbol-grid-empty')).toBeInTheDocument();
  });

  it('applies gridSize styling', () => {
    const { container, rerender } = render(<SymbolGrid {...defaultProps} gridSize="small" />);
    expect(container.querySelector('[data-testid="symbol-grid"]')).toBeInTheDocument();

    rerender(<SymbolGrid {...defaultProps} gridSize="large" />);
    expect(container.querySelector('[data-testid="symbol-grid"]')).toBeInTheDocument();
  });

  it('renders with search result flag', () => {
    render(<SymbolGrid {...defaultProps} isSearchResult={true} />);
    expect(screen.getByTestId('symbol-grid')).toBeInTheDocument();
  });

  it('handles large number of symbols', () => {
    const manySymbols = makeSymbols(50);
    render(<SymbolGrid {...defaultProps} symbols={manySymbols} />);
    expect(screen.getAllByRole('gridcell').length).toBe(50);
  });
});
