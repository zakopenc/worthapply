import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'WorthApply terms of service covering account use, subscriptions, billing, intellectual property, and user responsibilities.',
  alternates: {
    canonical: '/terms',
  },
};

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'account', title: 'Account Registration' },
  { id: 'use', title: 'Acceptable Use' },
  { id: 'ip', title: 'Intellectual Property' },
  { id: 'subscriptions', title: 'Subscriptions & Billing' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'limitation', title: 'Limitation of Liability' },
  { id: 'termination', title: 'Termination' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'contact', title: 'Contact Us' },
];

export default function TermsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Terms of Service</h1>
          <p className={styles.heroMeta}>Last updated: March 1, 2026</p>
        </div>
      </section>

      <div className={styles.layout}>
        {/* TOC */}
        <aside className={styles.toc}>
          <p className={styles.tocTitle}>On this page</p>
          <nav className={styles.tocList}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={styles.tocLink}>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className={styles.content}>
          <p className={styles.contentParagraph}>
            These Terms of Service (&quot;Terms&quot;) govern your use of the
            WorthApply platform. By creating an account or using our services,
            you agree to be bound by these Terms.
          </p>

          <div id="acceptance" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Acceptance of Terms</h2>
            <p className={styles.contentParagraph}>
              By accessing or using WorthApply, you agree to these Terms and our
              Privacy Policy. If you do not agree, you may not use our services.
              We reserve the right to modify these Terms at any time, and we
              will notify you of material changes.
            </p>
          </div>

          <div id="account" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Account Registration</h2>
            <p className={styles.contentParagraph}>
              You must provide accurate and complete information when creating an
              account. You are responsible for maintaining the security of your
              account credentials and for all activities that occur under your
              account. Notify us immediately of any unauthorized access.
            </p>
          </div>

          <div id="use" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Acceptable Use</h2>
            <p className={styles.contentParagraph}>
              You agree to use WorthApply only for lawful purposes related to
              your job search. You may not:
            </p>
            <ul className={styles.contentList}>
              <li className={styles.contentListItem}>
                Use the platform to generate misleading or fraudulent application materials
              </li>
              <li className={styles.contentListItem}>
                Attempt to reverse-engineer, scrape, or extract data from the platform
              </li>
              <li className={styles.contentListItem}>
                Share your account credentials with others
              </li>
              <li className={styles.contentListItem}>
                Use automated tools to access the platform beyond normal usage
              </li>
              <li className={styles.contentListItem}>
                Violate any applicable laws or regulations
              </li>
            </ul>
          </div>

          <div id="ip" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Intellectual Property</h2>
            <p className={styles.contentParagraph}>
              The WorthApply platform, including all software, designs, text,
              and other content, is owned by WorthApply and protected by
              intellectual property laws. You retain ownership of any content you
              submit to the platform, such as your evidence bank entries and
              personal information.
            </p>
          </div>

          <div id="subscriptions" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Subscriptions &amp; Billing</h2>
            <p className={styles.contentParagraph}>
              Paid subscriptions are billed in advance on a monthly or annual
              basis. You may cancel at any time, and your subscription will
              remain active until the end of the current billing period. Refunds
              are handled on a case-by-case basis.
            </p>
            <p className={styles.contentParagraph}>
              Free trial periods are available for Pro subscriptions. You will
              not be charged until the trial period ends unless you cancel
              beforehand.
            </p>
          </div>

          <div id="disclaimers" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Disclaimers</h2>
            <p className={styles.contentParagraph}>
              WorthApply provides tools and analysis to assist your job search,
              but does not guarantee employment outcomes. Our fit scores and
              recommendations are algorithmic assessments and should be used as
              one input in your decision-making process.
            </p>
            <p className={styles.contentParagraph}>
              The platform is provided &quot;as is&quot; without warranties of
              any kind, express or implied.
            </p>
          </div>

          <div id="limitation" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Limitation of Liability</h2>
            <p className={styles.contentParagraph}>
              To the fullest extent permitted by law, WorthApply shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the platform, including but not
              limited to loss of income, data, or opportunities.
            </p>
          </div>

          <div id="termination" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Termination</h2>
            <p className={styles.contentParagraph}>
              We may suspend or terminate your account at any time for violation
              of these Terms. Upon termination, your right to use the platform
              ceases immediately. You may request an export of your data before
              account deletion.
            </p>
          </div>

          <div id="governing-law" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Governing Law</h2>
            <p className={styles.contentParagraph}>
              These Terms are governed by the laws of the State of Delaware,
              without regard to its conflict of law provisions. Any disputes
              shall be resolved in the courts of Delaware.
            </p>
          </div>

          <div id="contact" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Contact Us</h2>
            <p className={styles.contentParagraph}>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@worthapply.com">legal@worthapply.com</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
