import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | WorthApply',
  description: 'Refund and cancellation policy for WorthApply subscriptions.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f4] py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> April 5, 2026
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 mb-4">
                At WorthApply, we want you to be completely satisfied with your subscription. This Refund Policy explains when refunds are available and how to request one.
              </p>
              <p className="text-gray-700">
                <strong>Key Points:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>7-day money-back guarantee for first-time subscribers</li>
                <li>No refunds for renewals or partial months</li>
                <li>Cancellation anytime (access continues until period end)</li>
                <li>Free plan available (no payment required to try the service)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 7-Day Money-Back Guarantee</h2>
              <p className="text-gray-700 mb-4">
                <strong>First-Time Pro or Premium Subscribers:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>If you subscribe to Pro ($39/mo) or Premium ($79/mo) for the first time, you have <strong>7 days</strong> from the initial payment to request a full refund</li>
                <li>No questions asked—just email{' '}
                  <a href="mailto:support@worthapply.com" className="text-primary hover:underline">
                    support@worthapply.com
                  </a>{' '}
                  with &quot;Refund Request&quot; in the subject line
                </li>
                <li>Refunds are processed within 5-7 business days to your original payment method</li>
                <li>After refund, your account reverts to the Free plan</li>
              </ul>
              <p className="text-gray-700">
                <strong>Note:</strong> The 7-day guarantee applies only to your <em>first</em> paid subscription. Re-subscribing after a refund is not eligible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. No Refunds After 7 Days</h2>
              <p className="text-gray-700 mb-4">
                After the 7-day guarantee period expires, <strong>all payments are final and non-refundable</strong>, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Subscription Renewals:</strong> Monthly or annual auto-renewals are not refundable</li>
                <li><strong>Partial Months:</strong> If you cancel mid-month, you will not receive a pro-rated refund</li>
                <li><strong>Downgrades:</strong> Switching from Premium to Pro does not refund the price difference</li>
                <li><strong>Duplicate Payments:</strong> If you accidentally make multiple payments, contact support immediately (we may issue a refund for genuine errors)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
              <p className="text-gray-700 mb-4">
                You can cancel your subscription anytime from your account settings:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                <li>Log in to WorthApply</li>
                <li>Go to Settings → Billing</li>
                <li>Click &quot;Cancel Subscription&quot;</li>
                <li>Confirm cancellation</li>
              </ol>
              <p className="text-gray-700 mb-4">
                <strong>What happens after cancellation:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access Continues:</strong> You retain Pro/Premium access until the end of your current billing period</li>
                <li><strong>No Auto-Renewal:</strong> You will not be charged again</li>
                <li><strong>Downgrade:</strong> After the period ends, your account automatically reverts to the Free plan</li>
                <li><strong>Data Retained:</strong> Your resumes, analyses, and applications remain accessible on the Free plan (with monthly limits)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Free Plan Alternative</h2>
              <p className="text-gray-700 mb-4">
                Before subscribing, try our <strong>Free plan</strong>:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>3 job analyses per month</li>
                <li>Resume upload and parsing</li>
                <li>Application tracking</li>
                <li>No credit card required</li>
              </ul>
              <p className="text-gray-700 mt-4">
                The Free plan lets you test the core workflow risk-free before committing to a paid subscription.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Annual Subscriptions</h2>
              <p className="text-gray-700 mb-4">
                Annual plans (if available) follow the same refund rules:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>7-Day Guarantee:</strong> Full refund if requested within 7 days of initial purchase</li>
                <li><strong>After 7 Days:</strong> No refunds, even if you cancel early</li>
                <li><strong>Cancellation:</strong> Prevents auto-renewal but access continues for the full year</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Exceptions & Special Cases</h2>
              <p className="text-gray-700 mb-4">
                We may issue refunds outside this policy in rare cases:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Billing Errors:</strong> If we charged you incorrectly (e.g., duplicate charges, wrong amount)</li>
                <li><strong>Service Outages:</strong> Extended downtime that prevents use of the service</li>
                <li><strong>Unauthorized Charges:</strong> If your payment method was used without authorization (contact your bank immediately)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Contact{' '}
                <a href="mailto:support@worthapply.com" className="text-primary hover:underline">
                  support@worthapply.com
                </a>{' '}
                with details. We review exceptional cases individually.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. How to Request a Refund</h2>
              <p className="text-gray-700 mb-4">
                <strong>Within 7 days of first subscription:</strong>
              </p>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                <li>
                  Email{' '}
                  <a href="mailto:support@worthapply.com" className="text-primary hover:underline">
                    support@worthapply.com
                  </a>
                </li>
                <li>Subject: &quot;Refund Request&quot;</li>
                <li>Include: Account email and reason (optional)</li>
                <li>We will process your refund within 5-7 business days</li>
                <li>You will receive a confirmation email once processed</li>
              </ol>
              <p className="text-gray-700">
                <strong>After 7 days:</strong> Refunds are not available. You may cancel to prevent future charges.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Chargebacks</h2>
              <p className="text-gray-700 mb-4">
                <strong>Please contact us before filing a chargeback.</strong> Chargebacks hurt small businesses and may result in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Immediate account suspension</li>
                <li>Permanent ban from the service</li>
                <li>Loss of all data (resumes, analyses, applications)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                If you have a billing issue, email us first. We will resolve legitimate disputes fairly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Refund Policy at any time. Changes will be posted on this page with an updated &quot;Last Updated&quot; date. Existing subscriptions are subject to the policy in effect at the time of purchase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">Questions about refunds or cancellations?</p>
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@worthapply.com" className="text-primary hover:underline">
                  support@worthapply.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Response Time:</strong> We aim to respond within 24 hours (excluding weekends and holidays)
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
