'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * AutoCheckoutTrigger - Automatically triggers checkout after signup
 * 
 * When user clicks "Get Started" while not logged in:
 * 1. Redirects to signup with returnUrl containing plan/priceId
 * 2. After signup, returns to pricing page with those params
 * 3. This component auto-triggers the checkout for them
 */
export function AutoCheckoutTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasTriggered = useRef(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    const priceId = searchParams.get('priceId');

    // Only trigger if we have both params and haven't triggered yet
    if (!plan || !priceId || hasTriggered.current) {
      return;
    }

    const triggerCheckout = async () => {
      try {
        hasTriggered.current = true;

        // Check if user is authenticated
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Not authenticated, do nothing (let PricingCard handle it)
          return;
        }

        // User is authenticated, auto-trigger checkout
        console.log('Auto-triggering checkout for plan:', plan);

        // Find the matching pricing card button and click it
        // This is a simple approach - alternatively we could duplicate the checkout logic here
        const buttons = document.querySelectorAll('button');
        let foundButton = null;

        for (const button of buttons) {
          const cardContainer = button.closest('[data-plan]');
          if (cardContainer && cardContainer.getAttribute('data-plan') === plan) {
            foundButton = button;
            break;
          }
        }

        if (foundButton) {
          foundButton.click();
        } else {
          console.warn('Could not find pricing card button for plan:', plan);
        }

        // Clean up URL params
        router.replace('/pricing', { scroll: false });
      } catch (error) {
        console.error('Auto-checkout trigger error:', error);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(triggerCheckout, 500);
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}
