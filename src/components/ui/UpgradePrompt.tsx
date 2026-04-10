import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import styles from './UpgradePrompt.module.css';

export interface UpgradePromptProps {
  feature: string;
  className?: string;
}

export function UpgradePrompt({ feature, className }: UpgradePromptProps) {
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.iconWrapper}>
        <Lock size={24} strokeWidth={1.5} />
      </div>
      <h4 className={styles.title}>Upgrade to Pro</h4>
      <p className={styles.description}>
        {feature} is available on the Pro plan. Upgrade to unlock the full
        WorthApply experience.
      </p>
      <Link href="/pricing">
        <Button variant="primary" size="md">
          View Plans
        </Button>
      </Link>
    </div>
  );
}
