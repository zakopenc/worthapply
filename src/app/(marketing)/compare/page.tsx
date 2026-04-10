import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Users, TrendUp } from '@/components/ui/phosphor-icons';
import { RevealOnScroll, StaggerGroup, FadeUp, HoverCard } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Compare WorthApply - How We Stack Up Against Other Resume Tools',
  description: 'See how WorthApply compares to Jobscan, Teal, and Rezi. Fit-first workflow, evidence-backed AI, and strategic job search approach.',
};

const competitors = [
  {
    name: 'Jobscan',
    slug: 'jobscan',
    icon: Target,
    tagline: 'ATS keyword optimization',
    description: 'Popular for keyword matching and ATS scoring',
    keyDifference: 'WorthApply analyzes fit first, not just keywords',
  },
  {
    name: 'Teal',
    slug: 'teal',
    icon: Users,
    tagline: 'All-in-one career platform',
    description: 'Job tracking and resume building combined',
    keyDifference: 'WorthApply focuses on decision-making, not just tracking',
  },
  {
    name: 'Rezi',
    slug: 'rezi',
    icon: TrendUp,
    tagline: 'AI resume builder',
    description: 'Template-based resume creation',
    keyDifference: 'WorthApply tailors based on your actual experience',
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How WorthApply compares
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We believe in fit-first, evidence-backed job applications. See how our approach differs from other tools.
            </p>
          </div>
        </RevealOnScroll>

        {/* What Makes Us Different */}
        <RevealOnScroll>
          <div className="mb-16 bg-secondary/5 border border-secondary/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Our approach: Quality over quantity
            </h2>
            <StaggerGroup className="grid md:grid-cols-3 gap-8">
              <FadeUp>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-secondary" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Fit first</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Analyze alignment before investing time in tailoring
                  </p>
                </div>
              </FadeUp>
              <FadeUp>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-secondary" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Evidence-backed</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tailoring grounded in your actual experience, not fabricated
                  </p>
                </div>
              </FadeUp>
              <FadeUp>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendUp className="w-8 h-8 text-secondary" weight="duotone" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Strategic workflow</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Filter effort toward high-fit roles, not spray-and-pray
                  </p>
                </div>
              </FadeUp>
            </StaggerGroup>
          </div>
        </RevealOnScroll>

        {/* Competitor Comparisons */}
        <StaggerGroup className="grid md:grid-cols-3 gap-8 mb-16">
          {competitors.map((competitor) => (
            <FadeUp key={competitor.slug}>
              <HoverCard>
                <Link
                  href={`/compare/${competitor.slug}`}
                  className="group block bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-xl hover:border-secondary/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <competitor.icon className="w-10 h-10 text-secondary" weight="duotone" />
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all" weight="bold" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    vs {competitor.name}
                  </h3>
                  <p className="text-sm text-secondary font-medium mb-3">{competitor.tagline}</p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{competitor.description}</p>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ✓ {competitor.keyDifference}
                    </p>
                  </div>
                </Link>
              </HoverCard>
            </FadeUp>
          ))}
        </StaggerGroup>

        {/* CTA */}
        <RevealOnScroll>
          <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ready to try a smarter approach?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with a free job fit analysis. See how WorthApply&apos;s workflow helps you focus on quality applications.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-container transition-all"
            >
              Get started free
              <ArrowRight className="w-5 h-5" weight="bold" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
