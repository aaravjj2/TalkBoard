import { APP_NAME } from '@/constants';

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6" data-testid="help-page">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Help & Guide
      </h1>

      <Section title="What is TalkBoard?" icon="💬">
        <p>
          {APP_NAME} is an Augmentative and Alternative Communication (AAC) app
          that helps people communicate by selecting picture symbols that are
          converted into spoken sentences using AI.
        </p>
      </Section>

      <Section title="How to Use" icon="📖">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Select a category</strong> — Use the tabs to browse
            different symbol categories (People, Actions, Food, etc.)
          </li>
          <li>
            <strong>Tap symbols</strong> — Tap the picture symbols you want to
            include in your sentence. They appear in the sentence bar at the top.
          </li>
          <li>
            <strong>Speak</strong> — Tap the Speak button to generate and hear
            a natural sentence from your selected symbols.
          </li>
          <li>
            <strong>Clear or edit</strong> — Remove individual symbols by
            tapping them in the sentence bar, or clear all with the trash button.
          </li>
        </ol>
      </Section>

      <Section title="Quick Phrases" icon="⚡">
        <p>
          Frequently used sentences are saved automatically (if enabled in
          Settings). Access them from the Quick Phrases page for one-tap
          speaking.
        </p>
      </Section>

      <Section title="Search" icon="🔍">
        <p>
          Use the search bar to find symbols by name or keyword across all
          categories.
        </p>
      </Section>

      <Section title="Settings" icon="⚙️">
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Voice</strong> — Change the speaking voice, speed, pitch,
            and volume.
          </li>
          <li>
            <strong>Appearance</strong> — Toggle dark mode, adjust font size,
            and change grid size.
          </li>
          <li>
            <strong>Accessibility</strong> — Enable high contrast mode and
            other accessibility features.
          </li>
          <li>
            <strong>Caregiver PIN</strong> — Set a PIN to protect advanced
            settings.
          </li>
        </ul>
      </Section>

      <Section title="Caregiver Mode" icon="🔒">
        <p>
          Caregiver mode provides access to usage statistics, symbol
          customization, data management, and advanced settings. Protected with
          an optional PIN.
        </p>
      </Section>

      <Section title="History" icon="📋">
        <p>
          All spoken sentences are saved in History. You can replay them,
          favorite them for quick access, or remove entries you no longer need.
        </p>
      </Section>

      <Section title="Accessibility" icon="♿">
        <ul className="list-disc list-inside space-y-1">
          <li>Full keyboard navigation with arrow keys</li>
          <li>Screen reader support with ARIA labels</li>
          <li>High contrast mode for low vision</li>
          <li>Large touch targets (44px minimum)</li>
          <li>Adjustable font sizes</li>
          <li>Reduced motion support</li>
        </ul>
      </Section>

      <Section title="Keyboard Shortcuts" icon="⌨️">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Shortcut keys="↑ ↓ ← →" action="Navigate symbols" />
          <Shortcut keys="Enter / Space" action="Select symbol" />
          <Shortcut keys="Backspace" action="Remove last symbol" />
          <Shortcut keys="Escape" action="Close modal / menu" />
          <Shortcut keys="Ctrl + S" action="Speak sentence" />
          <Shortcut keys="Ctrl + Delete" action="Clear all" />
        </div>
      </Section>

      <Section title="Privacy & Data" icon="🔐">
        <p>
          All data is stored locally on your device using your browser's
          localStorage. No personal data is sent to external servers except for
          AI sentence generation, which sends only the selected symbol labels
          (no user identifiers).
        </p>
      </Section>

      <Section title="Troubleshooting" icon="🔧">
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>No sound?</strong> — Check your device volume and ensure
            your browser allows audio playback.
          </li>
          <li>
            <strong>Sentence not generating?</strong> — Check your internet
            connection. The fallback generator works offline.
          </li>
          <li>
            <strong>Data lost?</strong> — Clearing browser data will remove
            TalkBoard data. Use the Export feature in Settings to back up
            regularly.
          </li>
        </ul>
      </Section>

      <div className="text-center text-sm text-gray-400 py-4">
        {APP_NAME} v1.0 — Built with ❤️ for accessible communication
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4" data-testid={`help-section-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        {children}
      </div>
    </section>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex items-center gap-2">
      <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
        {keys}
      </kbd>
      <span className="text-gray-500 dark:text-gray-400">{action}</span>
    </div>
  );
}
