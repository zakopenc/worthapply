'use client';

import { useState } from 'react';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Button } from '@/components/ui/Button';

interface AnalysisResult {
  overall_score: number;
  verdict: 'high-priority' | 'worth-applying' | 'low-priority' | 'poor-fit';
  matched_skills: Array<{ skill: string; evidence_from_resume: string }>;
  skill_gaps: Array<{ skill: string; impact: string; suggestion: string }>;
  seniority_analysis: {
    role_level: string;
    user_level: string;
    assessment: string;
  };
  domain_experience: {
    required_domains: string[];
    user_domains: string[];
    overlap: string[];
  };
  application_id?: string;
}

export default function AnalyzerPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          job_url: jobUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data);
      setSuccess('Analysis complete!');
    } catch (err) {
      setError((err as Error).message || 'Failed to analyze job. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveToApplications() {
    if (!results) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          company,
          job_description: jobDescription,
          job_url: jobUrl || undefined,
          status: 'wishlist',
          analysis: results,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess('Saved to applications!');
    } catch (err) {
      setError((err as Error).message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'high-priority':
        return 'text-green-600';
      case 'worth-applying':
        return 'text-blue-600';
      case 'low-priority':
        return 'text-yellow-600';
      case 'poor-fit':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'high-priority':
        return 'High Priority - Strong Match';
      case 'worth-applying':
        return 'Worth Applying';
      case 'low-priority':
        return 'Low Priority';
      case 'poor-fit':
        return 'Poor Fit';
      default:
        return verdict;
    }
  };

  return (
    <>
      <div className="max-w-[960px] mx-auto py-20 px-8">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-on-surface mb-4">
            Job fit analyzer
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl leading-relaxed">
            Paste a job description to see how well it matches your background
            and get tailored recommendations.
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

        {/* Analysis Input Card */}
        <form onSubmit={handleAnalyze}>
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                  Job title
                </label>
                <input
                  className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                  placeholder="e.g. Senior Product Designer"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                  Company
                </label>
                <input
                  className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                  placeholder="e.g. Acme Corp"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                Job URL (optional)
              </label>
              <input
                className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                placeholder="https://example.com/job/12345"
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                Job description
              </label>
              <textarea
                className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all resize-y min-h-[300px]"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center text-lg py-4"
              icon={
                loading ? undefined : (
                  <span className="material-symbols-outlined text-[20px]">
                    target
                  </span>
                )
              }
              iconPosition="left"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze fit'}
            </Button>
          </section>
        </form>

        {/* Analysis Results */}
        {results && (
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-black text-on-surface mb-2">
                  Analysis Results
                </h2>
                <p className={`text-lg font-semibold ${getVerdictColor(results.verdict)}`}>
                  {getVerdictLabel(results.verdict)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <CircularProgress value={results.overall_score} size="lg" />
                <div>
                  <div className="text-4xl font-black text-on-surface">
                    {results.overall_score}%
                  </div>
                  <div className="text-sm text-on-surface/60">Match Score</div>
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            {results.matched_skills && results.matched_skills.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                  <h4 className="text-lg font-bold text-on-surface">
                    Matched Strengths
                  </h4>
                </div>
                <ul className="space-y-3">
                  {results.matched_skills.slice(0, 5).map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-on-surface/60">•</span>
                      <div>
                        <strong>{skill.skill}</strong>
                        <p className="text-sm text-on-surface/60">
                          {skill.evidence_from_resume}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skill Gaps */}
            {results.skill_gaps && results.skill_gaps.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-yellow-600">
                    warning
                  </span>
                  <h4 className="text-lg font-bold text-on-surface">
                    Areas to Address
                  </h4>
                </div>
                <div className="space-y-4">
                  {results.skill_gaps.slice(0, 5).map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-surface-container-high rounded-xl"
                    >
                      <div className="font-semibold text-on-surface mb-1">
                        {gap.skill}
                      </div>
                      <p className="text-sm text-on-surface/60 mb-2">
                        Impact: {gap.impact}
                      </p>
                      <p className="text-sm text-on-surface/80">
                        💡 {gap.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seniority Analysis */}
            {results.seniority_analysis && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-on-surface mb-3">
                  Experience Level Match
                </h4>
                <div className="p-4 bg-surface-container-high rounded-xl">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-on-surface/60">Role Level</div>
                      <div className="font-semibold">{results.seniority_analysis.role_level}</div>
                    </div>
                    <div>
                      <div className="text-sm text-on-surface/60">Your Level</div>
                      <div className="font-semibold">{results.seniority_analysis.user_level}</div>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface/80">
                    {results.seniority_analysis.assessment}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <Button
                variant="primary"
                className="flex-1"
                icon={
                  <span className="material-symbols-outlined text-[20px]">
                    auto_fix_high
                  </span>
                }
                iconPosition="left"
                onClick={() => {
                  window.location.href = '/tailor';
                }}
              >
                Tailor resume for this role
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                icon={
                  <span className="material-symbols-outlined text-[20px]">
                    bookmark
                  </span>
                }
                iconPosition="left"
                onClick={handleSaveToApplications}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save to applications'}
              </Button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
