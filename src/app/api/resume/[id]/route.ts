import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('id, storage_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resume.storage_path) {
      const { error: storageError } = await supabase.storage.from('resumes').remove([resume.storage_path]);

      if (storageError) {
        console.error('Resume storage delete error:', storageError);
        return NextResponse.json({ error: 'Failed to delete resume file' }, { status: 500 });
      }
    }

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Resume delete error:', error);
      return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
