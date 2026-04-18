'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Briefcase,
  CaretDown,
  ClipboardText,
  FileMagnifyingGlass,
  List,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import DarkModeToggle from '@/components/DarkModeToggle';
import styles from './MarketingNav.module.css';

const productLinks = [
  {
    href: '/features',
    title: 'Job-fit analysis',
    description: 'Understand fit, missing evidence, and what matters before you tailor.',
    icon: FileMagnifyingGlass,
  },
  {
    href: '/features',
    title: 'Resume tailoring',
    description: 'Generate sharper, role-specific edits grounded in your real experience.',
    icon: Sparkle,
  },
  {
    href: '/features',
    title: 'Application tracking',
    description: 'Keep every role, follow-up, and next step organized in one workflow.',
    icon: ClipboardText,
  },
  {
    href: '/pricing',
    title: 'Plans',
    description: 'Choose the workflow depth and application volume that fits your search.',
    icon: Briefcase,
  },
];

export default function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setProductOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <div className={`${styles.shell} ${isScrolled ? styles.shellScrolled : ''}`}>
        <Link href="/" className={styles.brand} aria-label="WorthApply home">
          <span className={styles.brandMark}>
            <Image src="/logo.png" alt="WorthApply" width={1080} height={1080} priority />
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          <div
            className={styles.productMenu}
            onMouseEnter={() => setProductOpen(true)}
            onMouseLeave={() => setProductOpen(false)}
          >
            <button
              type="button"
              className={styles.navButton}
              aria-expanded={productOpen}
              onClick={() => setProductOpen((value) => !value)}
            >
              Product
              <CaretDown size={16} className={`${styles.chevron} ${productOpen ? styles.chevronOpen : ''}`} weight="bold" />
            </button>

            <div className={`${styles.dropdown} ${productOpen ? styles.dropdownOpen : ''}`}>
              <div className={styles.dropdownLead}>
                <span className={styles.kicker}>Why people switch</span>
                <h3>Better applications with less wasted effort.</h3>
                <p>
                  WorthApply helps job seekers analyze fit, tailor with real evidence, and keep
                  every application moving in one clean workflow.
                </p>
                <Link href="/signup" className={styles.dropdownCta}>
                  Analyze a job for free
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>

              <div className={styles.dropdownGrid}>
                {productLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <Link key={`${link.href}-${link.title}`} href={link.href} className={styles.dropdownItem} onClick={() => setProductOpen(false)} style={{ transitionDelay: `${index * 36}ms` }}>
                      <span className={styles.dropdownIcon}>
                        <Icon size={18} />
                      </span>
                      <div>
                        <strong>{link.title}</strong>
                        <p>{link.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <Link href="/features" className={styles.navLink}>Features</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/compare" className={styles.navLink}>Compare</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
        </nav>

        <div className={styles.desktopActions}>
          <DarkModeToggle />
          <Link href="/login" className={styles.signIn}>Sign in</Link>
          <Link href="/signup" className={styles.primaryCta}>Get started</Link>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X size={20} weight="fill" /> : <List size={20} weight="bold" />}
        </button>
      </div>

      <div className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ''}`}>
        <div className={styles.mobileNav}>
          <Link href="/features" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/compare" onClick={() => setMobileOpen(false)}>Compare</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
        </div>
        <div className={styles.mobileActions}>
          <Link href="/login" className={styles.signIn} onClick={() => setMobileOpen(false)}>Sign in</Link>
          <Link href="/signup" className={styles.primaryCta} onClick={() => setMobileOpen(false)}>Get started</Link>
        </div>
      </div>
    </header>
  );
}
