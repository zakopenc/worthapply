import React from 'react';
import { cn } from '@/lib/utils';
import styles from './VerdictBadge.module.css';

export interface VerdictBadgeProps {
  verdict: 'apply' | 'low-priority' | 'skip';
  size?: 'sm' | 'default';
  className?: string;
}

const verdictLabels: Record<VerdictBadgeProps['verdict'], string> = {
  apply: 'APPLY',
  'low-priority': 'LOW-PRIORITY',
  skip: 'SKIP',
};

export function VerdictBadge({ verdict, size = 'default', className }: VerdictBadgeProps) {
  return (
    <span
      className={cn(
        styles.badge,
        styles[verdict.replace('-', '') as 'apply' | 'lowpriority' | 'skip'],
        styles[`size-${size}`],
        className,
      )}
    >
      {verdictLabels[verdict]}
    </span>
  );
}
