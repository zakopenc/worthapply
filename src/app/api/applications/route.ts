import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { applicationCreateSchema, applicationUpdateSchema } from '@/lib/validations';
import { normalizeApplicationStatus } from '@/lib/application-status';
import { checkRateLimit } from '@/lib/ratelimit';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('applications')
      .select('*, job_analyses(overall_score, verdict)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Applications fetch error:', error);
      return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
    }

    const normalizedData = (data || []).map((application) => ({
      ...application,
      status: normalizeApplicationStatus(application.status),
    }));

    return NextResponse.json({ data: normalizedData });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimit = await checkRateLimit(user.id, 'applications');
    if (!rateLimit.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const parsed = applicationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { job_title, company, location, status, source, analysis_id } = parsed.data;
    const normalizedStatus = normalizeApplicationStatus(status);

    if (analysis_id) {
      const { data: analysis, error: analysisError } = await supabase
        .from('job_analyses')
        .select('id')
        .eq('id', analysis_id)
        .eq('user_id', user.id)
        .single();

      if (analysisError || !analysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
      }

      const { data: existingForAnalysis } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('analysis_id', analysis_id)
        .maybeSingle();

      if (existingForAnalysis) {
        return NextResponse.json({
          data: {
            ...existingForAnalysis,
            status: normalizeApplicationStatus(existingForAnalysis.status),
          },
        });
      }
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_title,
        company,
        location: location || null,
        status: normalizedStatus,
        source: source || null,
        analysis_id: analysis_id || null,
        applied_date: normalizedStatus === 'applied' ? new Date().toISOString().split('T')[0] : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Application create error:', error);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }
    return NextResponse.json({ data: { ...data, status: normalizeApplicationStatus(data.status) } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimit = await checkRateLimit(user.id, 'applications');
    if (!rateLimit.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const parsed = applicationUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;

    const { data, error } = await supabase
      .from('applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Application update error:', error);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }
    return NextResponse.json({ data: { ...data, status: normalizeApplicationStatus(data.status) } });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
