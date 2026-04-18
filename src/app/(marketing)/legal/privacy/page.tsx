import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | WorthApply',
  description: 'How WorthApply collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f4] py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-gray-600 mb-8">
            <strong>Last Updated:</strong> April 5, 2026
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                WorthApply Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our service (&quot;Service&quot;).
              </p>
              <p className="text-gray-700">
                By using WorthApply, you agree to this Privacy Policy. If you do not agree, do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password</li>
                <li><strong>Profile Data:</strong> Job preferences, career goals, skills</li>
                <li><strong>Resume Content:</strong> Work history, education, achievements, contact information</li>
                <li><strong>Job Descriptions:</strong> Text you paste for analysis</li>
                <li><strong>Payment Information:</strong> Processed securely by Stripe (we do not store credit card numbers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
                <li><strong>Cookies:</strong> Session cookies for authentication and analytics (see Section 8)</li>
                <li><strong>Analytics:</strong> Google Analytics for traffic and behavior analysis</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Third-Party Data</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>LinkedIn:</strong> If you use our LinkedIn job scraper, we access publicly available job postings (no personal LinkedIn data is collected)</li>
                <li><strong>Google OAuth:</strong> If you sign in with Google, we receive your name, email, and profile picture</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Provide the Service:</strong> Job analysis, resume tailoring, application tracking</li>
                <li><strong>Process AI Requests:</strong> Your resume and job descriptions are sent to Google Gemini API for analysis (Google&apos;s data practices apply)</li>
                <li><strong>Improve the Service:</strong> Analytics, bug fixes, feature development</li>
                <li><strong>Communicate:</strong> Account updates, product announcements, customer support</li>
                <li><strong>Process Payments:</strong> Via Stripe for Pro/Premium subscriptions</li>
                <li><strong>Security:</strong> Fraud prevention, abuse detection, compliance with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-700 mb-4">
                <strong>We DO NOT sell your personal information.</strong> We only share data in these situations:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Service Providers</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Supabase:</strong> Database and authentication hosting (SOC 2 compliant)</li>
                <li><strong>Google Cloud:</strong> Gemini API for job analysis and resume tailoring</li>
                <li><strong>Vercel:</strong> Web hosting and infrastructure</li>
                <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                <li><strong>Google Analytics:</strong> Website traffic and user behavior analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose your information if required by law, court order, or government request, or to protect our rights and safety.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Business Transfers</h3>
              <p className="text-gray-700">
                If WorthApply is acquired or merged, your data may be transferred to the new owner. You will be notified of any such change.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Encryption:</strong> HTTPS/TLS for data in transit, AES-256 for data at rest</li>
                <li><strong>Access Controls:</strong> Role-based permissions, multi-factor authentication for internal access</li>
                <li><strong>Regular Audits:</strong> Security reviews and vulnerability scanning</li>
                <li><strong>Third-Party Certifications:</strong> Our providers (Supabase, Stripe) are SOC 2 and PCI-DSS compliant</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>No system is 100% secure.</strong> While we strive to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Active Accounts:</strong> We retain your data as long as your account is active</li>
                <li><strong>Deleted Accounts:</strong> Data is deleted within 30 days of account deletion</li>
                <li><strong>Legal Obligations:</strong> Some data may be retained longer if required by law (e.g., billing records for tax purposes)</li>
                <li><strong>Analytics:</strong> Aggregated, anonymized data may be retained indefinitely for product improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Access & Correction</h3>
              <p className="text-gray-700 mb-4">
                You can view and update your profile, resume, and account settings at any time from your account dashboard.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Data Deletion</h3>
              <p className="text-gray-700 mb-4">
                Delete your account from Settings → Account → Delete Account. All data will be permanently deleted within 30 days.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Data Export</h3>
              <p className="text-gray-700 mb-4">
                Request a copy of your data by contacting{' '}
                <a href="mailto:privacy@worthapply.com" className="text-primary hover:underline">
                  privacy@worthapply.com
                </a>
                . We will provide a JSON export within 30 days.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.4 Opt-Out of Marketing</h3>
              <p className="text-gray-700 mb-4">
                Unsubscribe from marketing emails via the link in any email or from Settings → Notifications.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.5 GDPR Rights (EU Users)</h3>
              <p className="text-gray-700 mb-4">
                If you are in the EU/EEA, you have additional rights under GDPR:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Right to access, rectify, erase, or restrict processing of your data</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.6 CCPA Rights (California Users)</h3>
              <p className="text-gray-700">
                California residents have the right to know what personal information is collected, request deletion, and opt-out of sale (note: we do not sell data).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies & Tracking</h2>
              <p className="text-gray-700 mb-4">We use cookies for:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Authentication, session management (required)</li>
                <li><strong>Analytics Cookies:</strong> Google Analytics (can be disabled via browser settings)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Most browsers accept cookies by default. You can configure your browser to reject cookies, but this may limit functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700">
                The Service may contain links to third-party websites (e.g., LinkedIn job postings). We are not responsible for their privacy practices. Review their privacy policies separately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                The Service is not intended for users under 18. We do not knowingly collect data from children. If you believe a child has provided information, contact us to delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700">
                Your data may be processed in the United States or other countries where our service providers operate. By using the Service, you consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy at any time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">For privacy questions or requests, contact:</p>
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@worthapply.com" className="text-primary hover:underline">
                  privacy@worthapply.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Mail:</strong> WorthApply Inc., 123 Market St, San Francisco, CA 94103
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
