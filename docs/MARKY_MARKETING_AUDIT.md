# Marky — WorthApply Marketing Audit

**Auditor:** Marky (CMO)
**Date:** 2026-04-08
**Scope:** End-to-end marketing audit — positioning, messaging, funnel, channels, competitive, 30/60/90 plan
**Methodology:** Marky's "Audit an existing SaaS marketing setup" playbook
**Sources:** Live site (www.worthapply.com), repo at /home/zak/projects/worthapply, project-context.md, HONEST_REALITY_CHECK.md

---

## 1. Executive Summary

**Positioning verdict:** The *wedge* is genuinely strong. The *execution* is sabotaging it.

WorthApply has something rare in this category — a real, defensible positioning angle: **"Fit-First"** (analyze fit *before* tailoring) vs the "keyword stuffer" incumbents (Jobscan, Rezi, Teal). That's a category-creating verb. Most SaaS founders would kill for this.

But the homepage is actively undermining that wedge in two critical ways:

1. **Fabricated social proof at scale.** Eleven hardcoded instances of "10,000+ users", "100,000+ jobs analyzed", "4.9/5 from 10,000+ verified reviews", "847 people analyzed jobs today", plus a JSON-LD `ratingValue: 4.9` shipped to Google. Per `project-context.md` this is an **MVP that just launched**. These numbers cannot be real. This is not a copy problem — it is a core integrity problem for a product whose literal differentiator is **"Evidence-Based, no fabrication"**. It is also a legal risk (FTC deceptive practices), an SEO risk (structured data lying to Google), and a conversion risk for the target persona (experienced professionals can smell fake testimonials in three seconds).
2. **The wedge is buried.** The H1 ("Land Your Dream Job 3x Faster") is generic resume-tool boilerplate. The real differentiator ("Not Another Keyword Stuffer" / Fit-First) lives in H2 position and only lands for people who scroll. The strongest message in the product should be above the fold, not below the third scroll break.

**Biggest risks:**
- Fabricated social proof → credibility, legal, SEO, and message-consistency collapse simultaneously
- Generic H1 → wasting the single most valuable pixel block on the site
- Unsubstantiated "3x faster" claim → can't scale this to paid without evidence
- Middle-of-pack pricing ($39) positioned as "Best Choice" without proof of best

**Biggest opportunities:**
- Lead with "Fit-First" — it's the only positioning in this category that isn't a commodity
- SEO hijack comparison pages already scaffolded (`/compare`, `/tools/ats-checker`, blog comparison files) — SearchSherpa can compound this fast
- Free public tool (`/tools/ats-checker`) is a real acquisition surface, not just a landing page
- The fit-first narrative is LinkedIn-native — Linky can run this as thought leadership, not product pitching
- Comparison table on homepage already names Jobscan/Rezi/Teal head-on — rare and good

**Top 5 actions (priority order):**
1. **[P0]** Strip all fabricated social proof from the homepage and JSON-LD today. Replace with honest early-stage framing. (CodyUI + Marky copy)
2. **[P0]** Rewrite the H1 + subhead around "Fit-First" before anything else ships. (Marky)
3. **[P0]** Substantiate or remove the "3x faster" claim. (Marky)
4. **[P1]** Build out `/compare/jobscan`, `/compare/teal`, `/compare/rezi` as full comparison landing pages (not homepage table only). (SearchSherpa + CodyUI)
5. **[P1]** Ship a weekly "Fit-First" LinkedIn narrative series via Linky — not product pitches, category education. (Marky brief → Linky)

**30/60/90 headline:** Fix integrity and positioning in Days 1–14, turn on SEO hijack + LinkedIn narrative in Days 15–45, earn the right to paid in Days 46–90. **Do not run paid search until the homepage is honest and the wedge is above the fold.**

**Launch readiness from a marketing POV: NOT READY.** Fix integrity and positioning first. This is a 1–2 day fix, not a rebuild.

---

## 2. Positioning and Messaging Audit

### ICP clarity: 7/10

`project-context.md` is clear: *"Experienced professionals, career switchers, technical candidates applying selectively to competitive roles."*

That is a sharp, sophisticated ICP. These are people who:
- Apply selectively, not in volume (this is huge — the whole product thesis depends on it)
- Are skeptical of AI hype
- Have real experience to analyze (so "no fabrication" matters to them)
- Value their time more than a $39/mo subscription
- Read reviews, compare tools, do their homework

The homepage **does not speak to this ICP**. It speaks to volume-applicants:

> "Stop wasting time on jobs you won't get. Intelligent matching analyzes your fit in seconds, tailors your resume, and finds 300 matching jobs on LinkedIn automatically."

"Finds 300 matching jobs on LinkedIn automatically" is a **volume** promise — the opposite of "apply selectively to competitive roles." You are pitching the product to the wrong persona in the subhead. The selective applicant doesn't want 300 jobs; they want confidence on the 12 jobs they already care about.

### Category / one-liner: 4/10

**Current H1:** "Land Your Dream Job 3x Faster"

This is generic. Swap the logo and it could run on Jobscan, Teal, Rezi, or ZipRecruiter. It does not carry the wedge. It does not earn the pricing. It does not identify the ICP.

**Current H2 (the real wedge):** "Not Another Keyword Stuffer"

*This* is the positioning. It's in the wrong slot. The H2 should be the H1.

**Marky's recommended one-liner direction** (needs iteration, not final):
- **"Know if you're the right fit — before you apply."**
- **"Fit-first job search. Stop tailoring resumes for jobs you were never going to get."**
- **"The AI resume tool that tells you when not to apply."** *(bold, differentiating, defensible)*

The last one is the strongest because **no competitor can copy it without invalidating their own volume pitch.**

### Value proposition stack

Current stack (implied by homepage):
1. Fit analysis before tailoring ✅ *real wedge*
2. Evidence-based, no fabrication ✅ *real wedge*
3. Resume tailoring ⚠️ *commodity*
4. 300 LinkedIn jobs automatically ⚠️ *contradicts ICP*
5. Application tracking ⚠️ *commodity*
6. Cover letter generator ⚠️ *commodity*

Marky's take: **Stack ranks 3–6 are table stakes.** They should appear in the feature grid, not the hero. The hero belongs to 1 and 2 exclusively.

### Proof: 2/10 (critical)

On-site proof claims:
- "Trusted by 10,000+ job seekers" (line 50 of page.tsx)
- "4.9/5 from 10,000+ verified users" (line 75)
- "Live: 847 people analyzed jobs today" (line 82)
- "100,000+ Jobs Analyzed" (line 250)
- "Trusted by 10,000+" (line 255)
- "10,000+ verified 5-star reviews" (line 275)
- "Over 10,000 Job Seekers and Counting" (line 280)
- "100,000+ Job Analyses Completed" (line 680)
- "Join 10,000+ job seekers" (line 858)
- "4.9/5 from 10,000+ users" (line 869)
- `ratingValue: 4.9` in JSON-LD structured data (line 936)

Plus seven named testimonials with stock-style photos (Sarah Martinez, Marcus Rodriguez, Jessica Park, David Chen, Priya Patel, Alex Thompson, Rachel Kim).

**Per project-context.md, the product is a just-launched MVP.** None of these numbers are real.

This is a four-way self-own:
1. **Credibility** — the target ICP (sophisticated, selective, skeptical) will spot this instantly and bounce. The exact people you most want to convert are the ones most likely to sniff it out.
2. **Integrity** — the product's flagship promise is "Evidence-Based, no fabrication." The homepage fabricates at scale. If you lie about your user count, why would I trust you not to lie about my resume?
3. **Legal** — FTC rules on deceptive social proof and fake reviews are explicit. The JSON-LD `ratingValue: 4.9` is particularly exposed because it is a structured, machine-readable claim shipped to Google.
4. **SEO** — Google actively penalizes fake review schema. This is one structured-data audit away from a manual action.

**This is the single biggest marketing problem on the site and must be fixed before anything else ships.** It takes hours, not weeks.

### Objection handling: 6/10

Good: the FAQ block on the homepage names the real objections head-on —
- "How does the analyzer work?"
- "Will it write fake experience?"
- "What makes you different?"

The "will it write fake experience" objection is excellent — it shows real ICP understanding. But the whole "no fabrication" angle is structurally contradicted by the fabricated social proof above it. Fix the fabrication first or the objection handling reads as ironic.

---

## 3. Homepage and Landing Page Audit

### Above-the-fold (homepage)

| Element | Current | Marky verdict |
|---|---|---|
| Trust strip | "Trusted by 10,000+ job seekers" | ❌ Fabricated. Strip it. |
| H1 | "Land Your Dream Job 3x Faster" | ❌ Generic. Replace with the wedge. |
| Subhead | "...finds 300 matching jobs on LinkedIn automatically." | ⚠️ Wrong persona. Rewrite for selective applicants. |
| Social proof | "4.9/5 from 10,000+ verified users" | ❌ Fabricated. Remove. |
| Live counter | "Live: 847 people analyzed jobs today" | ❌ Fabricated. Remove. |
| Primary CTA | "Try Demo (No Signup)" | ✅ Excellent. Low friction is the right call for this ICP. |
| Secondary CTA | "Analyze Your Resume Free" | ✅ Good. |
| Reassurance | "No credit card required / Free forever / 7-day money-back" | ✅ Good trust signals. Keep. |
| Product visual | Fit Score card (92%, Senior Product Manager, TechCorp) | ✅ Strong. Shows the product doing the thing. Keep. |

**Verdict:** The *structure* of the hero is correct. The *content* is fabricated and mispositioned. A copy pass fixes 80% of it.

### Comparison section (homepage)

This section is **the best thing on the site.** It names Jobscan, Rezi, Teal head-on with a specific feature comparison table and row-by-row ✅/⚠️/❌. This is SEO gold, conversion gold, and positioning gold. Three wins from one section.

Two fixes:
- The "Updated April 2026 • Based on public pricing and features" subtext is good but should link to sources per row for credibility.
- Build standalone `/compare/jobscan`, `/compare/teal`, `/compare/rezi` pages *with the same data* — comparison keywords are high-intent and currently live on the homepage (wasted distribution).

### "Not Another Keyword Stuffer" section

This is the real positioning. It should be the H1, not a secondary section. Keep the three-column comparison (Other Tools / WorthApply / Manual Approach) — it works. Just promote the headline.

### Funnel CTAs

Multiple CTAs on homepage:
- "Try Demo (No Signup)"
- "Analyze Your Resume Free"
- "Try the Smarter Way Free"
- "See Detailed Comparison"
- "Get Started Free"

Four of five point to `/signup`. One points to `/demo`. One points to `/compare`.

**Marky verdict:** Good *density*, slightly too much *variety*. Pick two primary CTAs and repeat them. "Try Demo (No Signup)" is the strongest low-friction entry — make it co-primary everywhere.

### ATS Checker tool (`/tools/ats-checker`)

Per `project-context.md` this is a **public free tool (acquisition surface)**. This is the most underleveraged asset on the site. Free tools with real utility are the highest-ROI top-of-funnel play available to an early-stage SaaS. This deserves:
- Its own SEO landing ("free ATS resume checker" is a high-volume commercial query)
- A prominent nav entry, not buried
- A post-result upsell to full Fit Analysis
- Embedded proof from real usage (the first honest social proof you'll earn)

---

## 4. Funnel Audit (visit → signup → activation → retention)

Inferred from the outside — full instrumented funnel review needs analytics access.

| Stage | What I can see | Verdict |
|---|---|---|
| Visit | Multiple acquisition surfaces (`/`, `/compare`, `/features`, `/tools/ats-checker`, `/demo`, blog) | ✅ Good surface area |
| Hook | Free demo (no signup) + free ATS checker | ✅ Right idea, underleveraged |
| Signup | Free-forever plan, no CC, 7-day refund | ✅ Low friction |
| Activation | Implied: upload resume → paste job → get fit score | ⚠️ Not verifiable from outside. Time-to-first-fit-score is the activation metric. |
| Retention | Unknown — requires data | ⚠️ Not verifiable |
| Monetization | $39/mo, 1 tier visible on homepage | ⚠️ Single tier is fine for MVP, but "Best Choice" badge needs proof |

**Critical unknown:** Is there conversion tracking (GA4, Plausible, PostHog) and is the core event `signup_completed` firing with a UTM attribution trail? If not, no paid budget should turn on until it is. AdPilot guardrail #1.

**Recommended immediate funnel instrumentation** (if not already in place):
- `homepage_view`
- `demo_started` (from /demo)
- `ats_checker_used`
- `signup_started`
- `signup_completed`
- `first_fit_analysis_completed` ← activation event
- `paid_conversion`

Attribute all five with UTM + landing page. Without this, Marky blocks paid spend.

---

## 5. Competitive Teardown — Jobscan, Teal, Rezi

Based on the on-site comparison table, the product's own comparison blog files, and category knowledge. For a deeper competitive teardown with scraped current pricing/copy, assign SearchSherpa.

| Axis | Jobscan | Teal | Rezi | WorthApply |
|---|---|---|---|---|
| Core promise | ATS keyword match score | Job tracking + resume builder | AI resume generation | **Fit-first analysis** |
| Category verb | "scan" | "track" | "generate" | **"know your fit"** |
| Price | $49/mo | $29/mo | $29/mo | $39/mo |
| Positioning age | Mature (category king) | Modern | AI-native | Category-creating |
| Brand trust | High, incumbent | Growing | Growing | Zero (MVP) |
| Weakness | Keyword-stuffing reputation | Feature sprawl | "AI-generated" skepticism | No trust yet |
| WorthApply's edge | Fit-first > keyword-match | Depth > breadth | Evidence > generation | Defensible positioning |
| WorthApply's gap | No brand, fake proof | No brand, fake proof | No brand, fake proof | Nothing real to stand on yet |

**Where WorthApply wins on paper:**
- Positioning wedge (Fit-First) is the only genuinely differentiated angle in the category
- "Evidence-based, no fabrication" is a real ICP concern no competitor owns
- $39 undercuts Jobscan while out-positioning Rezi/Teal
- LinkedIn scraper (300 jobs) is a feature hook but contradicts the ICP — repositioning needed

**Where WorthApply loses:**
- Zero real brand equity (MVP stage)
- Fabricated social proof is a **bigger liability** than Jobscan's keyword-stuffing reputation, because it hits the flagship promise
- No independent reviews, no press, no case studies
- Competitors have 5+ years of compounding SEO

**Marky's competitive thesis:** *"Jobscan sells a scanner. Teal sells a tracker. Rezi sells a generator. WorthApply sells a verdict — should you even apply?"* That is the line to hammer across every channel.

---

## 6. SEO / Organic Baseline (high-level)

Signals already present:
- Blog with comparison content scaffolded (`src/content/blog/comparison/worthapply-vs-jobscan.md`)
- Comparison table on homepage with real competitor names
- `/compare`, `/features`, `/pricing`, `/about`, `/tools/ats-checker` routes exist
- SEO audit report already in repo (`SEO_AUDIT_REPORT.md`)
- Google Search Console setup doc present

**Marky-level verdict (not a deep SEO audit — that's SearchSherpa's):**
- The comparison-page play is the single highest-leverage SEO move for this business and it is **partially scaffolded but not shipped at full scale**.
- "X vs Y" comparison queries are the highest-intent queries in this category. They convert 5–10x homepage traffic.
- `/tools/ats-checker` should rank for "free ATS resume checker" — this is a 5-figure monthly search volume query. If it doesn't rank yet, that is SearchSherpa's first task.
- Brand search defense (querying "worthapply") is minimal risk at this stage (no brand awareness to defend yet) — park it until Linky builds some.

**Assign to SearchSherpa:**
1. Full SEO audit against Priority 1 SEO implementation skill
2. Build out individual `/compare/jobscan`, `/compare/teal`, `/compare/rezi`, `/compare/resume-io` pages
3. Rank `/tools/ats-checker` for "free ATS resume checker" and adjacent
4. Expand the blog comparison cluster (5–10 articles minimum: vs Jobscan, vs Teal, vs Rezi, vs Resume.io, vs LinkedIn Premium Easy Apply, "best ATS checker", "best resume tailoring tool", "how to know if you should apply")

---

## 7. Paid Readiness — NO, not yet

Marky's paid guardrail: **do not turn on spend until (a) the homepage is honest, (b) the wedge is above the fold, (c) conversion tracking + attribution is verified firing end-to-end, (d) landing pages match ad themes, (e) you've validated the offer converts organically first.**

Current status:
- (a) Homepage is not honest — ❌ blocker
- (b) Wedge is buried — ❌ blocker
- (c) Conversion tracking — ❓ unverified, needs check
- (d) No dedicated landing pages per intent — ❌ blocker
- (e) Organic conversion baseline — ❓ unknown, probably thin

**Marky blocks AdPilot from spending until (a), (b), (d) are fixed and (c), (e) are verified.** Paid search to a broken funnel is lighting money on fire. This is the AdPilot guardrail and Marky enforces it.

Once unblocked, AdPilot's first campaigns should be:
1. Brand defense (cheap, small)
2. Competitor comparison capture ("jobscan alternative", "teal vs rezi", etc.) → matching `/compare/*` page
3. High-intent problem queries ("know if I should apply to a job", "resume fit score", "ATS resume checker")
4. Retargeting homepage + ATS checker visitors

No prospecting, no Meta, no display until the above proves CAC < $40 and activation > 25%.

---

## 8. Channel Mix Recommendation

**Current stage:** Early pre-traction. MVP launched, zero real users, positioning not yet landed, no validated acquisition channel.

**Marky's channel mix for this stage:**

| Channel | Priority | Owner | Why |
|---|---|---|---|
| **Honest homepage rewrite** | P0 now | Marky + CodyUI | Everything downstream is blocked by this |
| **Comparison SEO (/compare/*)** | P0 | SearchSherpa + CodyUI | Highest-intent commercial queries, already scaffolded |
| **Free ATS checker tool distribution** | P0 | SearchSherpa + Marky | Free tool is the best TOFU lever for this ICP |
| **LinkedIn "Fit-First" narrative (Linky)** | P0 | Marky brief → Linky | Linky exists, ICP lives on LinkedIn, low cost |
| **Blog comparison cluster (Penny)** | P1 | Marky brief → Penny | Compound SEO, feeds the comparison pages |
| **Founder-led distribution** | P1 | Zak | Subreddits (r/resumes, r/jobs, r/cscareerquestions), build in public on LinkedIn |
| **Branded search defense (paid)** | P2 | AdPilot | Cheap, park once there's brand awareness |
| **Comparison paid search** | P2 | AdPilot | Only after (a)(b)(c)(d)(e) are green |
| **Retargeting** | P2 | AdPilot | Only after enough organic traffic exists |
| **Meta prospecting / display** | Not now | — | Not for this ICP at this stage |
| **Cold outreach / email** | Not now | — | Wrong motion for this SaaS shape |

**Rule:** compounding channels first (SEO, LinkedIn narrative, free tool), burn channels only after the funnel is proven.

---

## 9. Prioritized Fix List

### P0 — Blockers. Fix this week.

| # | Fix | Why | Owner | Impact | Effort |
|---|---|---|---|---|---|
| 1 | Strip all fabricated social proof from homepage + JSON-LD (11 instances + schema) | Core integrity, legal, SEO, credibility | CodyUI (copy) + Marky (replacement text) | Removes the biggest credibility risk on the site | 2 hours |
| 2 | Rewrite H1 + subhead around Fit-First wedge for the selective-applicant ICP | Wedge is currently buried; H1 is generic | Marky | Highest-leverage pixel on the site | 2 hours |
| 3 | Substantiate or remove the "3x faster" claim | Unsupported, legal exposure, undermines trust | Marky + CodyBacky (source data if any) | Trust + compliance | 30 min |
| 4 | Remove or reframe "finds 300 matching jobs on LinkedIn automatically" from the hero subhead — contradicts the selective-applicant ICP | ICP/message mismatch | Marky | Message-persona fit | 30 min |
| 5 | Verify conversion tracking (GA4/PostHog/Plausible) fires for signup_completed + first_fit_analysis_completed with UTM attribution | Blocks any paid spend | CodyBacky | Makes measurement possible | 2 hours |
| 6 | Replace or remove the seven fake testimonial profiles until real user quotes exist | Same integrity issue as #1 | CodyUI + Marky | Credibility | 1 hour |

**Total P0 effort:** ~1 day for one person. This is not a rebuild. It's a copy-and-integrity pass.

### P1 — High leverage. Next 14 days.

| # | Fix | Owner | Impact |
|---|---|---|---|
| 7 | Build standalone `/compare/jobscan`, `/compare/teal`, `/compare/rezi` pages (not homepage table only) | SearchSherpa + CodyUI | Comparison SEO + high-intent conversion |
| 8 | Rank `/tools/ats-checker` for "free ATS resume checker" (on-page SEO, schema, internal linking) | SearchSherpa | TOFU acquisition |
| 9 | Launch Linky's weekly "Fit-First" LinkedIn narrative series (category education, not product pitches) | Marky brief → Linky | Brand equity, ICP reach |
| 10 | Penny ships a 6-article comparison blog cluster feeding the /compare/* pages | Marky brief → Penny | Compound SEO, internal linking authority |
| 11 | Add real case study or "how WorthApply analyzes fit" walkthrough with screenshots — honest proof that is not numeric | Marky + Banany (visuals) | First honest proof asset |
| 12 | Lock one activation metric (probably `first_fit_analysis_completed` within 10 min of signup) and instrument it | CodyBacky | Makes the funnel measurable |

### P2 — After P0/P1 clear. Days 30–90.

| # | Fix | Owner |
|---|---|---|
| 13 | Turn on brand defense + competitor comparison paid search (small budget, tight themes) | AdPilot |
| 14 | Retargeting homepage + ATS checker visitors | AdPilot |
| 15 | Lifecycle email onboarding (day 0, day 1, day 3, day 7) with activation nudges | CodyBacky + Marky |
| 16 | Public dashboard of real stats once they exist (even "1,200 analyses completed" beats any fake number) | CodyUI + CodyBacky |
| 17 | Independent reviews (Product Hunt, G2, Capterra) — seed with honest early users | Marky + Zak |
| 18 | Weekly marketing review cadence (pipeline, CAC, activation, what shipped, what was cut) | Marky |

---

## 10. 30 / 60 / 90 Day Marketing Plan

### Days 1–14: Fix integrity and ship the wedge

**Goal:** Honest homepage, wedge above the fold, tracking verified, comparison pages live.

| Owner | Deliverable | Metric |
|---|---|---|
| Marky | New H1/subhead, replacement trust strip copy, removal of all fabricated claims | Zero fabricated claims on site |
| CodyUI | Implement copy changes, refactor hero, remove fake testimonials | Homepage ships honest |
| CodyBacky | Verify GA4/analytics + conversion events firing end-to-end | Full funnel measurable |
| SearchSherpa | Ship `/compare/jobscan`, `/compare/teal`, `/compare/rezi` pages | 3 pages live + indexed |
| Linky | First 3 "Fit-First" LinkedIn posts | 3 posts live |
| Penny | First 2 comparison blog articles | 2 posts live |

**Kill criteria:** If homepage rewrite isn't shipped by Day 7, block all other marketing work until it is.
**Success metric:** Homepage honesty score = 100%, wedge in H1, tracking verified, 3 comparison pages indexed.

### Days 15–45: Turn on compounding channels

**Goal:** Real organic traffic baseline, first honest signups, real activation data.

| Owner | Deliverable | Metric |
|---|---|---|
| SearchSherpa | Rank `/tools/ats-checker` for "free ATS resume checker" | Top 20 for primary query |
| SearchSherpa | Expand comparison cluster to 6 pages | 6 pages live |
| Penny | Blog cluster: 4 additional comparison + how-to articles | 4 posts live |
| Linky | Daily "Fit-First" LinkedIn rhythm (M/W/F minimum) | 15+ posts, track impressions + profile visits |
| Marky | Founder-led distribution brief for Zak (r/resumes, r/jobs, LinkedIn building in public) | Brief delivered, Zak posting 2x/week |
| Marky + CodyBacky | Funnel dashboard: visits → signup → activation | Dashboard live, first 100 signups tracked |

**Kill criteria:** If activation rate (signup → first fit analysis) is below 25% by Day 30, pause all acquisition spend (including Linky cadence) and fix activation first.
**Success metric:** 500+ real homepage visits/week, 50+ honest signups, activation rate ≥ 25%, one channel showing compounding growth.

### Days 46–90: Earn the right to paid, start compounding

**Goal:** Validated organic funnel, first disciplined paid tests, real proof assets.

| Owner | Deliverable | Metric |
|---|---|---|
| Marky | Channel review: which of SEO / ATS tool / LinkedIn / blog is compounding? Double down, cut losers | Channel verdict |
| AdPilot | Turn on brand defense + competitor comparison paid search (tight budget, kill at CAC > $40) | First paid signups at defined CAC |
| AdPilot | Retargeting layer | Retargeting CVR baseline |
| Marky | First honest case study or "how we analyzed Zak's fit" walkthrough | 1 real proof asset |
| Linky | 5+ engagement-winning posts (measured by profile visits → site visits → signup, not likes) | Attribution to signups |
| CodyBacky | Lifecycle email onboarding (day 0/1/3/7) | Email → activation lift |
| Marky | Weekly marketing review: CAC, activation, retention, LTV projection | 4 reviews shipped |

**Kill criteria:** If paid CAC exceeds $40 in any campaign by Day 75, cut it. If blended CAC exceeds activation-weighted-LTV/3, pause all paid.
**Success metric:** 2,000+ real visits/week, 200+ monthly signups, activation ≥ 30%, one validated paid channel at CAC < $40, first 10 paying customers.

---

## 11. Launch Readiness Verdict (Marketing POV)

**Status: NOT ready to scale marketing. Ready to fix and ship fast.**

**Blockers:**
1. Fabricated social proof must come down (integrity, legal, SEO, credibility)
2. Wedge must move to H1 (everything downstream compounds off this)
3. Conversion tracking must be verified firing
4. Do not turn on paid until the above are done and comparison pages are live

**Not blockers (can ship in parallel):**
- Linky can start the Fit-First narrative the moment the homepage is honest
- SearchSherpa can build `/compare/*` pages in parallel with homepage fixes
- Penny can write the comparison cluster immediately

**Time to launch-ready (marketing):** 7 days of focused work. Not a rebuild. A correction.

**What's genuinely good** (do not change):
- The Fit-First wedge itself — keep it, promote it
- The homepage comparison table — keep it, expand to standalone pages
- The /demo (no signup) + free /tools/ats-checker acquisition surfaces — keep them, market them harder
- The FAQ objection handling ("Will it write fake experience?") — keep it, let it breathe
- The "Not Another Keyword Stuffer" comparison section — keep it, but promote its headline to H1
- The pricing + free-forever + 7-day refund trust stack — keep it
- Zak's product conviction (per HONEST_REALITY_CHECK.md) — this is clearly a serious builder who thinks hard about reality; the fabricated social proof is a copy mistake, not a character one

---

## Marky's closing note to Zak

You have better positioning than 90% of SaaS founders ever land on. "Fit-First" is a category-creating verb — Jobscan cannot adopt it without invalidating their own product, and neither can Teal or Rezi. That's the definition of defensible.

The fabricated social proof has to come off the site this week. Not because of the legal risk (though that's real). Not because of the SEO risk (though that's real too). Because your product's entire promise is *"we don't fabricate."* If the homepage fabricates, the promise dies in the hero. The ICP you're chasing — experienced, selective, skeptical — will catch it in seconds, and those are the exact people whose $39/mo you need most.

Fix the homepage. Ship the comparison pages. Point Linky at the Fit-First narrative. Do not turn on paid until all four are green. Everything else on this plan compounds from there.

— Marky
