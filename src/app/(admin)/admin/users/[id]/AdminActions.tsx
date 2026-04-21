'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type SelectablePlan = 'free' | 'pro' | 'premium';
type SubStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

function initialSelectablePlan(currentPlan: string): SelectablePlan {
  if (currentPlan === 'free' || currentPlan === 'pro' || currentPlan === 'premium') return currentPlan;
  // Legacy lifetime rows or unknown — default to premium.
  return 'premium';
}

interface AdminActionsProps {
  userId: string;
  currentPlan: string;
  currentStatus: string | null;
}

export function RepairPlanForm({ userId, currentPlan, currentStatus }: AdminActionsProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<SelectablePlan>(() => initialSelectablePlan(currentPlan));
  const [status, setStatus] = useState<SubStatus | ''>((currentStatus as SubStatus) || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const isLegacyLifetimeUser = currentPlan === 'lifetime';

  useEffect(() => {
    setPlan(initialSelectablePlan(currentPlan));
    setStatus((currentStatus as SubStatus) || '');
  }, [currentPlan, currentStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setResult({ ok: false, message: 'Reason is required.' });
      return;
    }
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
        router.refresh();
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.actionForm}>
      <h3 className={styles.actionTitle}>Repair plan</h3>
      <div className={styles.formRow}>
        <label className={styles.label}>Plan</label>
        {isLegacyLifetimeUser && (
          <p style={{ marginBottom: 8, fontSize: 13, color: '#57534e' }}>
            User is on a legacy <strong>lifetime</strong> record. The lifetime tier is discontinued — pick free, pro, or premium to replace it.
          </p>
        )}
        <select value={plan} onChange={e => setPlan(e.target.value as SelectablePlan)} className={styles.select}>
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="premium">premium</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>Subscription status</label>
        <select value={status} onChange={e => setStatus(e.target.value as SubStatus | '')} className={styles.select}>
          <option value="">— none / null —</option>
          <option value="active">active</option>
          <option value="trialing">trialing</option>
          <option value="past_due">past_due</option>
          <option value="canceled">canceled</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Reason <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Stripe webhook missed payment"
          className={styles.input}
          maxLength={300}
        />
      </div>
      {result && <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>}
      <button type="submit" disabled={loading} className={styles.actionBtn}>
        {loading ? 'Saving…' : 'Apply plan change'}
      </button>
    </form>
  );
}

interface ResetUsageProps {
  userId: string;
}

const RESOURCE_TYPES = [
  { value: 'analyses', label: 'Job analyses' },
  { value: 'tailoring', label: 'Resume tailoring' },
  { value: 'cover_letters', label: 'Cover letters' },
  { value: 'job_scrapes', label: 'LinkedIn searches' },
] as const;

type ResourceType = (typeof RESOURCE_TYPES)[number]['value'];

export function ResetUsageForm({ userId }: ResetUsageProps) {
  const router = useRouter();
  const [resource, setResource] = useState<ResourceType>('analyses');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setResult({ ok: false, message: 'Reason is required.' });
      return;
    }
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
        router.refresh();
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.actionForm}>
      <h3 className={styles.actionTitle}>Reset monthly usage</h3>
      <div className={styles.formRow}>
        <label className={styles.label}>Resource</label>
        <select value={resource} onChange={e => setResource(e.target.value as ResourceType)} className={styles.select}>
          {RESOURCE_TYPES.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Reason <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. User hit limit due to parsing errors"
          className={styles.input}
          maxLength={300}
        />
      </div>
      {result && <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>}
      <button type="submit" disabled={loading} className={styles.actionBtn}>
        {loading ? 'Resetting…' : 'Reset usage'}
      </button>
    </form>
  );
}

type AccountStatus = 'active' | 'flagged' | 'suspended';

interface AccountStatusProps {
  userId: string;
  currentStatus: string;
}

export function AccountStatusForm({ userId, currentStatus }: AccountStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AccountStatus>((currentStatus as AccountStatus) || 'active');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    setStatus((currentStatus as AccountStatus) || 'active');
  }, [currentStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setResult({ ok: false, message: 'Reason is required.' });
      return;
    }
    if (status === 'suspended' && !confirm(`Suspend this account? The user will not be able to access the app.\n\nReason: ${reason}`))
      return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/trust/set-account-status/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true, message: 'Account status updated.' } : { ok: false, message: data.error || 'Failed.' });
      if (res.ok) {
        setReason('');
        router.refresh();
      }
    } catch {
      setResult({ ok: false, message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.actionForm}>
      <h3 className={styles.actionTitle}>Account status</h3>
      <div className={styles.formRow}>
        <label className={styles.label}>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value as AccountStatus)} className={styles.select}>
          <option value="active">active — normal access</option>
          <option value="flagged">flagged — admin review note</option>
          <option value="suspended">suspended — blocked from app</option>
        </select>
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Reason <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Abusive usage pattern"
          className={styles.input}
          maxLength={300}
        />
      </div>
      {result && <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>}
      <button type="submit" disabled={loading} className={styles.actionBtn}>
        {loading ? 'Saving…' : 'Set status'}
      </button>
    </form>
  );
}

interface DeleteUserProps {
  userId: string;
  userEmail: string;
}

export function DeleteUserForm({ userId, userEmail }: DeleteUserProps) {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setResult({ ok: false, message: 'Reason is required.' });
      return;
    }
    if (!confirm(`PERMANENTLY DELETE this account and all data?\n\nThis cannot be undone.\n\nEmail: ${userEmail}\nReason: ${reason}`))
      return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/trust/delete-user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, confirm_email: confirmEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: 'User deleted. Redirecting…' });
        window.setTimeout(() => {
          window.location.href = '/admin/users';
        }, 1500);
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
    <form onSubmit={handleSubmit} className={styles.dangerForm}>
      <h3 className={styles.dangerFormTitle}>Delete account (GDPR)</h3>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Confirm user email <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          value={confirmEmail}
          onChange={e => setConfirmEmail(e.target.value)}
          placeholder={userEmail}
          className={styles.input}
        />
      </div>
      <div className={styles.formRow}>
        <label className={styles.label}>
          Reason <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. GDPR deletion request"
          className={styles.input}
          maxLength={300}
        />
      </div>
      {result && <p className={result.ok ? styles.successMsg : styles.errorMsg}>{result.message}</p>}
      <button
        type="submit"
        disabled={loading || confirmEmail.toLowerCase() !== userEmail.toLowerCase()}
        className={styles.deleteBtn}
      >
        {loading ? 'Deleting…' : 'Delete user permanently'}
      </button>
    </form>
  );
}
