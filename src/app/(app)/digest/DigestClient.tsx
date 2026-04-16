'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import styles from './digest.module.css';

interface DigestMatch {
  id: string;
  job_title: string;
  company: string;
  location: string;
  location_type: 'remote' | 'hybrid' | 'onsite';
  salary: string | null;
  overall_score: number;
  verdict: 'apply' | 'low-priority' | 'skip';
  matched_keywords: string[];
  bookmarked: boolean;
}

interface DigestClientProps {
  matches: DigestMatch[];
  plan: string;
  summary: {
    total: number;
    strongFits: number;
    remoteFriendly: number;
    avgScore: number;
  };
}

const LOCATION_TYPES = ['all', 'remote', 'hybrid', 'onsite'] as const;

function getScoreColor(score: number) {
  if (score >= 70) return 'var(--color-accent-dark)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function getVerdictLabel(verdict: DigestMatch['verdict']) {
  if (verdict === 'apply') return 'Strong fit';
  if (verdict === 'low-priority') return 'Selective fit';
  return 'Low fit';
}

function getVerdictClass(verdict: DigestMatch['verdict']) {
  if (verdict === 'apply') return styles.verdictApply;
  if (verdict === 'low-priority') return styles.verdictLowPriority;
  return styles.verdictSkip;
}

function labelLocationType(type: DigestMatch['location_type']) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function DigestClient({ matches, plan, summary }: DigestClientProps) {
  const [filter, setFilter] = useState<string>('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(matches.filter((m) => m.bookmarked).map((m) => m.id))
  );

  const isFree = plan === 'free';

  const filtered = useMemo(
    () => (filter === 'all' ? matches : matches.filter((m) => m.location_type === filter)),
    [filter, matches]
  );

  const toggleBookmark = async (id: string) => {
    const next = new Set(bookmarks);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setBookmarks(next);
    await fetch(`/api/digest/${id}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: next.has(id) }),
    });
  };

  const hero = (
    <section className={styles.heroCard}>
      <div>
        <h1 className={styles.heroTitle}>Daily Digest</h1>
        <p className={styles.heroSubtitle}>Today&apos;s strongest matches, ranked for action.</p>
        <p className={styles.heroText}>
          Review the roles most aligned to your background, preferences, and search direction. Bookmark anything worth revisiting, then move the highest-signal roles into the analyzer.
        </p>

        <div className={styles.heroHighlights}>
          <div className={styles.highlightItem}><Target size={16} /> {summary.strongFits} strong-fit roles</div>
          <div className={styles.highlightItem}><MapPin size={16} /> {summary.remoteFriendly} remote opportunities</div>
          <div className={styles.highlightItem}><TrendingUp size={16} /> {summary.avgScore ? `${summary.avgScore}% avg fit` : 'No scores yet'}</div>
        </div>
      </div>

      <div className={styles.heroActions}>
        <Link href="/analyzer" className={styles.primaryAction}>
          <Search size={16} /> Analyze a role
        </Link>
        <Link href="/tracker" className={styles.secondaryAction}>
          <BriefcaseBusiness size={16} /> Open tracker
        </Link>
      </div>
    </section>
  );

  const metrics = (
    <section className={styles.metricsGrid}>
      <article className={styles.metricCard}>
        <span className={styles.metricLabel}>Today’s matches</span>
        <strong className={styles.metricValue}>{summary.total}</strong>
        <p className={styles.metricText}>Fresh roles curated from your current targeting profile.</p>
      </article>
      <article className={styles.metricCard}>
        <span className={styles.metricLabel}>Strong fits</span>
        <strong className={styles.metricValue}>{summary.strongFits}</strong>
        <p className={styles.metricText}>Opportunities worth prioritizing before lower-signal applications.</p>
      </article>
      <article className={styles.metricCard}>
        <span className={styles.metricLabel}>Remote friendly</span>
        <strong className={styles.metricValue}>{summary.remoteFriendly}</strong>
        <p className={styles.metricText}>Roles that align with remote-first search preferences.</p>
      </article>
      <article className={styles.metricCard}>
        <span className={styles.metricLabel}>Average fit</span>
        <strong className={styles.metricValue}>{summary.avgScore ? `${summary.avgScore}%` : '--'}</strong>
        <p className={styles.metricText}>A quick read on how strong today’s overall digest looks.</p>
      </article>
    </section>
  );

  const filterBar = (
    <section className={styles.filterCard}>
      <div className={styles.filterHeader}>
        <div>
          <div className={styles.sectionEyebrow}>Refine the list</div>
          <h2 className={styles.sectionTitle}>Filter by work style</h2>
        </div>
        <div className={styles.filterMeta}><Filter size={16} /> {filtered.length} visible</div>
      </div>

      <div className={styles.filterBar}>
        {LOCATION_TYPES.map((type) => (
          <button
            key={type}
            className={`${styles.pill} ${filter === type ? styles.pillActive : ''}`}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'All matches' : labelLocationType(type)}
          </button>
        ))}
      </div>
    </section>
  );

  const cards = filtered.length === 0 ? (
    <div className={styles.emptyState}>
      <Sparkles size={56} className={styles.emptyIcon} />
      <div className={styles.emptyTitle}>No matches in this filter</div>
      <div className={styles.emptyDesc}>
        Try another work-style view or check back tomorrow after WorthApply refreshes your digest.
      </div>
    </div>
  ) : (
    <div className={styles.cardGrid}>
      {filtered.map((match) => {
        const isBookmarked = bookmarks.has(match.id);
        return (
          <article key={match.id} className={styles.card}>
            <button
              className={`${styles.bookmarkBtn} ${isBookmarked ? styles.bookmarkActive : ''}`}
              onClick={() => toggleBookmark(match.id)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>

            <div className={styles.cardTop}>
              <div className={styles.companyLogo}>{match.company.charAt(0)}</div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>{match.job_title}</div>
                <div className={styles.cardCompany}>{match.company}</div>
              </div>
            </div>

            <div className={styles.cardMeta}>
              <span className={styles.locationBadge}><MapPin size={12} /> {match.location}</span>
              <span className={styles.locationBadge}>{labelLocationType(match.location_type)}</span>
              {match.salary ? <span className={styles.salary}>{match.salary}</span> : null}
            </div>

            <div className={styles.cardScoreRow}>
              <div className={styles.scoreBox}>
                <strong style={{ color: getScoreColor(match.overall_score) }}>{match.overall_score}%</strong>
                <span>Fit score</span>
              </div>
              <span className={`${styles.verdictBadge} ${getVerdictClass(match.verdict)}`}>
                {getVerdictLabel(match.verdict)}
              </span>
            </div>

            {match.matched_keywords?.length > 0 ? (
              <div className={styles.tags}>
                {match.matched_keywords.slice(0, 5).map((kw, i) => (
                  <span key={`${match.id}-${i}`} className={styles.tag}>{kw}</span>
                ))}
              </div>
            ) : null}

            <div className={styles.cardFooter}>
              <Link href={`/analyzer?digest=${match.id}`} className={styles.analyzeLink}>
                <Search size={14} /> Analyze this role
              </Link>
              <span className={styles.inlineHint}>Use this when the fit is worth a closer read.</span>
            </div>
          </article>
        );
      })}
    </div>
  );

  const content = (
    <div className={styles.page}>
      {hero}
      {metrics}
      {filterBar}
      {cards}
    </div>
  );

  if (isFree) {
    return (
      <div className={styles.page}>
        {hero}
        <section className={styles.lockedSection}>
          <div className={styles.upgradeOverlayContent}>
            {metrics}
            {filterBar}
            {cards}
          </div>
          <div className={styles.upgradeCard}>
            <div className={styles.upgradeIcon}><Sparkles size={28} /></div>
            <div className={styles.upgradeTitle}>Unlock Daily Digest</div>
            <div className={styles.upgradeText}>
              Upgrade to Pro to see curated matches every day, bookmark the best opportunities, and focus your energy on the roles most worth pursuing.
            </div>
            <div className={styles.upgradeBenefits}>
              <span>Daily ranked matches</span>
              <span>Bookmark and review flow</span>
              <span>Faster shortlisting</span>
            </div>
            <Link href="/settings?tab=billing" className={styles.upgradeBtn}>
              Upgrade to Pro <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return content;
}
