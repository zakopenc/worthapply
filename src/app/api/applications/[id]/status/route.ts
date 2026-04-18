import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { normalizeApplicationStatus } from '@/lib/application-status';
import { applicationStatusSchema } from '@/lib/validations';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = applicationStatusSchema.safeParse(body.status);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const status = normalizeApplicationStatus(parsed.data);

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'applied') {
      updates.applied_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: { ...data, status: normalizeApplicationStatus(data.status) } });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
