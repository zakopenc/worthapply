import React from 'react';
import { cn } from '@/lib/utils';
import styles from './LoadingSkeleton.module.css';

export interface LoadingSkeletonProps {
  variant?: 'card' | 'table-row' | 'score-ring' | 'text';
  count?: number;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={cn(styles.bone, styles.boneHeader)} />
      <div className={cn(styles.bone, styles.boneLine)} />
      <div className={cn(styles.bone, styles.boneLineShort)} />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className={styles.tableRow}>
      <div className={cn(styles.bone, styles.boneCell)} />
      <div className={cn(styles.bone, styles.boneCellWide)} />
      <div className={cn(styles.bone, styles.boneCell)} />
      <div className={cn(styles.bone, styles.boneCell)} />
    </div>
  );
}

function SkeletonScoreRing() {
  return <div className={cn(styles.bone, styles.boneRing)} />;
}

function SkeletonText() {
  return (
    <div className={styles.textBlock}>
      <div className={cn(styles.bone, styles.boneLine)} />
      <div className={cn(styles.bone, styles.boneLineShort)} />
    </div>
  );
}

const variantMap = {
  card: SkeletonCard,
  'table-row': SkeletonTableRow,
  'score-ring': SkeletonScoreRing,
  text: SkeletonText,
};

export function LoadingSkeleton({
  variant = 'card',
  count = 1,
  className,
}: LoadingSkeletonProps) {
  const Component = variantMap[variant];

  return (
    <div className={cn(styles.container, className)}>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
