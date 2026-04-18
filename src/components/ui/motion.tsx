'use client';

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

// ─── Stagger container + item ────────────────────────────────────────
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0, 1] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.4, 0, 1] } },
};

export function StaggerGroup({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={{
        ...staggerContainer,
        show: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeIn} className={className}>
      {children}
    </motion.div>
  );
}

export function ScaleUp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={scaleUp} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Reveal on scroll (standalone, no parent needed) ─────────────────
export function RevealOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hover lift card ─────────────────────────────────────────────────
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className={`group ${className ?? ''}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Gradient border card ────────────────────────────────────────────
export function GradientCard({
  children,
  className,
  glowOnHover = false,
  highlighted = false,
}: {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={`group relative rounded-3xl p-px ${
        highlighted
          ? 'bg-gradient-to-br from-secondary via-secondary/60 to-primary'
          : 'bg-gradient-to-br from-outline-variant/30 via-transparent to-outline-variant/30 hover:from-secondary/40 hover:to-primary/40'
      } transition-all duration-500 ${glowOnHover ? 'hover:shadow-xl hover:shadow-secondary/10' : ''} ${className ?? ''}`}
    >
      <div className="h-full rounded-[calc(1.5rem-1px)] bg-surface-container-lowest p-6">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────
export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="relative group/tip inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover/tip:opacity-100 transition-all duration-200 px-3 py-1.5 bg-inverse-surface text-inverse-on-surface text-xs rounded-lg whitespace-nowrap shadow-lg scale-95 group-hover/tip:scale-100 z-50">
        {content}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface" />
      </span>
    </span>
  );
}

// ─── Animated Tabs ───────────────────────────────────────────────────
export function AnimatedTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
}) {
  return (
    <div className={`inline-flex gap-1 bg-surface-container rounded-xl p-1 ${className ?? ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className="relative px-5 py-2 text-sm font-semibold rounded-lg transition-colors duration-200"
        >
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative z-10 ${activeTab === tab ? 'text-on-surface' : 'text-on-surface-variant'}`}>
            {tab}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Animated counter ────────────────────────────────────────────────
export { default as CountUp } from 'react-countup';

// ─── Pulse badge ─────────────────────────────────────────────────────
export function PulseBadge({
  children,
  variant = 'success',
  className,
}: {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'brand';
  className?: string;
}) {
  const colors = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    brand: 'bg-gradient-to-r from-secondary to-primary text-white border-transparent',
  };

  const dotColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    brand: 'bg-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${colors[variant]} ${className ?? ''}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColors[variant]} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
      </span>
      {children}
    </span>
  );
}

// ─── Shimmer skeleton ────────────────────────────────────────────────
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl animate-shimmer bg-gradient-to-r from-surface-container via-surface-container-high to-surface-container bg-[length:200%_100%] ${className ?? ''}`}
    />
  );
}
