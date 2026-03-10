import { useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useFocusTrap } from '@/hooks/useAccessibility';

export default function Modal() {
  const { isModalOpen, modalContent, closeModal } = useUIStore();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isModalOpen);

  useEffect(() => {
    if (isModalOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || !modalContent) return null;

  const { title, message, onConfirm, onCancel, confirmText, cancelText, variant } =
    modalContent;

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-testid="modal"
    >
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="modal-title"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
        >
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="btn-secondary"
            data-testid="modal-cancel"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            data-testid="modal-confirm"
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
