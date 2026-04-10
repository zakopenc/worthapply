import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Target, Warning, Sparkle } from '@/components/ui/phosphor-icons';
import Breadcrumbs from '@/components/Breadcrumbs';
import { RevealOnScroll, StaggerGroup, FadeUp } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Best Teal Alternative - WorthApply | Fit-First Job Application Tool',
  description: 'Looking for a Teal alternative? WorthApply focuses on fit-first analysis and strategic applications vs all-in-one platform. Free forever plan available.',
};

export default function JobscanAlternativePage() {
  const alternativeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Best Jobscan Alternative - WorthApply",
    "description": "WorthApply is a Jobscan alternative that analyzes job fit before tailoring, with evidence-backed analysis suggestions.",
    "about": {
      "@type": "SoftwareApplication",
      "name": "WorthApply",
      "applicationCategory": "BusinessApplication"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(alternativeSchema) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumbs
            items={[
              { label: 'Alternative', href: '/alternative' },
              { label: 'Teal Alternative', href: '/alternative/teal-alternative' }
            ]}
          />
          
          {/* Hero */}
          <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8d5b46] bg-[#c68a71]/10 border border-[#c68a71]/20 px-4 py-2 rounded-full mb-6">
              <Warning className="w-4 h-4 text-[#8d5b46]" weight="fill" />
              <span>Teal Alternative</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.0] mb-4">
              The Best Teal Alternative
            </h1>
            <p className="text-lg text-[#6e665f] dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Focus on quality over quantity. Strategic fit-first workflow instead of job board aggregation—with evidence-backed analysis tailoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-container transition-all"
              >
                Try WorthApply Free
                <ArrowRight className="w-5 h-5" weight="bold" />
              </Link>
              <Link
                href="/compare/teal"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-[#171411] dark:text-gray-100 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
              >
                See Full Comparison
              </Link>
            </div>
          </div>
          </RevealOnScroll>

          {/* Why People Switch */}
          <div className="mb-16 bg-gray-50 dark:bg-gray-900 rounded-3xl p-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-8 text-center">
              Why Job Seekers Switch from Teal to WorthApply
            </h2>
            <StaggerGroup className="grid md:grid-cols-3 gap-8">
              <FadeUp>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-secondary" weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-[#171411] dark:text-gray-100 mb-2">Decision-First, Not Tracking-First</h3>
                <p className="text-[#6e665f] dark:text-gray-400">
                  Analyze job fit BEFORE adding to your tracker. Teal helps you track everything, but doesn&apos;t help you decide what&apos;s worth tracking.
                </p>
              </div>
              </FadeUp>
              <FadeUp>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkle className="w-8 h-8 text-secondary" weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-[#171411] dark:text-gray-100 mb-2">No Fabricated Experience</h3>
                <p className="text-[#6e665f] dark:text-gray-400">
                  Evidence-backed suggestions grounded in your real work. Unlike generic keyword stuffing, we help you articulate what you&apos;ve actually done.
                </p>
              </div>
              </FadeUp>
              <FadeUp>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-secondary" weight="bold" />
                </div>
                <h3 className="text-xl font-bold text-[#171411] dark:text-gray-100 mb-2">Focus on Quality</h3>
                <p className="text-[#6e665f] dark:text-gray-400">
                  Strategic workflow helps you apply to fewer, better-fit roles. Teal&apos;s job board aggregation can lead to spray-and-pray applying.
                </p>
              </div>
              </FadeUp>
            </StaggerGroup>
          </div>

          {/* What You Lose vs Gain */}
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-8 text-center">
              What You Lose and Gain by Switching
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-4 flex items-center gap-2">
                  <X className="w-6 h-6" weight="bold" />
                  What You Lose
                </h3>
                <ul className="space-y-3 text-[#3d362f] dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Job board aggregation (WorthApply doesn&apos;t scrape job boards - you find jobs, we analyze fit)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Chrome extension for one-click saves (we focus on strategic analysis over quick adds)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Career coaching content library (Teal has extensive guides and resources)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-4 flex items-center gap-2">
                  <Check className="w-6 h-6" weight="bold" />
                  What You Gain
                </h3>
                <ul className="space-y-3 text-[#3d362f] dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Job fit analysis</strong> - Know which jobs are worth your time before tailoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Evidence-backed tailoring</strong> - Suggestions grounded in your real experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Application tracking</strong> - Keep applications organized in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Strategic workflow</strong> - Quality over quantity approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Free forever</strong> - 3 analyses/month, no time limit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="mb-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 overflow-x-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-6">Side-by-Side Comparison</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-4 pr-4 font-bold text-[#171411] dark:text-gray-100">Feature</th>
                  <th className="text-center py-4 px-4 font-bold text-secondary">WorthApply</th>
                    <th className="text-center py-4 px-4 font-bold text-[#6e665f] dark:text-gray-400">Teal</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Job fit analysis</td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                  <td className="text-center py-4 px-4"><X className="w-6 h-6 text-red-400 mx-auto" weight="bold" /></td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Professional optimization</td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                  <td className="text-center py-4 px-4"><X className="w-6 h-6 text-red-400 mx-auto" weight="bold" /></td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">ATS keyword optimization</td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Application tracking</td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Job board aggregation</td>
                  <td className="text-center py-4 px-4"><X className="w-6 h-6 text-red-400 mx-auto" weight="bold" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Pricing (monthly)</td>
                  <td className="text-center py-4 px-4"><span className="text-sm font-semibold text-[#171411] dark:text-gray-100">$99</span></td>
                  <td className="text-center py-4 px-4"><span className="text-sm font-semibold text-[#171411] dark:text-gray-100">$79</span></td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Free plan</td>
                  <td className="text-center py-4 px-4"><span className="text-sm font-semibold text-green-600">Free forever</span></td>
                  <td className="text-center py-4 px-4"><span className="text-sm font-semibold text-green-600">Free forever</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Migration Guide */}
          <div className="mb-16 bg-secondary/5 border border-secondary/20 rounded-2xl p-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-6 text-center">
              How to Switch from Teal
            </h2>
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171411] dark:text-gray-100 mb-1">Sign up for WorthApply</h3>
                    <p className="text-[#6e665f] dark:text-gray-400">Start with our free forever plan - no credit card required. Get 3 job fit analyses per month.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171411] dark:text-gray-100 mb-1">Upload your resume</h3>
                    <p className="text-[#6e665f] dark:text-gray-400">Use the same resume from Teal. We&apos;ll analyze it from a fit-first perspective before you add it to your tracker.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171411] dark:text-gray-100 mb-1">Analyze job fit first</h3>
                    <p className="text-[#6e665f] dark:text-gray-400">Before spending hours tailoring, see if the role actually aligns with your experience and goals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171411] dark:text-gray-100 mb-1">Get evidence-backed tailoring</h3>
                    <p className="text-[#6e665f] dark:text-gray-400">For high-fit roles, our system suggests improvements based on your actual experience - no keyword stuffing.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#171411] dark:text-gray-100 mb-1">Track everything</h3>
                    <p className="text-[#6e665f] dark:text-gray-400">Keep all applications organized so nothing slips through the cracks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <RevealOnScroll>
          <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-2xl p-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-4">
              Ready to try a smarter approach?
            </h2>
            <p className="text-lg text-[#6e665f] dark:text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Start with free job fit analysis. See which roles are worth your time before you invest effort in tailoring.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-container transition-all"
            >
              Get started free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-[#9a8f85] dark:text-gray-400 mt-4">
              Free forever plan • No credit card required • 3 analyses/month
            </p>
          </div>
          </RevealOnScroll>
        </div>
      </div>
    </>
  );
}
