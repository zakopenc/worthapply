import { createClient } from '@/lib/supabase/server';
import { generateJSON } from '@/lib/gemini/client';
import { buildCoverLetterTriagePrompt } from '@/lib/gemini/prompts/cover-letter';
import { getPlanLimits, isPaidPlan, getEffectivePlan, type Plan } from '@/lib/plans';
import { analysisActionSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import { CURRENT_MONTH, releaseMonthlyUsage, reserveMonthlyUsage } from '@/lib/usage-tracking';
import { createCoverLetterVersionRecord } from '@/lib/versioned-workspace-records';
import { checkRateLimit } from '@/lib/ratelimit';

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
    const parsed = analysisActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request body' }, { status: 400 });
    }

    const { analysis_id, application_id } = parsed.data;
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
    const hasFullCoverLetterAccess = isPaidPlan(plan);

    let usedCoverLetters = 0;

    try {
      const usageReservation = await reserveMonthlyUsage(supabase, 'cover_letters', limits.cover_letters_per_month, currentMonth);
      usedCoverLetters = usageReservation.used;

      if (!usageReservation.allowed) {
        return NextResponse.json(
          {
            error: `Plan limit reached (${limits.cover_letters_per_month} cover letters/month).`,
            upgrade_required: true,
            limit: limits.cover_letters_per_month,
            used: usageReservation.used,
          },
          { status: 403 }
        );
      }
    } catch (usageError) {
      console.error('Cover letter usage reservation error:', usageError);
      return NextResponse.json({ error: 'Failed to reserve usage' }, { status: 500 });
    }

    const releaseReservedUsage = async () => {
      try {
        await releaseMonthlyUsage(supabase, 'cover_letters', currentMonth);
      } catch (releaseError) {
        console.error('Cover letter usage release error:', releaseError);
      }
    };

    const { data: analysis, error: analysisError } = await supabase
      .from('job_analyses')
      .select('id, job_title, company, location, employment_type, overall_score, verdict, matched_skills, skill_gaps, recruiter_concerns, seniority_analysis, job_description_raw')
      .eq('id', analysis_id)
      .eq('user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', application_id)
      .eq('user_id', user.id)
      .single();

    if (applicationError || !application) {
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    try {
      const fallbackRecommendation = (() => {
        if (analysis.verdict === 'apply') {
          return (analysis.overall_score || 0) >= 80 ? 'skip' : 'short-note';
        }

        if (analysis.verdict === 'low-priority') {
          return 'short-note';
        }

        return 'full-letter';
      })();

      const fallbackReasoning = (() => {
        if (fallbackRecommendation === 'skip') {
          return 'This role already looks like a strong fit, so a cover letter is likely optional unless the employer explicitly asks for one.';
        }

        if (fallbackRecommendation === 'short-note') {
          return 'A concise cover note can reinforce your strongest match points without over-investing extra time.';
        }

        return 'This role may need more narrative context, so a full cover letter would help frame your strengths and address likely questions.';
      })();

      const result = hasFullCoverLetterAccess
        ? await generateJSON<{
            recommendation: string;
            reasoning: string;
            content: string;
            key_points_addressed: string[];
          }>(buildCoverLetterTriagePrompt(analysis))
        : {
            recommendation: fallbackRecommendation,
            reasoning: fallbackReasoning,
            content: '',
            key_points_addressed: [],
          };

      let coverLetter;

      try {
        coverLetter = await createCoverLetterVersionRecord(supabase, {
          applicationId: application_id,
          analysisId: analysis_id,
          recommendation: result.recommendation,
          content: hasFullCoverLetterAccess ? result.content : null,
        });
      } catch (saveError) {
        console.error('Cover letter save error:', saveError);
        await releaseReservedUsage();
        return NextResponse.json({ error: 'Failed to save cover letter' }, { status: 500 });
      }

      return NextResponse.json({
        data: {
          ...coverLetter,
          content: hasFullCoverLetterAccess ? result.content : '',
          reasoning: result.reasoning,
          plan,
          upgrade_required: !hasFullCoverLetterAccess,
          usage: {
            used: usedCoverLetters,
            limit: limits.cover_letters_per_month,
          },
        },
      });
    } catch (generationError) {
      console.error('Cover letter generation error:', generationError);
      await releaseReservedUsage();
      return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
    }
  } catch (error) {
    console.error('Cover letter error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
