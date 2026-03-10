/**
 * PinDialog — Modal for entering caregiver PIN
 */
import { useState, useRef, useEffect } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';

export default function PinDialog() {
  const {
    showPinDialog,
    setShowPinDialog,
    verifyAndLogin,
    isLockedOut,
    lockoutRemainingMs,
    error,
    clearError,
  } = useCaregiverStore();

  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutDisplay, setLockoutDisplay] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPinDialog) {
      setPin('');
      clearError();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showPinDialog, clearError]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLockedOut || lockoutRemainingMs <= 0) {
      setLockoutDisplay('');
      return;
    }

    const updateDisplay = () => {
      const remaining = lockoutRemainingMs - (Date.now() % lockoutRemainingMs);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setLockoutDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [isLockedOut, lockoutRemainingMs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4 || isSubmitting || isLockedOut) return;

    setIsSubmitting(true);
    // Small delay for UX
    setTimeout(() => {
      verifyAndLogin(pin);
      setIsSubmitting(false);
      setPin('');
    }, 200);
  };

  const handlePinChange = (value: string) => {
    // Only allow digits, max 8
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setPin(cleaned);
    clearError();
  };

  const handleClose = () => {
    setShowPinDialog(false);
    setPin('');
    clearError();
  };

  if (!showPinDialog) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Enter caregiver PIN"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Caregiver Access</h2>
              <p className="text-sm text-blue-100 mt-1">Enter your PIN to continue</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lockout warning */}
          {isLockedOut && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
              <p className="text-red-700 dark:text-red-300 font-medium">Account Locked</p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                Too many failed attempts. Try again in {lockoutDisplay}
              </p>
            </div>
          )}

          {/* PIN dots visualization */}
          <div className="flex justify-center gap-3 py-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  i < pin.length
                    ? 'bg-blue-500 scale-110'
                    : i < 4
                    ? 'bg-gray-300 dark:bg-gray-600'
                    : 'bg-gray-200 dark:bg-gray-700 opacity-40'
                }`}
              />
            ))}
          </div>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            className="sr-only"
            aria-label="PIN input"
            autoComplete="off"
            disabled={isLockedOut}
          />

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinChange(pin + num)}
                disabled={isLockedOut || pin.length >= 8}
                className="h-14 text-xl font-medium rounded-xl bg-gray-100 dark:bg-gray-700 
                  hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500
                  disabled:opacity-50 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              disabled={isLockedOut}
              className="h-14 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handlePinChange(pin + '0')}
              disabled={isLockedOut || pin.length >= 8}
              className="h-14 text-xl font-medium rounded-xl bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500
                disabled:opacity-50 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin(pin.slice(0, -1))}
              disabled={isLockedOut || pin.length === 0}
              className="h-14 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              aria-label="Delete last digit"
            >
              ⌫
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center animate-shake">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pin.length < 4 || isSubmitting || isLockedOut}
            className="w-full py-3 rounded-xl font-medium text-white
              bg-gradient-to-r from-blue-500 to-purple-600
              hover:from-blue-600 hover:to-purple-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all"
          >
            {isSubmitting ? 'Verifying...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
