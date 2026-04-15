'use client';

import { useState } from 'react';
import styles from '../ops.module.css';

export function RetryButton({ resumeId }: { resumeId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleRetry() {
    if (!confirm('Retry extraction for this resume?')) return;
    setState('loading');
    try {
      const res = await fetch(`/api/admin/ops/retry-resume/${resumeId}`, { method: 'POST' });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done')  return <span style={{ color: '#16a34a', fontSize: 13 }}>Queued ✓</span>;
  if (state === 'error') return <span style={{ color: '#dc2626', fontSize: 13 }}>Failed</span>;

  return (
    <button
      onClick={handleRetry}
      disabled={state === 'loading'}
      className={styles.retryBtn}
    >
      {state === 'loading' ? '…' : 'Retry'}
    </button>
  );
}
