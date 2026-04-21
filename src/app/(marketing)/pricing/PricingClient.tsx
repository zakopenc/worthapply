'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  SealCheck,
  CheckCircle,
  CaretDown,
  ShieldCheck,
  Sparkle,
  Crown,
} from '@phosphor-icons/react';
import UsageIndicator from '@/components/marketing/UsageIndicator';
import styles from './pricing.module.css';

type CellValue = string | boolean;
type BillingInterval = 'monthly' | 'annual' | 'lifetime';
type CheckoutPlan = 'pro_monthly' | 'pro_annual' | 'premium_monthly' | 'premium_annual' | 'lifetime';

interface PricingClientProps {
  priceIds: {
    proMonthly: string;
    proAnnual: string;
    premiumMonthly: string;
    premiumAnnual: string;
    lifetime: string;
  };
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    subtitle: 'Perfect for exploring the workflow',
    cta: 'Start for free',
    features: [
      '3 job analyses per month',
      '2 resume tailorings per month',
      '3 cover letter verdicts',
      'Basic ATS review',
      '8 tracked applications',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    monthlyPrice: '$39',
    annualPrice: '$32',
    annualNote: 'Billed $384 yearly',
    subtitle: 'For serious job seekers',
    popular: true,
    cta: 'Start Pro Trial',
    features: [
      'Unlimited job analyses',
      'Unlimited resume tailoring',
      'Unlimited cover letters',
      '10 LinkedIn job searches/month',
      'Find 300 matching jobs automatically',
      'Advanced fit scoring',
      'ATS optimization',
      'Unlimited job tracking',
      'Email support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: '$79',
    annualPrice: '$65',
    annualNote: 'Billed $780 yearly',
    subtitle: 'For executives & high earners',
    cta: 'Go Premium',
    features: [
      'Everything in Professional',
      '20 LinkedIn job searches/month',
      'Find 600 matching jobs automatically',
      'AI interview preparation',
      'Salary negotiation guidance',
      'Custom AI training on your industry',
      '1-on-1 strategy call (monthly)',
      'Priority support',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$499',
    subtitle: 'One payment, forever access',
    cta: 'Get Lifetime Access',
    features: [
      'Everything in Premium',
      'Lifetime access (never pay again)',
      'All future features included',
      'Founding member badge',
      'Direct input on roadmap',
      'VIP support',
    ],
  },
];

const comparison = [
  {
    section: 'Core workflow',
    rows: [
      { feature: 'Job analyses per month', free: '3/month', pro: 'Unlimited', premium: 'Unlimited', lifetime: 'Unlimited' },
      { feature: 'Resume tailorings per month', free: '2/month', pro: 'Unlimited', premium: 'Unlimited', lifetime: 'Unlimited' },
      { feature: 'Cover letters per month', free: '3 verdicts', pro: 'Unlimited', premium: 'Unlimited', lifetime: 'Unlimited' },
      { feature: 'LinkedIn job searches/month', free: '0', pro: '10 searches', premium: '20 searches', lifetime: '20 searches' },
      { feature: 'Tracked applications', free: '8 jobs', pro: 'Unlimited', premium: 'Unlimited', lifetime: 'Unlimited' },
    ],
  },
  {
    section: 'Advanced Features',
    rows: [
      { feature: 'Basic fit analysis', free: true, pro: true, premium: true, lifetime: true },
      { feature: 'Missing skills analysis', free: false, pro: true, premium: true, lifetime: true },
      { feature: 'ATS optimization', free: false, pro: true, premium: true, lifetime: true },
      { feature: 'Before/after score comparison', free: false, pro: true, premium: true, lifetime: true },
      { feature: 'Natural Voice Pass', free: false, pro: true, premium: true, lifetime: true },
      { feature: 'Expert interview preparation', free: false, pro: false, premium: true, lifetime: true },
      { feature: 'Salary negotiation guidance', free: false, pro: false, premium: true, lifetime: true },
      { feature: 'Custom industry training', free: false, pro: false, premium: true, lifetime: true },
    ],
  },
  {
    section: 'Support and extras',
    rows: [
      { feature: 'Email support', free: false, pro: true, premium: true, lifetime: true },
      { feature: 'Priority support', free: false, pro: false, premium: true, lifetime: true },
      { feature: 'Monthly strategy call', free: false, pro: false, premium: true, lifetime: true },
      { feature: 'Founding member badge', free: false, pro: false, premium: false, lifetime: true },
      { feature: 'Direct roadmap input', free: false, pro: false, premium: false, lifetime: true },
    ],
  },
];

const faqs = [
  {
    q: 'How does the free trial work?',
    a: 'When you start Pro or Premium, you get full access to all features for 7 days. If you do not continue, your account remains on the free plan.',
  },
  {
    q: 'What\'s the difference between Pro and Premium?',
    a: 'Pro gives you unlimited analyses, tailoring, and cover letters plus 10 LinkedIn job searches per month. Premium doubles your job searches to 20/month and adds interview prep, salary negotiation, custom industry training, and monthly 1-on-1 strategy calls.',
  },
  {
    q: 'How does LinkedIn job scraping work?',
    a: 'We analyze your resume and automatically search LinkedIn for jobs matching your skills, experience level, and preferences. Pro users get 10 searches per month (300 jobs), Premium gets 20 searches (600 jobs). Each search finds up to 30 perfectly matched jobs.',
  },
  {
    q: 'Can I upgrade from Pro to Premium later?',
    a: 'Yes! You can upgrade or downgrade anytime from your account settings. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Who should choose Lifetime?',
    a: 'Lifetime is best for career-oriented professionals who will use WorthApply across multiple job searches over the years. It includes everything in Premium forever, plus founding member benefits.',
  },
  {
    q: 'What if I run out of LinkedIn searches?',
    a: 'Your monthly search limit resets on the 1st of each month. If you need more searches mid-month, you can upgrade to Premium for double the searches.',
  },
];

export default function PricingClient({ priceIds }: PricingClientProps) {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<BillingInterval | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [billingPulse, setBillingPulse] = useState(false);

  const proPrice = useMemo(() => (annual ? plans[1].annualPrice : plans[1].monthlyPrice), [annual]);
  const premiumPrice = useMemo(() => (annual ? plans[2].annualPrice : plans[2].monthlyPrice), [annual]);
  const proBilling = annual ? 'Billed yearly' : 'Billed monthly';
  const premiumBilling = annual ? 'Billed yearly' : 'Billed monthly';

  useEffect(() => {
    setBillingPulse(true);
    const timeout = window.setTimeout(() => setBillingPulse(false), 520);
    return () => window.clearTimeout(timeout);
  }, [annual]);

  const handleCheckout = async (plan: 'pro' | 'premium', interval: 'monthly' | 'annual') => {
    const billingInterval: BillingInterval = interval;
    setLoading(billingInterval);
    try {
      const payloadMap: Record<string, { priceId: string; plan: CheckoutPlan }> = {
        'pro-monthly': { priceId: priceIds.proMonthly, plan: 'pro_monthly' },
        'pro-annual': { priceId: priceIds.proAnnual, plan: 'pro_annual' },
        'premium-monthly': { priceId: priceIds.premiumMonthly, plan: 'premium_monthly' },
        'premium-annual': { priceId: priceIds.premiumAnnual, plan: 'premium_annual' },
      };
      const payload = payloadMap[`${plan}-${interval}`];

      if (!payload.priceId) {
        throw new Error('Pricing is not configured right now.');
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error?.includes('Unauthorized')) window.location.href = '/signup?redirect=/pricing';
      else alert(data.error || 'Something went wrong');
    } catch {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleLifetimeCheckout = async () => {
    setLoading('lifetime');
    try {
      if (!priceIds.lifetime) {
        throw new Error('Lifetime pricing is not configured.');
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: priceIds.lifetime, plan: 'lifetime' }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (data.error?.includes('Unauthorized')) window.location.href = '/signup?redirect=/pricing';
      else alert(data.error || 'Something went wrong');
    } catch {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Pricing</span>
          <h1>Start free. Upgrade when landing your dream job matters.</h1>
          <p>
            Try the workflow with no commitment, unlock unlimited professional job hunting with Pro,
            or get Premium for executive-level career acceleration.
          </p>

          <div className={styles.billingToggle}>
            <span className={!annual ? styles.toggleActive : ''}>Monthly</span>
            <button
              type="button"
              className={`${styles.toggleButton} ${annual ? styles.toggleOn : ''}`}
              onClick={() => setAnnual((value) => !value)}
              aria-label="Toggle annual pricing"
              aria-pressed={annual}
            >
              <span className={`${styles.toggleKnob} ${annual ? styles.toggleKnobOn : ''}`} />
            </button>
            <span className={annual ? styles.toggleActive : ''}>Annual</span>
            <span className={`${styles.savePill} ${billingPulse ? styles.savePillPulse : ''}`}>Save 18%</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.planGrid}>
            {/* Free Plan */}
            <article className={`${styles.planCard} ${styles.planCardAnimated}`} style={{ animationDelay: '40ms' }}>
              <div>
                <span className={styles.planName}>{plans[0].name}</span>
                <div className={styles.priceRow}>
                  <strong>{plans[0].price}</strong>
                  <span>forever</span>
                </div>
                <p>{plans[0].subtitle}</p>
              </div>
              <div className={styles.featureList}>
                {plans[0].features.map((feature) => (
                  <Feature key={feature} text={feature} />
                ))}
              </div>
              <Link href="/signup" className={styles.secondaryCta}>
                {plans[0].cta}
              </Link>
            </article>

            {/* Pro Plan — Coming Soon */}
            <article className={`${styles.planCard} ${styles.planCardFeatured} ${styles.planCardAnimated} ${styles.planCardFeaturedGlow}`} style={{ animationDelay: '120ms', position: 'relative', overflow: 'hidden' }} aria-label="Professional plan — coming soon">
              <ComingSoonOverlay />
              <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.65, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }} aria-hidden="true">
                <span className={styles.featuredTag}>Most popular</span>
                <div>
                  <span className={styles.planName}>{plans[1].name}</span>
                  <div key={annual ? 'annual' : 'monthly'} className={`${styles.priceRow} ${styles.priceRowSwap}`}>
                    <strong>{proPrice}</strong>
                    <span>/month</span>
                  </div>
                  <p>{plans[1].subtitle}</p>
                  <div key={`meta-${annual ? 'annual' : 'monthly'}`} className={`${styles.planMeta} ${styles.planMetaSwap}`}>
                    <span>{proBilling}</span>
                    {annual && <span>{plans[1].annualNote}</span>}
                    <span>7-day free trial</span>
                  </div>
                </div>
                <div className={styles.featureList}>
                  {plans[1].features.map((feature) => (
                    <Feature key={feature} text={feature} />
                  ))}
                </div>
                <button type="button" className={styles.primaryCta} disabled tabIndex={-1}>
                  {plans[1].cta}
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </article>

            {/* Premium Plan — Coming Soon */}
            <article className={`${styles.planCard} ${styles.planCardAnimated}`} style={{ animationDelay: '200ms', border: '2px solid #8B5CF6', position: 'relative', overflow: 'hidden' }} aria-label="Premium plan — coming soon">
              <ComingSoonOverlay accent="#8B5CF6" />
              <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.65, display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }} aria-hidden="true">
                <div style={{ position: 'relative' }}>
                  <Crown size={20} weight="duotone" style={{ position: 'absolute', top: -4, right: 0, color: '#8B5CF6' }} />
                  <span className={styles.planName} style={{ color: '#8B5CF6' }}>{plans[2].name}</span>
                  <div key={annual ? 'premium-annual' : 'premium-monthly'} className={`${styles.priceRow} ${styles.priceRowSwap}`}>
                    <strong>{premiumPrice}</strong>
                    <span>/month</span>
                  </div>
                  <p>{plans[2].subtitle}</p>
                  <div key={`premium-meta-${annual ? 'annual' : 'monthly'}`} className={`${styles.planMeta} ${styles.planMetaSwap}`}>
                    <span>{premiumBilling}</span>
                    {annual && <span>{plans[2].annualNote}</span>}
                    <span>7-day free trial</span>
                  </div>
                </div>
                <div className={styles.featureList}>
                  {plans[2].features.map((feature) => (
                    <Feature key={feature} text={feature} />
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.primaryCta}
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
                  disabled
                  tabIndex={-1}
                >
                  {plans[2].cta}
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </article>

            {/* Lifetime Plan */}
            <article className={`${styles.planCard} ${styles.planCardDark} ${styles.planCardAnimated}`} style={{ animationDelay: '280ms' }}>
              <div>
                <span className={styles.planNameDark}>{plans[3].name}</span>
                <div className={styles.priceRowDark}>
                  <strong>{plans[3].price}</strong>
                  <span>one-time</span>
                </div>
                <p>{plans[3].subtitle}</p>
              </div>
              <div className={styles.featureListDark}>
                {plans[3].features.map((feature) => (
                  <Feature key={feature} text={feature} dark />
                ))}
              </div>
              <button
                type="button"
                className={styles.darkCta}
                onClick={handleLifetimeCheckout}
                disabled={loading === 'lifetime'}
              >
                {loading === 'lifetime' ? 'Loading…' : plans[3].cta}
              </button>
            </article>
          </div>

          <div className={styles.valuePanel}>
            <div>
              <span className={styles.sectionEyebrow}>How pricing aligns with your job search</span>
              <h2>Free to validate, Pro to scale, Premium to accelerate, Lifetime for the long run.</h2>
              <p>
                The free plan helps you test fit before committing. Pro removes limits for active job searches.
                Premium adds executive-level features like interview prep and strategy calls. Lifetime gives you
                WorthApply as a permanent career tool with founding member perks.
              </p>
            </div>
            <div className={styles.valueList}>
              <div><ShieldCheck size={18} weight="fill" /> No commitment required to start</div>
              <div><Sparkle size={18} weight="duotone" /> Unlimited workflow for active searches</div>
              <div><Crown size={18} weight="duotone" /> Executive features for high earners</div>
              <div><SealCheck size={18} weight="fill" /> Founding member access for career-long value</div>
            </div>
          </div>

          {/* Usage Visualization */}
          <div className={styles.usageSection}>
            <div className={styles.usageHeader}>
              <span className={styles.sectionEyebrow}>Usage limits visualized</span>
              <h3>See how each plan handles your workflow</h3>
            </div>

            <div className={styles.usageGrid}>
              {/* Free Plan Usage */}
              <div className={styles.usageCard}>
                <div className={styles.usageCardHeader}>
                  <h4>Free Plan</h4>
                  <span className={styles.usageBadge}>Test the workflow</span>
                </div>
                <div className={styles.usageIndicators}>
                  <UsageIndicator current={3} max={3} label="Job analyses/month" />
                  <UsageIndicator current={2} max={2} label="Resume tailorings/month" />
                  <UsageIndicator current={0} max={0} label="LinkedIn searches" />
                </div>
                <p className={styles.usageNote}>
                  Perfect for testing on a few high-priority roles
                </p>
              </div>

              {/* Pro Plan Usage */}
              <div className={`${styles.usageCard} ${styles.usageCardFeatured}`}>
                <div className={styles.usageCardHeader}>
                  <h4>Pro Plan</h4>
                  <span className={`${styles.usageBadge} ${styles.usageBadgeFeatured}`}>Most popular</span>
                </div>
                <div className={styles.usageIndicators}>
                  <UsageIndicator label="Job analyses" unlimited={true} />
                  <UsageIndicator label="Resume tailorings" unlimited={true} />
                  <UsageIndicator current={10} max={10} label="LinkedIn searches/month" />
                </div>
                <p className={styles.usageNote}>
                  Unlimited analyses + 300 LinkedIn jobs per month
                </p>
              </div>

              {/* Premium Plan Usage */}
              <div className={styles.usageCard} style={{ border: '2px solid #8B5CF6' }}>
                <div className={styles.usageCardHeader}>
                  <h4>Premium Plan</h4>
                  <span className={styles.usageBadge} style={{ background: '#8B5CF6' }}>Executive</span>
                </div>
                <div className={styles.usageIndicators}>
                  <UsageIndicator label="Job analyses" unlimited={true} />
                  <UsageIndicator label="Resume tailorings" unlimited={true} />
                  <UsageIndicator current={20} max={20} label="LinkedIn searches/month" />
                </div>
                <p className={styles.usageNote}>
                  Everything + 600 LinkedIn jobs + interview prep
                </p>
              </div>

              {/* Lifetime Plan Usage */}
              <div className={`${styles.usageCard} ${styles.usageCardDark}`}>
                <div className={styles.usageCardHeader}>
                  <h4>Lifetime Plan</h4>
                  <span className={`${styles.usageBadge} ${styles.usageBadgeDark}`}>Forever access</span>
                </div>
                <div className={styles.usageIndicators}>
                  <UsageIndicator label="Job analyses" unlimited={true} />
                  <UsageIndicator label="Resume tailorings" unlimited={true} />
                  <UsageIndicator current={20} max={20} label="LinkedIn searches/month" />
                </div>
                <p className={styles.usageNote}>
                  Everything in Premium, forever. One payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.tableIntro}>
            <span className={styles.sectionEyebrow}>Plan comparison</span>
            <h2>See exactly what changes as you upgrade.</h2>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Pro</th>
                  <th>Premium</th>
                  <th>Lifetime</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((group) =>
                  group.rows.map((row, index) => (
                    <tr key={`${group.section}-${row.feature}`} className={index === 0 ? styles.groupStart : ''}>
                      <td>
                        {index === 0 && <span className={styles.groupLabel}>{group.section}</span>}
                        <strong>{row.feature}</strong>
                      </td>
                      <td><CellDisplay value={row.free} /></td>
                      <td className={styles.highlightCell}><CellDisplay value={row.pro} /></td>
                      <td><CellDisplay value={row.premium} /></td>
                      <td><CellDisplay value={row.lifetime} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.faqShell}>
            <div className={styles.faqIntro}>
              <span className={styles.sectionEyebrow}>FAQ</span>
              <h2>Questions job seekers ask before upgrading.</h2>
            </div>

            <div className={styles.faqList}>
              {faqs.map((faq, index) => {
                const open = openFaq === index;
                return (
                  <article key={faq.q} className={styles.faqItem}>
                    <button
                      type="button"
                      className={styles.faqButton}
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : index)}
                    >
                      <span>{faq.q}</span>
                      <CaretDown size={18} weight="bold" className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
                    </button>
                    <div className={`${styles.faqAnswerWrap} ${open ? styles.faqAnswerWrapOpen : ''}`}>
                      <p className={styles.faqAnswer}>{faq.a}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className={styles.bottomCta}>
            <h2>Ready to know before you apply?</h2>
            <div className={styles.bottomActions}>
              <Link href="/signup" className={styles.primaryCta}>
                Get started free
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link href="/features" className={styles.secondaryCta}>
                View features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ComingSoonOverlay({ accent = '#0f172a' }: { accent?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          padding: '10px 20px',
          borderRadius: 999,
          background: accent,
          color: 'white',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
        }}
      >
        Coming Soon
      </span>
    </div>
  );
}

function Feature({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div className={dark ? styles.featureDark : styles.feature}>
      <CheckCircle size={16} weight="fill" />
      <span>{text}</span>
    </div>
  );
}

function CellDisplay({ value }: { value: CellValue }) {
  if (value === true) return <span className={styles.cellIcon}><CheckCircle size={16} weight="fill" /></span>;
  if (value === false) return <span className={styles.cellMuted}>—</span>;
  return <span className={styles.cellText}>{value}</span>;
}
