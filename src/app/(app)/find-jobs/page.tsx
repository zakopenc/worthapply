'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url: string;
  postedDate: string;
  experienceLevel?: string;
  jobType?: string;
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState<LinkedInJob[]>([]);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userPlan, setUserPlan] = useState('free');
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [teaserJobs, setTeaserJobs] = useState<LinkedInJob[]>([]);
  const [usage, setUsage] = useState({ used: 0, limit: 0 });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, plan')
        .eq('id', user.id)
        .single();
      if (profile) {
        setUserPlan(profile.plan || 'free');
      }
    }
  }

  async function handleScrapeJobs(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setUpgradeRequired(false);

    try {
      const response = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywords || undefined,
          location: location || undefined,
          maxResults: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgrade_required) {
          setUpgradeRequired(true);
          setTeaserJobs(data.teaser || []);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to scrape jobs');
        }
        setLoading(false);
        return;
      }

      setJobs(data.jobs);
      setUsage(data.usage);
      setSuccess(`Found ${data.jobs.length} jobs matching your profile!`);
    } catch (err) {
      setError((err as Error).message || 'Failed to scrape jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeJob(job: LinkedInJob) {
    // Redirect to analyzer with job info pre-filled
    const params = new URLSearchParams({
      title: job.title,
      company: job.company,
      description: job.description,
    });
    window.location.href = `/analyzer?${params.toString()}`;
  }

  const isPro = userPlan === 'pro' || userPlan === 'lifetime';

  return (
    <>
      <div className="max-w-[1200px] mx-auto py-20 px-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tight text-on-surface mb-4">
            🔍 Find Jobs
          </h1>
          <p className="text-xl text-on-surface/60 max-w-2xl leading-relaxed">
            AI-powered job discovery based on your resume. Find the best matches on LinkedIn automatically.
          </p>
          {isPro && usage.limit > 0 && (
            <div className="mt-4 inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              {usage.used}/{usage.limit} searches used this month
            </div>
          )}
        </header>

        {/* Error/Success Messages */}
        {error && !upgradeRequired && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error rounded-xl">
            <p className="text-error font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleScrapeJobs}>
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm mb-12">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                    Keywords (optional)
                  </label>
                  <input
                    className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                    placeholder="Leave blank to auto-generate from resume"
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="text-sm text-on-surface/60 ml-1">
                    Example: &quot;Software Engineer React Python&quot;
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-secondary ml-1">
                    Location (optional)
                  </label>
                  <input
                    className="bg-surface-container-high border-none rounded-2xl p-4 focus:bg-surface-container-lowest focus:ring-1 focus:ring-secondary/20 transition-all"
                    placeholder="Auto-detected from resume"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-sm text-on-surface/60 ml-1">
                    Example: &quot;San Francisco, CA&quot; or &quot;Remote&quot;
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-[24px]">
                    auto_awesome
                  </span>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">AI-Powered Search</h4>
                    <p className="text-sm text-blue-700">
                      Leave fields empty and we&apos;ll automatically generate the perfect search based on your resume, skills, and experience level.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center text-lg py-4"
                icon={
                  loading ? undefined : (
                    <span className="material-symbols-outlined text-[20px]">
                      search
                    </span>
                  )
                }
                iconPosition="left"
                disabled={loading}
              >
                {loading ? 'Scraping LinkedIn...' : 'Find Jobs on LinkedIn'}
              </Button>
            </div>
          </section>
        </form>

        {/* Upgrade Gate for Free Users */}
        {upgradeRequired && teaserJobs.length > 0 && (
          <div className="relative mb-12">
            <div className="blur-sm opacity-50 pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teaserJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm"
                  >
                    <h3 className="font-bold text-lg mb-2">{job.title}</h3>
                    <p className="text-on-surface/60 mb-4">{job.company}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md">
                <span className="material-symbols-outlined text-[64px] text-secondary mb-4">
                  lock
                </span>
                <h3 className="text-3xl font-black text-on-surface mb-4">
                  Upgrade to Pro
                </h3>
                <p className="text-on-surface/60 mb-6 text-lg">
                  Unlock AI-powered job discovery and see all 47 matching jobs from LinkedIn
                </p>
                <Button
                  variant="primary"
                  className="w-full justify-center text-lg py-4 mb-3"
                  onClick={() => (window.location.href = '/pricing')}
                  icon={
                    <span className="material-symbols-outlined text-[20px]">
                      upgrade
                    </span>
                  }
                  iconPosition="left"
                >
                  Upgrade Now - $19.99/month
                </Button>
                <p className="text-sm text-on-surface/40">
                  Cancel anytime • 10 searches per month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Job Results */}
        {jobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-on-surface">
                {jobs.length} Jobs Found
              </h2>
              <div className="text-sm text-on-surface/60">
                Scraped from LinkedIn
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-on-surface mb-1">
                        {job.title}
                      </h3>
                      <p className="text-on-surface/60 font-medium mb-2">
                        {job.company}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-on-surface/50">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            location_on
                          </span>
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                              payments
                            </span>
                            {job.salary}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface/70 mb-4 line-clamp-3">
                    {job.description}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleAnalyzeJob(job)}
                      icon={
                        <span className="material-symbols-outlined text-[18px]">
                          analytics
                        </span>
                      }
                      iconPosition="left"
                    >
                      Analyze Fit
                    </Button>
                    {job.url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(job.url, '_blank')}
                        icon={
                          <span className="material-symbols-outlined text-[18px]">
                            open_in_new
                          </span>
                        }
                        iconPosition="left"
                      >
                        View
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-outline-variant/10 text-xs text-on-surface/40">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {jobs.length === 0 && !loading && !upgradeRequired && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[80px] text-on-surface/20 mb-4">
              work
            </span>
            <h3 className="text-2xl font-bold text-on-surface mb-2">
              Discover Your Perfect Jobs
            </h3>
            <p className="text-on-surface/60 mb-6 max-w-md mx-auto">
              Our AI will search LinkedIn for jobs that match your resume, skills, and experience level automatically.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-on-surface/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-green-600">
                  check_circle
                </span>
                AI-Powered Search
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-green-600">
                  check_circle
                </span>
                Resume-Based Matching
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-green-600">
                  check_circle
                </span>
                One-Click Analysis
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
