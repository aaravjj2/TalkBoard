import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { v4 as uuidv4 } from 'uuid';

export default function OnboardingPage() {
  const { setProfile, setOnboardingComplete } = useUserStore();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const handleComplete = () => {
    setProfile({
      id: uuidv4(),
      name: name.trim() || 'User',
      avatar: '😊',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setOnboardingComplete(true);
    addToast('Welcome to TalkBoard! 🎉', 'success');
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-6">
      <span className="text-7xl block">💬</span>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">
        Welcome to TalkBoard
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        A modern AAC (Augmentative and Alternative Communication) app that helps
        you express yourself through symbols and AI-powered sentence generation.
      </p>
      <button
        onClick={() => setStep(1)}
        className="btn-primary text-lg px-8 py-3"
        data-testid="onboarding-next-0"
      >
        Get Started →
      </button>
    </div>,

    // Step 1: How it works
    <div key="how" className="text-center space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        How It Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <Feature
          emoji="🧩"
          title="Select Symbols"
          description="Browse categories and tap picture symbols to build your message"
        />
        <Feature
          emoji="🤖"
          title="AI Generates"
          description="AI converts your symbols into natural, grammatical sentences"
        />
        <Feature
          emoji="🔊"
          title="Speak Aloud"
          description="Your sentence is spoken aloud with customizable voice settings"
        />
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(0)} className="btn-secondary">
          ← Back
        </button>
        <button
          onClick={() => setStep(2)}
          className="btn-primary"
          data-testid="onboarding-next-1"
        >
          Next →
        </button>
      </div>
    </div>,

    // Step 2: Name
    <div key="name" className="text-center space-y-6">
      <span className="text-5xl block">👋</span>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        What's your name?
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        This helps personalize your experience. You can change it later.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="input-field max-w-xs mx-auto text-center text-lg"
        autoFocus
        data-testid="onboarding-name-input"
      />
      <div className="flex gap-3 justify-center">
        <button onClick={() => setStep(1)} className="btn-secondary">
          ← Back
        </button>
        <button
          onClick={handleComplete}
          className="btn-primary"
          data-testid="onboarding-complete"
        >
          Start Using TalkBoard 🎉
        </button>
      </div>
    </div>,
  ];

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4"
      data-testid="onboarding-page"
    >
      <div className="card p-8 max-w-xl w-full">{steps[step]}</div>

      {/* Progress dots */}
      <div className="fixed bottom-8 flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Feature({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
      <span className="text-3xl block mb-2">{emoji}</span>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
