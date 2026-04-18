# WorthApply Project Context

**Last updated:** 2026-04-02

## Product Overview

WorthApply is an AI-powered job application SaaS helping job seekers:
1. Analyze job fit before tailoring (fit verdict, evidence gaps, ATS alignment)
2. Tailor resumes with evidence-backed AI suggestions
3. Generate targeted cover letters
4. Track applications and follow-up workflow

**Target audience:** Experienced professionals, career switchers, technical candidates applying selectively to competitive roles.

**Primary revenue goal:** $10k MRR

**Current stage:** MVP launched, homepage recently redesigned for stronger conversion/trust, paid acquisition strategy in progress

## Technology Stack

### Frontend
- **Framework:** Next.js 14 App Router
- **Styling:** CSS Modules (NOT Tailwind — deliberate architecture choice)
- **Icons:** Lucide React
- **Typography:** next/font with Geist (sans) and Geist Mono
- **Deployment:** Vercel

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **AI:** OpenAI API (primary), with Anthropic for specialized tasks

### Route Structure
```
/                    → marketing homepage
/(marketing)/*       → about, features, pricing, compare, tools
/(auth)/*            → signin, signup, password reset
/(app)/*             → authenticated workspace
  /dashboard
  /job-analysis
  /applications
  /resumes
  /cover-letters
  /settings
/tools/ats-checker   → public free tool (acquisition surface)
```

## Design System

### Brand Colors (CSS Custom Properties)
```css
--color-primary: #9d6148        /* warm brown */
--color-primary-light: #c68a71
--color-primary-dark: #8d5b46
--color-bg-cream: #fcfaf7
--color-bg-alt: #f7f1ea
--color-text-primary: #171411
--color-text-secondary: #6e665f
```

### Typography
- **Display:** Geist (for headings, hero text)
- **Body:** Geist (paragraphs, UI)
- **Mono:** Geist Mono (code, data)

### Motion
- CSS-based animations for hero entrance and scroll-reveal sections
- `ScrollRevealGroup` client component for in-view reveal
- `prefers-reduced-motion` respected globally
- Conservative timings (400–750ms), subtle scale/y-offset transitions

### Component Patterns
- Marketing pages use CSS Modules exclusively
- App surfaces use CSS Modules + shared primitives
- Shared shell: `MarketingNav`, footer in `(marketing)/layout.tsx`
- No component library — custom-built for brand consistency

## Business Rules

### Free Plan Limits
- 3 job analyses
- 2 resume tailorings
- 8 tracked applications
- 15 evidence items
- Cover letter verdict only (no full generation)

### Pro Plan
- Unlimited job analyses
- Unlimited resume tailoring
- Unlimited tracked applications
- Unlimited evidence storage
- Full cover letter generation
- Advanced features (ATS optimization, interview prep)

### Data Model Key Entities
- `users` (Supabase Auth)
- `job_analyses` (fit verdict, scores, evidence, ATS gaps)
- `resumes` (base resume, tailored versions, storage_path)
- `applications` (job role, company, status, priority, notes)
- `cover_letters` (generated content, tone, alignment)

## Important Conventions

### Routing
- `/signup` is used everywhere even though the actual auth route file may be named differently — this is intentional for marketing consistency
- Internal app routes follow `/app/[feature]` pattern
- Compare pages use `/compare/[slug]` structure (requires `/compare` index)

### Content Strategy
- **Core narrative:** Fit first → Evidence-backed tailoring → One workflow
- **Voice:** Direct, credible, decision-focused (not hype-y AI marketing)
- **Proof:** Outcome-oriented, concrete mechanisms, truthful trust signals (no fake testimonials)
- **CTAs:** Primary = "Analyze a job free", Secondary = ATS checker or compare alternatives

### SEO Foundation
- `metadataBase` configured
- Per-page metadata with canonical URLs
- Open Graph + Twitter cards
- `robots.ts` and `sitemap.ts` at root
- Structured data: FAQPage, SoftwareApplication

### Code Quality Standards
- ESLint passing required before commit
- TypeScript strict mode
- CSS Modules scoped to page/component
- No inline styles in JSX
- File naming: kebab-case for routes, PascalCase for components

## Known Issues / Tech Debt

1. **Missing `/signup` route file** — nav/CTA links point to `/signup` but actual route might be elsewhere; needs audit/fix
2. **Some internal app routes expect backend endpoints that don't exist yet** (billing, privacy export, resume delete)
3. **Frontend/backend data contract drift** in places (e.g., `parsed` vs `complete` status, `file_url` vs `storage_path`)
4. **ATS checker tool** is client-side only (lightweight preview, not full parsing) — should be framed honestly or upgraded

## Deployment

- **Platform:** Vercel
- **Branch:** main auto-deploys to production
- **Build command:** `npm run build`
- **Output directory:** `.next` (Next.js default)
- **Environment variables:** Set in Vercel dashboard
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - (others as needed)

## AI Agent Guidelines

### When working on WorthApply:

1. **Design changes:** Load the `codyui` skill — CodyUI owns all UI/UX/frontend design decisions
2. **Backend/API work:** Load the `codybacky` skill — CodyBacky owns Supabase integration, API routes, data modeling
3. **QA/testing:** Load the `qatesty` skill — QATesty owns test strategy, Playwright tests, manual QA sessions
4. **SEO/content:** Load the `searchsherpa` skill — SearchSherpa owns SEO/GEO/AEO strategy
5. **Paid acquisition:** Load the `adpilot` skill — AdPilot owns paid ads strategy and creative

### Before starting medium+ complexity features:
- Check this context doc
- Verify routes exist
- Confirm backend endpoints are live
- Scope is small enough (< 1600 tokens ideal)
- Design exists (if visual work)

### When editing marketing pages:
- Preserve CSS Modules architecture (do NOT migrate to Tailwind)
- Keep brand voice: fit-first, evidence-backed, one workflow
- Maintain premium editorial feel
- Respect motion system (conservative, reduced-motion aware)

### When editing app surfaces:
- Match existing CSS Modules patterns
- Wire to real API routes (or stub clearly if not ready)
- Keep data contracts aligned with backend schema
- Respect free-plan limits in UI

## Testing

- **Local QA stack:** Playwright, Lighthouse, manual testing docs
- **Test docs location:** `/qa/`
- **CI:** Not yet configured (manual QA currently)
- **Key test scenarios documented in:**
  - `TESTING_FREE_PLAN.md`
  - `MANUAL_TESTING_SESSION_1.md`
  - `AI_TRAINING_PLAN.md`

## Contact / Ownership

- **Owner:** Zak (abdelboch@gmail.com)
- **GitHub:** zakopenc/worthapply
- **Live site:** https://worthapply.com
- **Primary dev agents:** CodyUI (design), CodyBacky (backend), QATesty (QA)
