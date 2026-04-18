#!/usr/bin/env node
/**
 * Creates the `resumes` Supabase Storage bucket required for onboarding.
 * Idempotent: safe to re-run.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

(async () => {
  const { data: existing, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('listBuckets failed:', listErr.message);
    process.exit(1);
  }
  console.log('Existing buckets:', existing.map(b => b.name));

  if (existing.find(b => b.name === 'resumes')) {
    console.log('resumes bucket already exists — nothing to do');
    return;
  }

  const { data, error } = await supabase.storage.createBucket('resumes', {
    public: false,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  });

  if (error) {
    console.error('createBucket FAILED:', error.message);
    process.exit(1);
  }
  console.log('Created resumes bucket:', data);
})();
