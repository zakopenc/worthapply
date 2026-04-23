'use client';

import { useState, FormEvent } from 'react';
import styles from './PartnersForm.module.css';

interface FormData {
  name: string;
  email: string;
  roleType: string;
  clientVolume: string;
  website: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  roleType?: string;
  clientVolume?: string;
  website?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Please enter a valid email address';
  if (!data.roleType) errors.roleType = 'Please select how you work with job seekers';
  if (!data.clientVolume) errors.clientVolume = 'Please select a client volume';
  if (data.website && !/^https?:\/\/.+/.test(data.website))
    errors.website = 'Please enter a valid URL starting with http:// or https://';
  return errors;
}

const ROLE_OPTIONS = [
  { value: '', label: 'Select one…' },
  { value: 'outplacement', label: 'Outplacement firm (LHH, Challenger Gray, MRA, etc.)' },
  { value: 'independent_coach', label: 'Independent career coach' },
  { value: 'executive_coach', label: 'Executive coach' },
  { value: 'university_career_center', label: 'University / college career center' },
  { value: 'hr_recruiter', label: 'HR professional / recruiter' },
  { value: 'other', label: 'Other' },
];

const VOLUME_OPTIONS = [
  { value: '', label: 'Select one…' },
  { value: '1-5', label: '1–5 clients / month' },
  { value: '6-20', label: '6–20 clients / month' },
  { value: '21-50', label: '21–50 clients / month' },
  { value: '50+', label: '50+ clients / month' },
];

const EMPTY: FormData = { name: '', email: '', roleType: '', clientVolume: '', website: '', notes: '' };

export default function PartnersClient() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState('');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setStatus('loading');
    setApiError('');

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          roleType: form.roleType,
          clientVolume: form.clientVolume,
          website: form.website.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm(EMPTY);
    } catch {
      setApiError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <strong>Application received!</strong>
          <p>
            We&apos;ll review it and send your personalized referral link and free Pro account
            within 24 hours. Check your inbox — a confirmation is on its way.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* Name */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="name">Your full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          value={form.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
        />
        {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
      </div>

      {/* Email */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="email">Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="jane@yourcoachingsite.com"
          value={form.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
        />
        {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
      </div>

      {/* Role type */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="roleType">How do you work with job seekers?</label>
        <select
          id="roleType"
          name="roleType"
          value={form.roleType}
          onChange={handleChange}
          className={`${styles.select} ${errors.roleType ? styles.inputError : ''}`}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === ''}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.roleType && <span className={styles.errorMsg}>{errors.roleType}</span>}
      </div>

      {/* Client volume */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="clientVolume">Roughly how many clients per month?</label>
        <select
          id="clientVolume"
          name="clientVolume"
          value={form.clientVolume}
          onChange={handleChange}
          className={`${styles.select} ${errors.clientVolume ? styles.inputError : ''}`}
        >
          {VOLUME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === ''}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.clientVolume && <span className={styles.errorMsg}>{errors.clientVolume}</span>}
      </div>

      {/* Website (optional) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="website">
          Your website{' '}
          <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="website"
          name="website"
          type="url"
          autoComplete="url"
          placeholder="https://yourcoachingsite.com"
          value={form.website}
          onChange={handleChange}
          className={`${styles.input} ${errors.website ? styles.inputError : ''}`}
        />
        {errors.website && <span className={styles.errorMsg}>{errors.website}</span>}
      </div>

      {/* Notes (optional) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="notes">
          Anything else we should know?{' '}
          <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="e.g. I run a cohort of 40 mid-career engineers per quarter…"
          value={form.notes}
          onChange={handleChange}
          className={styles.textarea}
        />
      </div>

      {apiError && (
        <div className={styles.apiError} role="alert">
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className={styles.submitBtn}
      >
        {status === 'loading' ? 'Sending…' : 'Get my referral link →'}
      </button>

      <p className={styles.formNote}>
        No spam, no sales calls. Just your link and a Pro account. Unsubscribe anytime.
      </p>
    </form>
  );
}
