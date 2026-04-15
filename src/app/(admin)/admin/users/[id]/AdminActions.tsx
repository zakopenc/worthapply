'use client';

import { useState } from 'react';
import styles from './page.module.css';

type Plan = 'free' | 'pro' | 'premium' | 'lifetime';
type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

interface AdminActionsProps {
  userId: string;
  currentPlan: string;
  currentStatus: string | null;
}

export function RepairPlanForm({ userId, currentPlan, currentStatus }: AdminActionsProps) {
  const [plan, setPlan] = useState<Plan>(currentPlan as Plan || 'free');
  const [status, setStatus] = useState<SubStatus | ''>(currentStatus as SubStatus || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) { setResult({ ok: false, message: 'Reason is required.' }); return; }
    if (!confirm(`Set plan to "${plan}" (status: ${status || 'null'}) for this user?\n\nReason: ${reason}`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/repair-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, subscription_status: status || null, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Request failed.' });
      } else {
        setResult({ ok: true, message: 'Plan updated successfully.' });
        setReason('');
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.actionForm}>
      <h3 className={styles.actionTitle}>Repair Plan</h3>
      <div className={styles.formRow}>
        <label className={styles.label}>Plan</label>
        <select value={plan} onChange={e => setPlan(e.target.value as Plan)} className={styles.select}>
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="premium">premium</option>
          <option value="lifetime">lifetime</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Subscription Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as SubStatus | '')} className={styles.select}>
          <option value="">— none / null —</option>
          <option value="active">active</option>
          <option value="trialing">trialing</option>
          <option value="past_due">past_due</option>
          <option value="canceled">canceled</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Reason <span className={styles.required}>*</span></label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Stripe webhook missed payment"
          className={styles.input}
          maxLength={300}
        />
      </div>
      {result && (
        <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>
      )}
      <button type="submit" disabled={loading} className={styles.actionBtn}>
        {loading ? 'Saving…' : 'Apply Plan Change'}
      </button>
    </form>
  );
}

interface ResetUsageProps {
  userId: string;
}

const RESOURCE_TYPES = [
  { value: 'analyses',      label: 'Job Analyses' },
  { value: 'tailoring',     label: 'Resume Tailoring' },
  { value: 'cover_letters', label: 'Cover Letters' },
  { value: 'job_scrapes',   label: 'LinkedIn Searches' },
] as const;

type ResourceType = typeof RESOURCE_TYPES[number]['value'];

export function ResetUsageForm({ userId }: ResetUsageProps) {
  const [resource, setResource] = useState<ResourceType>('analyses');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) { setResult({ ok: false, message: 'Reason is required.' }); return; }
    if (!confirm(`Reset "${resource}" usage for this user this month?\n\nReason: ${reason}`)) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource_type: resource, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Request failed.' });
      } else {
        setResult({ ok: true, message: `Usage for "${resource}" reset to 0.` });
        setReason('');
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.actionForm}>
      <h3 className={styles.actionTitle}>Reset Monthly Usage</h3>
      <div className={styles.formRow}>
        <label className={styles.label}>Resource</label>
        <select value={resource} onChange={e => setResource(e.target.value as ResourceType)} className={styles.select}>
          {RESOURCE_TYPES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Reason <span className={styles.required}>*</span></label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. User hit limit due to parsing errors"
          className={styles.input}
          maxLength={300}
        />
      </div>
      {result && (
        <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>
      )}
      <button type="submit" disabled={loading} className={styles.actionBtn}>
        {loading ? 'Resetting…' : 'Reset Usage'}
      </button>
    </form>
  );
}
