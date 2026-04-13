'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

// Extend Stripe type is no longer needed
// interface StripeWithRedirect extends Stripe {
//   redirectToCheckout: (options: { sessionId: string }) => Promise<{ error?: Error }>;
// }

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  priceId: string;
  plan: 'pro' | 'premium';
  popular?: boolean;
  features: string[];
}

export default function PricingCard({
  name,
  description,
  price,
  priceId,
  plan,
  popular = false,
  features
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const hasAutoTriggered = useRef(false);

  // Auto-trigger checkout if user just signed up and returned with plan params
  useEffect(() => {
    const urlPlan = searchParams.get('plan');
    const urlPriceId = searchParams.get('priceId');

    // Only auto-trigger if:
    // 1. URL has plan and priceId params
    // 2. They match this pricing card
    // 3. We haven't already triggered
    if (!urlPlan || !urlPriceId || urlPlan !== plan || hasAutoTriggered.current) {
      return;
    }

    const autoTrigger = async () => {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        hasAutoTriggered.current = true;
        console.log('Auto-triggering checkout for', plan, 'plan');
        
        // Trigger checkout automatically
        handleCheckout();
        
        // Clean up URL after 2 seconds
        setTimeout(() => {
          router.replace('/pricing', { scroll: false });
        }, 2000);
      }
    };

    // Small delay to ensure everything is loaded
    setTimeout(autoTrigger, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, plan]);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to signup with return URL
        const returnUrl = `/pricing?plan=${plan}&priceId=${encodeURIComponent(priceId)}`;
        router.push(`/signup?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      });

      const data = await response.json();
      console.log('Checkout response data:', data); // Added log

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL provided by server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className={`relative rounded-2xl p-px ${
        popular
          ? 'bg-gradient-to-br from-secondary via-secondary/60 to-primary shadow-xl shadow-secondary/10'
          : 'bg-gradient-to-br from-outline-variant/30 via-transparent to-outline-variant/30 hover:from-secondary/40 hover:to-primary/40'
      } transition-all duration-500`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-secondary to-primary text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Most Popular
          </span>
        </div>
      )}

      <div className={`bg-white rounded-[calc(1rem-1px)] p-8 h-full ${popular ? 'pt-10' : ''}`}>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="mb-8">
          <div className="text-5xl font-bold text-gray-900">${price}</div>
          <div className="text-gray-600">per month</div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`
            w-full py-4 px-6 text-center rounded-xl font-semibold transition-all duration-200 mb-8
            flex items-center justify-center gap-2
            ${popular
              ? 'bg-gradient-to-r from-secondary to-primary text-white hover:shadow-2xl hover:-translate-y-0.5'
              : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
          `}
        >
          {loading ? (
            <>
              <CircleNotch className="w-5 h-5 animate-spin" weight="bold" />
              Processing...
            </>
          ) : (
            <>
              Get Started
              <ArrowRight className="w-5 h-5" weight="bold" />
            </>
          )}
        </button>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
