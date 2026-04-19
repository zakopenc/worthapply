'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../support.module.css';

export function TicketStatusActions({
  ticketId,
  status,
}: {
  ticketId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function setStatus(next: 'open' | 'closed') {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: 'err', text: typeof data.error === 'string' ? data.error : 'Update failed' });
        return;
      }
      setMessage({ type: 'ok', text: next === 'closed' ? 'Marked as closed.' : 'Reopened.' });
      router.refresh();
    } catch {
      setMessage({ type: 'err', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.actions}>
      {status === 'open' ? (
        <button type="button" className={styles.closeBtn} disabled={loading} onClick={() => setStatus('closed')}>
          {loading ? 'Saving…' : 'Mark as closed'}
        </button>
      ) : (
        <button type="button" className={styles.closeBtn} disabled={loading} onClick={() => setStatus('open')}>
          {loading ? 'Saving…' : 'Reopen ticket'}
        </button>
      )}
      {message && (
        <span className={`${styles.msg} ${message.type === 'ok' ? styles.msgOk : styles.msgErr}`}>{message.text}</span>
      )}
    </div>
  );
}
