import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: resume, error } = await supabase
    .from('resumes')
    .select('parse_status, parsed_data, items_extracted')
    .eq('id', id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }

  return NextResponse.json({
    parse_status: resume.parse_status,
    parsed_data: resume.parsed_data,
    items_extracted: resume.items_extracted,
  });
}
