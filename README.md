# TalkBoard

> An inclusive, modular AAC platform that empowers non-verbal communication with adaptive learning, collaboration, and data-driven personalization.

---

## Elevator pitch

TalkBoard is a progressive web app for Augmentative and Alternative Communication (AAC) that puts expressive communication tools, adaptive practice, and caregiver workflows in one fast, offline-capable package.

## Demo & Proof Pack

- Demo video (3 min): `proof-pack/talkboard-demo.webm`
- Screenshots: `proof-pack/screenshots/` (43 full-page screenshots)
- Proof README: `proof-pack/README.md`

These artifacts were generated with a Playwright recorder script (`scripts/record-demo.ts`).

## Project Story

### Inspiration

TalkBoard was inspired by real-world AAC needs — caregivers and clinicians who needed a single, flexible toolbox rather than many fragmented apps. The goal was to design an app that is fast in-the-moment, yet powerful enough for clinical workflows and research.

### What I learned

- Accessibility and extensibility must be designed up-front (typed services, small components, and testable stores).
- Deterministic UI automation with Playwright enables reproducible demo assets (video + screenshots).
- Balancing bundle size and development ergonomics requires careful code-splitting and deferred loading.

Some measured outcomes from this project:

- Source lines: $$L = 52{,}128$$
- Modules built: 259
- Tests: $$\frac{386}{386} \times 100\% = 100\%$$ passing

### How it was built

1. Define types and services for each domain (symbols, analytics, adaptive learning, caregiver workflows).
2. Implement compact, reusable components and compose pages using React Router.
3. Persist state with Zustand and add a service-worker for PWA support.
4. Create unit tests (Vitest) and Playwright flows for E2E and demo capture.

Quick start:

```bash
npm install
npm run dev
# open http://localhost:5177/
```

## Built with

- TypeScript, React 19
- Vite, Tailwind CSS
- Zustand (state), React Router
- Vitest + React Testing Library
- Playwright (non-headless) for E2E and demo recording
- PWA: service worker + manifest

## Features

- Symbol grid + sentence builder
- Adaptive learning and practice
- Caregiver dashboard and session history
- Data visualization and reporting
- Collaboration and gamification modules
- Communication Partner and Assessment modules
- PWA support (offline-capable)

## Running tests and build

Run unit tests:

```bash
npx vitest run
```

Create a production build:

```bash
npm run build
```

## Repository & commit

This repository is public at: https://github.com/aaravjj2/TalkBoard

Latest notable commit: `6087676` — added the proof-pack video and screenshots.

## Contributing

Contributions, bug reports, and pull requests are welcome. Please open issues on the GitHub repo.

## License

This project is open source. Add your preferred license here (MIT, Apache-2.0, etc.).
