import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Topbar from '@/components/app/Topbar';
import ResumeClient from './ResumeClient';

export const metadata = {
  title: 'Resume & Evidence',
  description: 'Upload, manage, and review the resume evidence WorthApply uses to tailor applications and job-fit analysis.',
};

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: resume } = await supabase
    .from('resumes')
    .select('id, filename, storage_path, created_at, parse_status, parsed_data, items_extracted')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let fileUrl = '';
  if (resume?.storage_path) {
    const signed = await supabase.storage.from('resumes').createSignedUrl(resume.storage_path, 60 * 60);
    fileUrl = signed.data?.signedUrl || '';
  }

  return (
    <>
      <Topbar title="Resume & Evidence" breadcrumb="Workspace / Resume & Evidence" />
      <ResumeClient
        initialResume={
          resume
            ? {
                id: resume.id,
                filename: resume.filename,
                uploaded_at: resume.created_at,
                parse_status: resume.parse_status,
                file_url: fileUrl,
              }
            : null
        }
        initialParsedData={resume?.parsed_data || null}
        itemsExtracted={resume?.items_extracted || 0}
      />
    </>
  );
}
