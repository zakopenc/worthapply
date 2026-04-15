'use client';

import { useState } from 'react';
import styles from '../trust.module.css';

export function NewPrivacyRequestForm() {
  const [email, setEmail]   = useState('');
  const [type, setType]     = useState<'delete' | 'export'>('delete');
  const [notes, setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/trust/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, type, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: 'Request created.' });
        setEmail(''); setNotes('');
      } else {
        setResult({ ok: false, message: data.error || 'Failed.' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <p className={styles.formTitle}>Log New Privacy Request</p>
      <div className={styles.formRow}>
        <label className={styles.label}>User email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} placeholder="user@example.com" />
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Request type</label>
        <select value={type} onChange={e => setType(e.target.value as 'delete' | 'export')} className={styles.select}>
          <option value="delete">Delete — erase all data</option>
          <option value="export">Export — send data copy</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Notes</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={styles.input} placeholder="e.g. emailed support on Apr 14" maxLength={500} />
      </div>
      {result && <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>}
      <button type="submit" disabled={loading} className={styles.btn}>
        {loading ? 'Creating…' : 'Create Request'}
      </button>
    </form>
  );
}

export function ProcessButton({ requestId, resolution }: { requestId: string; resolution: 'complete' | 'rejected' }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  async function handle() {
    if (!confirm(`Mark this request as "${resolution}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trust/privacy/${requestId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span style={{ fontSize: 13, color: '#16a34a' }}>Done ✓</span>;

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={styles.processBtn}
      style={{
        background: resolution === 'complete' ? '#1a1a2e' : '#f0f0f0',
        color: resolution === 'complete' ? '#fff' : '#555',
        marginRight: 6,
      }}
    >
      {loading ? '…' : resolution === 'complete' ? 'Complete' : 'Reject'}
    </button>
  );
}
