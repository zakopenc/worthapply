import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, X, ArrowRight } from '@/components/ui/phosphor-icons';
import PricingCard from '@/components/marketing/PricingCard';
import { RevealOnScroll, StaggerGroup, FadeUp } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Pricing — Know Your Fit Before You Apply',
  description: 'Simple, transparent pricing. Free plan available. Pro at $39/mo includes unlimited analyses, gap breakdown, Outreach Copilot, and ATS optimization. 7-day money-back guarantee.',
  alternates: { canonical: 'https://www.worthapply.com/pricing' },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf8f4] to-white">
      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <RevealOnScroll>
            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] tracking-tight leading-[1.0] mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-[#6e665f] leading-relaxed mb-8">
              Start free, upgrade when you need more. Cancel anytime.
            </p>

            {/* Money-Back Guarantee Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-200 rounded-full text-green-800 font-semibold mb-12">
              <CheckCircle size={20} weight="fill" />
              7-Day Money-Back Guarantee on All Paid Plans
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <StaggerGroup className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <FadeUp>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#e8e2db] p-8">
              <h3 className="text-2xl font-extrabold text-[#171411] mb-2">Free</h3>
              <p className="text-[#6e665f] mb-6">Perfect for trying out WorthApply</p>
              
              <div className="mb-8">
                <div className="text-5xl font-extrabold text-[#171411]">$0</div>
                <div className="text-[#6e665f]">forever</div>
              </div>

              <Link
                href="/signup"
                className="block w-full py-4 px-6 bg-gray-100 text-[#171411] text-center rounded-xl font-semibold hover:bg-gray-200 transition-colors mb-8"
              >
                Get Started Free
              </Link>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[#3d362f]">1 full job analysis per month</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[#3d362f]">Fit score + Apply/Skip decision</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[#3d362f]">Matched strengths</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[#3d362f]">2 resume tailors + 3 cover letter verdicts</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="fill" className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-[#3d362f]">Track up to 8 applications</span>
                </div>
                <div className="flex items-start gap-3">
                  <X size={20} weight="bold" className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Gap breakdown + what to fix</span>
                </div>
                <div className="flex items-start gap-3">
                  <X size={20} weight="bold" className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Outreach Copilot</span>
                </div>
              </div>
            </div>
            </FadeUp>

            {/* Pro Plan */}
            <FadeUp>
              <PricingCard
                name="Professional"
                description="For serious job seekers"
                price={39}
                priceId={process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!}
                plan="pro"
                popular={true}
                features={[
                  'Unlimited job analyses',
                  'Full gap breakdown + what to fix',
                  'Apply/Skip decision with reasoning',
                  'Outreach Copilot — recruiter & referral messages',
                  'Unlimited resume tailoring + ATS optimization',
                  'Unlimited cover letters',
                  '10 LinkedIn job searches/month',
                  'Unlimited tracking + email support',
                ]}
              />
            </FadeUp>

            {/* Premium Plan */}
            <FadeUp>
              <PricingCard
                name="Premium"
                description="For executives & high earners"
                price={79}
                priceId={process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!}
                plan="premium"
                popular={false}
                features={[
                  'Everything in Professional',
                  'Interview Prep Copilot — stage-specific questions + STAR answer outlines',
                  'Evidence Vault — AI extracts your story bank from your resume',
                  '30 LinkedIn job searches/month (up to 30 results each)',
                  'Offer Evaluation — 4-year comp projections + negotiation scripts',
                  'Priority support',
                ]}
              />
            </FadeUp>
          </StaggerGroup>
        </div>
      </section>

      {/* Full Feature Comparison Table */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#171411] tracking-tight text-center mb-10">
              Full Feature Comparison
            </h2>
          </RevealOnScroll>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 pr-4 text-[#6e665f] font-semibold w-1/2">Feature</th>
                  <th className="text-center py-4 px-3 font-bold text-[#171411]">Free</th>
                  <th className="text-center py-4 px-3 font-bold text-secondary">Pro</th>
                  <th className="text-center py-4 px-3 font-bold text-purple-700">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { section: 'Analysis' },
                  { feature: 'Job analyses per month', free: '1', pro: 'Unlimited', premium: 'Unlimited' },
                  { feature: 'Fit score (0–100)', free: '✓', pro: '✓', premium: '✓' },
                  { feature: 'Apply/Skip decision', free: '✓', pro: '✓', premium: '✓' },
                  { feature: 'Decision reasoning + what to fix', free: '—', pro: '✓', premium: '✓' },
                  { feature: '7-dimension scoring', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'Gap breakdown + unsupported must-haves', free: '—', pro: '✓', premium: '✓' },

                  { section: 'Resume & Applications' },
                  { feature: 'Resume tailors per month', free: '2', pro: 'Unlimited', premium: 'Unlimited' },
                  { feature: 'ATS keyword alignment', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'Cover letter verdicts per month', free: '3', pro: 'Unlimited', premium: 'Unlimited' },
                  { feature: 'Cover letter generation + editor', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'Application tracking', free: '8 apps', pro: 'Unlimited', premium: 'Unlimited' },

                  { section: 'Outreach & Discovery' },
                  { feature: 'Outreach Copilot (recruiter + referral)', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'LinkedIn job searches/month', free: '—', pro: '10', premium: '30' },
                  { feature: 'LinkedIn results per search', free: '—', pro: '10', premium: '30' },

                  { section: 'Interview & Offers' },
                  { feature: 'Interview Prep Copilot', free: '—', pro: '—', premium: '✓' },
                  { feature: 'Evidence Vault (story bank)', free: '—', pro: '—', premium: '✓' },
                  { feature: 'Offer Evaluation', free: '—', pro: '—', premium: '✓' },
                  { feature: 'Salary Negotiation Copilot', free: '—', pro: '—', premium: '✓' },

                  { section: 'Support' },
                  { feature: 'Email support', free: '—', pro: '✓', premium: '✓' },
                  { feature: 'Priority support', free: '—', pro: '—', premium: '✓' },
                ].map((row, idx) => {
                  if ('section' in row) {
                    return (
                      <tr key={idx}>
                        <td colSpan={4} className="pt-6 pb-2 text-xs font-black uppercase tracking-widest text-[#9a8f85]">
                          {row.section}
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 pr-4 text-[#3d362f]">{row.feature}</td>
                      <td className="py-3 px-3 text-center text-[#6e665f]">{row.free}</td>
                      <td className="py-3 px-3 text-center font-semibold text-secondary">{row.pro}</td>
                      <td className="py-3 px-3 text-center font-semibold text-purple-700">{row.premium}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <RevealOnScroll>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] text-center mb-12">
              Frequently Asked Questions
            </h2>
          </RevealOnScroll>

          <div className="space-y-6">
            <RevealOnScroll delay={0 * 0.05}>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-[#171411] mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-[#6e665f]">
                  Yes! Cancel anytime from your account settings. No questions asked. Your access continues until the end of your current billing period.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={1 * 0.05}>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-[#171411] mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-[#6e665f]">
                  We accept all major credit cards (Visa, MasterCard, American Express, Discover) via Stripe, our secure payment processor.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={2 * 0.05}>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-[#171411] mb-2">
                  How does the 7-day money-back guarantee work?
                </h3>
                <p className="text-[#6e665f]">
                  If you&apos;re not satisfied with WorthApply within 7 days of your purchase, contact support and we&apos;ll issue a full refund. No questions asked.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={3 * 0.05}>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-[#171411] mb-2">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-[#6e665f]">
                  Yes! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and we&apos;ll pro-rate your billing.
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={4 * 0.05}>
              <div className="pb-6">
                <h3 className="text-lg font-bold text-[#171411] mb-2">
                  Is my payment information secure?
                </h3>
                <p className="text-[#6e665f]">
                  Absolutely. We use Stripe for payment processing, which is PCI-DSS compliant and trusted by millions of businesses worldwide. We never store your credit card information.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-on-background to-primary-container text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <RevealOnScroll>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Ready to know before you apply?
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-10">
              Start free today. No credit card required.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#171411] rounded-xl font-semibold text-lg hover:bg-[#fbf8f4] transition-all duration-200 hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight size={20} weight="bold" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
