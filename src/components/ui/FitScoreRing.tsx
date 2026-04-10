'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './FitScoreRing.module.css';

// Helper function for score colors
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  return '#ef4444'; // red
}

export interface FitScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { dim: 48, stroke: 4, fontSize: 14 },
  md: { dim: 72, stroke: 4, fontSize: 20 },
  lg: { dim: 96, stroke: 4, fontSize: 28 },
};

export function FitScoreRing({
  score,
  size = 'md',
  showLabel = true,
  className,
}: FitScoreRingProps) {
  const [mounted, setMounted] = useState(false);
  const { dim, stroke, fontSize } = sizeMap[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = getScoreColor(clampedScore);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={cn(styles.container, className)}
      style={{ width: dim, height: dim }}
      role="img"
      aria-label={`Fit score: ${clampedScore}%`}
    >
      <svg width={dim} height={dim} className={styles.svg}>
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          className={styles.progress}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
      </svg>
      {showLabel && (
        <span
          className={styles.label}
          style={{ fontSize, color }}
        >
          {clampedScore}
        </span>
      )}
    </div>
  );
}
