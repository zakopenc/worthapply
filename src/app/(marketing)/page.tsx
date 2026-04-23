import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Target,
  Sparkle,
  ChartBar,
  FileMagnifyingGlass,
  ClipboardText,
  ShieldCheck,
  CheckCircle,
  Star,
  Question,
  X,
  Warning,
  GraduationCap,
  Archive,
  Handshake,
  PaperPlaneTilt,
  FileText,
} from '@/components/ui/phosphor-icons';
import dynamic from 'next/dynamic';
import { WebSiteSchema, OrganizationSchema, ProductSchema } from '@/components/seo/StructuredData';
import { TrackEvent } from '@/components/analytics/TrackEvent';
import { StaggerGroup, FadeUp, RevealOnScroll, HoverCard, GradientCard } from '@/components/ui/motion';
import './homepage-animations.css';

// Lazy load non-critical components for better performance
const FAQ = dynamic(() => import('@/components/marketing/FAQ'), {
  loading: () => <div className="h-96 animate-pulse bg-surface-container rounded-2xl" />,
});

const ExitIntentPopup = dynamic(() => import('@/components/marketing/ExitIntentPopup'));

// LiveActivityFeed removed — was displaying fabricated real-time activity. Reintroduce only when wired to real usage data.
// CircularTestimonials removed — was rendering fabricated testimonials. Reintroduce when real user quotes exist.

export const metadata: Metadata = {
  title: 'WorthApply — The Job Probability Engine',
  description:
    'WorthApply scores your interview probability across 7 signals before you apply. Not a resume builder — a Job Probability Engine. Evidence-based, no fabrication. Free plan available.',
  alternates: { canonical: 'https://www.worthapply.com' },
  openGraph: {
    title: 'WorthApply — The Job Probability Engine',
    description: 'Score your interview probability before you apply. Not a resume builder — a decision engine.',
    url: 'https://www.worthapply.com',
    siteName: 'WorthApply',
    images: [{ url: 'https://www.worthapply.com/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorthApply — The Job Probability Engine',
    description: 'Score your interview probability before you apply. Evidence-based. No fabrication.',
    images: ['https://www.worthapply.com/og-image.png'],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Marky P0: explicit homepage_view event (in addition to $pageview) */}
      <TrackEvent event="homepage_view" />
      {/* Hero Section 1 - Primary (Benefit-Focused) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f4] to-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8 animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-secondary" weight="duotone" />
              <span className="text-sm font-medium text-[#171411]">Job Probability Engine · Not a resume builder.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] tracking-tight leading-[1.0] mb-6 animate-slide-up">
              Know your interview probability{' '}
              <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                before you apply.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#6e665f] leading-relaxed mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-100">
              WorthApply is a Job Probability Engine — not a resume builder. It scores your real interview chances across 7 signals, tells you whether to apply, and then gives you every tool to improve that probability.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up animation-delay-300">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-primary text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-200"
              >
                <Sparkle className="w-5 h-5" weight="duotone" />
                Calculate your probability — free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-gray-900 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-200"
              >
                <Target className="w-5 h-5" weight="duotone" />
                See a live demo
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#9a8f85] animate-fade-in animation-delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" weight="fill" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-secondary" weight="fill" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" weight="duotone" />
                <span className="font-semibold text-green-600">7-Day Money-Back Guarantee</span>
              </div>
            </div>

            {/* Product Visual / Browser Chrome Mock */}
            <div className="mt-16 relative animate-fade-in animation-delay-500">
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
              <div
                className="relative rounded-[30px] overflow-hidden border border-[rgba(84,72,64,0.12)] shadow-[0_24px_64px_-16px_rgba(28,28,26,0.16)]"
                style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,249,244,0.94))'}}
              >
                {/* Browser top bar */}
                <div className="flex items-center px-5 py-3.5 border-b border-[rgba(84,72,64,0.08)] bg-[#fffbf6]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#eab308]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
                  </div>
                  <div className="mx-auto px-4 py-1.5 bg-[#f5ece6] rounded-full font-mono text-xs text-[#8a7b70]">
                    worthapply.com/analyze
                  </div>
                </div>

                {/* Browser body — 2 columns */}
                <div className="grid sm:grid-cols-[1.3fr_1fr] gap-8 p-8">
                  {/* Left: decision + role + skills + next step */}
                  <div>
                    <div className="text-[10px] font-black text-[#8a7b70] uppercase tracking-[0.14em] mb-3">Interview Probability Analysis</div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(234,179,8,0.12)] text-[#854d0e] text-sm font-black mb-4">
                      ✦ TAILOR FIRST
                    </div>
                    <h3 className="text-2xl font-black text-[#171411] tracking-tight leading-tight mb-1.5">
                      Senior Product Manager
                    </h3>
                    <p className="text-sm text-[#6e665f] mb-4">TechCorp · San Francisco · $180k–$220k</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {['Product Strategy', 'Roadmapping', 'SQL', 'B2B SaaS'].map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-[rgba(34,197,94,0.1)] text-[#166534] text-xs font-semibold rounded-full">✓ {s}</span>
                      ))}
                      <span className="px-2.5 py-1 bg-[#f5ece6] text-[#8d5b46] text-xs font-semibold rounded-full">⚠ Figma</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#f6f3ef] border-l-[3px] border-[#84523c]">
                      <div className="text-[10px] font-black text-[#84523c] uppercase tracking-[0.14em] mb-1">Recommended next step</div>
                      <p className="text-xs text-[#3d362f] leading-relaxed">Reframe your platform experience to address the Figma gap before applying cold.</p>
                    </div>
                  </div>

                  {/* Right: fit ring + dimension scores */}
                  <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white border border-[rgba(84,72,64,0.08)]">
                    <div className="relative">
                      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" stroke="#e5e2de" strokeWidth="10" fill="none" />
                        <circle cx="60" cy="60" r="50" stroke="#eab308" strokeWidth="10" fill="none"
                          strokeDasharray="314.16" strokeDashoffset="75.4" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-[#171411]">76%</span>
                        <span className="text-[10px] text-[#8a7b70] font-semibold">Interview Probability</span>
                      </div>
                    </div>
                    <div className="w-full space-y-1.5">
                      {[
                        { label: 'Skills', score: 82, color: 'bg-green-500' },
                        { label: 'Experience', score: 74, color: 'bg-yellow-400' },
                        { label: 'Domain', score: 70, color: 'bg-yellow-400' },
                      ].map((d) => (
                        <div key={d.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-[#8a7b70] w-16 shrink-0">{d.label}</span>
                          <div className="flex-1 h-1.5 bg-[#e5e2de] rounded-full overflow-hidden">
                            <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.score}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-[#171411] w-6">{d.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ Links */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm">
              <a
                href="#faq-analysis"
                className="group flex items-center gap-2 text-[#6e665f] hover:text-primary transition-colors"
              >
                <Question className="w-4 h-4" weight="bold" />
                <span className="group-hover:underline">How does the probability engine work?</span>
              </a>
              <a
                href="#faq-fabrication"
                className="group flex items-center gap-2 text-[#6e665f] hover:text-primary transition-colors"
              >
                <Question className="w-4 h-4" weight="bold" />
                <span className="group-hover:underline">Is this a resume builder?</span>
              </a>
              <a
                href="#faq-difference"
                className="group flex items-center gap-2 text-[#6e665f] hover:text-primary transition-colors"
              >
                <Question className="w-4 h-4" weight="bold" />
                <span className="group-hover:underline">Free vs Pro vs Premium?</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Row */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            <FadeUp className="flex flex-col items-center">
              <ShieldCheck className="w-10 h-10 text-secondary mb-3" weight="duotone" />
              <div className="font-bold text-[#171411] text-lg mb-1">Secure & Private</div>
              <div className="text-sm text-[#6e665f]">Your data stays confidential</div>
            </FadeUp>
            <FadeUp className="flex flex-col items-center">
              <Target className="w-10 h-10 text-secondary mb-3" weight="duotone" />
              <div className="font-bold text-[#171411] text-lg mb-1">Probability Engine</div>
              <div className="text-sm text-[#6e665f]">Score your odds before you apply</div>
            </FadeUp>
            <FadeUp className="flex flex-col items-center">
              <Star className="w-10 h-10 text-secondary mb-3" weight="fill" />
              <div className="font-bold text-[#171411] text-lg mb-1">Not a Resume Builder</div>
              <div className="text-sm text-[#6e665f]">A decision engine that improves probability</div>
            </FadeUp>
          </StaggerGroup>
        </div>
      </section>

      {/* Our Promise Section (honest, early-stage framing) */}
      <section className="py-24 bg-gradient-to-b from-white to-[#fbf8f4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <ShieldCheck className="w-4 h-4 text-secondary" weight="duotone" />
            <span className="text-sm font-medium text-[#171411]">Our promise to you</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-6">
            Honest by design. Selective by principle.
          </h2>
          <p className="text-lg text-[#6e665f] leading-relaxed max-w-3xl mx-auto mb-12">
            Most resume tools fabricate achievements, stuff keywords, and push you to apply to 100+ jobs
            blindly. We built WorthApply because we believe the opposite is true.
          </p>

          <StaggerGroup className="grid md:grid-cols-3 gap-6 text-left">
            <FadeUp>
              <GradientCard glowOnHover>
                <Target className="w-8 h-8 text-secondary mb-4" weight="duotone" />
                <h3 className="font-bold text-[#171411] text-lg mb-2">Probability before effort</h3>
                <p className="text-[#6e665f] text-sm">
                  We calculate your interview probability <em>before</em> you spend hours tailoring. If the
                  odds aren&apos;t there, we say so — and tell you exactly what to fix.
                </p>
              </GradientCard>
            </FadeUp>
            <FadeUp>
              <GradientCard glowOnHover>
                <ShieldCheck className="w-8 h-8 text-secondary mb-4" weight="duotone" />
                <h3 className="font-bold text-[#171411] text-lg mb-2">Evidence over invention</h3>
                <p className="text-[#6e665f] text-sm">
                  Every suggestion is tied to your real experience. We will never fabricate achievements or
                  invent work you didn&apos;t do.
                </p>
              </GradientCard>
            </FadeUp>
            <FadeUp>
              <GradientCard glowOnHover>
                <CheckCircle className="w-8 h-8 text-secondary mb-4" weight="duotone" />
                <h3 className="font-bold text-[#171411] text-lg mb-2">Selective, not spam</h3>
                <p className="text-[#6e665f] text-sm">
                  Built for people going after 10&ndash;15 roles they actually want &mdash; not the
                  fire-and-forget 500-application approach.
                </p>
              </GradientCard>
            </FadeUp>
          </StaggerGroup>
        </div>
      </section>

      {/* Objection-Handling Section: Not Another Keyword Stuffer */}
      <section className="py-28" style={{background: '#0d0c0b'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <RevealOnScroll className="text-center mb-16">
            <span className="inline-block text-[10px] font-black text-[#4f463e] uppercase tracking-[0.25em] mb-5">Why WorthApply</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.05] mb-5">
              Not another keyword stuffer.
            </h2>
            <p className="text-lg text-[#6e665f] max-w-xl mx-auto leading-relaxed">
              Resume builders optimize your document. WorthApply{' '}
              <span className="text-[#c68a71] font-semibold">optimizes your probability of getting the call.</span>
            </p>
          </RevealOnScroll>

          {/* 3-col comparison */}
          <StaggerGroup className="grid md:grid-cols-3 gap-5 items-stretch">

            {/* Other Tools */}
            <FadeUp>
              <div className="h-full rounded-2xl border border-[#1f1b17] p-7 flex flex-col" style={{background: '#141210'}}>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#1f1b17]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: 'rgba(239,68,68,0.08)'}}>
                    <X className="w-4 h-4 text-red-500" weight="bold" />
                  </div>
                  <div>
                    <p className="font-bold text-[#e8e2db] text-sm leading-tight">Other Tools</p>
                    <p className="text-[11px] text-[#3d362f] mt-0.5">Jobscan · Rezi · Resume.io</p>
                  </div>
                </div>
                <ul className="space-y-3.5 flex-1">
                  {[
                    'Keyword spam that gets flagged',
                    'Apply to 100+ jobs blindly',
                    'No fit check before tailoring',
                    'Generic template-driven rewrites',
                    'Fabricate achievements freely',
                    'No outreach or interview tools',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'rgba(239,68,68,0.08)'}}>
                        <X className="w-2.5 h-2.5 text-red-500" weight="bold" />
                      </div>
                      <span className="text-sm text-[#3d362f] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* WorthApply — elevated center */}
            <FadeUp>
              <div className="h-full rounded-2xl p-7 flex flex-col relative -mt-3 -mb-3 shadow-[0_0_80px_rgba(198,138,113,0.1)]"
                style={{background: 'linear-gradient(160deg, #1e1610 0%, #150e09 100%)', border: '1.5px solid rgba(198,138,113,0.25)'}}>
                {/* Top badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-[0.18em] px-5 py-1.5 rounded-full whitespace-nowrap"
                  style={{background: 'linear-gradient(90deg, #9d6148, #c68a71)'}}>
                  Our approach
                </div>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b mt-3" style={{borderColor: 'rgba(198,138,113,0.15)'}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: 'rgba(198,138,113,0.12)'}}>
                    <CheckCircle className="w-4 h-4 text-[#c68a71]" weight="fill" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm leading-tight">WorthApply</p>
                    <p className="text-[11px] mt-0.5" style={{color: 'rgba(198,138,113,0.6)'}}>Fit-first · Evidence-based</p>
                  </div>
                </div>
                <ul className="space-y-3.5 flex-1">
                  {[
                    'Score fit across 7 dimensions first',
                    'Apply to 10–15 high-fit roles only',
                    'Analyze before tailoring — always',
                    'Suggestions grounded in your resume',
                    'Zero fabrication, ever',
                    'Outreach, interview prep & negotiation',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'rgba(198,138,113,0.12)'}}>
                        <CheckCircle className="w-2.5 h-2.5 text-[#c68a71]" weight="fill" />
                      </div>
                      <span className="text-sm text-[#e8e2db] font-medium leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>

            {/* Manual Approach */}
            <FadeUp>
              <div className="h-full rounded-2xl border border-[#1f1b17] p-7 flex flex-col" style={{background: '#141210'}}>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#1f1b17]">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: 'rgba(161,138,120,0.08)'}}>
                    <Warning className="w-4 h-4 text-[#6e665f]" weight="duotone" />
                  </div>
                  <div>
                    <p className="font-bold text-[#e8e2db] text-sm leading-tight">Manual Approach</p>
                    <p className="text-[11px] text-[#3d362f] mt-0.5">DIY job search</p>
                  </div>
                </div>
                <ul className="space-y-3.5 flex-1">
                  {[
                    '3–4 hours per application',
                    'Guess if you\'re even qualified',
                    'Same resume for every role',
                    '2–5% average response rate',
                    'Burnout from constant rejection',
                    'No system, no data, no leverage',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'rgba(161,138,120,0.08)'}}>
                        <Warning className="w-2.5 h-2.5 text-[#4f463e]" weight="duotone" />
                      </div>
                      <span className="text-sm text-[#3d362f] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </StaggerGroup>

          {/* CTA */}
          <RevealOnScroll className="text-center mt-16">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-lg text-white hover:-translate-y-0.5 transition-all duration-200"
              style={{background: 'linear-gradient(135deg, #9d6148 0%, #c68a71 100%)', boxShadow: '0 14px 40px rgba(157,97,72,0.3)'}}
            >
              <Sparkle className="w-5 h-5" weight="duotone" />
              Try the smarter way free
              <ArrowRight className="w-5 h-5" weight="bold" />
            </Link>
            <p className="text-xs text-[#3d362f] mt-4">No credit card required · Free plan available</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-16">
            <span className="inline-block text-[10px] font-black text-[#9a8f85] uppercase tracking-[0.25em] mb-5">Competitor comparison</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#171411] tracking-tight leading-[1.05] mb-5">
              See how we compare
            </h2>
            <p className="text-lg text-[#6e665f] max-w-xl mx-auto leading-relaxed">
              We analyzed the top alternatives so you don&apos;t have to.
            </p>
            <p className="text-xs text-[#c4bab4] mt-3 font-medium">Updated April 2026 · Based on public pricing and features</p>
          </RevealOnScroll>

          {(() => {
            type CellVal = boolean | { yes?: boolean; partial?: boolean; label?: string };

            const COL = 'grid-cols-[2fr_1fr_1fr_1fr_1fr]';

            const renderCell = (val: CellVal, isWA = false) => {
              if (val === false) {
                return (
                  <div className="flex justify-center">
                    <div className="w-5 h-5 rounded-full bg-[#f0ede9] flex items-center justify-center">
                      <X className="w-2.5 h-2.5 text-[#c4bab4]" weight="bold" />
                    </div>
                  </div>
                );
              }
              const v = val as { yes?: boolean; partial?: boolean; label?: string };
              if (v.partial) {
                return (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                      <Warning className="w-2.5 h-2.5 text-amber-500" weight="fill" />
                    </div>
                    {v.label && <span className="text-[10px] text-amber-600 font-semibold leading-none">{v.label}</span>}
                  </div>
                );
              }
              return (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={isWA ? {background: 'rgba(198,138,113,0.15)'} : {background: 'rgba(34,197,94,0.1)'}}>
                    <CheckCircle className="w-2.5 h-2.5" style={isWA ? {color: '#c68a71'} : {color: '#16a34a'}} weight="fill" />
                  </div>
                  {v.label && <span className="text-[10px] font-bold leading-none" style={isWA ? {color: '#c68a71'} : {color: '#16a34a'}}>{v.label}</span>}
                </div>
              );
            };

            const groups: { category: string; rows: { feature: string; wa: CellVal; jobscan: CellVal; rezi: CellVal; teal: CellVal }[] }[] = [
              {
                category: 'Strategy & Fit',
                rows: [
                  { feature: 'Apply/Skip Decision Engine', wa: { yes: true, label: '5 signals' }, jobscan: false, rezi: false, teal: false },
                  { feature: 'Fit-first analysis (before tailoring)', wa: { yes: true }, jobscan: false, rezi: false, teal: false },
                  { feature: 'Evidence-based — no fabrication', wa: { yes: true }, jobscan: { partial: true }, rezi: false, teal: { partial: true } },
                ],
              },
              {
                category: 'Documents',
                rows: [
                  { feature: 'Resume tailoring + ATS optimization', wa: { yes: true }, jobscan: { yes: true }, rezi: { yes: true }, teal: { yes: true } },
                  { feature: 'Cover letter generator', wa: { yes: true }, jobscan: { yes: true }, rezi: { yes: true }, teal: { yes: true } },
                  { feature: 'Unlimited analyses', wa: { yes: true, label: '$39' }, jobscan: { yes: true, label: '$89' }, rezi: { partial: true, label: '10/mo' }, teal: { partial: true, label: '5/mo' } },
                ],
              },
              {
                category: 'Outreach & Discovery',
                rows: [
                  { feature: 'Outreach Copilot (recruiter + referral)', wa: { yes: true, label: 'Pro' }, jobscan: false, rezi: false, teal: false },
                  { feature: 'LinkedIn job discovery', wa: { yes: true, label: 'Pro/Premium' }, jobscan: false, rezi: false, teal: { partial: true, label: 'Limited' } },
                ],
              },
              {
                category: 'Interview & Offers',
                rows: [
                  { feature: 'Interview Prep Copilot', wa: { yes: true, label: 'Premium' }, jobscan: false, rezi: false, teal: false },
                  { feature: 'Evidence Vault (story bank)', wa: { yes: true, label: 'Premium' }, jobscan: false, rezi: false, teal: false },
                  { feature: 'Offer & Salary Negotiation', wa: { yes: true, label: 'Premium' }, jobscan: false, rezi: false, teal: false },
                ],
              },
              {
                category: 'Tracking',
                rows: [
                  { feature: 'Application tracking', wa: { yes: true }, jobscan: { partial: true, label: 'Basic' }, rezi: false, teal: { yes: true } },
                ],
              },
            ];

            return (
              <>
                {/* Product header cards */}
                <div className={`grid ${COL} gap-3 mb-3`}>
                  <div className="hidden md:block" />
                  <div className="rounded-2xl p-5 text-center relative"
                    style={{background: 'linear-gradient(160deg, #1e1610 0%, #150e09 100%)', border: '1.5px solid rgba(198,138,113,0.3)'}}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full whitespace-nowrap"
                      style={{background: 'linear-gradient(90deg, #9d6148, #c68a71)'}}>
                      Best value
                    </div>
                    <div className="font-black text-white text-sm mt-1">WorthApply</div>
                    <div className="text-[10px] mt-1 font-semibold" style={{color: 'rgba(198,138,113,0.7)'}}>from $39/mo</div>
                  </div>
                  {[{ name: 'Jobscan', price: '$49/mo' }, { name: 'Rezi', price: '$29/mo' }, { name: 'Teal', price: '$29/mo' }].map((p) => (
                    <div key={p.name} className="rounded-2xl p-5 text-center bg-[#f9f7f5] border border-[#e8e2db]">
                      <div className="font-bold text-[#171411] text-sm">{p.name}</div>
                      <div className="text-[10px] text-[#9a8f85] mt-1 font-medium">{p.price}</div>
                    </div>
                  ))}
                </div>

                {/* Rows */}
                <div className="rounded-2xl overflow-hidden border border-[#e8e2db]">
                  {groups.map((group, gi) => (
                    <div key={gi}>
                      {/* Category header */}
                      <div className={`grid ${COL} bg-[#f5f2ef] border-b border-[#e8e2db] px-5 py-2.5`}>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a8f85]">{group.category}</span>
                        <div /><div /><div /><div />
                      </div>
                      {/* Feature rows */}
                      {group.rows.map((row, ri) => (
                        <div key={ri} className={`grid ${COL} border-b border-[#f0ede9] last:border-0 ${ri % 2 === 1 ? 'bg-[#fdfcfb]' : 'bg-white'}`}>
                          <div className="px-5 py-4 flex items-center">
                            <span className="text-sm text-[#3d362f] font-medium">{row.feature}</span>
                          </div>
                          <div className="px-3 py-4 flex items-center justify-center" style={{background: 'rgba(198,138,113,0.04)'}}>
                            {renderCell(row.wa, true)}
                          </div>
                          <div className="px-3 py-4 flex items-center justify-center">{renderCell(row.jobscan)}</div>
                          <div className="px-3 py-4 flex items-center justify-center">{renderCell(row.rezi)}</div>
                          <div className="px-3 py-4 flex items-center justify-center">{renderCell(row.teal)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend + CTA */}
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-5 text-xs text-[#9a8f85]">
                    {[
                      { icon: <CheckCircle className="w-2.5 h-2.5 text-green-600" weight="fill" />, bg: 'bg-green-50', label: 'Full support' },
                      { icon: <Warning className="w-2.5 h-2.5 text-amber-500" weight="fill" />, bg: 'bg-amber-50', label: 'Partial' },
                      { icon: <X className="w-2.5 h-2.5 text-[#c4bab4]" weight="bold" />, bg: 'bg-[#f0ede9]', label: 'Not available' },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full ${l.bg} flex items-center justify-center`}>{l.icon}</div>
                        <span>{l.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/compare" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    See detailed comparison
                    <ArrowRight className="w-4 h-4" weight="bold" />
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* "It's a Match If You..." Section (AG1-Style) */}
      <section className="py-24 bg-[#fbf8f4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
              Designed for Serious Job Seekers
            </h2>
            <p className="text-lg text-[#6e665f] leading-relaxed mb-8">
              WorthApply is perfect if you:
            </p>
          </div>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {[
              {
                text: 'Are applying but not getting interviews',
                detail: 'We score 7 fit dimensions and show exactly what to fix before you apply'
              },
              {
                text: 'Want to know your real chances before investing hours',
                detail: 'Apply/Skip decision in 10 seconds — before you touch your resume'
              },
              {
                text: 'Need recruiters to actually respond to outreach',
                detail: 'Outreach Copilot writes role-specific messages tied to your real proof points'
              },
              {
                text: 'Are prepping for interviews and want tailored questions',
                detail: 'Interview Prep Copilot generates role-specific questions with evidence-backed answers'
              },
              {
                text: 'Want a reusable bank of stories for every application',
                detail: 'Evidence Vault extracts your achievements once, then powers every tool automatically'
              },
              {
                text: 'Have an offer and want to negotiate without guessing',
                detail: 'Offer Evaluation gives you a 4-year comp projection and scripts to use on the call'
              }
            ].map((item, index) => (
              <FadeUp key={index}>
                <HoverCard>
                  <div className="flex items-start gap-3 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" weight="fill" />
                    <div>
                      <p className="font-semibold text-[#171411] mb-1">
                        {item.text}
                      </p>
                      <p className="text-sm text-[#6e665f]">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </HoverCard>
              </FadeUp>
            ))}
          </StaggerGroup>

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-container transition-all duration-200 hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" weight="bold" />
            </Link>
            <p className="text-sm text-[#9a8f85] mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* What Makes WorthApply Different */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] text-center mb-12">
            What makes WorthApply different
          </h2>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: 'Probability First', label: 'The only engine that scores your interview odds before you tailor' },
              { value: 'Evidence-Based', label: 'Every suggestion tied to your real experience' },
              { value: '$39/mo', label: 'Unlimited analyses &mdash; no per-use caps' },
            ].map((stat) => (
              <FadeUp key={stat.label}>
                <HoverCard>
                  <div className="text-center p-8 rounded-2xl bg-[#fbf8f4] hover:shadow-lg transition-all duration-300">
                    <div className="text-4xl font-bold text-secondary mb-3">{stat.value}</div>
                    <div className="text-[#6e665f]" dangerouslySetInnerHTML={{ __html: stat.label }} />
                  </div>
                </HoverCard>
              </FadeUp>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* How It Works (3-Step) */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-[#fbf8f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#6e665f] leading-relaxed max-w-2xl mx-auto">
              Land interviews in 3 simple steps
            </p>
          </div>
          
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: Target,
                title: 'Upload',
                description: 'Upload your resume once. We instantly parse your skills, experience, and achievements in seconds.',
              },
              {
                step: '2',
                icon: FileMagnifyingGlass,
                title: 'Calculate',
                description: 'Paste any job description. WorthApply calculates your interview probability across 7 signals and gives you an Apply/Skip verdict in 10 seconds.',
              },
              {
                step: '3',
                icon: Sparkle,
                title: 'Boost Your Probability',
                description: 'Use every tool — tailoring, outreach, interview prep — to close the gap and convert your probability into an offer.',
              }
            ].map((step) => (
              <FadeUp key={step.step} className="text-center">
                <HoverCard>
                  <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                    <step.icon className="w-10 h-10 text-secondary group-hover:text-white transition-colors" weight="duotone" />
                  </div>
                  <div className="text-6xl font-bold text-secondary/20 mb-2">{step.step}</div>
                  <h3 className="text-xl font-bold text-[#171411] mb-3">Step {step.step}: {step.title}</h3>
                  <p className="text-[#6e665f] leading-relaxed">{step.description}</p>
                </HoverCard>
              </FadeUp>
            ))}
          </StaggerGroup>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-container transition-all duration-200 hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#f0ede9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[34px] px-10 py-14 sm:px-14">
            <div className="text-center mb-14">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
                Every tool to boost your probability
              </h2>
              <p className="text-lg text-[#6e665f] leading-relaxed max-w-2xl mx-auto">
                The engine scores your odds. Each tool below improves them — from first analysis to signed offer.
              </p>
            </div>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Apply/Skip Decision Engine',
                  description: 'Scores your interview probability across 7 signals. Returns one of 5 verdicts before you invest a minute in tailoring',
                  badge: null,
                },
                {
                  icon: Sparkle,
                  title: 'Resume Tailoring + ATS',
                  description: 'Role-specific rewrites using PAR/CAR frameworks, ATS keyword alignment, and seniority-calibrated bullets',
                  badge: null,
                },
                {
                  icon: FileText,
                  title: 'Cover Letter Generator',
                  description: 'Evidence-backed cover letters that open with a proof point, not "I am excited to apply"',
                  badge: null,
                },
                {
                  icon: PaperPlaneTilt,
                  title: 'Outreach Copilot',
                  description: 'Separate recruiter message, referral ask, LinkedIn note, and follow-up — each tailored to your actual fit',
                  badge: 'Pro',
                },
                {
                  icon: ChartBar,
                  title: 'LinkedIn Job Discovery',
                  description: 'Surface roles matching your background. Pro gets 10 searches/month, Premium gets 30',
                  badge: 'Pro',
                },
                {
                  icon: ClipboardText,
                  title: 'Application Tracker',
                  description: 'Track every application, status, and follow-up in one place. Never lose track of a live opportunity',
                  badge: null,
                },
                {
                  icon: GraduationCap,
                  title: 'Interview Prep Copilot',
                  description: 'Stage-specific questions — recruiter screen, hiring manager, panel — with evidence-backed answer outlines from your resume',
                  badge: 'Premium',
                },
                {
                  icon: Archive,
                  title: 'Evidence Vault',
                  description: 'AI extracts your achievements into a permanent story bank — categorized, tagged, and ready to power every application',
                  badge: 'Premium',
                },
                {
                  icon: Handshake,
                  title: 'Offer & Negotiation Copilot',
                  description: '4-year comp projections, market benchmarks, ranked negotiation levers, and scripts for the counter-offer call',
                  badge: 'Premium',
                },
              ].map((feature) => (
                <FadeUp key={feature.title}>
                  <HoverCard className="h-full">
                    <div className="group p-8 rounded-3xl border border-[rgba(84,72,64,0.12)] hover:border-[rgba(198,138,113,0.28)] hover:shadow-[0_32px_72px_rgba(28,28,26,0.08)] hover:-translate-y-[5px] transition-all duration-200 h-full" style={{background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,249,244,0.8) 100%)'}}>
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-12 h-12 bg-[rgba(132,82,60,0.1)] rounded-xl flex items-center justify-center group-hover:bg-secondary transition-all duration-200">
                          <feature.icon className="w-6 h-6 text-secondary group-hover:text-white transition-colors" weight="duotone" />
                        </div>
                        {feature.badge && (
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            feature.badge === 'Premium'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-secondary/10 text-secondary border border-secondary/20'
                          }`}>
                            {feature.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[#171411] mb-2 tracking-tight">{feature.title}</h3>
                      <p className="text-[#4f463e] text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </HoverCard>
                </FadeUp>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div id="faq">
        <FAQ
          items={[
            {
              id: "faq-analysis",
              question: "How does the Job Probability Engine work?",
              answer: "Paste any job description. WorthApply calculates your interview probability across 7 signals — role alignment, seniority, skills, experience depth, domain relevance, evidence strength, and risk level — and returns one of 5 verdicts: Apply Now, Tailor First, Apply if Referred, Stretch if Priority Company, or Skip. Free users get the verdict. Pro users get the full probability breakdown, gap analysis, and a ranked fix list."
            },
            {
              question: "What is the Outreach Copilot?",
              answer: "The Outreach Copilot writes targeted messages for each contact type: a recruiter message, a referral ask, a short LinkedIn connection note, and a follow-up. Every message is grounded in your actual experience and fit score — not generic templates. Available on Pro and Premium plans."
            },
            {
              question: "What is the Evidence Vault?",
              answer: "The Evidence Vault is your permanent story bank. It extracts your achievements, projects, leadership stories, and problem-solving examples from your resume and organizes them into reusable units — each tagged by category, skills, and use case (resume, interview, cover letter, outreach, negotiation). Premium feature."
            },
            {
              question: "What does Interview Prep Copilot do?",
              answer: "It generates 22–30 stage-specific questions — recruiter screen, hiring manager, panel — with evidence-backed answer outlines drawn from your actual resume. Each question includes why it's likely to be asked and where you might fumble it. Also generates STAR stories and smart questions to ask the interviewer. Premium feature."
            },
            {
              id: "faq-difference",
              question: "What's the difference between Free, Pro, and Premium?",
              answer: "Free: 1 probability analysis/month, Apply/Skip verdict, 2 resume tailors, 3 cover letter verdicts, track 8 applications. Pro ($39/mo): unlimited analyses, full probability breakdown + gap fix list, Outreach Copilot, unlimited tailoring + ATS, unlimited cover letters, 10 LinkedIn searches/month. Premium ($79/mo): everything in Pro plus Interview Prep Copilot, Evidence Vault, 30 LinkedIn searches, and Offer & Salary Negotiation Copilot."
            },
            {
              id: "faq-fabrication",
              question: "Is WorthApply a resume builder?",
              answer: "No. WorthApply is a Job Probability Engine — the resume tailoring, cover letters, and ATS tools exist to improve your interview probability after the engine tells you a role is worth pursuing. Every suggestion is grounded in your actual experience. We will never fabricate achievements, invent metrics, or stuff keywords."
            }
          ]}
          subtitle="Everything you need to know about WorthApply"
        />
      </div>

      {/* Final CTA */}
      <section className="py-8 bg-[#f0ede9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="rounded-[34px] overflow-hidden" style={{background: 'linear-gradient(135deg, #171411 0%, #241f1a 55%, #2d261f 100%)'}}>
              <div className="px-8 py-20 sm:px-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.12] mb-6">
                  <span className="text-xs font-black text-[#fdba9f] uppercase tracking-widest">Our promise to you</span>
                </div>
                <h2 className="text-3xl lg:text-[3.4rem] font-black tracking-[-0.05em] leading-[1.0] mb-5 text-white">
                  We won&apos;t waste your time — or your story.
                </h2>
                <p className="text-lg mb-10 max-w-xl mx-auto" style={{color: 'rgba(247,240,233,0.7)'}}>
                  The Job Probability Engine — score your odds, then use every tool to improve them. Zero guessing, zero fabrication.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-semibold text-lg hover:-translate-y-1 transition-all duration-200"
                    style={{background: 'linear-gradient(135deg, #9d6148 0%, #c68a71 52%, #d7a189 100%)', boxShadow: '0 18px 44px rgba(157,97,72,0.26)'}}
                  >
                    Get started free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-[#fdba9f] rounded-xl font-semibold text-lg hover:bg-white/[0.08] transition-all duration-200"
                  >
                    View pricing →
                  </Link>
                </div>
                <p className="text-sm mt-6" style={{color: 'rgba(247,240,233,0.45)'}}>
                  No credit card required • Free forever plan • Cancel anytime
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Exit Intent Popup */}
      <ExitIntentPopup />

      {/* Live Activity Feed removed — see import note above */}

      {/* Structured Data for SEO */}
      <WebSiteSchema
        name="WorthApply"
        url="https://worthapply.com"
        description="Job Probability Engine. WorthApply scores your interview probability across 7 signals before you apply — then gives you every tool to improve your odds."
      />

      <OrganizationSchema
        name="WorthApply"
        url="https://worthapply.com"
        logo="https://worthapply.com/logo.png"
        description="Job Probability Engine. WorthApply scores your interview probability across 7 signals before you apply — then gives you every tool to improve your odds."
        sameAs={[
          'https://twitter.com/worthapply',
          'https://linkedin.com/company/worthapply',
        ]}
      />
      
      <ProductSchema
        name="WorthApply Pro"
        description="Job Probability Engine. Scores your interview probability across 7 signals before you apply — then gives you every tool to improve it."
        image="https://worthapply.com/og-image.png"
        offers={[
          {
            price: '0',
            priceCurrency: 'USD',
            availability: 'InStock',
          },
          {
            price: '39',
            priceCurrency: 'USD',
            availability: 'InStock',
          },
        ]}
      />
      {/* ReviewSchema and aggregateRating intentionally removed — will be added back once real user reviews exist. */}
    </div>
  );
}
