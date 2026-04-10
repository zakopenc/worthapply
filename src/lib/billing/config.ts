export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://worthapply.vercel.app';
}

export type CheckoutPlan = 'pro_monthly' | 'pro_annual' | 'lifetime';

export function getCheckoutConfigByPlan(plan: CheckoutPlan) {
  switch (plan) {
    case 'pro_monthly':
      return {
        plan,
        interval: 'monthly' as const,
        mode: 'subscription' as const,
        priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        planType: 'pro' as const,
        hasTrial: true,
      };
    case 'pro_annual':
      return {
        plan,
        interval: 'annual' as const,
        mode: 'subscription' as const,
        priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
        planType: 'pro' as const,
        hasTrial: true,
      };
    case 'lifetime':
      return {
        plan,
        interval: 'lifetime' as const,
        mode: 'payment' as const,
        priceId: process.env.STRIPE_LIFETIME_PRICE_ID,
        planType: 'lifetime' as const,
        hasTrial: false,
      };
  }
}

export function getCheckoutConfig(interval: string | undefined) {
  switch (interval) {
    case 'monthly':
      return getCheckoutConfigByPlan('pro_monthly');
    case 'annual':
      return getCheckoutConfigByPlan('pro_annual');
    case 'lifetime':
      return getCheckoutConfigByPlan('lifetime');
    default:
      return null;
  }
}
