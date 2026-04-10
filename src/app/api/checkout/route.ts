import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { checkRateLimit } from '@/lib/ratelimit';
import { getAppUrl, getCheckoutConfigByPlan } from '@/lib/billing/config';
import { checkoutSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const normalizedCheckout = 'plan' in parsed.data
      ? {
          plan: parsed.data.plan,
          priceId: parsed.data.priceId,
        }
      : parsed.data.interval === 'monthly'
        ? {
            plan: 'pro_monthly' as const,
            priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
          }
        : parsed.data.interval === 'annual'
          ? {
              plan: 'pro_annual' as const,
              priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || '',
            }
          : {
              plan: 'lifetime' as const,
              priceId: process.env.STRIPE_LIFETIME_PRICE_ID || '',
            };

    const { priceId, plan } = normalizedCheckout;
    const checkoutConfig = getCheckoutConfigByPlan(plan);

    if (!checkoutConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!checkoutConfig.priceId) {
      return NextResponse.json({ error: 'Stripe pricing is not configured' }, { status: 500 });
    }

    if (priceId !== checkoutConfig.priceId) {
      return NextResponse.json({ error: 'Price ID does not match the selected plan' }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    });

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, full_name, plan, subscription_status')
      .eq('id', user.id)
      .single();

    if (profile?.plan === 'lifetime') {
      return NextResponse.json({ error: 'Lifetime access is already active on this account' }, { status: 400 });
    }

    if (
      checkoutConfig.planType === 'pro' &&
      profile?.plan === 'pro' &&
      profile.subscription_status &&
      profile.subscription_status !== 'canceled'
    ) {
      return NextResponse.json({ error: 'An active Pro subscription already exists for this account' }, { status: 400 });
    }

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const appUrl = getAppUrl();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: checkoutConfig.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgrade=success`,
      cancel_url: `${appUrl}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan,
        trial: checkoutConfig.hasTrial ? 'true' : 'false',
      },
    };

    if (checkoutConfig.hasTrial) {
      sessionParams.subscription_data = {
        trial_period_days: 7,
        metadata: {
          user_id: user.id,
          plan,
          trial: 'true',
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
