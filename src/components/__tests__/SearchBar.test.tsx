import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/AAC/SearchBar';

describe('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onClear: vi.fn(),
  };

  it('renders search input', () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders with role="search"', () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<SearchBar {...defaultProps} value="hello" />);
    expect(screen.getByTestId('search-input')).toHaveValue('hello');
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchBar {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when value is not empty', () => {
    render(<SearchBar {...defaultProps} value="something" />);
    expect(screen.getByTestId('search-clear')).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    render(<SearchBar {...defaultProps} value="" />);
    expect(screen.queryByTestId('search-clear')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const onClear = vi.fn();
    render(<SearchBar {...defaultProps} value="hello" onClear={onClear} />);
    fireEvent.click(screen.getByTestId('search-clear'));
    expect(onClear).toHaveBeenCalled();
  });

  it('uses custom placeholder', () => {
    render(<SearchBar {...defaultProps} placeholder="Find symbols..." />);
    expect(screen.getByPlaceholderText('Find symbols...')).toBeInTheDocument();
  });

  it('has accessible search input', () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByTestId('search-input');
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('aria-label');
  });
});
