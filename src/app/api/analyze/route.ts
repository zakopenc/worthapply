import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildAnalysisPrompt } from '@/lib/gemini/prompts/analyze';
import { getFeatureAccess, getPlanLimits, getEffectivePlan, type Plan } from '@/lib/plans';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/ratelimit';
import { CURRENT_MONTH, releaseMonthlyUsage, reserveMonthlyUsage } from '@/lib/usage-tracking';
import { captureServer } from '@/lib/analytics/posthog-server';

const ANALYSIS_PROMPT_VERSION = 'analysis-v2';
const ANALYSIS_WEIGHTS = {
  skills: 40,
  experience: 35,
  domain: 25,
};
const ANALYSIS_THRESHOLDS = {
  apply_min: 70,
  low_priority_min: 40,
  skip_below: 40,
};

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
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const parsed = analyzeJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { job_description, job_url, resume_id } = parsed.data;
    const currentMonth = CURRENT_MONTH();

    const [profileResponse, resumeResponse] = await Promise.all([
      supabase
        .from('profiles')
        .select('plan, subscription_status')
        .eq('id', user.id)
        .single(),
      resume_id
        ? supabase
            .from('resumes')
            .select('id, parse_status, parsed_data')
            .eq('id', resume_id)
            .eq('user_id', user.id)
            .maybeSingle()
        : supabase
            .from('resumes')
            .select('id, parse_status, parsed_data')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    const { data: profile, error: profileError } = profileResponse;
    const { data: resume, error: resumeError } = resumeResponse;

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json({ error: 'Failed to load plan details' }, { status: 500 });
    }

    if (resumeError) {
      console.error('Resume lookup error:', resumeError);
      return NextResponse.json({ error: 'Failed to load resume details' }, { status: 500 });
    }

    const rawPlan = (profile?.plan || 'free') as Plan;
    const plan = getEffectivePlan(rawPlan, profile?.subscription_status);
    const limits = getPlanLimits(plan);
    const features = getFeatureAccess(plan);

    let usedAnalyses = 0;

    try {
      const usageReservation = await reserveMonthlyUsage(supabase, 'analyses', limits.analyses_per_month, currentMonth);
      usedAnalyses = usageReservation.used;

      if (!usageReservation.allowed) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${limits.analyses_per_month} analyses/month). Upgrade to Pro for unlimited.`,
            upgrade_required: true,
            limit: limits.analyses_per_month,
            used: usageReservation.used,
          },
          { status: 403 }
        );
      }
    } catch (usageError) {
      console.error('Analysis usage reservation error:', usageError);
      return NextResponse.json({ error: 'Failed to reserve usage' }, { status: 500 });
    }

    const releaseReservedUsage = async () => {
      try {
        await releaseMonthlyUsage(supabase, 'analyses', currentMonth);
      } catch (releaseError) {
        console.error('Usage release error:', releaseError);
      }
    };

    const resumeData = resume?.parsed_data || null;
    const usedResumeEvidence = Boolean(resume?.parsed_data);
    const linkedResumeId = resume?.id || resume_id || null;
    const resumeNote = usedResumeEvidence
      ? 'This score was grounded in the parsed active resume.'
      : resume?.parse_status === 'pending' || resume?.parse_status === 'processing'
        ? 'Resume extraction was still processing, so this run relied mostly on the pasted job description.'
        : resume?.parse_status === 'failed'
          ? 'Resume extraction failed, so this run could not use structured resume evidence.'
          : 'No parsed active resume was available, so this run relied mostly on the pasted job description.';

    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey && process.env.NODE_ENV === 'production') {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'AI service is not configured' }, { status: 503 });
    }

    try {
      const analysis = geminiKey
        ? await generateJSON<{
            job_metadata: { title: string; company: string; location: string; type: string; seniority_level: string };
            overall_score: number;
            sub_scores: { skills: number; experience: number; domain: number };
            verdict: string;
            matched_skills: { skill: string; evidence_from_resume: string }[];
            skill_gaps: { skill: string; impact: string; suggestion: string }[];
            recruiter_concerns: { concern: string; severity: string; mitigation: string }[];
            seniority_analysis: { role_level: string; user_level: string; assessment: string; is_match: boolean };
          }>(buildAnalysisPrompt(job_description, resumeData as Record<string, unknown> | null))
        : generateMockAnalysis(job_description);

      const gatedAnalysis = {
        ...analysis,
        skill_gaps: features.missing_skills ? analysis.skill_gaps : [],
        recruiter_concerns: features.recruiter_concerns ? analysis.recruiter_concerns : [],
        seniority_analysis: features.seniority_match
          ? analysis.seniority_analysis
          : { role_level: '', user_level: '', assessment: 'Upgrade to Pro to see seniority analysis', is_match: true },
      };

      const { data: savedAnalysis, error: saveError } = await supabase
        .from('job_analyses')
        .insert({
          user_id: user.id,
          resume_id: linkedResumeId,
          job_title: analysis.job_metadata.title,
          company: analysis.job_metadata.company,
          location: analysis.job_metadata.location,
          employment_type: analysis.job_metadata.type,
          job_description_raw: job_description,
          job_url: job_url || null,
          overall_score: analysis.overall_score,
          skills_score: analysis.sub_scores.skills,
          experience_score: analysis.sub_scores.experience,
          domain_score: analysis.sub_scores.domain,
          verdict: analysis.verdict,
          matched_skills: analysis.matched_skills,
          skill_gaps: analysis.skill_gaps,
          recruiter_concerns: analysis.recruiter_concerns,
          seniority_analysis: analysis.seniority_analysis,
          analysis_metadata: {
            model: geminiKey ? 'gemini-3.1-pro-preview' : 'mock',
            timestamp: new Date().toISOString(),
            prompt_version: ANALYSIS_PROMPT_VERSION,
            used_resume_evidence: usedResumeEvidence,
            resume_parse_status: resume?.parse_status || null,
            resume_source: linkedResumeId ? 'active_resume' : 'none',
            resume_note: resumeNote,
            scoring_method: {
              overall_formula: 'skills*0.40 + experience*0.35 + domain*0.25',
              weights: ANALYSIS_WEIGHTS,
              verdict_thresholds: ANALYSIS_THRESHOLDS,
            },
          },
        })
        .select('id')
        .single();

      if (saveError || !savedAnalysis) {
        console.error('Save error:', saveError);
        await releaseReservedUsage();
        return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
      }

      // Marky P0: fire first_fit_analysis_completed for the activation funnel.
      // Only fires on the user's first completed analysis (activation event).
      try {
        const { count: analysisCount } = await supabase
          .from('job_analyses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (analysisCount === 1) {
          const secondsSinceSignup = user.created_at
            ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / 1000)
            : null;
          await captureServer(user.id, 'first_fit_analysis_completed', {
            fit_score: analysis.overall_score,
            verdict: analysis.verdict,
            seconds_since_signup: secondsSinceSignup,
            used_resume_evidence: usedResumeEvidence,
            plan,
            source: 'analyze_api',
          });
        }
      } catch (trackErr) {
        // Never fail the response because of analytics
        console.warn('[posthog] first_fit_analysis_completed capture failed:', trackErr);
      }

      return NextResponse.json({
        data: {
          analysis: { ...gatedAnalysis, id: savedAnalysis.id },
          features,
          plan,
          usage: {
            used: usedAnalyses,
            limit: limits.analyses_per_month,
          },
        },
        status: 200,
      });
    } catch (generationError) {
      console.error('Analysis generation error:', generationError);
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateMockAnalysis(jobDescription: string) {
  const lines = jobDescription.split('\n').filter(Boolean);
  const title = lines[0]?.slice(0, 60) || 'Software Engineer';
  const score = Math.floor(Math.random() * 40) + 45;

  return {
    job_metadata: {
      title,
      company: 'Company from JD',
      location: 'Remote',
      type: 'Full-time',
      seniority_level: 'Mid-Senior',
    },
    overall_score: score,
    sub_scores: {
      skills: score + Math.floor(Math.random() * 10) - 5,
      experience: score + Math.floor(Math.random() * 10) - 5,
      domain: score + Math.floor(Math.random() * 10) - 5,
    },
    verdict: score >= 70 ? 'apply' : score >= 40 ? 'low-priority' : 'skip',
    matched_skills: [
      { skill: 'JavaScript', evidence_from_resume: 'Mentioned in work history' },
      { skill: 'React', evidence_from_resume: 'Listed in skills section' },
    ],
    skill_gaps: [
      { skill: 'Kubernetes', impact: 'medium', suggestion: 'Highlight any container orchestration experience' },
    ],
    recruiter_concerns: [
      { concern: 'Limited resume data', severity: 'medium', mitigation: 'Upload your resume for a more accurate analysis' },
    ],
    seniority_analysis: {
      role_level: 'Mid-Senior',
      user_level: 'Unknown',
      assessment: 'Upload resume for seniority comparison',
      is_match: true,
    },
  };
}
