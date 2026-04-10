import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | WorthApply',
  description: 'Terms and conditions for using WorthApply\'s job application platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f4] py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> April 5, 2026
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing or using WorthApply (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
              </p>
              <p className="text-gray-700">
                WorthApply is operated by WorthApply Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). The Service provides job application analysis, resume tailoring, and career tools.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                <strong>2.1 Registration:</strong> You must create an account to use certain features. You agree to provide accurate, current, and complete information.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>2.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your password and account credentials. Notify us immediately of any unauthorized access.
              </p>
              <p className="text-gray-700">
                <strong>2.3 Age Requirement:</strong> You must be at least 18 years old to use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription Plans</h2>
              <p className="text-gray-700 mb-4">
                <strong>3.1 Free Plan:</strong> Provides limited access (3 job analyses per month). We reserve the right to modify or discontinue free features at any time.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>3.2 Paid Plans (Pro/Premium):</strong> Billed monthly or annually. Subscriptions automatically renew unless canceled before the renewal date.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>3.3 Pricing Changes:</strong> We may change subscription prices with 30 days&apos; notice. Current subscribers are grandfathered at their existing rate for one billing cycle.
              </p>
              <p className="text-gray-700">
                <strong>3.4 Cancellation:</strong> You may cancel anytime from your account settings. Access continues until the end of your current billing period. No refunds for partial months.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You agree NOT to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Attempt to reverse engineer, decompile, or hack the Service</li>
                <li>Share your account credentials with others</li>
                <li>Scrape, crawl, or automatically collect data from the Service</li>
                <li>Use the Service to send spam or unsolicited communications</li>
                <li>Violate any third-party rights, including intellectual property rights</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Content</h2>
              <p className="text-gray-700 mb-4">
                <strong>5.1 Your Data:</strong> You retain ownership of all content you upload (resumes, job descriptions, etc.). You grant us a limited license to process this content to provide the Service.
              </p>
              <p className="text-gray-700 mb-4">
                <strong>5.2 Accuracy:</strong> You represent that all information you provide is accurate and does not infringe third-party rights.
              </p>
              <p className="text-gray-700">
                <strong>5.3 Data Deletion:</strong> You may delete your account and data anytime from account settings. We will delete your data within 30 days, except where required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Service, including all code, designs, algorithms, and content (except User Content), is owned by WorthApply and protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-700">
                You may not copy, modify, distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                The Service integrates with third-party services (Google Cloud, LinkedIn, Supabase). We are not responsible for their availability, accuracy, or terms of service.
              </p>
              <p className="text-gray-700">
                Use of third-party services is subject to their respective terms and privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700 mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Job offers, interviews, or employment outcomes</li>
                <li>Accuracy of job fit scores or recommendations</li>
                <li>Uninterrupted or error-free operation</li>
                <li>That the Service will meet your specific requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WORTHAPPLY SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages exceeding the amount you paid us in the past 12 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold WorthApply harmless from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may suspend or terminate your account at any time for violation of these Terms or for any other reason, with or without notice.
              </p>
              <p className="text-gray-700">
                Upon termination, your right to use the Service immediately ceases. Sections 6, 8, 9, 10, and 12 survive termination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law & Disputes</h2>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of Delaware, USA, without regard to conflict of law principles.
              </p>
              <p className="text-gray-700">
                Any disputes shall be resolved through binding arbitration in Delaware, except where prohibited by law. You waive any right to a jury trial or class action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms at any time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact</h2>
              <p className="text-gray-700">
                For questions about these Terms, contact us at{' '}
                <a href="mailto:legal@worthapply.com" className="text-primary hover:underline">
                  legal@worthapply.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
