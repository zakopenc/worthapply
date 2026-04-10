'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TailoredBullet {
  original: string;
  tailored: string;
  reason: string;
}

interface TailoringResult {
  tailored_summary?: string;
  tailored_bullets?: TailoredBullet[];
  reordered_skills?: string[];
  original_score: number;
  tailored_score: number;
}

export default function TailorPage() {
  const [analysisId, setAnalysisId] = useState('');
  const [results, setResults] = useState<TailoringResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function handleTailor(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Tailoring failed');
      }

      const data = await response.json();
      setResults(data);
      setSuccess('Resume tailored successfully!');
    } catch (err) {
      setError((err as Error).message || 'Failed to tailor resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-[960px] mx-auto py-20 px-8">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-on-surface mb-4">
            Resume tailoring
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl leading-relaxed">
            Tailor your resume to match specific job requirements using AI-powered
            optimization.
          </p>
        </header>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error rounded-xl">
            <p className="text-error font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Tailoring Input Card */}
        <form onSubmit={handleTailor}>
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm mb-12">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                  Analysis ID
                </label>
                <input
                  className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                  placeholder="Enter analysis ID from your job analysis"
                  type="text"
                  value={analysisId}
                  onChange={(e) => setAnalysisId(e.target.value)}
                  required
                />
                <p className="text-sm text-on-surface/60 ml-1">
                  Get this from the analyzer page after analyzing a job
                </p>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center text-lg py-4"
              icon={
                loading ? undefined : (
                  <span className="material-symbols-outlined text-[20px]">
                    auto_fix_high
                  </span>
                )
              }
              iconPosition="left"
              disabled={loading}
            >
              {loading ? 'Tailoring resume...' : 'Tailor resume'}
            </Button>
          </section>
        </form>

        {/* Tailoring Results */}
        {results && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6 mb-10">
              <h2 className="text-3xl font-black text-on-surface">
                Tailored Resume
              </h2>
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-on-surface">
                    {results.original_score}%
                  </div>
                  <div className="text-sm text-on-surface/60">Original</div>
                </div>
                <span className="text-2xl text-on-surface/20">→</span>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-600">
                    {results.tailored_score}%
                  </div>
                  <div className="text-sm text-on-surface/60">Tailored</div>
                </div>
              </div>
            </div>

            {/* Tailored Summary */}
            {results.tailored_summary && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-on-surface mb-3">
                  Tailored Summary
                </h4>
                <div className="p-5 bg-surface-container-high rounded-xl">
                  <p className="text-on-surface leading-relaxed">
                    {results.tailored_summary}
                  </p>
                </div>
              </div>
            )}

            {/* Tailored Bullets */}
            {results.tailored_bullets && results.tailored_bullets.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-on-surface mb-4">
                  Tailored Experience Bullets
                </h4>
                <div className="space-y-4">
                  {results.tailored_bullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-surface-container-high rounded-xl"
                    >
                      <div className="mb-3">
                        <div className="text-xs font-bold uppercase tracking-widest text-on-surface/40 mb-1">
                          Original
                        </div>
                        <p className="text-on-surface/60 line-through">
                          {bullet.original}
                        </p>
                      </div>
                      <div className="mb-3">
                        <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">
                          Tailored
                        </div>
                        <p className="text-on-surface font-medium">
                          {bullet.tailored}
                        </p>
                      </div>
                      <div className="flex items-start gap-2 pt-3 border-t border-outline-variant/10">
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          lightbulb
                        </span>
                        <p className="text-sm text-on-surface/70">
                          {bullet.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reordered Skills */}
            {results.reordered_skills && results.reordered_skills.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-on-surface mb-3">
                  Reordered Skills (Priority First)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.reordered_skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-secondary/10 text-secondary rounded-full font-semibold text-sm"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Button */}
            <div className="mt-10 pt-8 border-t border-outline-variant/10">
              <Button
                variant="primary"
                className="w-full justify-center"
                icon={
                  <span className="material-symbols-outlined text-[20px]">
                    download
                  </span>
                }
                iconPosition="left"
                onClick={() => {
                  alert('Export functionality coming soon!');
                }}
              >
                Export tailored resume
              </Button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
