import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToastContainer from '@/components/common/ToastContainer';
import { useUIStore } from '@/stores/uiStore';
import { act } from '@testing-library/react';

describe('ToastContainer', () => {
  beforeEach(() => {
    act(() => {
      useUIStore.getState().clearToasts();
    });
  });

  it('renders toast container', () => {
    render(<ToastContainer />);
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  it('renders with role="status"', () => {
    render(<ToastContainer />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<ToastContainer />);
    expect(screen.getByTestId('toast-container')).toHaveAttribute('aria-live', 'polite');
  });

  it('displays success toast', () => {
    const { rerender } = render(<ToastContainer />);
    act(() => {
      useUIStore.getState().addToast('Operation successful', 'success');
    });
    rerender(<ToastContainer />);
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('displays error toast', () => {
    const { rerender } = render(<ToastContainer />);
    act(() => {
      useUIStore.getState().addToast('Something went wrong', 'error');
    });
    rerender(<ToastContainer />);
    expect(screen.getByTestId('toast-error')).toBeInTheDocument();
  });

  it('displays warning toast', () => {
    const { rerender } = render(<ToastContainer />);
    act(() => {
      useUIStore.getState().addToast('Be careful', 'warning');
    });
    rerender(<ToastContainer />);
    expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
  });

  it('displays info toast', () => {
    const { rerender } = render(<ToastContainer />);
    act(() => {
      useUIStore.getState().addToast('FYI', 'info');
    });
    rerender(<ToastContainer />);
    expect(screen.getByTestId('toast-info')).toBeInTheDocument();
  });

  it('displays multiple toasts', () => {
    const { rerender } = render(<ToastContainer />);
    act(() => {
      useUIStore.getState().addToast('First', 'success');
      useUIStore.getState().addToast('Second', 'error');
    });
    rerender(<ToastContainer />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('renders toast with role="alert"', () => {
    const { rerender } = render(<ToastContainer />);
    act(() => {
      useUIStore.getState().addToast('Alert test', 'info');
    });
    rerender(<ToastContainer />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
