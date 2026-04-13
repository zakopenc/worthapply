/**
 * ComparisonPage — reusable template for /compare/[competitor] landing pages.
 *
 * Built to Marky's P1 spec:
 *  - Consistent WorthApply pricing everywhere ($39/mo Pro — single source of truth)
 *  - Strong Fit-First positioning above the fold
 *  - Honest "When to choose them instead" section (builds credibility)
 *  - Deep feature comparison with contextual hints, not just ✓/✗
 *  - FAQ section with FAQPage JSON-LD schema for SEO hijack
 *  - Strong dual CTA (demo + signup)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X, ArrowRight, Target, Sparkles, Minus } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

// WorthApply Pro pricing — single source of truth. Keep in sync with /pricing.
export const WORTHAPPLY_PRICE = '$39';
export const WORTHAPPLY_FREE_ALLOWANCE = '3 analyses/month on the free plan';

export type FeatureCell =
  | { kind: 'yes'; note?: string }
  | { kind: 'no'; note?: string }
  | { kind: 'partial'; note: string }
  | { kind: 'text'; value: string };

export interface ComparisonFeatureRow {
  label: string;
  worthapply: FeatureCell;
  competitor: FeatureCell;
}

export interface ComparisonFAQ {
  question: string;
  answer: string;
}

export interface ComparisonPageData {
  /** Competitor display name, e.g. "Jobscan" */
  competitorName: string;
  /** URL slug, e.g. "jobscan" */
  competitorSlug: string;
  /** Competitor's monthly price as a display string, e.g. "$49.95" */
  competitorPrice: string;
  /** Short label for the competitor's pricing plan, e.g. "Jobscan Premium" */
  competitorPlanLabel: string;
  /** What the competitor's free/trial offer is, e.g. "7-day free trial" or "Free plan available" */
  competitorFreeLabel: string;
  /** One-sentence category label for the competitor, e.g. "ATS keyword optimization" */
  competitorCategory: string;
  /** Hero subtitle — the wedge in one sentence */
  heroSubtitle: string;
  /** TL;DR best-for sentences */
  worthApplyBestFor: string;
  competitorBestFor: string;
  /** The "core difference" explanation (2 paragraphs) */
  coreDifferenceWorthApply: string;
  coreDifferenceCompetitor: string;
  /** Honest "when to choose them" section — build trust by being fair */
  whenToChooseCompetitor: string[];
  /** Honest "when to choose WorthApply" */
  whenToChooseWorthApply: string[];
  /** Feature comparison rows (10 recommended) */
  features: ComparisonFeatureRow[];
  /** FAQ entries (4–6 recommended) */
  faqs: ComparisonFAQ[];
  /** Metadata overrides */
  metaTitle: string;
  metaDescription: string;
}

export function buildComparisonMetadata(data: ComparisonPageData): Metadata {
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `https://worthapply.com/compare/${data.competitorSlug}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `https://worthapply.com/compare/${data.competitorSlug}`,
      type: 'article',
    },
  };
}

function renderCell(cell: FeatureCell, isWorthApply: boolean) {
  const checkColor = isWorthApply ? 'text-secondary' : 'text-green-600';
  const xColor = 'text-red-400';

  switch (cell.kind) {
    case 'yes':
      return (
        <div className="flex flex-col items-center gap-1">
          <Check className={`w-5 h-5 ${checkColor}`} />
          {cell.note && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{cell.note}</span>
          )}
        </div>
      );
    case 'no':
      return (
        <div className="flex flex-col items-center gap-1">
          <X className={`w-5 h-5 ${xColor}`} />
          {cell.note && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{cell.note}</span>
          )}
        </div>
      );
    case 'partial':
      return (
        <div className="flex flex-col items-center gap-1">
          <Minus className="w-5 h-5 text-yellow-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{cell.note}</span>
        </div>
      );
    case 'text':
      return (
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{cell.value}</span>
      );
  }
}

export default function ComparisonPage({ data }: { data: ComparisonPageData }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `WorthApply vs ${data.competitorName}`,
    description: data.metaDescription,
    about: {
      '@type': 'Thing',
      name: 'Fit-first job search vs keyword-match resume tools',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs
            items={[
              { label: 'Compare', href: '/compare' },
              {
                label: `WorthApply vs ${data.competitorName}`,
                href: `/compare/${data.competitorSlug}`,
              },
            ]}
          />

          {/* Hero */}
          <div className="text-center mb-16 mt-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-secondary/10 rounded-full">
                <span className="text-sm font-semibold text-secondary">WorthApply</span>
              </div>
              <span className="text-gray-400">vs</span>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {data.competitorName}
                </span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
              WorthApply vs {data.competitorName}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {data.heroSubtitle}
            </p>
          </div>

          {/* Quick verdict / Best for */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="bg-secondary/5 border-2 border-secondary/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Choose WorthApply
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {data.worthApplyBestFor}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Choose {data.competitorName}
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {data.competitorBestFor}
              </p>
            </div>
          </div>

          {/* Core Difference */}
          <div className="mb-16 bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/20 rounded-3xl p-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
              The fundamental difference
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  WorthApply is built around a verdict
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data.coreDifferenceWorthApply}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {data.competitorName} is built around {data.competitorCategory.toLowerCase()}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data.coreDifferenceCompetitor}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              Feature comparison
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              Based on public pricing and features. Updated {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}.
            </p>
            <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left py-4 px-6 font-bold text-gray-900 dark:text-gray-100">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-secondary min-w-[140px]">
                      WorthApply
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-gray-600 dark:text-gray-400 min-w-[140px]">
                      {data.competitorName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.features.map((row, idx) => (
                    <tr
                      key={row.label}
                      className={
                        idx !== data.features.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-900'
                          : ''
                      }
                    >
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300 font-medium">
                        {row.label}
                      </td>
                      <td className="text-center py-4 px-6">{renderCell(row.worthapply, true)}</td>
                      <td className="text-center py-4 px-6">
                        {renderCell(row.competitor, false)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Comparison — HONEST */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
              Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-secondary rounded-2xl p-8 bg-secondary/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    WorthApply Pro
                  </h3>
                  <span className="px-2 py-1 text-xs font-semibold text-secondary bg-secondary/10 rounded-full">
                    Most popular
                  </span>
                </div>
                <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {WORTHAPPLY_PRICE}
                  <span className="text-xl text-gray-500 dark:text-gray-400 font-normal">/mo</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Unlimited fit analyses, evidence-based tailoring, cover letters, and application
                  tracking.
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>Free forever plan: {WORTHAPPLY_FREE_ALLOWANCE}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>7-day money-back guarantee</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <span>No credit card required for free plan</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {data.competitorPlanLabel}
                </h3>
                <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {data.competitorPrice}
                  <span className="text-xl text-gray-500 dark:text-gray-400 font-normal">/mo</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  {data.competitorCategory}.
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{data.competitorFreeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
              {data.competitorName} pricing reflects publicly listed plans at time of writing and
              may vary by region or promotion.
            </p>
          </div>

          {/* When to choose WorthApply / Competitor — honest */}
          <div className="mb-16 grid md:grid-cols-2 gap-6">
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                WorthApply is the better pick when you...
              </h3>
              <ul className="space-y-3">
                {data.whenToChooseWorthApply.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {data.competitorName} might be the better pick when you...
              </h3>
              <ul className="space-y-3">
                {data.whenToChooseCompetitor.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-6 italic">
                We&apos;d rather help you pick the right tool than convert a bad-fit customer. If
                {` ${data.competitorName} `}matches your workflow better, go with it.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center">
              Frequently asked
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {data.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
                >
                  <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/80 transition-colors">
                    <span>{faq.question}</span>
                    <span className="text-secondary transition-transform group-open:rotate-45 text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/5 border border-secondary/20 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Run your first fit analysis free
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Paste a job description, upload your resume, and get an honest read on whether the
              role is worth your time &mdash; before you spend hours tailoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary text-gray-900 dark:text-gray-100 rounded-xl font-semibold text-lg hover:bg-primary hover:text-white transition-all"
              >
                Try the demo (no signup)
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-primary-container transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                Get started free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-6">
              No credit card required &middot; 7-day money-back guarantee on all paid plans
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
