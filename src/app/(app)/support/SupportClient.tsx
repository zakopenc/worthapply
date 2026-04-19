'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LifeBuoy, Loader2, Paperclip, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const BUCKET = 'support-attachments';

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
  const base = cleaned.slice(0, 80) || 'screenshot';
  return base.includes('.') ? base : `${base}.png`;
}

type Preview = { id: string; file: File; url: string };

export default function SupportClient() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    let message = '';
    setPreviews((prev) => {
      const next: Preview[] = [...prev];
      for (const file of Array.from(fileList)) {
        if (next.length >= MAX_FILES) {
          message = `You can add at most ${MAX_FILES} screenshots.`;
          break;
        }
        if (file.size === 0) continue;
        if (file.size > MAX_BYTES) {
          message = `"${file.name}" is too large (max 5MB per image).`;
          continue;
        }
        if (!file.type.startsWith('image/')) {
          message = `"${file.name}" is not an image.`;
          continue;
        }
        const url = URL.createObjectURL(file);
        next.push({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          url,
        });
      }
      return next;
    });
    if (message) setError(message);
    else setError('');
  }, []);

  const removePreview = useCallback((id: string) => {
    setPreviews((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((p) => p.id !== id);
    });
    setError('');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const s = subject.trim();
    const b = body.trim();
    if (!s || !b) {
      setError('Please add a subject and describe the issue.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be signed in to send a report.');
      setSubmitting(false);
      return;
    }

    const ticketId = crypto.randomUUID();
    const uploadedPaths: string[] = [];

    try {
      for (let i = 0; i < previews.length; i++) {
        const file = previews[i].file;
        const path = `${user.id}/${ticketId}/${i + 1}-${sanitizeFilename(file.name)}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          contentType: file.type || 'image/png',
          upsert: false,
        });
        if (upErr) {
          console.error(upErr);
          throw new Error('Upload failed. Check your connection and try again.');
        }
        uploadedPaths.push(path);
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          subject: s,
          body: b,
          attachment_paths: uploadedPaths,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (uploadedPaths.length > 0) {
          await supabase.storage.from(BUCKET).remove(uploadedPaths);
        }
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setSubject('');
      setBody('');
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
    } catch (err) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
      }
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[720px] mx-auto py-12 lg:py-16 px-6 lg:px-10">
      <header className="mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary/15 text-secondary mb-4">
          <LifeBuoy className="w-6 h-6" aria-hidden />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-on-surface mb-2">
          Help &amp; support
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed max-w-xl">
          Report a bug, ask a question, or send feedback. Add screenshots so we can reproduce the issue faster.
        </p>
      </header>

      {success && (
        <div className="mb-8 p-5 rounded-2xl bg-green-50 border border-green-200 text-green-900">
          <p className="font-semibold mb-1">Thanks — we received your message.</p>
          <p className="text-sm text-green-800/90">
            Our team will review it and follow up by email if needed. You can submit another report below anytime.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-3xl border border-outline-variant/20 p-6 md:p-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="support-subject" className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="support-subject"
                className="bg-surface-container-high border-none rounded-2xl p-4 text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none"
                placeholder="e.g. Error when saving an application"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                required
                autoComplete="off"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="support-body" className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                What happened? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="support-body"
                className="bg-surface-container-high border-none rounded-2xl p-4 min-h-[180px] text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none resize-y"
                placeholder="Steps to reproduce, what you expected, and any error messages you saw…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={10000}
                required
              />
              <p className="text-xs text-on-surface-variant ml-1">{body.length} / 10000</p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                Screenshots (optional)
              </span>
              <p className="text-sm text-on-surface-variant ml-1 -mt-1">
                PNG, JPEG, WebP, or GIF — up to {MAX_FILES} files, 5MB each.
              </p>

              <label className="flex flex-col items-center justify-center gap-2 px-6 py-10 rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/50 hover:border-secondary/40 hover:bg-surface-container-low transition-colors cursor-pointer">
                <input
                  type="file"
                  accept={ACCEPT}
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <Paperclip className="w-8 h-8 text-on-surface-variant" aria-hidden />
                <span className="text-sm font-semibold text-on-surface">Click to attach screenshots</span>
                <span className="text-xs text-on-surface-variant">
                  Images upload securely from your browser (up to 5MB each).
                </span>
              </label>

              {previews.length > 0 && (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {previews.map((p) => (
                    <li key={p.id} className="relative aspect-video rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container">
                      <Image src={p.url} alt="" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => removePreview(p.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        aria-label={`Remove ${p.file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1c1c1a] text-white text-sm font-bold hover:bg-[#1c1c1a]/90 disabled:opacity-60 disabled:pointer-events-none transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Submit report'
              )}
            </button>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors"
            >
              ← Back to dashboard
            </Link>
          </div>
        </section>
      </form>

      <p className="mt-10 text-sm text-on-surface-variant text-center">
        Prefer email?{' '}
        <a href="mailto:hello@worthapply.com" className="font-semibold text-secondary hover:underline">
          hello@worthapply.com
        </a>
      </p>
    </div>
  );
}
