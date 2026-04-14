import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { processResumeExtraction } from '@/lib/resume-parser';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const STORAGE_BUCKET = 'resumes';

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function getExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function buildStoragePath(userId: string, filename: string) {
  const ext = getExtension(filename) || 'bin';
  const safeBase = sanitizeFilename(filename.replace(/\.[^.]+$/, '')).slice(0, 80) || 'resume';
  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;

  return `${userId}/${uniqueSuffix}-${safeBase}.${ext}`;
}

function getNormalizedContentType(file: File) {
  const extension = getExtension(file.name);
  const inferredType = MIME_TYPE_BY_EXTENSION[extension];

  if (file.type && Object.values(MIME_TYPE_BY_EXTENSION).includes(file.type)) {
    return file.type;
  }

  return inferredType || null;
}

// Magic byte signatures for file type validation
const MAGIC_BYTES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04], // PK (ZIP/DOCX)
  'application/msword': [0xD0, 0xCF, 0x11, 0xE0], // DOC (OLE2)
};

function validateMagicBytes(bytes: Uint8Array, contentType: string): boolean {
  const expected = MAGIC_BYTES[contentType];
  if (!expected) return true; // Allow unknown types (already validated by extension/MIME)
  if (bytes.length < expected.length) return false;

  // Check exact position first (most files)
  if (expected.every((byte, i) => bytes[i] === byte)) return true;

  // For PDFs: scan first 1024 bytes (some have BOM or whitespace before %PDF)
  if (contentType === 'application/pdf') {
    const scanLimit = Math.min(bytes.length, 1024);
    for (let offset = 1; offset <= scanLimit - expected.length; offset++) {
      if (expected.every((byte, i) => bytes[offset + i] === byte)) return true;
    }
  }

  return false;
}

async function cleanupUploadedFile(supabase: Awaited<ReturnType<typeof createClient>>, storagePath: string) {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);

  if (error) {
    console.error('Resume storage cleanup error:', error);
  }
}

async function cleanupResumeRecord(supabase: Awaited<ReturnType<typeof createClient>>, resumeId: string) {
  const { error } = await supabase.from('resumes').delete().eq('id', resumeId);

  if (error) {
    console.error('Resume record cleanup error:', error);
  }
}

async function restorePreviouslyActiveResumes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  resumeIds: string[]
) {
  if (!resumeIds.length) return;

  const { error } = await supabase.from('resumes').update({ is_active: true }).in('id', resumeIds);

  if (error) {
    console.error('Resume active-state restore error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: 'Empty files are not supported' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const contentType = getNormalizedContentType(file);

    if (!contentType) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 400 });
    }

    const previousActiveResponse = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (previousActiveResponse.error) {
      console.error('Active resume lookup error:', previousActiveResponse.error);
      return NextResponse.json({ error: 'Failed to prepare resume upload' }, { status: 500 });
    }

    const previousActiveIds = (previousActiveResponse.data || []).map((resume) => resume.id);
    const storagePath = buildStoragePath(user.id, file.name);
    const fileBytes = new Uint8Array(await file.arrayBuffer());

    // Validate file content matches declared type (magic bytes)
    if (!validateMagicBytes(fileBytes, contentType)) {
      return NextResponse.json(
        { error: 'File content does not match its type. Please upload a valid PDF or Word document.' },
        { status: 400 }
      );
    }

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, fileBytes, {
      contentType,
      upsert: false,
    });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: insertedResume, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        filename: file.name,
        storage_path: storagePath,
        is_active: false,
        parse_status: 'pending',
        raw_text: null,
        parsed_data: null,
        items_extracted: 0,
      })
      .select('id, filename, storage_path, created_at, parse_status, parsed_data, items_extracted')
      .single();

    if (insertError || !insertedResume) {
      console.error('Resume insert error:', insertError);
      await cleanupUploadedFile(supabase, storagePath);
      return NextResponse.json({ error: 'Failed to create resume record' }, { status: 500 });
    }

    const { error: deactivateError } = await supabase
      .from('resumes')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .neq('id', insertedResume.id);

    if (deactivateError) {
      console.error('Resume deactivate error:', deactivateError);
      await cleanupResumeRecord(supabase, insertedResume.id);
      await cleanupUploadedFile(supabase, storagePath);
      return NextResponse.json({ error: 'Failed to update active resume state' }, { status: 500 });
    }

    const { error: activateError } = await supabase
      .from('resumes')
      .update({ is_active: true })
      .eq('id', insertedResume.id)
      .eq('user_id', user.id);

    if (activateError) {
      console.error('Resume activate error:', activateError);
      await cleanupResumeRecord(supabase, insertedResume.id);
      await restorePreviouslyActiveResumes(supabase, previousActiveIds);
      await cleanupUploadedFile(supabase, storagePath);
      return NextResponse.json({ error: 'Failed to finalize resume upload' }, { status: 500 });
    }

    const signed = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(storagePath, 60 * 60);

    if (signed.error) {
      console.error('Signed URL error:', signed.error);
    }

    // Trigger background extraction
    processResumeExtraction(insertedResume.id).catch(console.error);

    return NextResponse.json({
      data: {
        resume: {
          id: insertedResume.id,
          filename: insertedResume.filename,
          uploaded_at: insertedResume.created_at,
          parse_status: 'pending',
          file_url: signed.data?.signedUrl || '',
        },
        parsed_data: null,
        items_extracted: 0,
        warnings: ['Resume uploaded successfully, extraction is processing.'],
      },
    });
  } catch (error) {
    console.error('Parse resume error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
