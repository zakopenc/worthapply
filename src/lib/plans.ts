// ============================================
// WorthApply Feature Gating System
// Tier: free | pro | premium | lifetime
// ============================================

export type Plan = 'free' | 'pro' | 'premium' | 'lifetime';

export interface PlanLimits {
  analyses_per_month: number | null; // null = unlimited
  tailoring_per_month: number | null;
  cover_letters_per_month: number | null;
  job_searches_per_month: number; // LinkedIn scraping searches per month
  linkedin_results_per_search: number; // number of LinkedIn jobs returned per search
  tracker_jobs: number | null;
  evidence_items: number | null;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    analyses_per_month: 3,
    tailoring_per_month: 2,
    cover_letters_per_month: 3, // verdict only
    job_searches_per_month: 0, // No LinkedIn scraping
    linkedin_results_per_search: 0,
    tracker_jobs: 8,
    evidence_items: 15,
  },
  pro: {
    analyses_per_month: null, // unlimited
    tailoring_per_month: null, // unlimited
    cover_letters_per_month: null, // unlimited
    job_searches_per_month: 10, // 10 LinkedIn searches/month
    linkedin_results_per_search: 10,
    tracker_jobs: null, // unlimited
    evidence_items: null, // unlimited
  },
  premium: {
    analyses_per_month: null, // unlimited
    tailoring_per_month: null, // unlimited
    cover_letters_per_month: null, // unlimited
    job_searches_per_month: 20, // 20 LinkedIn searches/month
    linkedin_results_per_search: 30,
    tracker_jobs: null, // unlimited
    evidence_items: null, // unlimited
  },
  lifetime: {
    analyses_per_month: null, // unlimited
    tailoring_per_month: null, // unlimited
    cover_letters_per_month: null, // unlimited
    job_searches_per_month: 20, // Same as Premium
    linkedin_results_per_search: 30,
    tracker_jobs: null, // unlimited
    evidence_items: null, // unlimited
  },
};

// Features gated by plan
export interface FeatureAccess {
  // Job Fit Analyzer
  fit_score: boolean;
  fit_grade: boolean;
  verdict: boolean;
  verdict_reason: boolean;
  matched_skills: boolean;
  missing_skills: boolean;        // PRO+
  seniority_match: boolean;       // PRO+
  recruiter_concerns: boolean;    // PRO+
  counter_arguments: boolean;     // PRO+
  reanalyze_after_tailor: boolean; // PRO+

  // Smart Tailoring
  basic_tailoring: boolean;
  skills_reorder: boolean;          // PRO+
  ats_keyword_injection: boolean;   // PRO+
  ats_format_check: boolean;        // PRO+
  natural_voice_pass: boolean;      // PRO+
  before_after_score: boolean;      // PRO+
  ats_keywords_list: boolean;       // PRO+
  docx_download: boolean;           // PRO+
  version_history: boolean;         // PRO+

  // Cover Letter
  cover_letter_verdict: boolean;
  cover_letter_generation: boolean; // PRO+
  cover_letter_editor: boolean;     // PRO+

  // LinkedIn Job Scraper
  linkedin_job_scraper: boolean;    // PRO+ (10 searches)
  linkedin_job_scraper_premium: boolean; // PREMIUM (20 searches)

  // Tracker
  ghost_flag: boolean;              // PRO+
  follow_up_alerts: boolean;        // PRO+
  interview_tracking: boolean;      // PRO+
  resume_version_per_app: boolean;  // PRO+

  // Workspace
  next_step_recommendation: boolean; // PRO+
  full_concerns_panel: boolean;      // PRO+

  // Dashboard
  interview_rate_stat: boolean;      // PRO+
  avg_fit_score_stat: boolean;       // PRO+

  // Digest
  ghost_flag_in_digest: boolean;     // PRO+
  digest_time_customization: boolean; // PRO+

  // Premium-only features
  interview_prep: boolean;           // PREMIUM+
  salary_negotiation: boolean;       // PREMIUM+
  custom_ai_training: boolean;       // PREMIUM+
  strategy_call: boolean;            // PREMIUM+

  // Support
  email_support: boolean;            // PRO+
  priority_support: boolean;         // PREMIUM+
  founding_member_badge: boolean;    // LIFETIME only
  roadmap_input: boolean;            // LIFETIME only
}

export function getFeatureAccess(plan: Plan): FeatureAccess {
  const isPaid = plan === 'pro' || plan === 'premium' || plan === 'lifetime';
  const isPremium = plan === 'premium' || plan === 'lifetime';
  const isLifetime = plan === 'lifetime';

  return {
    // Analyzer — free gets score + verdict + matched skills
    fit_score: true,
    fit_grade: true,
    verdict: true,
    verdict_reason: true,
    matched_skills: true,
    missing_skills: isPaid,
    seniority_match: isPaid,
    recruiter_concerns: isPaid,
    counter_arguments: isPaid,
    reanalyze_after_tailor: isPaid,

    // Tailoring — free gets basic (summary + top bullets)
    basic_tailoring: true,
    skills_reorder: isPaid,
    ats_keyword_injection: isPaid,
    ats_format_check: isPaid,
    natural_voice_pass: isPaid,
    before_after_score: isPaid,
    ats_keywords_list: isPaid,
    docx_download: isPaid,
    version_history: isPaid,

    // Cover Letter — free gets verdict only
    cover_letter_verdict: true,
    cover_letter_generation: isPaid,
    cover_letter_editor: isPaid,

    // LinkedIn Job Scraper
    linkedin_job_scraper: isPaid, // Pro gets 10, Premium gets 20
    linkedin_job_scraper_premium: isPremium,

    // Tracker
    ghost_flag: isPaid,
    follow_up_alerts: isPaid,
    interview_tracking: isPaid,
    resume_version_per_app: isPaid,

    // Workspace
    next_step_recommendation: isPaid,
    full_concerns_panel: isPaid,

    // Dashboard
    interview_rate_stat: isPaid,
    avg_fit_score_stat: isPaid,

    // Digest
    ghost_flag_in_digest: isPaid,
    digest_time_customization: isPaid,

    // Premium-only features
    interview_prep: isPremium,
    salary_negotiation: isPremium,
    custom_ai_training: isPremium,
    strategy_call: isPremium,

    // Support
    email_support: isPaid,
    priority_support: isPremium,
    founding_member_badge: isLifetime,
    roadmap_input: isLifetime,
  };
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function isPaidPlan(plan: Plan): boolean {
  return plan === 'pro' || plan === 'premium' || plan === 'lifetime';
}

/**
 * Returns the effective plan after checking subscription status.
 * Lifetime plans are never downgraded (no recurring subscription).
 * For subscription-based plans, only 'active' and 'trialing' are valid.
 */
export function getEffectivePlan(
  plan: Plan,
  subscriptionStatus: string | null | undefined
): Plan {
  // Free and lifetime plans don't depend on subscription status
  if (plan === 'free' || plan === 'lifetime') return plan;

  // For subscription-based plans, check status
  const validStatuses = ['active', 'trialing'];
  if (!subscriptionStatus || !validStatuses.includes(subscriptionStatus)) {
    return 'free';
  }

  return plan;
}

export function isPremiumPlan(plan: Plan): boolean {
  return plan === 'premium' || plan === 'lifetime';
}

// Plan pricing (for display and Stripe integration)
export interface PlanPricing {
  id: Plan;
  name: string;
  price: number;
  interval: 'month' | 'lifetime';
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  stripePriceId?: string; // Add your Stripe price IDs here
}

export const PLAN_PRICING: Record<Plan, PlanPricing> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for exploring',
    features: [
      '3 job analyses per month',
      '2 resume tailors per month',
      '3 cover letter verdicts',
      'Basic job tracking (8 jobs)',
      'Core fit analysis',
    ],
    cta: 'Get Started Free',
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 39,
    interval: 'month',
    description: 'For serious job seekers',
    popular: true,
    features: [
      'Unlimited job analyses',
      'Unlimited resume tailoring',
      'Unlimited cover letters',
      '10 LinkedIn job searches/month',
      'See up to 10 fresh LinkedIn jobs per search',
      'Find 300 matching jobs automatically',
      'Advanced fit scoring',
      'ATS optimization',
      'Unlimited job tracking',
      'Email support',
    ],
    cta: 'Start Pro Trial',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 79,
    interval: 'month',
    description: 'For executives & high earners',
    features: [
      'Everything in Professional',
      '20 LinkedIn job searches/month',
      'See up to 30 fresh LinkedIn jobs per search',
      'Find 600 matching jobs automatically',
      'AI interview preparation',
      'Salary negotiation guidance',
      'Custom AI training on your industry',
      '1-on-1 strategy call (monthly)',
      'Priority support',
    ],
    cta: 'Go Premium',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: 499,
    interval: 'lifetime',
    description: 'One-time payment, forever access',
    features: [
      'Everything in Premium',
      'Lifetime access (never pay again)',
      'All future features included',
      'Founding member badge',
      'Direct input on roadmap',
      'VIP support',
    ],
    cta: 'Get Lifetime Access',
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
  },
};

export function getPlanPricing(plan: Plan): PlanPricing {
  return PLAN_PRICING[plan];
}
