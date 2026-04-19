/**
 * Build Stripe Dashboard URL for a customer. Uses test mode when STRIPE_SECRET_KEY is sk_test_*.
 */
export function stripeCustomerDashboardUrl(customerId: string): string {
  const secret = process.env.STRIPE_SECRET_KEY ?? '';
  const isTest = secret.startsWith('sk_test');
  const prefix = isTest ? 'test/' : '';
  return `https://dashboard.stripe.com/${prefix}customers/${encodeURIComponent(customerId)}`;
}
