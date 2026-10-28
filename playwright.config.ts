import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4318);
const widths = [375, 768, 1280];
const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  // One retry absorbs timing flakes under parallel load; the reporter still lists them as flaky.
  retries: 1,
  // Three engines in parallel are CPU heavy; WebKit on Windows is much slower than the others.
  workers: process.env.CI ? 2 : 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: browsers.flatMap((b) =>
    widths.map((w) => ({
      name: `${b.name}-${w}`,
      timeout: b.name === 'webkit' ? 90_000 : 45_000,
      use: { ...b.device, viewport: { width: w, height: w < 768 ? 812 : 900 }, isMobile: false, hasTouch: false },
    })),
  ),
  webServer: {
    // npm run e2e builds dist-e2e first (fake public keys from .env.e2e).
    command: `npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
