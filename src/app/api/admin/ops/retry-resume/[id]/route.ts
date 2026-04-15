import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdmin, writeAuditLog } from '@/lib/admin/service';
import { processResumeExtraction } from '@/lib/resume-parser';

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resumeId } = await params;

  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = await verifyAdmin(adminUser.id);
  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Verify the resume exists and is in a retryable state
  const serviceClient = await createServiceClient();
  const { data: resume } = await serviceClient
    .from('resumes')
    .select('id, user_id, filename, parse_status')
    .eq('id', resumeId)
    .single();

  if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

  if (resume.parse_status === 'processing') {
    return NextResponse.json({ error: 'Resume is already being processed' }, { status: 409 });
  }

  // Fire retry in background — extraction can take 10-30s
  processResumeExtraction(resumeId).catch(err => {
    console.error('Admin retry-resume failed:', err);
  });

  await writeAuditLog({
    adminId: adminUser.id,
    targetUserId: resume.user_id,
    action: 'retry_resume_extraction',
    diff: { resume_id: resumeId, filename: resume.filename, previous_status: resume.parse_status },
    reason: 'Admin-triggered retry',
    ip: getIp(request),
  });

  return NextResponse.json({ success: true, message: 'Retry initiated.' });
}
