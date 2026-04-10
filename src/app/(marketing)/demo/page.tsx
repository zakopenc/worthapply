import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, CheckCircle, Warning, TrendUp, Sparkle } from '@/components/ui/phosphor-icons';
import { TrackEvent } from '@/components/analytics/TrackEvent';
import { RevealOnScroll, StaggerGroup, FadeUp, HoverCard } from '@/components/ui/motion';

export const metadata: Metadata = {
  title: 'Try Demo - See WorthApply In Action | No Signup Required',
  description: 'Experience our job fit analyzer with a live demo. See how we score your match, identify skill gaps, and provide tailored recommendations - all before creating an account.',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf8f4] to-white">
      {/* Marky P0: fire demo_started on mount */}
      <TrackEvent event="demo_started" />
      {/* Header */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#8d5b46] bg-[#c68a71]/10 border border-[#c68a71]/20 px-4 py-2 rounded-full mb-6">
              <Target size={16} weight="duotone" />
              Interactive Demo - No Signup Required
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold text-[#171411] tracking-tight leading-[1.0] mb-4">
              See WorthApply In Action
            </h1>
            <p className="text-lg text-[#6e665f] leading-relaxed mb-8">
              This is what our job fit analyzer looks like when you analyze a real job posting.
              Try it free to see your actual results.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Demo Job Analysis Result */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll delay={0.1}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-secondary to-primary px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target size={20} weight="duotone" />
                  <span className="font-semibold">Job Fit Analysis</span>
                </div>
                <div className="text-sm opacity-90">Completed in 8 seconds</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
              {/* Fit Score Card */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-6">
                  {/* Circular Score */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle cx="80" cy="80" r="70" stroke="#10b981" strokeWidth="12" fill="none"
                        strokeDasharray="439.82" strokeDashoffset="65.97" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-green-600">92%</div>
                        <div className="text-sm text-[#6e665f]">Fit Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold flex items-center gap-2">
                        <CheckCircle size={16} weight="fill" />
                        High Fit - Apply Now
                      </div>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-2">Senior Product Manager</h2>
                    <p className="text-lg text-[#6e665f] leading-relaxed mb-4">TechCorp • San Francisco, CA • $180k-$220k</p>
                    
                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-[#171411]">8/9</div>
                        <div className="text-xs text-[#6e665f]">Skills Match</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-[#171411]">5 yrs</div>
                        <div className="text-xs text-[#6e665f]">Experience</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Strong</div>
                        <div className="text-xs text-[#6e665f]">Culture Fit</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched Skills */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#171411] mb-4 flex items-center gap-2">
                  <CheckCircle size={20} weight="fill" className="text-green-600" />
                  Matched Skills (8/9)
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {['Product Strategy', 'Roadmapping', 'Agile/Scrum', 'SQL', 'Analytics', 'A/B Testing', 'Stakeholder Management', 'OKRs'].map((skill) => (
                    <div key={skill} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#171411] mb-4 flex items-center gap-2">
                  <Warning size={20} weight="fill" className="text-orange-600" />
                  Skill Gaps (1 item)
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Warning size={20} weight="fill" className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#171411] mb-1">Machine Learning Experience</div>
                      <p className="text-sm text-[#6e665f] mb-2">
                        Job requires ML/AI product experience. You have analytics background but haven&apos;t explicitly mentioned ML projects.
                      </p>
                      <div className="text-sm font-medium text-orange-700">
                        💡 Suggestion: Highlight any data science collaboration or AI feature launches in your experience section.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tailoring Recommendations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#171411] mb-4 flex items-center gap-2">
                  <TrendUp size={20} weight="duotone" className="text-blue-600" />
                  Resume Tailoring Recommendations
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Emphasize data-driven decision making',
                      detail: 'Add metrics to your product launches (e.g., "Increased user engagement by 34% through A/B tested feature rollout")'
                    },
                    {
                      title: 'Highlight cross-functional leadership',
                      detail: 'Mention team sizes and stakeholder management experience (job requires leading 15+ person squads)'
                    },
                    {
                      title: 'Add technical depth',
                      detail: 'Include SQL proficiency and analytics tool experience (Mixpanel, Amplitude, etc.) prominently'
                    }
                  ].map((rec, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="font-semibold text-[#171411] mb-1">{rec.title}</div>
                      <p className="text-sm text-[#6e665f]">{rec.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-6 text-center border-2 border-dashed border-secondary/30">
                <h3 className="text-xl font-bold text-[#171411] mb-3">
                  Want to see YOUR real fit score?
                </h3>
                <p className="text-lg text-[#6e665f] leading-relaxed mb-6">
                  Sign up free to analyze any job against your actual resume. Get personalized recommendations in seconds.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-secondary to-primary text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Sparkle size={20} weight="duotone" />
                    Analyze Your Resume Free
                    <ArrowRight size={20} weight="bold" />
                  </Link>
                  <Link 
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-[#3d362f] rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    View Pricing
                  </Link>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  ✓ No credit card required • ✓ 3 free analyses • ✓ 7-day money-back guarantee on Pro
                </p>
              </div>
            </div>
          </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Why This Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#171411] tracking-tight leading-[1.1] text-center mb-12">
            Why WorthApply Works
          </h2>
          
          <StaggerGroup className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Analyze BEFORE Applying',
                description: 'Stop wasting time on jobs you won\'t get. See your fit score first, apply to high-match roles only.',
                icon: Target
              },
              {
                title: 'Evidence-Based Tailoring',
                description: 'No keyword stuffing. We show you how to highlight YOUR real experience for each specific role.',
                icon: CheckCircle
              },
              {
                title: 'Quality Over Quantity',
                description: 'Built for people running 10-12 strong, targeted applications instead of 100+ blind ones. Fewer applications, sharper fit, less wasted effort.',
                icon: TrendUp
              }
            ].map((item, idx) => (
              <FadeUp key={idx}>
                <HoverCard className="text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon size={32} weight="duotone" className="text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-[#171411] mb-2">{item.title}</h3>
                  <p className="text-lg text-[#6e665f] leading-relaxed">{item.description}</p>
                </HoverCard>
              </FadeUp>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}
