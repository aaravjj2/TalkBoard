/**
 * PinSetup — Wizard for initial PIN setup
 */
import { useState } from 'react';
import { useCaregiverStore } from '@/stores/caregiverStore';

type Step = 'intro' | 'create' | 'confirm' | 'profile' | 'done';

export default function PinSetup() {
  const {
    showSetupWizard,
    setShowSetupWizard,
    setupPin,
    createProfile,
  } = useCaregiverStore();

  const [step, setStep] = useState<Step>('intro');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileRole, setProfileRole] = useState<'parent' | 'therapist' | 'teacher' | 'aide' | 'other'>('parent');

  if (!showSetupWizard) return null;

  const handlePinChange = (value: string, setter: (v: string) => void) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    setter(cleaned);
    setError('');
  };

  const handleCreatePin = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmPin = () => {
    if (pin !== confirmPin) {
      setError('PINs do not match');
      setConfirmPin('');
      return;
    }
    setStep('profile');
  };

  const handleFinish = () => {
    const success = setupPin(pin);
    if (!success) {
      setError('Failed to set PIN');
      return;
    }

    if (profileName.trim()) {
      createProfile({
        name: profileName.trim(),
        role: profileRole,
      });
    }

    setStep('done');
    setTimeout(() => {
      setShowSetupWizard(false);
      resetState();
    }, 2000);
  };

  const resetState = () => {
    setStep('intro');
    setPin('');
    setConfirmPin('');
    setError('');
    setProfileName('');
    setProfileRole('parent');
  };

  const handleClose = () => {
    setShowSetupWizard(false);
    resetState();
  };

  const roleOptions = [
    { value: 'parent', label: 'Parent / Guardian', emoji: '👨‍👩‍👧' },
    { value: 'therapist', label: 'Speech Therapist', emoji: '🩺' },
    { value: 'teacher', label: 'Teacher', emoji: '👩‍🏫' },
    { value: 'aide', label: 'Classroom Aide', emoji: '🤝' },
    { value: 'other', label: 'Other', emoji: '👤' },
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Caregiver setup wizard"
      >
        {/* Progress */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Caregiver Setup</h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-1">
            {['intro', 'create', 'confirm', 'profile'].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  ['intro', 'create', 'confirm', 'profile', 'done'].indexOf(step) >=
                  ['intro', 'create', 'confirm', 'profile', 'done'].indexOf(s)
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="space-y-4 text-center">
              <div className="text-5xl">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Set Up Caregiver Mode
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Caregiver mode gives you access to advanced settings, usage analytics,
                communication goals, and the ability to customize the AAC experience.
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> View detailed usage reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Set communication goals
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Manage symbol visibility
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Configure restrictions & schedules
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Add notes and observations
                </li>
              </ul>
              <button
                onClick={() => setStep('create')}
                className="w-full py-3 rounded-xl font-medium text-white
                  bg-gradient-to-r from-blue-500 to-purple-600
                  hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step: Create PIN */}
          {step === 'create' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Create Your PIN
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Choose a 4-8 digit PIN to protect caregiver access
              </p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value, setPin)}
                placeholder="Enter PIN (4-8 digits)"
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border-2 rounded-xl
                  bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none
                  text-gray-900 dark:text-white"
                autoComplete="off"
                autoFocus
              />
              <div className="flex gap-2 items-center justify-center">
                {[4, 5, 6, 7, 8].map((len) => (
                  <div
                    key={len}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      pin.length >= len ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('intro')}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600
                    text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100
                    dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreatePin}
                  disabled={pin.length < 4}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white
                    bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirm PIN */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Confirm Your PIN
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Enter your PIN again to confirm
              </p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={confirmPin}
                onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
                placeholder="Re-enter PIN"
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border-2 rounded-xl
                  bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none
                  text-gray-900 dark:text-white"
                autoComplete="off"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('create'); setConfirmPin(''); setError(''); }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600
                    text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100
                    dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPin}
                  disabled={confirmPin.length < 4}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white
                    bg-blue-500 hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step: Profile */}
          {step === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Your Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Optional: Add your name and role
              </p>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-3 border-2 rounded-xl
                  bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none
                  text-gray-900 dark:text-white"
                autoFocus
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Your role:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setProfileRole(role.value)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-colors ${
                        profileRole === role.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <span className="text-2xl">{role.emoji}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{role.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600
                    text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100
                    dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white
                    bg-gradient-to-r from-blue-500 to-purple-600
                    hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="space-y-4 text-center py-6">
              <div className="text-5xl animate-bounce">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Set!</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Caregiver mode is now active. You can access the dashboard from the sidebar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
