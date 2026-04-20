import type { Metadata } from 'next';
import { FadeUp, RevealOnScroll } from '@/components/ui/motion';
import ContactClient from './ContactClient';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | WorthApply',
  description: 'Get in touch with the WorthApply team. We\'re here to help with questions, feedback, or anything else.',
  alternates: {
    canonical: 'https://worthapply.com/contact',
  },
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBackdrop} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Contact Us</span>
          <h1>We&apos;d love to hear from you.</h1>
          <p>
            Have a question, a feature idea, or just want to say hello? Send us a message and
            we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <RevealOnScroll>
            <div className={styles.layout}>

              {/* Info sidebar */}
              <FadeUp>
                <div className={styles.infoCard}>
                  <h2>Let&apos;s talk</h2>
                  <p>
                    Whether you&apos;re a job seeker with feedback, a potential partner, or just curious —
                    we read every message.
                  </p>
                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <div className={styles.infoItemText}>
                        <strong>Email</strong>
                        <span>ZakE@worthapply.com</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div className={styles.infoItemText}>
                        <strong>Response time</strong>
                        <span>Usually within 1–2 business days</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className={styles.infoItemText}>
                        <strong>What to expect</strong>
                        <span>A real reply from a real person</span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>

              {/* Form card */}
              <FadeUp>
                <div className={styles.formCard}>
                  <h2 className={styles.formTitle}>Send a message</h2>
                  <ContactClient />
                </div>
              </FadeUp>

            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
