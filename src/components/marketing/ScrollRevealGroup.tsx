'use client';

import type { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export default function ScrollRevealGroup({ children, className, threshold }: ScrollRevealGroupProps) {
  const ref = useScrollAnimation(threshold);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
