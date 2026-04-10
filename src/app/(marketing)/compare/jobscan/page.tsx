import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Target, Sparkle } from '@/components/ui/phosphor-icons';
import Breadcrumbs from '@/components/Breadcrumbs';
import { RevealOnScroll, StaggerGroup, FadeUp } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'WorthApply vs Jobscan - Which Resume Tool is Right for You?',
  description: 'Compare WorthApply and Jobscan for Professional resume optimization, ATS checking, and job application tracking. See features, pricing, and key differences.',
};

export default function CompareJobscanPage() {
  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "WorthApply vs Jobscan Comparison",
    "description": "Compare WorthApply and Jobscan for Professional resume optimization, ATS checking, and job application tracking. See features, pricing, and key differences.",
    "about": {
      "@type": "Thing",
      "name": "Resume optimization software comparison"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://worthapply.com/og-compare-jobscan.png"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Breadcrumbs
          items={[
            { label: 'Compare', href: '/compare' },
            { label: 'WorthApply vs Jobscan', href: '/compare/jobscan' }
          ]}
        />
        
        {/* Hero */}
        <RevealOnScroll>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="px-4 py-2 bg-secondary/10 rounded-full">
              <span className="text-sm font-semibold text-secondary">WorthApply</span>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <span className="text-sm font-semibold text-[#3d362f] dark:text-gray-300">Jobscan</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.0] mb-4">
            WorthApply vs Jobscan
          </h1>
          <p className="text-lg text-[#6e665f] dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Fit-first workflow vs keyword optimization: Which approach helps you land better jobs faster?
          </p>
        </div>
        </RevealOnScroll>

        {/* Quick Summary */}
        <StaggerGroup className="grid md:grid-cols-2 gap-8 mb-16">
          <FadeUp><div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-secondary" weight="duotone" />
              <h2 className="text-2xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1]">WorthApply</h2>
            </div>
            <p className="text-[#3d362f] dark:text-gray-300 mb-4">
              <strong>Best for:</strong> Job seekers who want to evaluate fit before investing time in tailoring, and need evidence-backed resume improvements.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" weight="bold" />
                <span className="text-sm text-[#3d362f] dark:text-gray-300">Analyze job fit first</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" weight="bold" />
                <span className="text-sm text-[#3d362f] dark:text-gray-300">Evidence-backed tailoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-secondary flex-shrink-0" weight="bold" />
                <span className="text-sm text-[#3d362f] dark:text-gray-300">Decision-first workflow</span>
              </div>
            </div>
          </div></FadeUp>

          <FadeUp><div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkle className="w-6 h-6 text-[#6e665f] dark:text-gray-400" weight="duotone" />
              <h2 className="text-2xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1]">Jobscan</h2>
            </div>
            <p className="text-[#3d362f] dark:text-gray-300 mb-4">
              <strong>Best for:</strong> Applicants who already know which jobs to apply to and want keyword matching and ATS score optimization.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#6e665f] dark:text-gray-400 flex-shrink-0" weight="bold" />
                <span className="text-sm text-[#3d362f] dark:text-gray-300">ATS keyword matching</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#6e665f] dark:text-gray-400 flex-shrink-0" weight="bold" />
                <span className="text-sm text-[#3d362f] dark:text-gray-300">Resume scanning</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#6e665f] dark:text-gray-400 flex-shrink-0" weight="bold" />
                <span className="text-sm text-[#3d362f] dark:text-gray-300">Large template library</span>
              </div>
            </div>
          </div></FadeUp>
        </StaggerGroup>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-16 overflow-x-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-6">Feature Comparison</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-4 pr-4 font-bold text-[#171411] dark:text-gray-100">Feature</th>
                <th className="text-center py-4 px-4 font-bold text-secondary">WorthApply</th>
                <th className="text-center py-4 px-4 font-bold text-[#6e665f] dark:text-gray-400">Jobscan</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-900">
                <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Job fit analysis</td>
                <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                <td className="text-center py-4 px-4"><X className="w-6 h-6 text-red-400 mx-auto" weight="bold" /></td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-900">
                <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Evidence-backed tailoring</td>
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
                <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Cover letter generation</td>
                <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-900">
                <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">LinkedIn optimization</td>
                <td className="text-center py-4 px-4"><X className="w-6 h-6 text-red-400 mx-auto" weight="bold" /></td>
                <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-[#3d362f] dark:text-gray-300">Free forever plan</td>
                <td className="text-center py-4 px-4"><Check className="w-6 h-6 text-green-600 mx-auto" weight="bold" /></td>
                <td className="text-center py-4 px-4"><span className="text-sm text-[#9a8f85] dark:text-gray-400">Limited trial</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-6 text-center">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-secondary rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#171411] dark:text-gray-100 mb-2">WorthApply Pro</h3>
              <div className="text-4xl font-bold text-[#171411] dark:text-gray-100 mb-1">$99<span className="text-xl text-[#9a8f85] dark:text-gray-400">/mo</span></div>
              <p className="text-sm text-[#6e665f] dark:text-gray-400 mb-4">Unlimited analyses and tailoring</p>
              <p className="text-sm text-[#3d362f] dark:text-gray-300 mb-4">Free plan: 3 analyses/month</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-[#171411] dark:text-gray-100 mb-2">Jobscan</h3>
              <div className="text-4xl font-bold text-[#171411] dark:text-gray-100 mb-1">$49<span className="text-xl text-[#9a8f85] dark:text-gray-400">/mo</span></div>
              <p className="text-sm text-[#6e665f] dark:text-gray-400 mb-4">Unlimited scans</p>
              <p className="text-sm text-[#3d362f] dark:text-gray-300 mb-4">7-day free trial</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <RevealOnScroll>
        <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-2xl p-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] dark:text-gray-100 tracking-tight leading-[1.1] mb-4">
            Ready to try a fit-first approach?
          </h2>
          <p className="text-lg text-[#6e665f] dark:text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            Start with a free job fit analysis. No credit card required.
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
    </>
  );
}
