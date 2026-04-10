import { Metadata } from 'next';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How WorthApply collects, uses, and protects your personal information. Learn about data security, your rights, and our commitment to privacy.',
  alternates: {
    canonical: '/privacy',
  },
};

const sections = [
  { id: 'info-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'data-sharing', title: 'Data Sharing' },
  { id: 'data-storage', title: 'Data Storage & Security' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
];

export default function PrivacyPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
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
            WorthApply (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and safeguard your information when you use our
            platform.
          </p>

          <div id="info-we-collect" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Information We Collect</h2>
            <h3 className={styles.contentSubtitle}>Account Information</h3>
            <p className={styles.contentParagraph}>
              When you create an account, we collect your name, email address,
              and authentication credentials. If you sign in with Google, we
              receive your basic profile information from Google.
            </p>
            <h3 className={styles.contentSubtitle}>Usage Data</h3>
            <p className={styles.contentParagraph}>
              We collect information about how you interact with our platform,
              including job descriptions you analyze, evidence bank entries, and
              application tracking data.
            </p>
            <h3 className={styles.contentSubtitle}>Technical Data</h3>
            <p className={styles.contentParagraph}>
              We automatically collect device type, browser type, IP address,
              and general location data for analytics and security purposes.
            </p>
          </div>

          <div id="how-we-use" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>How We Use Your Information</h2>
            <p className={styles.contentParagraph}>
              We use your information to:
            </p>
            <ul className={styles.contentList}>
              <li className={styles.contentListItem}>Provide and improve our services</li>
              <li className={styles.contentListItem}>Analyze job descriptions against your profile</li>
              <li className={styles.contentListItem}>Generate tailored application materials</li>
              <li className={styles.contentListItem}>Send you daily digests and notifications you opt into</li>
              <li className={styles.contentListItem}>Detect and prevent fraud or abuse</li>
            </ul>
          </div>

          <div id="data-sharing" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Data Sharing</h2>
            <p className={styles.contentParagraph}>
              We do not sell your personal data. We may share data with trusted
              third-party service providers who assist us in operating our
              platform (e.g., hosting, analytics, payment processing), and only
              to the extent necessary for them to provide those services.
            </p>
          </div>

          <div id="data-storage" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Data Storage &amp; Security</h2>
            <p className={styles.contentParagraph}>
              Your data is stored on secure servers with encryption at rest and
              in transit. We implement industry-standard security measures
              including regular security audits, access controls, and monitoring.
            </p>
          </div>

          <div id="your-rights" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Your Rights</h2>
            <p className={styles.contentParagraph}>
              You have the right to access, correct, or delete your personal
              data at any time. You can export all your data from your account
              settings or request deletion by contacting our support team.
            </p>
          </div>

          <div id="cookies" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Cookies &amp; Tracking</h2>
            <p className={styles.contentParagraph}>
              We use essential cookies for authentication and session management.
              We use analytics cookies to understand how our platform is used.
              You can control cookie preferences through your browser settings.
            </p>
          </div>

          <div id="changes" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Changes to This Policy</h2>
            <p className={styles.contentParagraph}>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by email or through a prominent
              notice on our platform. Your continued use after changes
              constitutes acceptance of the updated policy.
            </p>
          </div>

          <div id="contact" className={styles.contentSection}>
            <h2 className={styles.contentTitle}>Contact Us</h2>
            <p className={styles.contentParagraph}>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at{' '}
              <a href="mailto:privacy@worthapply.com">privacy@worthapply.com</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
