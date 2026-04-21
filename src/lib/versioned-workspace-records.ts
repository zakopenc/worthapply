import type { SupabaseClient } from '@supabase/supabase-js';

type JsonObject = Record<string, unknown>;

async function getAuthenticatedUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Unauthorized');

  return user.id;
}

async function getNextVersion(
  supabase: SupabaseClient,
  table: 'tailored_resumes' | 'cover_letters',
  applicationId: string
): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .select('version')
    .eq('application_id', applicationId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Number(data?.version ?? 0) + 1;
}

export async function createTailoredResumeVersionRecord(
  supabase: SupabaseClient,
  args: {
    applicationId: string;
    analysisId: string;
    content: JsonObject;
    originalScore: number;
    tailoredScore: number;
    atsCheck?: JsonObject | null;
    toneCheck?: JsonObject | null;
  }
) {
  const userId = await getAuthenticatedUserId(supabase);
  const version = await getNextVersion(supabase, 'tailored_resumes', args.applicationId);

  const { data, error } = await supabase
    .from('tailored_resumes')
    .insert({
      user_id: userId,
      application_id: args.applicationId,
      analysis_id: args.analysisId,
      version,
      content: args.content,
      original_score: args.originalScore,
      tailored_score: args.tailoredScore,
      ats_check: args.atsCheck ?? {},
      tone_check: args.toneCheck ?? {},
    })
    .select('id, application_id, analysis_id, version, original_score, tailored_score, content, ats_check, tone_check, created_at')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to create tailored resume version');
  }

  return data;
}

export async function createCoverLetterVersionRecord(
  supabase: SupabaseClient,
  args: {
    applicationId: string;
    analysisId: string;
    recommendation: string;
    content: string | null;
    emailBodyContent?: string | null;
    metadata?: JsonObject | null;
  }
) {
  const userId = await getAuthenticatedUserId(supabase);
  const version = await getNextVersion(supabase, 'cover_letters', args.applicationId);

  const { data, error } = await supabase
    .from('cover_letters')
    .insert({
      user_id: userId,
      application_id: args.applicationId,
      analysis_id: args.analysisId,
      recommendation: args.recommendation,
      content: args.content,
      email_body_content: args.emailBodyContent ?? null,
      metadata: args.metadata ?? {},
      version,
    })
    .select('id, application_id, analysis_id, recommendation, content, email_body_content, metadata, version, created_at')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to create cover letter version');
  }

  return data;
}
