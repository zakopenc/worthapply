# CodyBacky — Conversion Tracking Handoff (P0)

**From:** Marky (CMO)
**To:** CodyBacky (Backend Engineer)
**Priority:** P0 — blocks all paid acquisition
**Effort:** ~1 day
**Date:** 2026-04-08

---

## The situation

WorthApply is preparing for launch. Marky's full marketing audit is in `MARKY_MARKETING_AUDIT.md`. P0 copy + integrity fixes are already shipped to main (commit `1ef20d0`). The remaining P0 blocker is conversion tracking.

## The finding — zero tracking installed

Verified via codebase search on 2026-04-08:

- **`src/app/layout.tsx`**: No GA `<Script>`, no PostHog provider, no `@vercel/analytics`, no Plausible, no Mixpanel, no Segment.
- **`src/app/(marketing)/layout.tsx`**: Same — no provider.
- **`package.json`**: No analytics dependency installed at all.
- **`.env.example`**: Lists Supabase, Stripe, Sentry, OpenAI — zero analytics provider keys.
- **Codebase grep** for `gtag|posthog|plausible|mixpanel|amplitude|@vercel/analytics|@next/third-parties`: zero hits in marketing surfaces.

**WorthApply currently has no way to measure whether any visitor signs up, activates, or pays attributable to any channel.** This is the exact condition that AdPilot refuses to launch paid into, and the exact condition Marky refuses to approve any marketing spend under.

## Why this is a P0 blocker

1. Any dollar or hour of marketing spent right now is spent blind.
2. Paid search cannot be turned on at all until signup conversions are trackable with attribution.
3. The 30/60/90 plan in `MARKY_MARKETING_AUDIT.md` is measured in CAC, activation rate, and channel CVR — none of which exist without instrumentation.
4. The activation metric (`first_fit_analysis_completed` within 10 minutes of signup) is the Day-30 kill criterion. If we can't measure it, we can't enforce the guardrail.

---

## What CodyBacky needs to ship

### 1. Pick one analytics provider

**Marky's recommendation: PostHog.**

Why PostHog for this stage:
- Product analytics + funnels + session replay in one tool (vs GA4 being event-only and clunky)
- Generous free tier (1M events/month) — fits an early-stage SaaS free for months
- Self-hostable if data residency ever becomes an issue
- Works cleanly with Next.js App Router via `posthog-js` client + optional server-side `posthog-node`
- Feature flags built-in (useful later for pricing/copy tests)
- Clean Supabase integration for user identification

Acceptable alternatives if CodyBacky has strong reason:
- Vercel Analytics + Vercel Speed Insights (simpler, but no funnels or cohort analysis)
- GA4 (free, universal, but bad UX for funnels)
- Plausible (lightweight, no funnels)

**Do not** install more than one. Pick one and ship it.

### 2. Install and wire it up

- Add `posthog-js` to `package.json`
- Create a `PostHogProvider` client component
- Mount it in `src/app/layout.tsx` so it wraps the entire app
- Initialize with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` from env
- Add both env vars to `.env.example`, `.env.local`, and Vercel project env (production + preview)
- Verify the provider respects `Do Not Track` and doesn't break SSR

### 3. Instrument the core funnel events

These are the events Marky's plan actually measures on. Every event should include UTM params and landing page as properties.

| Event name | Fires when | Required properties |
|---|---|---|
| `homepage_view` | Marketing page viewed | `path`, `utm_*`, `referrer` |
| `demo_started` | User lands on `/demo` | `utm_*`, `referrer` |
| `ats_checker_used` | User submits resume to `/tools/ats-checker` | `has_result` |
| `signup_started` | User lands on `/signup` | `utm_*`, `entry_page` |
| `signup_completed` | **Supabase auth signup succeeds** | `utm_*`, `entry_page`, `plan` |
| `first_fit_analysis_completed` | User runs their first fit analysis (activation) | `seconds_since_signup`, `fit_score` |
| `paid_conversion` | Stripe webhook fires `checkout.session.completed` | `plan`, `amount`, `utm_*` if recoverable |

**Critical:**
- `signup_completed` must fire from the **server-side Supabase auth hook**, not just the client-side success callback, so we don't lose conversions when the tab closes before the client fires.
- `paid_conversion` must fire from the **Stripe webhook handler**, not the client redirect, for the same reason.
- Both should use `posthog-node` server-side identify + capture with the user's distinct ID.
- All events should carry UTM attribution **from the original landing page**, not the last-touch page. Store initial UTMs in a cookie or localStorage at first site visit and replay them with every event.

### 4. Identify users across anonymous → known

When `signup_completed` fires, call `posthog.identify(supabase_user_id, { email, signup_date, initial_utm_source, initial_utm_medium, initial_utm_campaign })`. This stitches the anonymous-visitor session (homepage view → demo → signup_started) to the known user, so Marky can actually compute landing-page → signup → activation → paid funnels end-to-end with real attribution.

### 5. Build one dashboard

In PostHog, create a single saved dashboard called **"WorthApply Funnel — Marky"** with:

- **Funnel A:** `homepage_view` → `signup_started` → `signup_completed` → `first_fit_analysis_completed` → `paid_conversion`
- **Funnel B:** `ats_checker_used` → `signup_completed` (TOFU conversion for the free tool)
- **Breakdown:** all funnels broken down by `utm_source` and `entry_page`
- **Trend:** `signup_completed` and `first_fit_analysis_completed` per day over the last 30 days
- **Cohort:** "Activated users" = users who fired `first_fit_analysis_completed` within 10 minutes of `signup_completed`

### 6. Verification checklist before marking done

- [ ] `npm run build` succeeds with PostHog installed
- [ ] `homepage_view` fires in PostHog live events when homepage is loaded in preview deploy
- [ ] Signing up a test user fires `signup_completed` server-side and the distinct_id stitches to the pre-signup session
- [ ] Running a test fit analysis fires `first_fit_analysis_completed` with correct `seconds_since_signup`
- [ ] Completing a test Stripe checkout fires `paid_conversion` from the webhook handler
- [ ] UTM params from `?utm_source=test&utm_medium=email` persist across navigation and appear on `signup_completed`
- [ ] Dashboard "WorthApply Funnel — Marky" renders all funnels with the test data
- [ ] `.env.example` has the new env vars
- [ ] Production env vars are set in Vercel for both production and preview

### 7. Deliverable

Commit the wiring to `main` with a clear message:

```
codybacky(analytics): install PostHog + wire core funnel events (Marky P0)

- Add posthog-js + PostHogProvider in root layout
- Instrument: homepage_view, demo_started, ats_checker_used, signup_started,
  signup_completed (server-side), first_fit_analysis_completed, paid_conversion
- Server-side events from Supabase auth hook and Stripe webhook
- UTM attribution persisted from first-touch, identified on signup
- Dashboard "WorthApply Funnel — Marky" created in PostHog

Unblocks: Marky paid guardrail, AdPilot launch, 30/60/90 plan metrics.
Audit ref: CODYBACKY_CONVERSION_TRACKING_HANDOFF.md
```

Then update Marky with a one-line "tracking shipped, dashboard link: X" so the paid guardrail can be lifted.

---

## What CodyBacky should NOT do

- Install more than one analytics provider
- Fire `signup_completed` only from the client
- Lose UTM attribution between landing and signup
- Ship without testing a real signup → activation → paid flow end-to-end
- Create fake test events that get confused with real ones (use a `debug: true` property on dev events)
- Touch the marketing copy — that's already shipped
- Turn this into a 2-week refactor — this is a ~1 day install

---

## Context Marky hands off

- **Product stage:** MVP just launched. Zero real traffic baseline yet. This install is greenfield, not a migration.
- **Stack:** Next.js 15 App Router, Supabase auth, Stripe, Sentry already installed.
- **Paid acquisition is blocked** until this ships. Marky will not approve any AdPilot spend, Linky campaign link UTMs, or SearchSherpa campaign measurement until the dashboard is live.
- **The 30/60/90 plan in MARKY_MARKETING_AUDIT.md** sets activation kill criterion at 25% by Day 30 and CAC kill criterion at $40 in paid. Both require this tracking to function.

Ship it fast. Ship it clean. Then Marky turns the marketing machine on.

— Marky
