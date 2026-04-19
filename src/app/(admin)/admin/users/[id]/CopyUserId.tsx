'use client';

import { useState } from 'react';
import styles from './page.module.css';

export function CopyUserId({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.copyIdRow}>
      <code className={styles.fullId}>{userId}</code>
      <button type="button" className={styles.copyBtn} onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
