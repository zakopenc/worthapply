import { createClient } from '@/lib/supabase/server';
import { getPlanLimits, isPaidPlan, getEffectivePlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { CURRENT_MONTH, reserveMonthlyUsage } from '@/lib/usage-tracking';
import { checkRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

const scrapeJobsSchema = z.object({
  keywords: z.string().trim().min(1).max(200).optional(),
  location: z.string().trim().max(200).optional(),
  experienceLevel: z.array(z.string()).max(5).optional(),
  jobType: z.array(z.string()).max(5).optional(),
});

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

interface SearchCriteria {
  keywords: string;
  location: string;
  experienceLevel?: string[];
  jobType?: string[];
  maxResults: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = scrapeJobsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }
    const { keywords, location, experienceLevel, jobType } = parsed.data;

    const currentMonth = CURRENT_MONTH();

    // Get user profile and plan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json({ error: 'Failed to load plan details' }, { status: 500 });
    }

    const rawPlan = (profile?.plan || 'free') as Plan;
    const plan = getEffectivePlan(rawPlan, profile?.subscription_status);
    const limits = getPlanLimits(plan);
    const hasScrapeAccess = isPaidPlan(plan);

    // Check usage limits based on plan
    const usageLimit = limits.job_searches_per_month; // Free: 0, Pro: 10, Premium: 20

    if (!hasScrapeAccess) {
      return NextResponse.json(
        {
          error: 'This feature requires a Pro plan',
          upgrade_required: true,
          plan,
          teaser: await generateTeaserResults(keywords || 'Software Engineer', location || 'United States'),
        },
        { status: 403 }
      );
    }

    try {
      const usageReservation = await reserveMonthlyUsage(supabase, 'job_scrapes', usageLimit, currentMonth);

      if (!usageReservation.allowed) {
        return NextResponse.json(
          {
            error: `You've used all ${usageLimit} job searches this month. Resets ${getResetDate()}.`,
            upgrade_required: false,
            limit: usageLimit,
            used: usageReservation.used,
          },
          { status: 403 }
        );
      }
    } catch (usageError) {
      console.error('Usage reservation error:', usageError);
      return NextResponse.json({ error: 'Failed to reserve usage' }, { status: 500 });
    }

    // Generate search criteria from resume if not provided
    let searchCriteria: SearchCriteria;

    if (!keywords) {
      // Get user's resume
      const { data: resume } = await supabase
        .from('resumes')
        .select('parsed_data')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!resume?.parsed_data) {
        return NextResponse.json(
          { error: 'Please upload a resume first or provide search keywords' },
          { status: 400 }
        );
      }

      searchCriteria = generateSearchCriteriaFromResume(resume.parsed_data);
    } else {
      searchCriteria = {
        keywords,
        location: location || 'United States',
    experienceLevel: experienceLevel || ['MID_SENIOR'],
    jobType: jobType || ['FULL_TIME', 'CONTRACT'],
    maxResults: 30,
  };
    }

    // Call Apify LinkedIn scraper
    const jobs = await scrapeLinkedInJobs(searchCriteria);

    // Save scrape results to database
    const { error: insertError } = await supabase.from('job_scrapes').insert({
      user_id: user.id,
      search_criteria: searchCriteria,
      results: jobs,
      results_count: jobs.length,
    });

    if (insertError) {
      console.error('Failed to save scrape results:', insertError);
      // Continue anyway - don't block user from seeing results
    }

    return NextResponse.json({
      jobs,
      searchCriteria,
      usage: {
        used: (await supabase
          .from('monthly_usage')
          .select('used')
          .eq('user_id', user.id)
          .eq('resource_type', 'job_scrapes')
          .eq('period', currentMonth)
          .single()).data?.used || 1,
        limit: usageLimit,
      },
    });
  } catch (error) {
    console.error('Scrape jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape jobs. Please try again.' },
      { status: 500 }
    );
  }
}

function generateSearchCriteriaFromResume(parsedData: Record<string, unknown>): SearchCriteria {
  // Extract job titles from work history
  const workHistory = (parsedData.work_history || parsedData.work_experience || parsedData.experience || []) as Record<string, unknown>[];
  const jobTitles = workHistory.map((w: Record<string, unknown>) => (w.title || w.position || '') as string).filter(Boolean);
  const topTitles = jobTitles.slice(0, 3).join(' OR ');

  // Extract top skills
  let skills: string[] = [];
  if (Array.isArray(parsedData.skills)) {
    skills = parsedData.skills.flat().filter(Boolean);
  } else if (parsedData.skills && typeof parsedData.skills === 'object') {
    skills = Object.values(parsedData.skills).flat().filter(Boolean) as string[];
  }
  const topSkills = skills.slice(0, 5).join(' ');

  // Determine experience level based on years of experience
  const yearsExp = calculateYearsOfExperience(workHistory);
  let experienceLevel: string[] = [];
  if (yearsExp < 3) {
    experienceLevel = ['ENTRY_LEVEL', 'ASSOCIATE'];
  } else if (yearsExp < 7) {
    experienceLevel = ['MID_SENIOR'];
  } else {
    experienceLevel = ['MID_SENIOR', 'DIRECTOR'];
  }

  // Get location from resume
  const contactInfo = (parsedData.contact_info || parsedData.contact || parsedData.basics || parsedData.personal_info || {}) as Record<string, unknown>;
  const location = (contactInfo.location as string) || (parsedData.location as string) || 'United States';

  const keywords = topTitles && topSkills ? `${topTitles} ${topSkills}` : topTitles || topSkills || 'Software Engineer';

  return {
    keywords: keywords.trim(),
    location,
    experienceLevel,
    jobType: ['FULL_TIME', 'CONTRACT'],
    maxResults: 50,
  };
}

function calculateYearsOfExperience(workHistory: Record<string, unknown>[]): number {
  if (!workHistory || workHistory.length === 0) return 0;

  let totalMonths = 0;

  for (const job of workHistory) {
    const dates = job.dates as string | undefined;
    const startDate = job.start_date || job.start || (dates ? dates.split('-')[0] : undefined);
    const endDate = job.end_date || job.end || (dates ? dates.split('-')[1] : undefined) || 'Present';

    if (!startDate) continue;

    const start = new Date(startDate as string);
    const end = endDate === 'Present' || endDate === 'Current' ? new Date() : new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }

  return Math.round(totalMonths / 12);
}

async function scrapeLinkedInJobs(criteria: SearchCriteria): Promise<LinkedInJob[]> {
  const apifyToken = process.env.APIFY_API_TOKEN;

  if (!apifyToken) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('APIFY_API_TOKEN not configured');
    }
    console.warn('APIFY_API_TOKEN not configured — returning mock data');
    return generateMockJobs(criteria);
  }

  try {
    // Call Apify LinkedIn scraper
    const response = await fetch('https://api.apify.com/v2/acts/bebity~linkedin-jobs-scraper/runs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords: criteria.keywords,
        location: criteria.location,
        maxResults: criteria.maxResults,
        experienceLevel: criteria.experienceLevel,
        jobType: criteria.jobType,
      }),
    });

    if (!response.ok) {
      console.error('Apify API error:', response.statusText);
      return generateMockJobs(criteria);
    }

    const run = await response.json();
    const runId = run.data.id;

    // Poll for completion with exponential backoff (max ~45s total)
    const MAX_POLL_TIME_MS = 45_000;
    const startTime = Date.now();
    let delay = 2000; // Start at 2s, increase with backoff

    while (Date.now() - startTime < MAX_POLL_TIME_MS) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 8000); // Cap at 8s between polls

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${apifyToken}` },
        signal: AbortSignal.timeout(10_000),
      });

      const statusData = await statusResponse.json();

      if (statusData.data.status === 'SUCCEEDED') {
        const datasetId = statusData.data.defaultDatasetId;
        const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
          headers: { 'Authorization': `Bearer ${apifyToken}` },
          signal: AbortSignal.timeout(10_000),
        });

        const results = await resultsResponse.json();
        return results.map((item: Record<string, unknown>, index: number) => ({
          id: item.id || `job-${index}`,
          title: item.title || item.jobTitle || 'Unknown Title',
          company: item.company || item.companyName || 'Unknown Company',
          location: item.location || criteria.location,
          description: item.description || item.jobDescription || '',
          salary: item.salary || undefined,
          url: item.url || item.link || item.jobUrl || '',
          postedDate: item.postedDate || item.postedAt || new Date().toISOString(),
          experienceLevel: item.experienceLevel || undefined,
          jobType: item.jobType || undefined,
        }));
      }

      if (statusData.data.status === 'FAILED') {
        console.error('Apify run failed');
        return generateMockJobs(criteria);
      }
    }

    console.error('Apify scrape timeout after 45s');
    return generateMockJobs(criteria);
  } catch (error) {
    console.error('Apify scrape error:', error);
    return generateMockJobs(criteria);
  }
}

function generateMockJobs(criteria: SearchCriteria): LinkedInJob[] {
  // Generate realistic mock jobs for development/demo
  const companies = ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Netflix', 'Uber', 'Airbnb'];
  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote'];

  return Array.from({ length: Math.min(criteria.maxResults, 10) }, (_, i) => ({
    id: `mock-job-${i}`,
    title: criteria.keywords.split(' ').slice(0, 3).join(' ') || 'Software Engineer',
    company: companies[i % companies.length],
    location: locations[i % locations.length],
    description: `Looking for an experienced professional to join our team. This role involves ${criteria.keywords}.`,
    salary: i % 3 === 0 ? '$150K - $200K' : undefined,
    url: `https://linkedin.com/jobs/view/mock-${i}`,
    postedDate: new Date(Date.now() - i * 86400000).toISOString(),
    experienceLevel: criteria.experienceLevel?.[0] || 'MID_SENIOR',
    jobType: 'FULL_TIME',
  }));
}

async function generateTeaserResults(keywords: string, location: string): Promise<LinkedInJob[]> {
  // Generate 3 teaser results for free users
  return [
    {
      id: 'teaser-1',
      title: `Senior ${keywords}`,
      company: '████████', // Blurred
      location: location,
      description: '████████████████████████████████',
      url: '',
      postedDate: new Date().toISOString(),
    },
    {
      id: 'teaser-2',
      title: keywords,
      company: '████████',
      location: location,
      description: '████████████████████████████████',
      url: '',
      postedDate: new Date().toISOString(),
    },
    {
      id: 'teaser-3',
      title: `Lead ${keywords}`,
      company: '████████',
      location: location,
      description: '████████████████████████████████',
      url: '',
      postedDate: new Date().toISOString(),
    },
  ];
}

function getResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
