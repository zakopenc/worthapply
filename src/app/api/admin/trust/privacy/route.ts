import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin/service';
import { z } from 'zod';

const schema = z.object({
  user_email: z.string().email(),
  type: z.enum(['delete', 'export']),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await verifyAdmin(adminUser.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request' }, { status: 400 });
  }

  const { user_email, type, notes } = parsed.data;
  const serviceClient = await createServiceClient();

  // Look up user_id from email
  const { data: authList } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
  const userId = authList?.users?.find(u => u.email?.toLowerCase() === user_email.toLowerCase())?.id ?? null;

  const { error } = await serviceClient.from('privacy_requests').insert({
    user_id: userId,
    user_email,
    type,
    notes: notes ?? null,
    status: 'pending',
  });

  if (error) {
    console.error('Privacy request insert error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
