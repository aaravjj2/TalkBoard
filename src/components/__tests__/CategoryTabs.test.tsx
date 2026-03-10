import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryTabs from '@/components/AAC/CategoryTabs';
import type { SymbolCategoryId } from '@/types';
import { CATEGORIES } from '@/data/categories';

describe('CategoryTabs', () => {
  const defaultProps = {
    activeCategory: 'people' as SymbolCategoryId,
    onCategoryChange: vi.fn(),
  };

  it('renders tab list', () => {
    render(<CategoryTabs {...defaultProps} />);
    expect(screen.getByTestId('category-tabs')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders all category tabs', () => {
    render(<CategoryTabs {...defaultProps} />);
    CATEGORIES.forEach((cat) => {
      expect(screen.getByTestId(`category-tab-${cat.id}`)).toBeInTheDocument();
    });
  });

  it('marks active tab with aria-selected', () => {
    render(<CategoryTabs {...defaultProps} />);
    const active = screen.getByTestId('category-tab-people');
    expect(active).toHaveAttribute('aria-selected', 'true');
  });

  it('marks inactive tabs with aria-selected false', () => {
    render(<CategoryTabs {...defaultProps} />);
    const inactive = screen.getByTestId('category-tab-actions');
    expect(inactive).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onCategoryChange when tab is clicked', () => {
    const onChange = vi.fn();
    render(<CategoryTabs {...defaultProps} onCategoryChange={onChange} />);
    fireEvent.click(screen.getByTestId('category-tab-actions'));
    expect(onChange).toHaveBeenCalledWith('actions');
  });

  it('renders emoji and label for each tab', () => {
    render(<CategoryTabs {...defaultProps} />);
    CATEGORIES.forEach((cat) => {
      const tab = screen.getByTestId(`category-tab-${cat.id}`);
      expect(tab.textContent).toContain(cat.icon);
      expect(tab.textContent).toContain(cat.label);
    });
  });

  it('applies role="tab" to each button', () => {
    render(<CategoryTabs {...defaultProps} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(CATEGORIES.length);
  });

  it('changes active category highlighting', () => {
    const { rerender } = render(<CategoryTabs {...defaultProps} />);
    expect(screen.getByTestId('category-tab-people')).toHaveAttribute('aria-selected', 'true');

    rerender(<CategoryTabs {...defaultProps} activeCategory="food" />);
    expect(screen.getByTestId('category-tab-food')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('category-tab-people')).toHaveAttribute('aria-selected', 'false');
  });
});
