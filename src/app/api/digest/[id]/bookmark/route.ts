import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bookmarkUpdateSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id, 'digest-bookmark');
    if (!rateLimit.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const parsed = bookmarkUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { bookmarked } = parsed.data;

    const { data, error } = await supabase
      .from('digest_matches')
      .update({ bookmarked })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, bookmarked')
      .single();

    if (error) {
      console.error('Digest bookmark error:', error);
      return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Digest bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
