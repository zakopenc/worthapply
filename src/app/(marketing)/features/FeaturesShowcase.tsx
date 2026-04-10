'use client';

import { motion } from 'framer-motion';
import { Target, Sparkle, ClipboardText, Scan, SealCheck, Icon } from '@phosphor-icons/react';
import { FitAnalysisMockup } from './mockups/FitAnalysisMockup';
import { TailoringMockup } from './mockups/TailoringMockup';
import { TrackerMockup } from './mockups/TrackerMockup';
import { ATSCheckerMockup } from './mockups/ATSCheckerMockup';
import { CoverLetterMockup } from './mockups/CoverLetterMockup';

interface ShowcaseFeature {
  icon: Icon;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  mockup: React.ComponentType;
}

const showcaseFeatures: ShowcaseFeature[] = [
  {
    icon: Target,
    title: 'Job Fit Analysis',
    subtitle: 'Know before you apply',
    description:
      'Get an instant match score with detailed skill alignment, experience gaps, and keyword coverage. Make informed decisions before investing time.',
    bullets: [
      'Instant fit verdict in under 10 seconds',
      'Requirement-level alignment breakdown',
      'Missing skills and evidence gaps identified',
    ],
    mockup: FitAnalysisMockup,
  },
  {
    icon: Sparkle,
    title: 'Evidence-Based Tailoring',
    subtitle: 'Grounded in your real experience',
    description:
      'Transform generic resumes into targeted applications. See before/after comparisons with quantified score improvements.',
    bullets: [
      'Smart suggestions grounded in your experience',
      'Natural voice preservation — no robotic rewrites',
      'Before/after score comparison',
    ],
    mockup: TailoringMockup,
  },
  {
    icon: ClipboardText,
    title: 'Application Tracking',
    subtitle: 'Never lose a strong lead',
    description:
      'Keep every application organized with status tracking, match scores, and follow-up reminders in one clean dashboard.',
    bullets: [
      'Visual dashboard with key pipeline metrics',
      'Stage tracking from Applied to Offer',
      'Match scores and dates at a glance',
    ],
    mockup: TrackerMockup,
  },
  {
    icon: Scan,
    title: 'ATS Compatibility Check',
    subtitle: 'See what the robots see',
    description:
      'Understand exactly how Applicant Tracking Systems will parse your resume. Get actionable recommendations to improve readability and keyword coverage.',
    bullets: [
      'ATS score with detailed breakdown',
      'Parsing and formatting issues highlighted',
      'Keyword optimization suggestions',
    ],
    mockup: ATSCheckerMockup,
  },
  {
    icon: Sparkle,
    title: 'Cover Letter Generator',
    subtitle: 'Contextual, not cookie-cutter',
    description:
      'Generate cover letters that reference your specific experience and job requirements. Every claim backed by evidence from your resume.',
    bullets: [
      'Contextual content from your job analysis',
      'Evidence from your resume integrated',
      'One-click copy to clipboard',
    ],
    mockup: CoverLetterMockup,
  },
];

export function FeaturesShowcase() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-20"
      >
        <span className="inline-flex px-4 py-2 rounded-full bg-[#c68a71]/10 border border-[#c68a71]/20 text-[#8d5b46] text-xs font-bold uppercase tracking-wider">
          See it in action
        </span>
        <h2 className="mt-5 text-4xl lg:text-5xl font-extrabold text-[#171411] tracking-tight leading-[1.05]">
          Every feature, built to perform
        </h2>
        <p className="mt-4 text-lg text-[#6e665f] leading-relaxed">
          Interactive previews of how WorthApply works — from fit analysis to final application
        </p>
      </motion.div>

      {/* Feature showcase items */}
      <div className="space-y-28 lg:space-y-36">
        {showcaseFeatures.map((feature, index) => {
          const isReversed = index % 2 !== 0;
          const Mockup = feature.mockup;
          return (
            <div
              key={feature.title}
              className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
            >
              {/* Mockup */}
              <div className="w-full lg:w-[55%] flex-shrink-0">
                <Mockup />
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full lg:w-[45%]"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-[#c68a71]/10 rounded-2xl flex items-center justify-center mb-5">
                  <feature.icon size={28} weight="duotone" className="text-[#c68a71]" />
                </div>

                {/* Subtitle */}
                <span className="text-xs font-bold uppercase tracking-wider text-[#c68a71] mb-2 block">
                  {feature.subtitle}
                </span>

                {/* Title */}
                <h3 className="text-3xl lg:text-[2.5rem] font-extrabold text-[#171411] tracking-tight leading-[1.1] mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base lg:text-lg text-[#6e665f] leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-3">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <SealCheck size={18} weight="fill" className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm lg:text-[15px] text-[#3d362f] leading-snug font-medium">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
