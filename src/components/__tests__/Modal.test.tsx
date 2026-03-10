import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@/components/common/Modal';
import { useUIStore } from '@/stores/uiStore';
import { act } from '@testing-library/react';

describe('Modal', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.getState().closeModal();
    });
  });

  it('does not render when modal is closed', () => {
    render(<Modal />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders when modal is opened', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test Modal',
        message: 'Test message',
        onConfirm: vi.fn(),
      });
    });
    render(<Modal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('displays title and message', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Confirm Delete',
        message: 'Are you sure?',
        onConfirm: vi.fn(),
      });
    });
    render(<Modal />);
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('has role="dialog"', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
      });
    });
    render(<Modal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
      });
    });
    render(<Modal />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders confirm button', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
      });
    });
    render(<Modal />);
    expect(screen.getByTestId('modal-confirm')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
      });
    });
    render(<Modal />);
    expect(screen.getByTestId('modal-cancel')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm,
      });
    });
    render(<Modal />);
    fireEvent.click(screen.getByTestId('modal-confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('closes modal when cancel is clicked', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
      });
    });
    const { rerender } = render(<Modal />);
    fireEvent.click(screen.getByTestId('modal-cancel'));
    rerender(<Modal />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('uses custom confirm text', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
        confirmText: 'Yes, Delete',
      });
    });
    render(<Modal />);
    expect(screen.getByTestId('modal-confirm')).toHaveTextContent('Yes, Delete');
  });

  it('uses custom cancel text', () => {
    act(() => {
      useUIStore.getState().openModal({
        title: 'Test',
        message: 'Body',
        onConfirm: vi.fn(),
        cancelText: 'Go Back',
      });
    });
    render(<Modal />);
    expect(screen.getByTestId('modal-cancel')).toHaveTextContent('Go Back');
  });
});
