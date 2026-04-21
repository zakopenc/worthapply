export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://worthapply.vercel.app';
}

export type CheckoutPlan = 'pro_monthly' | 'pro_annual' | 'premium_monthly' | 'premium_annual';

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
    case 'premium_monthly':
      return {
        plan,
        interval: 'monthly' as const,
        mode: 'subscription' as const,
        priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        planType: 'premium' as const,
        hasTrial: true,
      };
    case 'premium_annual':
      return {
        plan,
        interval: 'annual' as const,
        mode: 'subscription' as const,
        priceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
        planType: 'premium' as const,
        hasTrial: true,
      };
  }
}

export function getCheckoutConfig(interval: string | undefined) {
  switch (interval) {
    case 'monthly':
      return getCheckoutConfigByPlan('pro_monthly');
    case 'annual':
      return getCheckoutConfigByPlan('pro_annual');
    default:
      return null;
  }
}
