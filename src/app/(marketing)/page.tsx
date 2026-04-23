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
  Warning
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
  title: 'WorthApply — Know your fit before you apply',
  description:
    'Fit-first job search. Analyze your real fit for a role in 10 seconds before tailoring your resume. Evidence-based, no fabrication. Free plan available.',
  alternates: { canonical: 'https://www.worthapply.com' },
  openGraph: {
    title: 'WorthApply — Know your fit before you apply',
    description: 'Fit-first job search. Built for selective applicants targeting competitive roles.',
    url: 'https://www.worthapply.com',
    siteName: 'WorthApply',
    images: [{ url: 'https://www.worthapply.com/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorthApply — Know your fit before you apply',
    description: 'Fit-first job search. Evidence-based. No fabrication.',
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
              <span className="text-sm font-medium text-[#171411]">Fit-first. Evidence-based. No fabrication.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] tracking-tight leading-[1.0] mb-6 animate-slide-up">
              Know your fit{' '}
              <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                before you apply.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#6e665f] leading-relaxed mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-100">
              WorthApply helps serious applicants decide which jobs are actually worth pursuing, tailor honestly using their real experience, and run a disciplined search from first analysis to interview.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up animation-delay-300">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-primary text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-200"
              >
                <Sparkle className="w-5 h-5" weight="duotone" />
                Get a free fit audit for 3 jobs
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
                  {/* Left: verdict + role + skills + evidence */}
                  <div>
                    <div className="text-[10px] font-black text-[#8a7b70] uppercase tracking-[0.14em] mb-3">Fit verdict</div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(34,197,94,0.12)] text-[#166534] text-sm font-black mb-4">
                      ✓ APPLY
                    </div>
                    <h3 className="text-2xl font-black text-[#171411] tracking-tight leading-tight mb-1.5">
                      Senior Product Manager
                    </h3>
                    <p className="text-sm text-[#6e665f] mb-4">TechCorp · San Francisco · $180k–$220k</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {['Product Strategy', 'Roadmapping', 'SQL', 'B2B SaaS'].map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-[rgba(34,197,94,0.1)] text-[#166534] text-xs font-semibold rounded-full">✓ {s}</span>
                      ))}
                      <span className="px-2.5 py-1 bg-[#f5ece6] text-[#8d5b46] text-xs font-semibold rounded-full">Figma</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#f6f3ef] border-l-[3px] border-[#84523c]">
                      <div className="text-[10px] font-black text-[#84523c] uppercase tracking-[0.14em] mb-1">Evidence</div>
                      <p className="text-xs text-[#3d362f] leading-relaxed italic">&ldquo;Led roadmap for 3M+ users at Stripe&rdquo; — matches their senior PM requirement.</p>
                    </div>
                  </div>

                  {/* Right: fit ring + label + CTA */}
                  <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white border border-[rgba(84,72,64,0.08)]">
                    <div className="relative">
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" stroke="#e5e2de" strokeWidth="10" fill="none" />
                        <circle cx="60" cy="60" r="50" stroke="#22c55e" strokeWidth="10" fill="none"
                          strokeDasharray="314.16" strokeDashoffset="37.7" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-[#171411]">88%</span>
                        <span className="text-[10px] text-[#8a7b70] font-semibold">Fit Score</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#6e665f] font-medium">8/9 skills matched</p>
                    <div className="px-5 py-2.5 bg-[#1c1c1a] text-white text-sm font-semibold rounded-xl">
                      Tailor Resume →
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
                <span className="group-hover:underline">How does the analyzer work?</span>
              </a>
              <a 
                href="#faq-fabrication" 
                className="group flex items-center gap-2 text-[#6e665f] hover:text-primary transition-colors"
              >
                <Question className="w-4 h-4" weight="bold" />
                <span className="group-hover:underline">Will it write fake experience?</span>
              </a>
              <a 
                href="#faq-difference" 
                className="group flex items-center gap-2 text-[#6e665f] hover:text-primary transition-colors"
              >
                <Question className="w-4 h-4" weight="bold" />
                <span className="group-hover:underline">What makes you different?</span>
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
              <div className="font-bold text-[#171411] text-lg mb-1">Fit-First Analysis</div>
              <div className="text-sm text-[#6e665f]">Know before you apply</div>
            </FadeUp>
            <FadeUp className="flex flex-col items-center">
              <Star className="w-10 h-10 text-secondary mb-3" weight="fill" />
              <div className="font-bold text-[#171411] text-lg mb-1">Evidence-Based</div>
              <div className="text-sm text-[#6e665f]">Tied to your real experience</div>
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
            We won&apos;t waste your time &mdash; or your story
          </h2>
          <p className="text-lg text-[#6e665f] leading-relaxed max-w-3xl mx-auto mb-12">
            Most resume tools fabricate achievements, stuff keywords, and push you to apply to 100+ jobs
            blindly. We built WorthApply because we believe the opposite is true.
          </p>

          <StaggerGroup className="grid md:grid-cols-3 gap-6 text-left">
            <FadeUp>
              <GradientCard glowOnHover>
                <Target className="w-8 h-8 text-secondary mb-4" weight="duotone" />
                <h3 className="font-bold text-[#171411] text-lg mb-2">Fit before effort</h3>
                <p className="text-[#6e665f] text-sm">
                  We tell you whether to apply <em>before</em> you spend hours tailoring. If the fit isn&apos;t
                  there, we say so.
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
              Not Another Keyword Stuffer
            </h2>
            <p className="text-lg text-[#6e665f] leading-relaxed max-w-3xl mx-auto">
              We&apos;re different from generic resume tools and slow manual approaches
            </p>
          </div>

          <StaggerGroup className="grid md:grid-cols-3 gap-8">
            {/* Other Tools Column */}
            <FadeUp className="p-6 rounded-2xl border-2 border-red-200 bg-red-50">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-600" weight="bold" />
                </div>
                <h3 className="text-xl font-bold text-[#171411]">Other Tools</h3>
                <p className="text-sm text-[#6e665f] mt-1">Jobscan, Rezi, Resume.io</p>
              </div>
              <ul className="space-y-3">
                {[
                  'Generic resume rewrites',
                  'Keyword spam that ATS flags',
                  'Apply to 100+ jobs blindly',
                  'No fit analysis before tailoring',
                  'Fabricate achievements',
                  'One-size-fits-all templates'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" weight="bold" />
                    <span className="text-[#3d362f]">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* WorthApply Column (Highlighted) */}
            <FadeUp className="p-6 rounded-2xl border-4 border-green-600 bg-green-50 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-1.5 rounded-full text-sm font-bold">
                Best Choice
              </div>
              <div className="text-center mb-6 mt-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-[#171411]">WorthApply</h3>
                <p className="text-sm text-[#6e665f] mt-1">Fit-first approach</p>
              </div>
              <ul className="space-y-3">
                {[
                  'Analyze fit BEFORE applying',
                  'Tailor based on YOUR experience',
                  'Focus on 10-12 high-fit roles',
                  'Fit verdict with evidence gaps flagged',
                  'Evidence-backed suggestions only',
                  'Tells you when not to apply'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                    <span className="text-[#171411] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* Manual Approach Column */}
            <FadeUp className="p-6 rounded-2xl border-2 border-gray-200 bg-gray-50">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Warning className="w-6 h-6 text-gray-600" weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-[#171411]">Manual Approach</h3>
                <p className="text-sm text-[#6e665f] mt-1">DIY job search</p>
              </div>
              <ul className="space-y-3">
                {[
                  '3-4 hours per application',
                  'Guess if you\'re qualified',
                  'Generic resume for all jobs',
                  '2-5% response rate',
                  'Burnout from rejections',
                  'No data-driven insights'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Warning className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" weight="duotone" />
                    <span className="text-[#3d362f]">{item}</span>
                  </li>
                ))}
              </ul>
            </FadeUp>
          </StaggerGroup>

          {/* CTA */}
          <RevealOnScroll className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-primary text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Sparkle className="w-5 h-5" weight="duotone" />
              Try the Smarter Way Free
              <ArrowRight className="w-5 h-5" weight="bold" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-24 bg-gradient-to-b from-[#fbf8f4] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
              See How We Compare
            </h2>
            <p className="text-lg text-[#6e665f] leading-relaxed mb-2">
              We analyzed the top 3 competitors so you don&apos;t have to
            </p>
            <p className="text-sm text-[#9a8f85]">
              Updated April 2026 • Based on public pricing and features
            </p>
          </RevealOnScroll>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-200 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-[#171411] sticky left-0 bg-gray-50">
                        Feature
                      </th>
                      <th scope="col" className="px-6 py-4 text-center bg-[rgba(198,138,113,0.08)] border-x-2 border-[#84523c]">
                        <div className="font-bold text-[#84523c] text-lg">WorthApply</div>
                        <div className="text-xs text-[#6e665f] font-normal mt-1">$39/mo</div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        <div className="font-semibold text-[#171411]">Jobscan</div>
                        <div className="text-xs text-[#6e665f] font-normal mt-1">$49/mo</div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        <div className="font-semibold text-[#171411]">Rezi</div>
                        <div className="text-xs text-[#6e665f] font-normal mt-1">$29/mo</div>
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        <div className="font-semibold text-[#171411]">Teal</div>
                        <div className="text-xs text-[#6e665f] font-normal mt-1">$29/mo</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      {
                        feature: 'Fit-First Analysis (before tailoring)',
                        worthapply: '✅',
                        jobscan: '❌',
                        rezi: '❌',
                        teal: '❌'
                      },
                      {
                        feature: 'LinkedIn Job Scraper (300 jobs)',
                        worthapply: '✅',
                        jobscan: '❌',
                        rezi: '❌',
                        teal: '⚠️ Limited'
                      },
                      {
                        feature: 'Resume Tailoring',
                        worthapply: '✅',
                        jobscan: '✅',
                        rezi: '✅',
                        teal: '✅'
                      },
                      {
                        feature: 'Evidence-Based (no fabrication)',
                        worthapply: '✅',
                        jobscan: '⚠️',
                        rezi: '❌',
                        teal: '⚠️'
                      },
                      {
                        feature: 'Unlimited Analyses',
                        worthapply: '✅ $39',
                        jobscan: '✅ $89',
                        rezi: '❌ 10/mo',
                        teal: '❌ 5/mo'
                      },
                      {
                        feature: 'Application Tracking',
                        worthapply: '✅',
                        jobscan: '⚠️ Basic',
                        rezi: '❌',
                        teal: '✅'
                      },
                      {
                        feature: 'Cover Letter Generator',
                        worthapply: '✅',
                        jobscan: '✅',
                        rezi: '✅',
                        teal: '✅'
                      },
                      {
                        feature: 'Chrome Extension',
                        worthapply: 'Coming Soon',
                        jobscan: '✅',
                        rezi: '❌',
                        teal: '✅'
                      }
                    ].map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium text-[#171411] whitespace-nowrap sticky left-0 bg-inherit">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-center text-sm bg-[rgba(198,138,113,0.06)] border-x-2 border-[#84523c] font-semibold">
                          {row.worthapply}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#6e665f]">
                          {row.jobscan}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#6e665f]">
                          {row.rezi}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-[#6e665f]">
                          {row.teal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#9a8f85] mb-4">
              ✅ = Full support • ⚠️ = Partial/Basic • ❌ = Not available
            </p>
            <Link 
              href="/compare" 
              className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
            >
              See Detailed Comparison
              <ArrowRight className="w-4 h-4" weight="bold" />
            </Link>
          </div>
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
                detail: 'We find exactly why and fix it for you'
              },
              {
                text: 'Want to know your real chances before applying',
                detail: 'See your fit score in seconds'
              },
              {
                text: 'Need to tailor your resume (but hate manual work)',
                detail: 'Done automatically in 10 seconds'
              },
              {
                text: 'Are tired of guessing which roles are worth your time',
                detail: 'Get a fit verdict before you touch your resume'
              },
              {
                text: 'Want data-driven insights, not guesswork',
                detail: 'See exactly what\'s working and what\'s not'
              },
              {
                text: 'Are on a job search but have limited time',
                detail: 'Automate the busywork, focus on interviews'
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
              { value: 'Fit-First', label: 'The only tool that analyzes fit before tailoring' },
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
                title: 'Analyze',
                description: 'Paste any job description. Get your fit score, matched skills, and a verdict in 10 seconds.',
              },
              {
                step: '3',
                icon: Sparkle,
                title: 'Land Interviews',
                description: 'Tailor your resume, generate cover letters, and apply with confidence. Watch the interviews roll in.',
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
                Everything you need in one workflow
              </h2>
              <p className="text-lg text-[#6e665f] leading-relaxed max-w-2xl mx-auto">
                Stop juggling multiple tools. WorthApply brings decision-making, tailoring, and tracking together.
              </p>
            </div>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Job-fit analysis',
                  description: 'Understand alignment and missing evidence before you invest time'
                },
                {
                  icon: FileMagnifyingGlass,
                  title: 'ATS review',
                  description: 'Spot keyword gaps and formatting risks that hurt screening performance'
                },
                {
                  icon: Sparkle,
                  title: 'Resume tailoring',
                  description: 'Generate role-specific edits grounded in your actual experience'
                },
                {
                  icon: ClipboardText,
                  title: 'Application tracking',
                  description: 'Keep applications and follow-ups organized so nothing slips through'
                },
                {
                  icon: ChartBar,
                  title: 'LinkedIn job discovery',
                  description: 'Surface relevant roles from LinkedIn so you can run fit analysis on the ones that matter'
                },
                {
                  icon: ShieldCheck,
                  title: 'Secure & Private',
                  description: 'Your resume data is encrypted and never shared with third parties'
                }
              ].map((feature) => (
                <FadeUp key={feature.title}>
                  <HoverCard className="h-full">
                    <div className="group p-8 rounded-3xl border border-[rgba(84,72,64,0.12)] hover:border-[rgba(198,138,113,0.28)] hover:shadow-[0_32px_72px_rgba(28,28,26,0.08)] hover:-translate-y-[5px] transition-all duration-200 h-full" style={{background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,249,244,0.8) 100%)'}}>
                      <div className="w-12 h-12 bg-[rgba(132,82,60,0.1)] rounded-xl flex items-center justify-center mb-5 group-hover:bg-secondary transition-all duration-200">
                        <feature.icon className="w-6 h-6 text-secondary group-hover:text-white transition-colors" weight="duotone" />
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
              question: "How does the job analysis work?",
              answer: "Our advanced analysis compares your resume against the job description. It scores your fit (0-100%), identifies matched skills, missing skills, and gives you a verdict on whether to apply. Think of it as having a career coach review every job for you."
            },
            {
              question: "Is my resume data private and secure?",
              answer: "Absolutely. Your resume is processed securely and never shared with third parties. We use industry-standard encryption and comply with GDPR. You can delete your data anytime from your account settings."
            },
            {
              id: "faq-difference",
              question: "What's the difference between Free and Pro?",
              answer: "Free gives you 3 job analyses per month to try the workflow. Pro ($39/mo) gives you unlimited analyses, resume tailoring, cover letters, and 10 LinkedIn job searches per month. See our pricing page for full comparison."
            },
            {
              question: "How does the LinkedIn job scraper work?",
              answer: "We analyze your resume and automatically search LinkedIn for jobs matching your skills, experience, and preferences. Pro users get 10 searches/month (300 jobs), Premium gets 20 searches/month (600 jobs)."
            },
            {
              question: "Can I cancel my Pro subscription anytime?",
              answer: "Yes! Cancel anytime from your account settings. No questions asked. Your access continues until the end of your current billing period."
            },
            {
              id: "faq-fabrication",
              question: "Will WorthApply fabricate experience on my resume?",
              answer: "No. Unlike generic resume tools, WorthApply only suggests improvements based on your actual experience. Our evidence-backed tailoring ensures every suggestion is grounded in what you've really done, just positioned more effectively for the specific role."
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
                  $39/mo, unlimited analyses. Cancel anytime. Evidence over invention.
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
        description="Fit-first job search platform. WorthApply analyzes your real fit for a role before you tailor your resume, with evidence-based suggestions tied to your actual experience."
      />

      <OrganizationSchema
        name="WorthApply"
        url="https://worthapply.com"
        logo="https://worthapply.com/logo.png"
        description="Fit-first job search platform. WorthApply analyzes your real fit for a role before you tailor your resume, with evidence-based suggestions tied to your actual experience."
        sameAs={[
          'https://twitter.com/worthapply',
          'https://linkedin.com/company/worthapply',
        ]}
      />
      
      <ProductSchema
        name="WorthApply Pro"
        description="Fit-first job search platform. Analyzes your real fit for a role before you tailor, with evidence-based suggestions tied to your actual experience."
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
