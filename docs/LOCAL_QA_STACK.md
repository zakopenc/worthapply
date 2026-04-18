# WorthApply Local QA Stack

This repo now supports a fully local, no-vendor-cost QA workflow for marketing/auth smoke coverage and Lighthouse audits.

## What is included

### 1. Playwright smoke tests
Covers:
- marketing page rendering
- key CTA presence
- mobile nav visibility
- auth page rendering
- basic browser-level form validation
- SEO smoke checks (canonical, meta description, structured data, robots, sitemap)

### 2. Lighthouse audits
Runs local desktop Lighthouse audits against:
- `/`
- `/pricing`
- `/login`

Outputs HTML + JSON reports to:
- `qa-reports/lighthouse/`

### 3. Safer local middleware behavior
If Supabase env vars are missing locally, middleware now falls back to `NextResponse.next()` instead of crashing local QA runs.

Important:
- this is only a local/developer convenience fallback
- real protected app flows still require valid Supabase environment variables to be meaningfully tested

## Commands

### Install Playwright browser
```bash
npm run test:install-browsers
```

### Run smoke tests
```bash
npm run test:smoke
```

### Run full Playwright suite
```bash
npm run test:e2e
```

### Run headed Playwright tests
```bash
npm run test:e2e:headed
```

### Run Lighthouse audits
```bash
npm run qa:lighthouse
```

### Run local QA bundle
```bash
npm run qa:all
```

## Current test files

- `tests/marketing-smoke.spec.ts`
- `tests/auth-smoke.spec.ts`
- `tests/seo-smoke.spec.ts`

## What this local stack is good for

Use it for:
- fast regression checks on marketing pages
- verifying auth pages still render correctly
- validating core SEO signals
- checking Lighthouse performance/accessibility/best-practices/SEO
- QA before pushing design/copy/navigation changes

## What still needs real env-backed testing

The following still need valid Supabase/Stripe/Gemini env and often real test data:
- signup/login end-to-end authentication
- onboarding completion
- dashboard/app workspace flows
- resume upload and parsing
- job analysis API flow
- tailoring flow
- billing and checkout
- tracker CRUD with persisted data

## Recommended QATesty workflow

### Every UI/content change
1. `npm run lint`
2. `npm run test:smoke`
3. `npm run qa:lighthouse`

### Every app-feature release
1. run local smoke suite
2. run manual exploratory QA on core user journeys
3. test protected flows with real staging env vars
4. log bugs by severity (P0-P3)
5. confirm no regression before push/deploy

## Suggested next QA expansions

### Near-term
- add Playwright coverage for compare pages by competitor slug
- add visual regression screenshots for homepage, pricing, login
- add API contract tests for public endpoints

### After staging test credentials are available
- add auth e2e flows
- add analyzer flow tests
- add tracker CRUD tests
- add billing smoke tests

## Notes

- Playwright starts the Next dev server automatically using `playwright.config.ts`
- Lighthouse uses local Chrome at `/usr/bin/google-chrome` by default
- Override base URL with `LIGHTHOUSE_BASE_URL` or `PLAYWRIGHT_BASE_URL` if needed
