import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const projectRoot = new URL('../../', import.meta.url);
const reportsDir = new URL('../../qa-reports/lighthouse/', import.meta.url);
const baseURL = process.env.LIGHTHOUSE_BASE_URL ?? 'http://127.0.0.1:3000';
const chromePath = process.env.LIGHTHOUSE_CHROME_PATH ?? '/usr/bin/google-chrome';

const urls = [
  { slug: 'homepage', path: '/' },
  { slug: 'pricing', path: '/pricing' },
  { slug: 'login', path: '/login' },
];

mkdirSync(reportsDir, { recursive: true });

function startDevServer() {
  return spawn('npm', ['run', 'dev', '--', '--hostname', '127.0.0.1', '--port', '3000'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });
}

async function waitForServer(url, timeoutMs = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok || [301, 302, 307, 308].includes(response.status)) {
        return;
      }
    } catch {}
    await delay(1500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function runLighthouse(url, slug) {
  return new Promise((resolve, reject) => {
    const outputPath = new URL(`../../qa-reports/lighthouse/${slug}`, import.meta.url);
    const child = spawn(
      'npx',
      [
        'lighthouse',
        url,
        '--quiet',
        '--chrome-path=' + chromePath,
        '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
        '--preset=desktop',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=html',
        '--output=json',
        '--output-path=' + outputPath.pathname,
      ],
      {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env },
      },
    );

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Lighthouse failed for ${url} with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

let server;
let startedServer = false;

try {
  try {
    await waitForServer(baseURL, 2500);
    console.log(`Using existing dev server at ${baseURL}`);
  } catch {
    server = startDevServer();
    startedServer = true;
    await waitForServer(baseURL);
  }

  for (const entry of urls) {
    const url = new URL(entry.path, baseURL).toString();
    console.log(`\nRunning Lighthouse for ${url}`);
    await runLighthouse(url, entry.slug);
  }

  console.log('\nLighthouse reports saved to qa-reports/lighthouse');
} finally {
  if (startedServer && server) {
    server.kill('SIGTERM');
  }
}
