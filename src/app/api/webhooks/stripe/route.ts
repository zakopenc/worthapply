import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { captureServer } from '@/lib/analytics/posthog-server';
import { logWebhookEvent } from '@/lib/admin/log-ai-error';
import { createHash } from 'crypto';

/**
 * Redacts a user ID for logs — returns a short stable hash so the same user
 * produces the same token across log lines (useful for tracing) but the
 * actual UUID is not written to stdout / log aggregators.
 */
function redactId(raw: string | null | undefined): string {
  if (!raw) return 'anon';
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 10);
  return `u_${hash}`;
}

// Extend Stripe types to include properties for beta API
interface SubscriptionWithPeriod extends Stripe.Subscription {
  current_period_end: number;
}

interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription: string | Stripe.Subscription | null;
  amount_paid: number;
  currency: string;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return secret;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars are not set');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, stripe, supabaseAdmin);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as SubscriptionWithPeriod;
        await handleSubscriptionUpdated(subscription, supabaseAdmin);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as SubscriptionWithPeriod;
        await handleSubscriptionDeleted(subscription, supabaseAdmin);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as InvoiceWithSubscription;
        await handleInvoicePaymentSucceeded(invoice, stripe);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as InvoiceWithSubscription;
        await handleInvoicePaymentFailed(invoice, stripe);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        logWebhookEvent({ stripeEventId: event.id, type: event.type, status: 'ignored' }).catch(() => {});
        return NextResponse.json({ received: true });
    }

    logWebhookEvent({ stripeEventId: event.id, type: event.type, status: 'processed' }).catch(() => {});
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logWebhookEvent({ stripeEventId: event.id, type: event.type, status: 'failed', errorMessage: errMsg }).catch(() => {});
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

type SupabaseAdmin = ReturnType<typeof getSupabaseAdmin>;

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe, supabaseAdmin: SupabaseAdmin) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const plan = session.metadata?.plan;

  if (!userId) {
    console.error('No userId in checkout session');
    return;
  }

  // Lifetime purchases (mode: 'payment') have no subscription
  if (!session.subscription) {
    // One-time payment (lifetime plan)
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: plan || 'lifetime',
        stripe_customer_id: session.customer as string,
        subscription_status: 'lifetime',
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile after lifetime checkout:', error);
    } else {
      console.log(`Lifetime plan activated for user ${redactId(userId)}`);
      await captureServer(userId, 'paid_conversion', {
        plan: plan || 'lifetime',
        stripe_customer_id: session.customer,
        amount_total: session.amount_total,
        currency: session.currency,
        source: 'stripe_webhook',
      });
    }
    return;
  }

  const subscriptionResponse = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Cast to SubscriptionWithPeriod to access current_period_end
  const subscription = subscriptionResponse as unknown as SubscriptionWithPeriod;

  // Update user's profile with subscription info
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: plan || 'pro',
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile after checkout:', error);
  } else {
    console.log(`Subscription activated for user ${redactId(userId)}: ${plan}`);

    await captureServer(userId, 'paid_conversion', {
      plan: plan || 'pro',
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscription.id,
      amount_total: session.amount_total,
      currency: session.currency,
      source: 'stripe_webhook',
    });
  }
}

async function handleSubscriptionUpdated(subscription: SubscriptionWithPeriod, supabaseAdmin: SupabaseAdmin) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const plan = subscription.metadata?.plan || 'pro';

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: plan,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log(`Subscription updated for user ${redactId(userId)}: ${subscription.status}`);
  }
}

async function handleSubscriptionDeleted(subscription: SubscriptionWithPeriod, supabaseAdmin: SupabaseAdmin) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Downgrade to free plan
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      subscription_status: 'canceled',
      subscription_current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error handling subscription cancellation:', error);
  } else {
    console.log(`Subscription canceled for user ${redactId(userId)}`);
  }
}

async function handleInvoicePaymentSucceeded(invoice: InvoiceWithSubscription, stripe: Stripe) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  console.log(`Payment succeeded for user ${redactId(userId)}: ${invoice.amount_paid / 100} ${invoice.currency}`);
}

async function handleInvoicePaymentFailed(invoice: InvoiceWithSubscription, stripe: Stripe) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Mark subscription as past_due so feature gating downgrades to free
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: subscription.status, // 'past_due' from Stripe
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating subscription status on payment failure:', error);
  } else {
    console.log(`Payment failed for user ${redactId(userId)}, status set to ${subscription.status}`);
  }
}
