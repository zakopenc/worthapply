import { createClient } from '@/lib/supabase/server';
import { getPlanLimits, isPaidPlan, getEffectivePlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { CURRENT_MONTH, reserveMonthlyUsage } from '@/lib/usage-tracking';
import { checkRateLimit } from '@/lib/ratelimit';
import { z } from 'zod';

const APIFY_BEST_ACTOR = 'curious_coder/linkedin-jobs-scraper';
const APIFY_BEST_ACTOR_ID = 'curious_coder~linkedin-jobs-scraper';

const scrapeJobsSchema = z.object({
  jobTitle: z.string().trim().min(1).max(200).optional(),
  keywords: z.string().trim().min(1).max(200).optional(),
  location: z.string().trim().max(200).optional(),
  experienceLevel: z.array(z.string()).max(5).optional(),
  jobType: z.array(z.string()).max(5).optional(),
});

export interface LinkedInJob {
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
  applicantsCount?: string;
  benefits?: string[];
  companyLinkedinUrl?: string;
  companyLogo?: string;
  applyUrl?: string;
}

interface SearchCriteria {
  jobTitle: string;
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

    const { jobTitle, keywords, location, experienceLevel, jobType } = parsed.data;
    const currentMonth = CURRENT_MONTH();

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
    const usageLimit = limits.job_searches_per_month;
    const resultsLimit = limits.linkedin_results_per_search;

    if (!hasScrapeAccess) {
      return NextResponse.json(
        {
          error: 'LinkedIn job search is available for Pro and Premium plans.',
          upgrade_required: true,
          plan,
          teaser: await generateTeaserResults(jobTitle || keywords || 'Software Engineer', location || 'United States'),
        },
        { status: 403 }
      );
    }

    const usageReservation = await reserveMonthlyUsage(supabase, 'job_scrapes', usageLimit, currentMonth);

    if (!usageReservation.allowed) {
      return NextResponse.json(
        {
          error: `You've used all ${usageLimit} LinkedIn searches this month. Resets ${getResetDate()}.`,
          upgrade_required: false,
          limit: usageLimit,
          used: usageReservation.used,
        },
        { status: 403 }
      );
    }

    let searchCriteria: SearchCriteria;

    if (!jobTitle && !keywords) {
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
          { error: 'Please upload a resume first or enter a job title.' },
          { status: 400 }
        );
      }

      searchCriteria = generateSearchCriteriaFromResume(resume.parsed_data, resultsLimit);
    } else {
      const normalizedJobTitle = (jobTitle || keywords || '').trim();
      searchCriteria = {
        jobTitle: normalizedJobTitle,
        keywords: normalizedJobTitle,
        location: location || 'United States',
        experienceLevel: experienceLevel || undefined,
        jobType: jobType || undefined,
        maxResults: resultsLimit,
      };
    }

    const jobs = await scrapeLinkedInJobs(searchCriteria);

    const { error: insertError } = await supabase.from('job_scrapes').insert({
      user_id: user.id,
      search_criteria: {
        ...searchCriteria,
        actor: APIFY_BEST_ACTOR,
      },
      results: jobs,
      results_count: jobs.length,
    });

    if (insertError) {
      console.error('Failed to save scrape results:', insertError);
    }

    return NextResponse.json({
      jobs,
      actor: {
        id: APIFY_BEST_ACTOR,
        reason: 'Best current fit for WorthApply: strongest market adoption, high rating, pay-per-result pricing, and salary-rich job output.',
      },
      searchCriteria,
      usage: {
        used: usageReservation.used,
        limit: usageLimit,
        resultsPerSearch: resultsLimit,
      },
    });
  } catch (error) {
    console.error('Scrape jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to search LinkedIn jobs. Please try again.' },
      { status: 500 }
    );
  }
}

function generateSearchCriteriaFromResume(parsedData: Record<string, unknown>, maxResults: number): SearchCriteria {
  const workHistory = (parsedData.work_history || parsedData.work_experience || parsedData.experience || []) as Record<string, unknown>[];
  const jobTitles = workHistory
    .map((w) => (w.title || w.position || '') as string)
    .filter(Boolean);
  const inferredJobTitle = jobTitles[0] || 'Software Engineer';

  let skills: string[] = [];
  if (Array.isArray(parsedData.skills)) {
    skills = parsedData.skills.flat().filter(Boolean) as string[];
  } else if (parsedData.skills && typeof parsedData.skills === 'object') {
    skills = Object.values(parsedData.skills).flat().filter(Boolean) as string[];
  }
  const topSkills = skills.slice(0, 4).join(' ');

  const yearsExp = calculateYearsOfExperience(workHistory);
  let experienceLevel: string[] | undefined;
  if (yearsExp < 3) {
    experienceLevel = ['ENTRY_LEVEL', 'ASSOCIATE'];
  } else if (yearsExp < 7) {
    experienceLevel = ['MID_SENIOR'];
  } else {
    experienceLevel = ['MID_SENIOR', 'DIRECTOR'];
  }

  const contactInfo = (parsedData.contact_info || parsedData.contact || parsedData.basics || parsedData.personal_info || {}) as Record<string, unknown>;
  const location = (contactInfo.location as string) || (parsedData.location as string) || 'United States';
  const keywords = [inferredJobTitle, topSkills].filter(Boolean).join(' ').trim() || inferredJobTitle;

  return {
    jobTitle: inferredJobTitle,
    keywords,
    location,
    experienceLevel,
    jobType: ['FULL_TIME'],
    maxResults,
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
    const searchUrl = buildLinkedInSearchUrl(criteria);
    const response = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_BEST_ACTOR_ID}/run-sync-get-dataset-items?token=${encodeURIComponent(apifyToken)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: [searchUrl],
          count: criteria.maxResults,
          scrapeCompany: true,
        }),
        signal: AbortSignal.timeout(120_000),
      }
    );

    if (!response.ok) {
      const failureBody = await response.text();
      console.error('Apify API error:', response.status, failureBody);
      return generateMockJobs(criteria);
    }

    const results = (await response.json()) as Record<string, unknown>[];
    if (!Array.isArray(results) || results.length === 0) {
      return [];
    }

    return results
      .map((item, index) => mapApifyJob(item, criteria, index))
      .filter((job): job is LinkedInJob => Boolean(job.title && job.company && job.description));
  } catch (error) {
    console.error('Apify scrape error:', error);
    return generateMockJobs(criteria);
  }
}

function buildLinkedInSearchUrl(criteria: SearchCriteria) {
  const params = new URLSearchParams();
  params.set('keywords', criteria.keywords);
  params.set('location', criteria.location);
  params.set('sortBy', 'DD');
  params.set('f_TPR', 'r86400');

  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

function mapApifyJob(item: Record<string, unknown>, criteria: SearchCriteria, index: number): LinkedInJob {
  const salaryInfo = getSalaryString(item.salaryInfo ?? item.salary ?? item.salaryRange);
  const description = getString(item.descriptionText)
    || getString(item.description)
    || getString(item.jobDescription)
    || stripHtml(getString(item.descriptionHtml));

  return {
    id: getString(item.id) || `job-${index}`,
    title: getString(item.title) || getString(item.jobTitle) || criteria.jobTitle || 'LinkedIn job',
    company: getString(item.companyName) || getString(item.company) || 'Unknown company',
    location: getString(item.location) || criteria.location,
    description,
    salary: salaryInfo || undefined,
    url: getString(item.link) || getString(item.url) || getString(item.jobUrl) || '',
    postedDate: getString(item.postedAt) || getString(item.postedDate) || new Date().toISOString(),
    experienceLevel: getString(item.seniorityLevel) || getString(item.experienceLevel) || undefined,
    jobType: getString(item.employmentType) || getString(item.jobType) || undefined,
    applicantsCount: getString(item.applicantsCount) || undefined,
    benefits: normalizeStringArray(item.benefits),
    companyLinkedinUrl: getString(item.companyLinkedinUrl) || undefined,
    companyLogo: getString(item.companyLogo) || getString(item.companyLogoUrl) || undefined,
    applyUrl: getString(item.applyUrl) || undefined,
  };
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return normalized.length ? normalized : undefined;
}

function getSalaryString(value: unknown) {
  if (Array.isArray(value)) {
    const parts = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    return parts.length ? parts.join(' - ') : '';
  }

  return getString(value);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function generateMockJobs(criteria: SearchCriteria): LinkedInJob[] {
  const companies = ['Stripe', 'Google', 'Meta', 'Microsoft', 'Notion', 'Vercel', 'Datadog', 'Airbnb'];
  const locations = [criteria.location, 'Remote', 'New York, NY', 'Austin, TX', 'Seattle, WA'];

  return Array.from({ length: criteria.maxResults }, (_, i) => ({
    id: `mock-job-${i}`,
    title: criteria.jobTitle || criteria.keywords || 'Software Engineer',
    company: companies[i % companies.length],
    location: locations[i % locations.length],
    description: `We are hiring for a ${criteria.jobTitle || criteria.keywords} role. You will own delivery, collaborate cross-functionally, and ship measurable product impact. Strong communication, execution, and domain fluency are expected.`,
    salary: i % 2 === 0 ? '$140,000 - $185,000' : '$95,000 - $125,000',
    url: `https://www.linkedin.com/jobs/view/mock-${i}`,
    postedDate: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    experienceLevel: i % 3 === 0 ? 'Senior' : 'Mid-Senior',
    jobType: 'Full-time',
    applicantsCount: `${25 + i * 3}`,
    benefits: i % 2 === 0 ? ['Actively Hiring', 'Remote'] : ['Health insurance'],
    applyUrl: `https://www.linkedin.com/jobs/view/mock-${i}`,
  }));
}

async function generateTeaserResults(jobTitle: string, location: string): Promise<LinkedInJob[]> {
  return [
    {
      id: 'teaser-1',
      title: `Senior ${jobTitle}`,
      company: '████████',
      location,
      description: '████████████████████████████████',
      salary: '$██K - $██K',
      url: '',
      postedDate: new Date().toISOString(),
    },
    {
      id: 'teaser-2',
      title: jobTitle,
      company: '████████',
      location,
      description: '████████████████████████████████',
      salary: '$██K - $██K',
      url: '',
      postedDate: new Date().toISOString(),
    },
    {
      id: 'teaser-3',
      title: `Lead ${jobTitle}`,
      company: '████████',
      location,
      description: '████████████████████████████████',
      salary: '$██K - $██K',
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
