/**
 * TalkBoard — 3-Minute Demo Video + Proof Pack Recorder
 * Navigates through every major feature, records video via Playwright,
 * and captures full-page screenshots for the proof pack.
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5177';
const OUT_DIR = path.resolve('./proof-pack');
const SCREENSHOTS_DIR = path.join(OUT_DIR, 'screenshots');
const VIDEO_DIR = path.join(OUT_DIR, 'video');

// Helper: wait
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper: take a named screenshot
async function shot(page: import('playwright').Page, name: string) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  📸  ${name}`);
}

// Helper: fill onboarding if present
async function skipOnboarding(page: import('playwright').Page) {
  try {
    const btn = page.locator('button:has-text("Get Started")');
    if (await btn.isVisible({ timeout: 3000 })) {
      await btn.click();
      await wait(800);
    }
  } catch { /* already past onboarding */ }
}

async function main() {
  // Ensure output dirs exist
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  console.log('\n🎬  TalkBoard Demo Recorder');
  console.log('════════════════════════════');

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1440,900', '--disable-gpu-compositing'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // ─── 0. Onboarding / Home ─────────────────────────────────────────────
  console.log('\n[0/20] Home Page');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await wait(1500);
  await skipOnboarding(page);
  await wait(1500);
  await shot(page, '00-home');

  // Interact: click a few symbols
  try {
    const symbols = page.locator('[data-testid="symbol-button"]');
    const count = await symbols.count();
    if (count > 0) {
      await symbols.nth(0).click();
      await wait(500);
      if (count > 1) { await symbols.nth(1).click(); await wait(500); }
      if (count > 2) { await symbols.nth(2).click(); await wait(500); }
    }
  } catch { /* symbols may have different selectors */ }
  await shot(page, '01-home-symbols-selected');
  await wait(1000);

  // ─── 1. Analytics ──────────────────────────────────────────────────────
  console.log('[1/20] Analytics');
  await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '02-analytics');
  // Scroll down to see charts
  await page.evaluate(() => window.scrollTo(0, 400));
  await wait(1000);
  await shot(page, '03-analytics-charts');

  // ─── 2. Symbol Editor ─────────────────────────────────────────────────
  console.log('[2/20] Symbol Editor');
  await page.goto(`${BASE_URL}/symbol-editor`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '04-symbol-editor');
  await page.evaluate(() => window.scrollTo(0, 400));
  await wait(800);
  await shot(page, '05-symbol-editor-grid');

  // ─── 3. Adaptive Learning ─────────────────────────────────────────────
  console.log('[3/20] Adaptive Learning');
  await page.goto(`${BASE_URL}/adaptive-learning`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '06-adaptive-learning');
  // Click through tabs
  try {
    const tabs = page.locator('button').filter({ hasText: /patterns|insights|session/i });
    if (await tabs.count() > 0) { await tabs.first().click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '07-adaptive-learning-tab');

  // ─── 4. Caregiver Dashboard ───────────────────────────────────────────
  console.log('[4/20] Caregiver Dashboard');
  await page.goto(`${BASE_URL}/caregiver`, { waitUntil: 'networkidle' });
  await wait(2500);
  await shot(page, '08-caregiver-dashboard');
  await page.evaluate(() => window.scrollTo(0, 300));
  await wait(800);
  await shot(page, '09-caregiver-details');

  // ─── 5. Security ──────────────────────────────────────────────────────
  console.log('[5/20] Security & Privacy');
  await page.goto(`${BASE_URL}/security`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '10-security');
  // Scroll down
  await page.evaluate(() => window.scrollTo(0, 500));
  await wait(800);
  await shot(page, '11-security-settings');

  // ─── 6. Multi-Modal Input ─────────────────────────────────────────────
  console.log('[6/20] Multi-Modal Input');
  await page.goto(`${BASE_URL}/multi-modal`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '12-multi-modal');
  try {
    const voiceTab = page.locator('button:has-text("Voice")');
    if (await voiceTab.isVisible({ timeout: 2000 })) {
      await voiceTab.click(); await wait(1000);
    }
  } catch { /* */ }
  await shot(page, '13-multi-modal-voice');

  // ─── 7. Data Visualization ────────────────────────────────────────────
  console.log('[7/20] Data Visualization');
  await page.goto(`${BASE_URL}/visualization`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '14-visualization');
  // Click Charts tab
  try {
    const chartsTab = page.locator('button:has-text("Charts")');
    if (await chartsTab.isVisible({ timeout: 2000 })) {
      await chartsTab.click(); await wait(1500);
    }
  } catch { /* */ }
  await shot(page, '15-visualization-charts');
  // Click Heatmap tab
  try {
    const heatmapTab = page.locator('button:has-text("Heatmap")');
    if (await heatmapTab.isVisible({ timeout: 2000 })) {
      await heatmapTab.click(); await wait(1500);
    }
  } catch { /* */ }
  await shot(page, '16-visualization-heatmap');

  // ─── 8. Collaboration ─────────────────────────────────────────────────
  console.log('[8/20] Collaboration');
  await page.goto(`${BASE_URL}/collaboration`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '17-collaboration');
  try {
    const teamTab = page.locator('button:has-text("Team")');
    if (await teamTab.isVisible({ timeout: 2000 })) { await teamTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '18-collaboration-team');
  try {
    const msgTab = page.locator('button:has-text("Messages")');
    if (await msgTab.isVisible({ timeout: 2000 })) { await msgTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '19-collaboration-messages');

  // ─── 9. Gamification ──────────────────────────────────────────────────
  console.log('[9/20] Gamification');
  await page.goto(`${BASE_URL}/gamification`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '20-gamification');
  try {
    const achieveTab = page.locator('button:has-text("Achievements")');
    if (await achieveTab.isVisible({ timeout: 2000 })) { await achieveTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '21-gamification-achievements');
  try {
    const leaderTab = page.locator('button:has-text("Leaderboard")');
    if (await leaderTab.isVisible({ timeout: 2000 })) { await leaderTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '22-gamification-leaderboard');
  try {
    const streakTab = page.locator('button:has-text("Streak")');
    if (await streakTab.isVisible({ timeout: 2000 })) { await streakTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '23-gamification-streak');

  // ─── 10. Communication Partner ────────────────────────────────────────
  console.log('[10/20] Communication Partner');
  await page.goto(`${BASE_URL}/communication-partner`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '24-communication-partner');
  try {
    const sessionsTab = page.locator('button:has-text("Sessions")');
    if (await sessionsTab.isVisible({ timeout: 2000 })) { await sessionsTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '25-communication-partner-sessions');
  try {
    const strategiesTab = page.locator('button:has-text("Strategies")');
    if (await strategiesTab.isVisible({ timeout: 2000 })) { await strategiesTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '26-communication-partner-strategies');
  // Expand a strategy
  try {
    const expandBtn = page.locator('[data-testid="strategy-card"]').first();
    if (await expandBtn.isVisible({ timeout: 2000 })) { await expandBtn.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '27-communication-strategy-expanded');

  // ─── 11. Assessment & Reporting ───────────────────────────────────────
  console.log('[11/20] Assessment & Reporting');
  await page.goto(`${BASE_URL}/assessment`, { waitUntil: 'networkidle' });
  await wait(2000);
  await shot(page, '28-assessment-overview');
  try {
    const assessTab = page.locator('button:has-text("Assessments")');
    if (await assessTab.isVisible({ timeout: 2000 })) { await assessTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '29-assessment-list');
  try {
    const goalsTab = page.locator('button:has-text("Goals")');
    if (await goalsTab.isVisible({ timeout: 2000 })) { await goalsTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '30-assessment-goals');
  try {
    const progressTab = page.locator('button:has-text("Progress")');
    if (await progressTab.isVisible({ timeout: 2000 })) { await progressTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '31-assessment-progress');
  try {
    const benchTab = page.locator('button:has-text("Benchmark")');
    if (await benchTab.isVisible({ timeout: 2000 })) { await benchTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '32-assessment-benchmarks');
  try {
    const reportsTab = page.locator('button:has-text("Reports")');
    if (await reportsTab.isVisible({ timeout: 2000 })) { await reportsTab.click(); await wait(1000); }
  } catch { /* */ }
  await shot(page, '33-assessment-reports');
  // Generate a report
  try {
    const genBtn = page.locator('button:has-text("Generate")').first();
    if (await genBtn.isVisible({ timeout: 2000 })) { await genBtn.click(); await wait(2000); }
  } catch { /* */ }
  await shot(page, '34-assessment-report-generated');

  // ─── 12. Quick Phrases ────────────────────────────────────────────────
  console.log('[12/20] Quick Phrases');
  await page.goto(`${BASE_URL}/quick-phrases`, { waitUntil: 'networkidle' });
  await wait(1800);
  await shot(page, '35-quick-phrases');

  // ─── 13. History ──────────────────────────────────────────────────────
  console.log('[13/20] History');
  await page.goto(`${BASE_URL}/history`, { waitUntil: 'networkidle' });
  await wait(1800);
  await shot(page, '36-history');

  // ─── 14. Profile ──────────────────────────────────────────────────────
  console.log('[14/20] Profile');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await wait(1800);
  await shot(page, '37-profile');

  // ─── 15. Settings ─────────────────────────────────────────────────────
  console.log('[15/20] Settings');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await wait(1800);
  await shot(page, '38-settings');
  await page.evaluate(() => window.scrollTo(0, 400));
  await wait(800);
  await shot(page, '39-settings-bottom');

  // ─── 16. Help ─────────────────────────────────────────────────────────
  console.log('[16/20] Help');
  await page.goto(`${BASE_URL}/help`, { waitUntil: 'networkidle' });
  await wait(1800);
  await shot(page, '40-help');

  // ─── 17. Dark Mode Toggle ─────────────────────────────────────────────
  console.log('[17/20] Dark mode');
  await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
  await wait(1000);
  await page.evaluate(() => document.documentElement.classList.toggle('dark'));
  await wait(1200);
  await shot(page, '41-home-dark-mode');

  // ─── 18. Back to Home — Final ─────────────────────────────────────────
  console.log('[18/20] Final home state');
  await page.evaluate(() => document.documentElement.classList.toggle('dark'));
  await wait(800);
  try {
    const symbols = page.locator('[data-testid="symbol-button"]');
    for (let i = 0; i < Math.min(5, await symbols.count()); i++) {
      await symbols.nth(i).click();
      await wait(400);
    }
  } catch { /* */ }
  await shot(page, '42-final-home');
  await wait(1500);

  // ─── 19. Wrapup pause ─────────────────────────────────────────────────
  console.log('[19/20] Wrapup pause...');
  await wait(3000);

  // ─── Close browser (stops video recording) ────────────────────────────
  console.log('[20/20] Closing — saving video...');
  await context.close();
  await browser.close();

  // ─── Find the recorded video ──────────────────────────────────────────
  const videoFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const rawVideo = path.join(VIDEO_DIR, videoFiles[0]);
    const finalVideo = path.join(OUT_DIR, 'talkboard-demo.webm');
    fs.renameSync(rawVideo, finalVideo);
    const sizeMB = (fs.statSync(finalVideo).size / 1024 / 1024).toFixed(1);
    console.log(`\n✅  Video saved: ${finalVideo} (${sizeMB} MB)`);
  } else {
    console.log('\n⚠️  No video file found in output dir');
  }

  const ssCount = fs.readdirSync(SCREENSHOTS_DIR).length;
  console.log(`✅  Screenshots: ${ssCount} images in ${SCREENSHOTS_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
